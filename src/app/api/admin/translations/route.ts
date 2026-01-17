import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/db";

/**
 * Admin Translations API
 * 모든 번역 목록 조회
 */

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getDatabase();
        const translations = db.prepare(`
            SELECT id, slug, type, locale, title, updated_at
            FROM translations
            ORDER BY slug, type, locale
        `).all();

        return NextResponse.json({ translations });
    } catch (error) {
        console.error("Admin translations error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch translations" },
            { status: 500 }
        );
    }
}
