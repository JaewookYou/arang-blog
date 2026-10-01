import { listPlaceholders, PLACEHOLDER_TEST } from "./protect";
import type { TranslationLocale } from "@/lib/i18n";

/**
 * 번역 결과 검증
 * 예전에는 번역이 실패해도 한국어 원문을 번역본으로 저장했다.
 * 이제는 검증을 통과하지 못하면 저장하지 않고 재시도하거나 실패로 기록한다.
 */

const HANGUL = /[가-힣ㄱ-ㆎ]/g;

export function countHangul(text: string): number {
    return (text.match(HANGUL) || []).length;
}

function nonSpaceLength(text: string): number {
    return text.replace(/\s+/g, "").length;
}

/** 길이 비교용: HTML 태그·플레이스홀더·링크 주소·URL을 뺀 실제 글자 */
function readableText(markdown: string): string {
    return markdown
        .replace(/<[^>]+>/g, " ")
        .replace(new RegExp(PLACEHOLDER_TEST.source, "g"), " ")
        .replace(/\]\([^)]*\)/g, "]")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/&[a-z#0-9]+;/gi, " ");
}

function headingCount(markdown: string): number {
    let inFence = false;
    let count = 0;
    for (const line of markdown.split("\n")) {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
        if (!inFence && /^#{1,6}\s+\S/.test(line)) count++;
    }
    return count;
}

/**
 * 서식용 인라인 태그 — 워드프로세서에서 옮긴 HTML에는 의미 없는 <span>이 많고,
 * 번역 모델이 인접한 <span>을 합치는 일이 잦다. 이런 차이는 내용을 해치지 않으므로 경고로만 본다.
 * (실행 위험은 렌더링 단계의 rehypeSafeHtml이 막는다)
 */
const INLINE_FORMATTING = new Set([
    "span", "br", "wbr", "b", "strong", "i", "em", "u", "s", "strike", "del", "ins",
    "font", "sup", "sub", "small", "big", "mark", "nobr", "abbr", "q", "tt",
]);

/** HTML 태그 이름 순서 (속성은 무시). structuralOnly면 서식용 인라인 태그를 뺀다 */
export function tagSequence(text: string, options: { structuralOnly?: boolean } = {}): string[] {
    const tags = (text.match(/<\/?[a-zA-Z][a-zA-Z0-9]*(?=[\s>/])[^>]*>/g) || []).map((tag) =>
        tag.replace(/^<(\/?)([a-zA-Z0-9]+)[\s\S]*$/, "<$1$2>").toLowerCase()
    );
    if (!options.structuralOnly) return tags;
    return tags.filter((tag) => !INLINE_FORMATTING.has(tag.replace(/[<>/]/g, "")));
}

/** 원문 대비 번역문 길이(공백 제외)의 최소 비율 — 이보다 짧으면 잘렸다고 본다 */
const MIN_LENGTH_RATIO: Record<TranslationLocale, number> = { en: 0.75, ja: 0.5, zh: 0.35 };
const MAX_LENGTH_RATIO = 6;

export interface ChunkValidation {
    errors: string[];
    warnings: string[];
}

/** 플레이스홀더가 들어간 마크다운 조각 단위 검증 */
export function validateChunk(input: string, output: string, locale: TranslationLocale): ChunkValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1) 플레이스홀더 보존
    const expected = listPlaceholders(input).sort();
    const actual = listPlaceholders(output).sort();
    const missing = expected.filter((p) => !actual.includes(p));
    const extra = actual.filter((p, i) => !expected.includes(p) || actual.indexOf(p) !== i);
    if (missing.length) errors.push(`플레이스홀더 누락: ${missing.slice(0, 5).join(", ")}`);
    if (extra.length) errors.push(`플레이스홀더 중복/추가: ${extra.slice(0, 5).join(", ")}`);

    // 2) 한국어 잔존 (코드/이미지는 이미 빠져 있으므로 본문에 한글이 남으면 미번역)
    //    명령어 등 그대로 둬야 하는 짧은 한국어 문자열 정도만 허용한다
    const inHangul = countHangul(input);
    const outHangul = countHangul(output);
    if (inHangul > 0 && outHangul > Math.max(4, inHangul * 0.06)) {
        errors.push(`한국어가 번역되지 않고 남음 (${outHangul}/${inHangul}자)`);
    }

    // 3) 길이 (잘림/누락 감지) — 태그·주소를 뺀 실제 글자 수로 비교
    const inLen = nonSpaceLength(readableText(input));
    const outLen = nonSpaceLength(readableText(output));
    if (inLen >= 40) {
        const ratio = outLen / inLen;
        // 영어 위주의 조각은 언어에 따라 길이가 크게 줄 수 있으므로 한국어가 충분할 때만 하한을 본다
        if (inHangul >= 30 && ratio < MIN_LENGTH_RATIO[locale]) {
            errors.push(`번역문이 너무 짧음 (원문 대비 ${(ratio * 100).toFixed(0)}%)`);
        }
        if (ratio > MAX_LENGTH_RATIO) errors.push(`번역문이 비정상적으로 김 (원문 대비 ${(ratio * 100).toFixed(0)}%)`);
    }

    // 4) 원시 HTML 태그 구조 유지 (티스토리에서 가져온 표/이미지/링크 등)
    const inTags = tagSequence(input);
    if (inTags.length > 0) {
        const outTags = tagSequence(output);
        const inStructural = tagSequence(input, { structuralOnly: true });
        const outStructural = tagSequence(output, { structuralOnly: true });
        if (inStructural.join("") !== outStructural.join("")) {
            // 이미지·링크·표·문단 태그가 바뀌면 내용이 빠지거나 HTML이 깨지므로 항상 실패로 본다
            errors.push(`HTML 태그 구조 불일치 (${inStructural.length} → ${outStructural.length}개)`);
        } else if (inTags.join("") !== outTags.join("")) {
            warnings.push(`서식 태그 일부 변경 (${inTags.length} → ${outTags.length}개)`);
        }
    }

    // 5) 헤딩 수 (목차 구조 유지)
    const inHeadings = headingCount(input);
    const outHeadings = headingCount(output);
    if (inHeadings !== outHeadings) {
        warnings.push(`헤딩 수 불일치 (${inHeadings} → ${outHeadings})`);
    }

    return { errors, warnings };
}

