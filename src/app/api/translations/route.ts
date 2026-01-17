import { NextRequest, NextResponse } from "next/server";
import { getTranslation, getAllTranslations, getAvailableLocales, upsertTranslation, deleteTranslation } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Translations API
 * DB에서 번역 데이터 조회/수정
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

// 번역 수정/추가
export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, type, locale, title, description, content } = body;

        if (!slug || !type || !locale || !title || !content) {
            return NextResponse.json(
                { error: "Missing required fields: slug, type, locale, title, content" },
                { status: 400 }
            );
        }

        const translation = upsertTranslation(slug, type, locale, title, description || "", content);

        return NextResponse.json({
            success: true,
            translation,
        });
    } catch (error) {
        console.error("Translation update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update translation" },
            { status: 500 }
        );
    }
}

// 번역 삭제
export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "post";
    const locale = searchParams.get("locale");

    if (!slug) {
        return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    try {
        const deletedCount = deleteTranslation(slug, type, locale || undefined);

        return NextResponse.json({
            success: true,
            deletedCount,
        });
    } catch (error) {
        console.error("Translation delete error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete translation" },
            { status: 500 }
        );
    }
}
