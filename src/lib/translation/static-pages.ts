import { Type, type Schema } from "@google/genai";
import { generateJson } from "@/lib/gemini";
import type { TranslationLocale } from "@/lib/i18n";
import { countHangul } from "./validate";
import { LANGUAGE_NAMES } from "./translate";
import { markdownMarkers } from "@/lib/inline-markdown";

/**
 * 정적 페이지(Home/About) JSON 번역
 * 원본과 같은 키·배열 길이·HTML 태그 구조를 갖는지 검증한다.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** 원본 JSON 모양으로 응답 스키마를 만든다 */
function schemaFor(value: JsonValue): Schema {
    if (Array.isArray(value)) {
        return {
            type: Type.ARRAY,
            items: value.length ? schemaFor(value[0]) : { type: Type.STRING },
            minItems: String(value.length),
            maxItems: String(value.length),
        };
    }
    if (value !== null && typeof value === "object") {
        const properties: Record<string, Schema> = {};
        for (const [k, v] of Object.entries(value)) properties[k] = schemaFor(v);
        return { type: Type.OBJECT, properties, required: Object.keys(value), propertyOrdering: Object.keys(value) };
    }
    if (typeof value === "number") return { type: Type.NUMBER };
    if (typeof value === "boolean") return { type: Type.BOOLEAN };
    return { type: Type.STRING };
}

const tagsOf = (s: string) => (s.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((t) => t.replace(/\s+/g, " ")).join("");

/** 원문에 있는 숫자 중 번역문에 없는 것 (개수까지 비교) */
function missingDigits(source: string, translated: string): string[] {
    const counts = new Map<string, number>();
    for (const d of translated.match(/\d+/g) || []) counts.set(d, (counts.get(d) || 0) + 1);
    const missing: string[] = [];
    for (const d of source.match(/\d+/g) || []) {
        const left = counts.get(d) || 0;
        if (left > 0) counts.set(d, left - 1);
        else missing.push(d);
    }
    return missing;
}

function compareShape(source: JsonValue, translated: JsonValue, path: string, errors: string[]) {
    if (Array.isArray(source)) {
        if (!Array.isArray(translated) || translated.length !== source.length) {
            errors.push(`${path}: 배열 길이 불일치`);
            return;
        }
        source.forEach((v, i) => compareShape(v, translated[i], `${path}[${i}]`, errors));
        return;
    }
    if (source !== null && typeof source === "object") {
        if (translated === null || typeof translated !== "object" || Array.isArray(translated)) {
            errors.push(`${path}: 객체가 아님`);
            return;
        }
        for (const k of Object.keys(source)) {
            if (!(k in translated)) errors.push(`${path}.${k}: 키 누락`);
            else compareShape(source[k], (translated as Record<string, JsonValue>)[k], `${path}.${k}`, errors);
        }
        return;
    }
    if (typeof source === "string") {
        if (typeof translated !== "string") {
            errors.push(`${path}: 문자열이 아님`);
            return;
        }
        if (tagsOf(source) !== tagsOf(translated)) errors.push(`${path}: HTML 태그가 바뀜`);
        if (markdownMarkers(source) !== markdownMarkers(translated)) errors.push(`${path}: 마크다운 기호가 바뀜`);
        // 연도·순위·CVE 번호 같은 숫자가 빠지면 정보가 사라진 것이다 (예: "(2019 ~ )" 누락)
        const missingNumbers = missingDigits(source, translated);
        if (missingNumbers.length) errors.push(`${path}: 숫자 누락 (${missingNumbers.join(", ")})`);
        if (countHangul(translated) > Math.max(2, countHangul(source) * 0.2)) errors.push(`${path}: 한국어가 남음`);
    }
}

/** 번역된 JSON이 원본과 같은 구조인지 검사 (문제 목록 반환) */
export function validateStaticTranslation(source: unknown, translated: unknown): string[] {
    const errors: string[] = [];
    compareShape(source as JsonValue, translated as JsonValue, "$", errors);
    return errors;
}

export async function translateStaticPageJson(sourceJson: string, locale: TranslationLocale): Promise<string> {
    const source = JSON.parse(sourceJson) as JsonValue;
    let feedback = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await generateJson<JsonValue>({
            system: `You translate the JSON content of a Korean security researcher's personal website into ${LANGUAGE_NAMES[locale]}.
Translate only human-readable string values. Keep every key, the array lengths, and the order exactly the same.
Values are inline Markdown and may also contain HTML. Keep Markdown syntax (**bold**, *italic*, \`code\`, [text](url), ~~strike~~) and HTML tags/attributes exactly as they are, and translate only the text inside them. Never translate link URLs or code.
Do not translate CVE IDs, company names, team names, product names, competition names written in English, or other proper nouns.
Keep every number (years, dates, ranks, scores, IDs) and every parenthetical such as "(2019 ~ )". Do not drop or shorten any part.
Emoji and symbols must stay where they are. Return the translated JSON only.`,
            prompt: `${feedback}${JSON.stringify(source, null, 2)}`,
            schema: schemaFor(source),
            temperature: 0.2,
        });

        const errors: string[] = [];
        compareShape(source, result.data, "$", errors);
        if (errors.length === 0) {
            return JSON.stringify(result.data, null, 2);
        }
        feedback = `IMPORTANT: The previous translation was rejected: ${errors.slice(0, 8).join("; ")}. Fix these problems.\n\n`;
        console.warn(`[static-pages] ${locale} 번역 검증 실패 (${attempt}/3): ${errors.slice(0, 5).join("; ")}`);
    }

    throw new Error(`${LANGUAGE_NAMES[locale]} 번역 결과가 원본 구조와 일치하지 않습니다.`);
}
