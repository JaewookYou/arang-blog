import { NextRequest, NextResponse } from "next/server";
import { getTranslation, getAllTranslations, getAvailableLocales } from "@/lib/db";

/**
 * Translations API
 * DB에서 번역 데이터 조회
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
        // 특정 언어 요청
        if (locale) {
            const translation = getTranslation(slug, type, locale);
            if (translation) {
                return NextResponse.json({ translation });
            }
            return NextResponse.json({ translation: null });
        }

        // 모든 번역 + 사용 가능한 언어 목록
        const translations = getAllTranslations(slug, type);
        const locales = getAvailableLocales(slug, type);

        return NextResponse.json({
            translations,
            availableLocales: locales,
        });
    } catch (error) {
        console.error("Translations API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch translations" },
            { status: 500 }
        );
    }
}
