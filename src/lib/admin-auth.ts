import { NextResponse } from "next/server";
import { auth, isWhitelisted } from "@/lib/auth";

/**
 * 관리자 API 인증 헬퍼
 * 로그인 시 화이트리스트를 통과한 GitHub 계정만 세션을 받는다.
 */
export async function isAdminSession(): Promise<boolean> {
    const session = await auth();
    return Boolean(session && isWhitelisted((session.user as { login?: string } | undefined)?.login));
}

export async function requireAdmin(): Promise<NextResponse | null> {
    const session = await auth();
    // 세션 발급 후 화이트리스트에서 빠진 계정도 막는다
    if (!session || !isWhitelisted((session.user as { login?: string } | undefined)?.login)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

/** 내부 스크립트용 Bearer 토큰 인증 */
export function hasInternalToken(request: Request): boolean {
    const expected = process.env.INTERNAL_API_TOKEN;
    if (!expected) return false;
    const header = request.headers.get("authorization") || "";
    const token = header.replace(/^Bearer\s+/i, "");
    if (token.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
}
