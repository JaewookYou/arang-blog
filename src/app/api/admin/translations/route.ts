import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteTranslation } from "@/lib/db";
import { isTranslationLocale, type TranslationLocale } from "@/lib/i18n";
import { enqueueTranslations, getTranslationOverview, syncTranslations } from "@/lib/translation/service";
import { isContentType } from "@/lib/translation/source";

/**
 * Admin Translations API
 * GET  : 글별·언어별 번역 상태 + 고아 번역 + 설정
 * POST : { action: "sync" }                              누락/오래됨/문제/실패 번역 일괄 생성
 *        { action: "translate", type, slug, locales? }   특정 글 (재)번역
 *        { action: "delete-orphans" }                    원문이 없는 번역 삭제
 */
export async function GET() {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        return NextResponse.json(getTranslationOverview());
    } catch (error) {
        console.error("Admin translations error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch translations" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const body = await request.json();

        if (body.action === "sync") {
            const result = syncTranslations({ reason: "manual" });
            return NextResponse.json({ success: true, ...result });
        }

        if (body.action === "translate") {
            if (!isContentType(body.type) || typeof body.slug !== "string") {
                return NextResponse.json({ error: "type과 slug가 필요합니다." }, { status: 400 });
            }
            const locales: TranslationLocale[] | undefined = Array.isArray(body.locales)
                ? body.locales.filter(isTranslationLocale)
                : undefined;
            const result = enqueueTranslations([{ type: body.type, slug: body.slug, locales, reason: "manual" }]);
            return NextResponse.json({ success: true, ...result });
        }

        if (body.action === "delete-orphans") {
            const { orphans } = getTranslationOverview();
            let deleted = 0;
            for (const orphan of orphans) {
                deleted += deleteTranslation(orphan.slug, orphan.type, orphan.locale);
            }
            return NextResponse.json({ success: true, deleted });
        }

        return NextResponse.json({ error: "알 수 없는 action입니다." }, { status: 400 });
    } catch (error) {
        console.error("Admin translations action error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Action failed" },
            { status: 500 }
        );
    }
}
