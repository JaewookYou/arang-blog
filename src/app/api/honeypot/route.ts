import { NextRequest, NextResponse } from "next/server";
import { addHoneypotLog } from "@/lib/db";

/**
 * Honeypot API
 * 악의적인 경로 접근을 로깅
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, ip, userAgent } = body;

        if (path && ip) {
            addHoneypotLog(path, ip, userAgent || "unknown");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Honeypot logging error:", error);
        return NextResponse.json({ error: "Logging failed" }, { status: 500 });
    }
}
