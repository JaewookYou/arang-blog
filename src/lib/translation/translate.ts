import { Type } from "@google/genai";
import { generateJson } from "@/lib/gemini";
import { markdownToHtml } from "@/lib/markdown";
import type { TranslationLocale } from "@/lib/i18n";
import { normalizePlaceholders, PLACEHOLDER_TEST, protectMarkdown, restoreMarkdown } from "./protect";
import { joinChunks, splitMarkdown } from "./chunk";
import { countHangul, inspectStoredTranslation, PROBLEM_LABELS, repairEscapedNewlines, validateChunk } from "./validate";

/**
 * 한국어 블로그 글(마크다운)을 en/ja/zh로 번역한다.
 *  1. 코드 블록/이미지를 플레이스홀더로 보호
 *  2. 블록 경계에서 조각으로 분할
 *  3. 조각별로 번역하고 검증 (실패 시 사유를 알려주며 재시도)
 *  4. 복원 후 원문과 같은 파이프라인으로 HTML 렌더링
 * 검증을 끝내 통과하지 못하면 예외를 던진다. (한국어 원문을 번역본으로 저장하지 않는다)
 */

export const LANGUAGE_NAMES: Record<TranslationLocale, string> = {
    en: "English",
    ja: "Japanese",
    zh: "Simplified Chinese",
};

const STYLE_GUIDE: Record<TranslationLocale, string> = {
    en: "Write natural, fluent English as a native technical blogger would. Keep the author's first-person voice.",
    ja: "自然な日本語の技術ブログの文体で書くこと。原文が「〜다」体(한다체)なら「だ・である」調、「〜습니다」体なら「です・ます」調にそろえる。",
    zh: "使用自然流畅的简体中文技术博客文体，采用中文安全社区常用的术语。",
};

function systemPrompt(locale: TranslationLocale): string {
    return `You are a professional technical translator for a Korean security research blog (web hacking, CTF writeups, penetration testing, AI security).
Translate the Korean Markdown provided by the user into ${LANGUAGE_NAMES[locale]}.

Rules:
1. Translate everything faithfully and completely. Never summarize, skip, merge, or add content.
2. Keep the Markdown structure exactly: headings, lists, numbering, tables, blockquotes, emphasis, horizontal rules, line breaks, and blank lines.
3. Placeholders such as [[CODE_BLOCK_0]], [[INLINE_CODE_0]] and [[IMAGE_0]] stand for code blocks, inline code and images. Copy each one exactly once, unchanged (never translate, reformat, or escape it), and keep it where it belongs in the translated sentence or on its own line if it was on its own line.
4. Do not change inline code (text inside backticks), URLs, file paths, commands, HTTP headers, payloads, CVE IDs, product names, or identifiers.
5. Translate link text but keep link targets unchanged. Keep raw HTML tags and attributes unchanged and translate only the human-readable text inside them.
6. Use the standard technical terms of the target language (e.g. 페이로드 → payload, 취약점 → vulnerability).
7. Style: ${STYLE_GUIDE[locale]}
8. The output must not contain Korean, except quoted Korean strings that are literally part of a program, UI, or command and must stay as-is.

Return JSON: {"translation": "<translated markdown>"}`;
}

const chunkSchema = {
    type: Type.OBJECT,
    properties: { translation: { type: Type.STRING } },
    required: ["translation"],
};

const metaSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ["title", "description"],
};

export class TranslationValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TranslationValidationError";
    }
}

const MAX_ATTEMPTS = 3;

/** 테스트에서 Gemini 대신 다른 생성기를 주입할 수 있게 한다 */
export interface TranslateDeps {
    generate?: typeof generateJson;
}

async function translateChunk(
    chunk: string,
    locale: TranslationLocale,
    context: { title: string; index: number; total: number },
    generate: typeof generateJson
): Promise<{ text: string; model: string; warnings: string[] }> {
    // 번역할 내용이 없는 조각(플레이스홀더/공백만)은 그대로 둔다
    const stripped = chunk.replace(new RegExp(PLACEHOLDER_TEST.source, "g"), "").trim();
    if (!stripped || (countHangul(stripped) === 0 && !/[A-Za-z]{3,}/.test(stripped))) {
        return { text: chunk, model: "", warnings: [] };
    }

    let feedback = "";
    let lastErrors: string[] = [];
    let lastWarnings: string[] = [];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const prompt = [
            `Document title: ${context.title}`,
            `This is part ${context.index + 1} of ${context.total} of the document. Translate only this part.`,
            feedback,
            "Korean Markdown to translate:",
            "<<<",
            chunk,
            ">>>",
        ]
            .filter(Boolean)
            .join("\n");

        const result = await generate<{ translation: string }>({
            system: systemPrompt(locale),
            prompt,
            schema: chunkSchema,
            temperature: attempt === 1 ? 0.2 : 0.1,
        });

        let text = typeof result.data.translation === "string" ? result.data.translation : "";
        text = normalizePlaceholders(repairEscapedNewlines(chunk, text));

        const { errors, warnings } = validateChunk(chunk, text, locale);
        if (result.finishReason !== "STOP") errors.push(`응답이 중간에 끊김 (finishReason=${result.finishReason})`);

        // 헤딩 수 불일치는 마지막 시도 전까지만 재시도 사유로 삼는다 (HTML 태그 불일치는 항상 오류)
        if (attempt < MAX_ATTEMPTS) {
            errors.push(...warnings.filter((w) => w.startsWith("헤딩")));
        }

        if (errors.length === 0) {
            return { text, model: result.model, warnings };
        }

        lastErrors = errors;
        lastWarnings = warnings;
        feedback = `IMPORTANT: Your previous translation of this part was rejected because: ${errors.join("; ")}. Translate the whole part again, completely, following every rule.`;
        console.warn(`[translate] ${locale} 조각 ${context.index + 1}/${context.total} 검증 실패 (${attempt}/${MAX_ATTEMPTS}): ${errors.join("; ")}`);
    }

    throw new TranslationValidationError(
        `조각 ${context.index + 1}/${context.total} 번역 검증 실패: ${lastErrors.join("; ")}${lastWarnings.length ? ` (경고: ${lastWarnings.join("; ")})` : ""}`
    );
}

