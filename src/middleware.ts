import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware
 * - /admin 경로 보호
 * - 허니팟 경로 로깅
 */

// 허니팟 경로 목록
const HONEYPOT_PATHS = [
    "/wp-admin",
    "/wp-login.php",
    "/phpmyadmin",
    "/admin.php",
    "/administrator",
    "/.env",
    "/config.php",
    "/xmlrpc.php",
];

export default auth(async (req) => {
    const { pathname } = req.nextUrl;

    // 허니팟 경로 감지
    if (HONEYPOT_PATHS.some((path) => pathname.startsWith(path))) {
        // 로깅 API 호출 (비동기, fire-and-forget)
        const logData = {
            path: pathname,
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            timestamp: new Date().toISOString(),
        };

        // 로깅 API 호출 (서버 내부)
        try {
            await fetch(new URL("/api/honeypot", req.nextUrl.origin), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(logData),
            });
        } catch {
            // 로깅 실패해도 계속 진행
        }

        // 404 반환
        return NextResponse.rewrite(new URL("/not-found", req.url));
    }

    // /admin 경로 보호
    if (pathname.startsWith("/admin")) {
        // 로그인 페이지는 제외
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        // 인증되지 않은 사용자는 로그인 페이지로
        if (!req.auth) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/admin/:path*",
        "/wp-admin/:path*",
        "/wp-login.php",
        "/phpmyadmin/:path*",
        "/admin.php",
        "/administrator/:path*",
        "/.env",
        "/config.php",
        "/xmlrpc.php",
    ],
};
