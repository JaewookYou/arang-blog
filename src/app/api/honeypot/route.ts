import { NextRequest, NextResponse } from "next/server";
import { addHoneypotLog } from "@/lib/db";

/**
 * Honeypot API
 * WAF 룰셋 기반 공격 탐지 로깅
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, ip, userAgent, method, category, severity, payload } = body;

        if (path && ip) {
            addHoneypotLog({
                path,
                ip,
                userAgent: userAgent || "unknown",
                method: method || "GET",
                category: category || "unknown",
                severity: severity || "LOW",
                payload: payload || undefined,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Honeypot logging error:", error);
        return NextResponse.json({ error: "Logging failed" }, { status: 500 });
    }
}