async function translateMeta(
    title: string,
    description: string,
    locale: TranslationLocale,
    generate: typeof generateJson
): Promise<{ title: string; description: string; model: string }> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const result = await generate<{ title: string; description: string }>({
            system: `You translate the title and summary of a Korean security research blog post into ${LANGUAGE_NAMES[locale]}.
Keep product names, CVE IDs, code identifiers, and symbols (such as a leading "!") unchanged. ${STYLE_GUIDE[locale]}
If the description is empty, return an empty string for it. Return JSON: {"title": "...", "description": "..."}`,
            prompt: JSON.stringify({ title, description }),
            schema: metaSchema,
            temperature: 0.2,
            maxOutputTokens: 4096,
        });
        const outTitle = String(result.data.title || "").trim();
        const outDesc = String(result.data.description || "").trim();
        const titleOk = outTitle.length > 0 && countHangul(outTitle) <= Math.max(2, countHangul(title) * 0.2);
        const descOk = !description.trim() || (outDesc.length > 0 && countHangul(outDesc) <= Math.max(4, countHangul(description) * 0.1));
        if (titleOk && descOk) {
            return { title: outTitle, description: description.trim() ? outDesc : "", model: result.model };
        }
    }
    throw new TranslationValidationError("제목/설명 번역 검증 실패");
}

/** 동시 실행 개수를 제한하는 map — 하나가 실패하면 남은 항목은 시작하지 않는다 */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let next = 0;
    let failed = false;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (next < items.length && !failed) {
            const index = next++;
            try {
                results[index] = await fn(items[index], index);
            } catch (error) {
                failed = true;
                throw error;
            }
        }
    });
    await Promise.all(workers);
    return results;
}

export interface TranslateDocumentInput {
    title: string;
    description: string;
    markdown: string;
    locale: TranslationLocale;
}

export interface TranslatedDocument {
    title: string;
    description: string;
    markdown: string;
    html: string;
    model: string;
    warnings: string[];
}

export async function translateDocument(
    input: TranslateDocumentInput,
    deps: TranslateDeps = {}
): Promise<TranslatedDocument> {
    const { locale } = input;
    const generate = deps.generate ?? generateJson;
    const protectedMd = protectMarkdown(input.markdown);
    const chunks = splitMarkdown(protectedMd.text);

    const [meta, translatedChunks] = await Promise.all([
        translateMeta(input.title, input.description || "", locale, generate),
        mapLimit(chunks, 3, (chunk, index) =>
            translateChunk(chunk.body, locale, { title: input.title, index, total: chunks.length }, generate)
        ),
    ]);

    // 원문과 같은 구분자(빈 줄 등)로 다시 이어 붙인다
    const joined = joinChunks(chunks, translatedChunks.map((c) => c.text));
    const markdown = restoreMarkdown(joined, protectedMd).replace(/\s+$/, "") + "\n";
    const html = await markdownToHtml(markdown);

    // 저장 전에 상태 점검과 같은 기준으로 확인한다.
    // (여기서 통과하지 못한 번역이 저장되면 자동 동기화가 같은 글을 계속 다시 번역하게 된다)
    const sourceHtml = await markdownToHtml(input.markdown);
    const problems = inspectStoredTranslation(html, sourceHtml, locale);
    if (problems.length) {
        throw new TranslationValidationError(`번역 결과 점검 실패: ${problems.map((p) => PROBLEM_LABELS[p]).join(", ")}`);
    }

    const models = [...new Set([meta.model, ...translatedChunks.map((c) => c.model)].filter(Boolean))];
    const warnings = translatedChunks.flatMap((c, i) => c.warnings.map((w) => `조각 ${i + 1}: ${w}`));

    return {
        title: meta.title,
        description: meta.description,
        markdown,
        html,
        model: models.join(","),
        warnings,
    };
}
