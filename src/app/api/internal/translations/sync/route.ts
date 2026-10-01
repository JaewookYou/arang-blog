import { NextRequest, NextResponse } from "next/server";
import { hasInternalToken } from "@/lib/admin-auth";
import { getTranslationOverview, syncTranslations } from "@/lib/translation/service";

/**
 * Internal Translation Sync API (Bearer INTERNAL_API_TOKEN)
 * POST: 누락·오래된 번역을 백그라운드로 생성 / GET: 현재 상태 요약
 * 예) curl -X POST -H "Authorization: Bearer $INTERNAL_API_TOKEN" https://blog.arang.kr/api/internal/translations/sync
 */
export async function POST(request: NextRequest) {
    if (!hasInternalToken(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const result = syncTranslations({ reason: "manual" });
        return NextResponse.json({ success: true, ...result, summary: getTranslationOverview().summary });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    if (!hasInternalToken(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const overview = getTranslationOverview();
    return NextResponse.json({ summary: overview.summary, config: overview.config, orphans: overview.orphans.length });
}
