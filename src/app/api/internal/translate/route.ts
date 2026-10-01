import { NextRequest, NextResponse } from "next/server";
import { hasInternalToken } from "@/lib/admin-auth";
import { saveTranslation } from "@/lib/db";
import { isGeminiConfigured } from "@/lib/gemini";
import { isTranslationLocale, TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/github";
import { computeSourceHash, isContentType } from "@/lib/translation/source";
import { translateDocument } from "@/lib/translation/translate";

/**
 * Internal Translation API (Bearer INTERNAL_API_TOKEN)
 * 스크립트/에이전트가 글을 올린 뒤 호출해 번역을 동기식으로 생성한다.
 *
 * 요청: { content, title, description?, slug, type, targetLocales? }
 * 응답: { success, message, translations: { [locale]: { title, description, content(markdown) } }, errors? }
 *
 * 예전과 달리 번역이 실패한 언어는 한국어 원문으로 덮어쓰지 않고 errors에만 기록한다.
 */

export const maxDuration = 600;

export async function POST(request: NextRequest) {
    if (!hasInternalToken(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isGeminiConfigured()) {
        return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { content, title, description, slug, type } = body;

        if (typeof content !== "string" || !content.trim() || !title || !isValidSlug(slug) || !isContentType(type)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const locales: TranslationLocale[] = Array.isArray(body.targetLocales) && body.targetLocales.length
            ? body.targetLocales.filter(isTranslationLocale)
            : [...TRANSLATION_LOCALES];

        const source = { title: String(title), description: String(description || ""), markdown: content };
        const sourceHash = computeSourceHash(source);
        const translations: Record<string, { title: string; description: string; content: string }> = {};
        const errors: string[] = [];

        for (const locale of locales) {
            try {
                const result = await translateDocument({ ...source, locale });
                saveTranslation({
                    slug,
                    type,
                    locale,
                    title: result.title,
                    description: result.description || null,
                    content: result.html,
                    contentMd: result.markdown,
                    sourceHash,
                    model: result.model,
                });
                translations[locale] = { title: result.title, description: result.description, content: result.markdown };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[internal-translate] ${slug} ${locale} 실패: ${message}`);
                errors.push(`${locale}: ${message}`);
            }
        }

        const succeeded = Object.keys(translations);
        return NextResponse.json(
            {
                success: errors.length === 0,
                message: succeeded.length ? `Translated to: ${succeeded.join(", ")}` : "Translation failed",
                translations,
                errors: errors.length ? errors : undefined,
            },
            { status: succeeded.length ? 200 : 502 }
        );
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Translation failed" },
            { status: 500 }
        );
    }
}
