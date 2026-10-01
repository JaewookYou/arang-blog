import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isTranslationLocale, TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n";
import { isValidSlug, normalizeKind, parseFrontmatter } from "@/lib/github";
import { enqueueTranslations } from "@/lib/translation/service";

/**
 * Admin Translation API (글쓰기/수정 화면의 "번역 생성" 버튼)
 * 긴 글은 번역에 몇 분이 걸려 요청이 프록시 타임아웃에 걸리므로
 * 백그라운드 작업으로 등록하고 바로 응답한다. 진행 상황은 /api/admin/translations 에서 확인한다.
 *
 * body: { slug, type, content, title?, description?, targetLocales? }
 *  - content에 프론트매터가 있으면 거기서 title/description을 읽는다.
 */
export async function POST(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const body = await request.json();
        const slug = body.slug;
        const kind = normalizeKind(body.type);
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: "슬러그를 먼저 입력하세요." }, { status: 400 });
        }
        if (typeof body.content !== "string" || !body.content.trim()) {
            return NextResponse.json({ error: "번역할 내용이 없습니다." }, { status: 400 });
        }

        let parsed;
        try {
            parsed = parseFrontmatter(body.content);
        } catch (error) {
            return NextResponse.json(
                { error: `프론트매터 YAML 오류: ${error instanceof Error ? error.message : String(error)}` },
                { status: 400 }
            );
        }

        const title = String(parsed.data.title ?? body.title ?? "").trim();
        const description = String(parsed.data.description ?? body.description ?? "").trim();
        if (!title) {
            return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
        }

        const locales: TranslationLocale[] = Array.isArray(body.targetLocales)
            ? body.targetLocales.filter(isTranslationLocale)
            : [...TRANSLATION_LOCALES];

        const { queued } = enqueueTranslations([
            { type: kind, slug, locales, source: { title, description, markdown: parsed.body }, reason: "manual" },
        ]);

        return NextResponse.json(
            {
                success: true,
                queued,
                message: `${queued}개 언어 번역을 시작했습니다. 번역 관리 화면에서 진행 상황을 확인할 수 있습니다.`,
            },
            { status: 202 }
        );
    } catch (error) {
        console.error("Translation enqueue error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Translation failed" },
            { status: 500 }
        );
    }
}
