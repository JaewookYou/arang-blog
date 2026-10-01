import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import {
    ALL_HONEYPOT_PATHS,
    getCategoryFromPath,
    analyzePayload,
    isSuspiciousUserAgent,
    pathMatchesRule,
    type Severity,
    type AttackCategory,
} from "@/lib/waf-rules";
import { getHoneypotToken } from "@/lib/internal-token";

/**
 * Middleware
 * - /admin 경로 보호
 * - WAF 기반 허니팟 탐지 및 로깅
 * - 언어 결정: ?lang= 파라미터 > locale 쿠키 > 국가/브라우저 언어 (크롤러는 원문 한국어)
 */

const SUPPORTED_LOCALES = ["ko", "en", "ja", "zh"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const isSupported = (value: string | null | undefined): value is SupportedLocale =>
    !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);

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

// 검색엔진/링크 미리보기 봇: 같은 URL은 항상 같은 언어(원문)를 보여줘야 색인이 꼬이지 않는다
const BOT_UA = /bot|crawl|spider|slurp|yeti|daum|bingpreview|facebookexternalhit|kakaotalk-scrap|embedly|whatsapp|telegram|discord|slack|preview/i;

function detectLocale(req: NextRequest): SupportedLocale {
    // 1. Cloudflare CF-IPCountry 헤더 (있는 경우)
    const country = req.headers.get("cf-ipcountry");
    if (country && COUNTRY_TO_LOCALE[country]) {
        return COUNTRY_TO_LOCALE[country];
    }

    // 2. Accept-Language 헤더 (q 값 순서대로)
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) {
        const languages = acceptLanguage
            .split(",")
            .map((part) => {
                const [code, ...params] = part.trim().split(";");
                const q = params.find((p) => p.trim().startsWith("q="));
                return { code: code.toLowerCase(), q: q ? parseFloat(q.trim().slice(2)) || 0 : 1 };
            })
            .sort((a, b) => b.q - a.q);

        for (const { code } of languages) {
            const short = code.split("-")[0];
            if (isSupported(short)) return short;
        }
    }

    // 3. 기본값: 영어
    return "en";
}

// 허니팟 탐지 결과
interface HoneypotMatch {
    category: AttackCategory;
    severity: Severity;
    payload?: string;
    blockable: boolean;
}

// 이 블로그가 실제로 제공하는 경로 — 경로 기반 허니팟 규칙을 적용하지 않는다
const APP_PREFIXES = [
    "/posts", "/writeups", "/search", "/about", "/admin",
    "/api/auth/", "/api/og", "/api/comments", "/api/translations", "/api/admin/", "/api/internal/", "/api/honeypot",
    "/uploads/", "/static/", "/images/", "/_next/",
];

// 검색어·제목처럼 사용자가 쓴 글자가 그대로 들어가는 경로 — 페이로드가 보여도 차단하지 않고 기록만 한다
const CONTENT_QUERY_PATHS = ["/search", "/api/og", "/posts", "/writeups"];

/** 세그먼트 단위 접두사 비교 — "/admin"은 "/admin", "/admin/x"에 맞고 "/administrator"에는 맞지 않는다 */
const underPrefix = (pathname: string, prefix: string) => {
    const base = prefix.replace(/\/$/, "");
    return pathname === base || pathname.startsWith(`${base}/`) || (prefix.endsWith("/") && pathname.startsWith(prefix));
};

const isAppPath = (pathname: string) => pathname === "/" || APP_PREFIXES.some((p) => underPrefix(pathname, p));

function detectHoneypot(req: NextRequest): HoneypotMatch | null {
    const { pathname, search } = req.nextUrl;
    const userAgent = req.headers.get("user-agent") || "";

    if (!isAppPath(pathname)) {
        // 1. 경로 기반 탐지 (세그먼트 단위 일치)
        if (ALL_HONEYPOT_PATHS.some((p) => pathMatchesRule(pathname, p))) {
            const result = getCategoryFromPath(pathname) ?? { category: "unknown" as AttackCategory, severity: "MEDIUM" as Severity };
            return { ...result, blockable: true };
        }

        // 2. 파일 확장자 기반 탐지 (백업 파일 등)
        const lower = pathname.toLowerCase();
        if ([".bak", ".sql", ".zip", ".tar", ".gz", ".rar", ".7z", ".old", ".backup", ".swp"].some((ext) => lower.endsWith(ext))) {
            return { category: "backup", severity: "HIGH", blockable: true };
        }
        if (lower.endsWith(".cgi")) {
            return { category: "scanner", severity: "MEDIUM", blockable: false };
        }
    }

    // 3. Query String 페이로드 분석
    if (search) {
        const payloadResult = analyzePayload(search);
        if (payloadResult) {
            const contentQuery = CONTENT_QUERY_PATHS.some((p) => underPrefix(pathname, p));
            return {
                category: payloadResult.category,
                severity: payloadResult.severity,
                payload: search.slice(0, 500),
                blockable: !contentQuery,
            };
        }
    }

    // 4. 의심스러운 User-Agent 탐지 (기록만)
    if (isSuspiciousUserAgent(userAgent)) {
        return { category: "scanner", severity: "MEDIUM", blockable: false };
    }

    return null;
}