/** JSON 문자열 안의 줄바꿈이 "\\n" 문자 그대로 들어온 경우 복구 */
export function repairEscapedNewlines(input: string, output: string): string {
    const inputNewlines = (input.match(/\n/g) || []).length;
    const outputNewlines = (output.match(/\n/g) || []).length;
    const literal = (output.match(/\\n/g) || []).length;
    if (inputNewlines >= 2 && outputNewlines < inputNewlines / 2 && literal >= inputNewlines / 2) {
        return output.replace(/\\r\\n|\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"');
    }
    return output;
}

// ============ 저장된 번역(HTML) 점검 ============

function visibleText(html: string): string {
    return html
        .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
        .replace(/<code[\s\S]*?<\/code>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z#0-9]+;/gi, " ");
}

function countTag(html: string, tag: string): number {
    return (html.match(new RegExp(`<${tag}[\\s>]`, "gi")) || []).length;
}

export type StoredTranslationProblem = "not-html" | "placeholder" | "korean" | "truncated" | "empty";

export const PROBLEM_LABELS: Record<StoredTranslationProblem, string> = {
    "not-html": "HTML로 변환되지 않은 마크다운이 저장됨",
    placeholder: "코드/이미지 플레이스홀더가 복원되지 않음",
    korean: "한국어 원문이 그대로 남아 있음",
    truncated: "원문 대비 내용이 누락됨",
    empty: "내용이 비어 있음",
};

/**
 * DB에 저장된 번역 HTML을 원문 HTML과 비교해 문제를 찾는다.
 * (예전 버전이 저장한 깨진 번역을 찾아 재번역하기 위함)
 */
export function inspectStoredTranslation(
    translationHtml: string,
    sourceHtml: string,
    locale: TranslationLocale
): StoredTranslationProblem[] {
    const problems: StoredTranslationProblem[] = [];
    const trimmed = translationHtml.trim();

    if (!trimmed) return ["empty"];
    if (!trimmed.startsWith("<")) problems.push("not-html");
    if (PLACEHOLDER_TEST.test(trimmed)) problems.push("placeholder");

    const srcText = visibleText(sourceHtml);
    const trText = visibleText(trimmed);
    const srcHangul = countHangul(srcText);
    const trHangul = countHangul(trText);
    if (trHangul > Math.max(80, srcHangul * 0.1)) problems.push("korean");

    if (!problems.includes("not-html")) {
        const preMissing = countTag(trimmed, "pre") < countTag(sourceHtml, "pre");
        const imgMissing = countTag(trimmed, "img") < countTag(sourceHtml, "img");
        const srcLen = nonSpaceLength(srcText);
        const ratio = srcLen > 0 ? nonSpaceLength(trText) / srcLen : 1;
        const tooShort = srcLen >= 200 && ratio < MIN_LENGTH_RATIO[locale] * 0.8;
        if (preMissing || imgMissing || tooShort) problems.push("truncated");
    }

    return problems;
}
