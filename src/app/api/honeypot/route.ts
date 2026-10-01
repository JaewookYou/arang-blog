import { NextRequest, NextResponse } from "next/server";
import { addHoneypotLog } from "@/lib/db";
import { getHoneypotToken } from "@/lib/internal-token";

/**
 * Honeypot API
 * middleware가 탐지한 공격 시도를 기록한다.
 * 예전에는 누구나 이 API로 가짜 로그를 넣을 수 있었으므로 내부 토큰을 확인한다.
 */

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const clip = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : undefined);

export async function POST(request: NextRequest) {
    const expected = await getHoneypotToken();
    if (!expected || request.headers.get("x-honeypot-token") !== expected) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const path = clip(body.path, 2000);
        const ip = clip(body.ip, 100);

        if (path && ip) {
            addHoneypotLog({
                path,
                ip,
                userAgent: clip(body.userAgent, 500) || "unknown",
                method: clip(body.method, 10) || "GET",
                category: clip(body.category, 30) || "unknown",
                severity: SEVERITIES.includes(body.severity) ? body.severity : "LOW",
                payload: clip(body.payload, 500),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Honeypot logging error:", error);
        return NextResponse.json({ error: "Logging failed" }, { status: 500 });
    }
}