async function logHoneypot(req: NextRequest, match: HoneypotMatch) {
    const token = await getHoneypotToken();
    if (!token) return;

    const logData = {
        path: req.nextUrl.pathname + req.nextUrl.search,
        // Apache가 마지막에 덧붙인 값이 실제 접속 IP (앞쪽 값은 위조 가능)
        ip: req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || req.headers.get("x-real-ip") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        method: req.method,
        category: match.category,
        severity: match.severity,
        payload: match.payload,
    };

    // 같은 컨테이너 안의 서버로 직접 보낸다 (외부 프록시를 거치지 않음)
    const internalOrigin = `http://127.0.0.1:${process.env.PORT || 3000}`;
    try {
        await fetch(new URL("/api/honeypot", internalOrigin), {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-honeypot-token": token },
            body: JSON.stringify(logData),
        });
    } catch {
        // 로깅 실패해도 계속 진행
    }
}

/** 응답 쿠키를 설정하고, 이번 요청의 서버 컴포넌트도 같은 언어를 보도록 요청 쿠키를 바꾼다 */
function withLocale(req: NextRequest, locale: SupportedLocale, persist: boolean): NextResponse {
    const headers = new Headers(req.headers);
    const cookies = (req.headers.get("cookie") || "")
        .split(/;\s*/)
        .filter((c) => c && !c.startsWith("locale="));
    cookies.push(`locale=${locale}`);
    headers.set("cookie", cookies.join("; "));

    const response = NextResponse.next({ request: { headers } });
    if (persist && req.cookies.get("locale")?.value !== locale) {
        response.cookies.set("locale", locale, {
            maxAge: 60 * 60 * 24 * 365, // 1년
            path: "/",
            sameSite: "lax",
        });
    }
    return response;
}

export default auth(async (req, ctx) => {
    const { pathname, searchParams } = req.nextUrl;
    const event = ctx as unknown as NextFetchEvent | undefined;

    // 허니팟 탐지
    const honeypotMatch = detectHoneypot(req);
    if (honeypotMatch) {
        const logging = logHoneypot(req, honeypotMatch);
        if (typeof event?.waitUntil === "function") event.waitUntil(logging);
        else await logging;

        // 확실한 공격 경로/페이로드(CRITICAL, HIGH)는 404 처리
        if (honeypotMatch.blockable && (honeypotMatch.severity === "CRITICAL" || honeypotMatch.severity === "HIGH")) {
            return NextResponse.rewrite(new URL("/not-found", req.url));
        }
    }

    // /admin 경로 보호 (/administrator 같은 허니팟 경로는 위에서 처리됨)
    if (underPrefix(pathname, "/admin")) {
        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        if (!req.auth) {
            return NextResponse.redirect(new URL("/admin/login", req.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // 언어 결정
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = BOT_UA.test(userAgent);
    const langParam = searchParams.get("lang");
    const cookieLocale = req.cookies.get("locale")?.value;

    if (isSupported(langParam)) {
        // 언어별 링크(?lang=en, 원문 보기 ?lang=ko)는 이번 요청에만 적용하고 쿠키는 바꾸지 않는다.
        // (응답 쿠키를 설정하면 Next.js가 이번 렌더링의 쿠키도 그 값으로 덮어쓴다.
        //  처음 방문한 사람의 쿠키는 다음 일반 요청에서 브라우저 언어로 설정된다)
        return withLocale(req, langParam, false);
    }
    if (isBot) {
        return withLocale(req, "ko", false);
    }
    if (isSupported(cookieLocale)) {
        return NextResponse.next();
    }
    return withLocale(req, detectLocale(req), true);
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
        "/",
        "/posts/:path*",
        "/writeups/:path*",
        "/about",
        "/search",
        // 동적 파라미터 검사용
        "/api/:path*",
    ],
};
