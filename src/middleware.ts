import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware
 * - /admin 경로 보호
 * - 허니팟 경로 로깅
 * - 언어 감지 및 쿠키 설정
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

// 지원 언어 및 국가 매핑
const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh"] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
    KR: "ko",
    JP: "ja",
    CN: "zh",
    TW: "zh",
    HK: "zh",
    US: "en",
    GB: "en",
    AU: "en",
    CA: "en",
    NZ: "en",
    IE: "en",
};

const LANGUAGE_TO_LOCALE: Record<string, SupportedLocale> = {
    ko: "ko",
    "ko-KR": "ko",
    ja: "ja",
    "ja-JP": "ja",
    zh: "zh",
    "zh-CN": "zh",
    "zh-TW": "zh",
    "zh-HK": "zh",
    en: "en",
    "en-US": "en",
    "en-GB": "en",
};

function detectLocale(req: NextRequest): SupportedLocale {
    // 1. 쿠키에서 locale 확인 (사용자가 직접 선택한 경우)
    const cookieLocale = req.cookies.get("locale")?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLocale)) {
        return cookieLocale as SupportedLocale;
    }

    // 2. Cloudflare CF-IPCountry 헤더 (있는 경우)
    const country = req.headers.get("cf-ipcountry");
    if (country && COUNTRY_TO_LOCALE[country]) {
        return COUNTRY_TO_LOCALE[country];
    }

    // 3. Accept-Language 헤더 파싱
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) {
        // "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" 형태 파싱
        const languages = acceptLanguage.split(",").map(lang => {
            const [code] = lang.trim().split(";");
            return code;
        });

        for (const lang of languages) {
            if (LANGUAGE_TO_LOCALE[lang]) {
                return LANGUAGE_TO_LOCALE[lang];
            }
            // "ko-KR" -> "ko" 시도
            const shortCode = lang.split("-")[0];
            if (LANGUAGE_TO_LOCALE[shortCode]) {
                return LANGUAGE_TO_LOCALE[shortCode];
            }
        }
    }

    // 4. 기본값: 영어
    return "en";
}

export default auth(async (req) => {
    const { pathname } = req.nextUrl;

    // 허니팟 경로 감지
    if (HONEYPOT_PATHS.some((path) => pathname.startsWith(path))) {
        const logData = {
            path: pathname,
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            timestamp: new Date().toISOString(),
        };

        try {
            await fetch(new URL("/api/honeypot", req.nextUrl.origin), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(logData),
            });
        } catch {
            // 로깅 실패해도 계속 진행
        }

        return NextResponse.rewrite(new URL("/not-found", req.url));
    }

    // /admin 경로 보호
    if (pathname.startsWith("/admin")) {
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        if (!req.auth) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
    }

    // 언어 감지 및 쿠키 설정
    const response = NextResponse.next();
    const locale = detectLocale(req);

    // 쿠키가 없거나 다르면 설정
    const currentLocale = req.cookies.get("locale")?.value;
    if (currentLocale !== locale) {
        response.cookies.set("locale", locale, {
            maxAge: 60 * 60 * 24 * 365, // 1년
            path: "/",
        });
    }

    return response;
});

export const config = {
    matcher: [
        // 기존 경로
        "/admin/:path*",
        "/wp-admin/:path*",
        "/wp-login.php",
        "/phpmyadmin/:path*",
        "/admin.php",
        "/administrator/:path*",
        "/.env",
        "/config.php",
        "/xmlrpc.php",
        // 포스트 및 라이트업 페이지에도 적용
        "/posts/:path*",
        "/writeups/:path*",
        "/",
    ],
};
