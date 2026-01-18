import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    ALL_HONEYPOT_PATHS,
    getCategoryFromPath,
    analyzePayload,
    isSuspiciousUserAgent,
    type Severity,
    type AttackCategory,
} from "@/lib/waf-rules";

/**
 * Middleware
 * - /admin 경로 보호
 * - WAF 기반 허니팟 탐지 및 로깅
 * - 언어 감지 및 쿠키 설정
 */

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
        const languages = acceptLanguage.split(",").map(lang => {
            const [code] = lang.trim().split(";");
            return code;
        });

        for (const lang of languages) {
            if (LANGUAGE_TO_LOCALE[lang]) {
                return LANGUAGE_TO_LOCALE[lang];
            }
            const shortCode = lang.split("-")[0];
            if (LANGUAGE_TO_LOCALE[shortCode]) {
                return LANGUAGE_TO_LOCALE[shortCode];
            }
        }
    }

    // 4. 기본값: 영어
    return "en";
}

// 허니팟 탐지 결과
interface HoneypotMatch {
    category: AttackCategory;
    severity: Severity;
    payload?: string;
}

// 허니팟 탐지 함수
function detectHoneypot(req: NextRequest): HoneypotMatch | null {
    const { pathname, search } = req.nextUrl;
    const userAgent = req.headers.get("user-agent") || "";

    // 1. 경로 기반 탐지
    if (ALL_HONEYPOT_PATHS.some(p => pathname.startsWith(p) || pathname.includes(p))) {
        const result = getCategoryFromPath(pathname);
        if (result) {
            return result;
        }
        // 매칭되었지만 카테고리 못 찾은 경우
        return { category: "unknown", severity: "MEDIUM" };
    }

    // 2. 파일 확장자 기반 탐지 (백업 파일 등)
    const dangerousExtensions = [".bak", ".sql", ".zip", ".tar", ".gz", ".rar", ".7z", ".old", ".backup"];
    if (dangerousExtensions.some(ext => pathname.endsWith(ext))) {
        return { category: "backup", severity: "HIGH" };
    }

    // 3. Query String 페이로드 분석
    if (search) {
        const payloadResult = analyzePayload(search);
        if (payloadResult) {
            return {
                category: payloadResult.category,
                severity: payloadResult.severity,
                payload: search.slice(0, 500), // 최대 500자
            };
        }
    }

    // 4. 의심스러운 User-Agent 탐지
    if (isSuspiciousUserAgent(userAgent)) {
        return { category: "scanner", severity: "MEDIUM" };
    }

    return null;
}

export default auth(async (req) => {
    const { pathname } = req.nextUrl;

    // 허니팟 탐지
    const honeypotMatch = detectHoneypot(req);
    if (honeypotMatch) {
        const logData = {
            path: pathname + req.nextUrl.search,
            ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            userAgent: req.headers.get("user-agent") || "unknown",
            method: req.method,
            category: honeypotMatch.category,
            severity: honeypotMatch.severity,
            payload: honeypotMatch.payload,
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

        // CRITICAL 또는 HIGH 심각도는 차단 (404 반환)
        if (honeypotMatch.severity === "CRITICAL" || honeypotMatch.severity === "HIGH") {
            return NextResponse.rewrite(new URL("/not-found", req.url));
        }
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
        // Admin 경로
        "/admin/:path*",
        // 허니팟 경로 (주요 패턴)
        "/wp-admin/:path*",
        "/wp-login.php",
        "/wp-content/:path*",
        "/wp-includes/:path*",
        "/phpmyadmin/:path*",
        "/administrator/:path*",
        "/.env",
        "/.env.local",
        "/.git/:path*",
        "/config.php",
        "/xmlrpc.php",
        "/actuator/:path*",
        // 페이지 경로 (언어 감지용)
        "/posts/:path*",
        "/writeups/:path*",
        "/",
        // 동적 파라미터 검사용
        "/search",
        "/api/:path*",
    ],
};
