import { NextRequest, NextResponse } from "next/server";
import { deleteTranslation, getAllTranslations, getAvailableLocales, getTranslation, saveTranslation } from "@/lib/db";
import { isAdminSession, requireAdmin } from "@/lib/admin-auth";
import { isTranslationLocale } from "@/lib/i18n";
import { markdownToHtml } from "@/lib/markdown";
import { htmlToMarkdown, looksLikeHtml } from "@/lib/html-to-markdown";
import { getSourceItem, isContentType } from "@/lib/translation/source";

/**
 * Translations API
 * GET    : 번역 조회 (관리자에게는 편집용 마크다운도 함께 반환)
 * PUT    : 관리자 번역 수정 — 마크다운을 받아 HTML로 렌더링해 저장
 * DELETE : 관리자 번역 삭제
 */

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "post";
    const locale = searchParams.get("locale");

    if (!slug) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    try {
        if (locale) {
            const translation = getTranslation(slug, type, locale);
            if (!translation) {
                if (await isAdminSession()) {
                    const source = isContentType(type) ? getSourceItem(type, slug) : null;
                    return NextResponse.json({
                        translation: null,
                        source: source ? { title: source.title, description: source.description, markdown: source.markdown, hash: source.hash } : null,
                    });
                }
                return NextResponse.json({ translation: null });
            }

            const { content_md, source_hash, model, ...publicFields } = translation;
            if (!(await isAdminSession())) {
                return NextResponse.json({ translation: publicFields });
            }

            // 예전 번역은 HTML만 있으므로 편집용 마크다운으로 변환해 준다
            const markdown = content_md || (looksLikeHtml(translation.content)
                ? await htmlToMarkdown(translation.content)
                : translation.content);
            const source = isContentType(type) ? getSourceItem(type, slug) : null;
            return NextResponse.json({
                translation: { ...publicFields, source_hash, model },
                markdown,
                markdownConverted: !content_md,
                source: source ? { title: source.title, description: source.description, markdown: source.markdown, hash: source.hash } : null,
            });
        }

        const translations = getAllTranslations(slug, type).map(({ content_md, source_hash, model, ...rest }) => rest);
        return NextResponse.json({ translations, availableLocales: getAvailableLocales(slug, type) });
    } catch (error) {
        console.error("Translations API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch translations" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const body = await request.json();
        const { slug, type, locale, title, description } = body;
        const markdown: unknown = body.markdown ?? body.content;

        if (!slug || !isContentType(type) || !isTranslationLocale(locale) || !title || typeof markdown !== "string" || !markdown.trim()) {
            return NextResponse.json(
                { error: "slug, type, locale, title, 내용(markdown)이 필요합니다." },
                { status: 400 }
            );
        }

        const html = await markdownToHtml(markdown);
        const previous = getTranslation(slug, type, locale);
        const source = getSourceItem(type, slug);

        const translation = saveTranslation({
            slug,
            type,
            locale,
            title: String(title).trim(),
            description: description ? String(description).trim() : null,
            content: html,
            contentMd: markdown,
            // 사람이 현재 원문 기준으로 다듬은 번역이므로 최신으로 표시한다
            sourceHash: source?.hash ?? previous?.source_hash ?? null,
            model: "manual",
        });

        return NextResponse.json({ success: true, translation });
    } catch (error) {
        console.error("Translation update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update translation" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "post";
    const locale = searchParams.get("locale");

    if (!slug) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    try {
        const deletedCount = deleteTranslation(slug, type, locale || undefined);
        return NextResponse.json({ success: true, deletedCount });
    } catch (error) {
        console.error("Translation delete error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete translation" },
            { status: 500 }
        );
    }
}
