/**
 * WAF Rules - OWASP CRS 기반 공격 탐지 패턴
 * 허니팟 기능에서 사용
 */

// 심각도 레벨
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// 공격 카테고리
export type AttackCategory =
    | "admin"    // CMS/Admin 접근
    | "config"   // 설정 파일 노출
    | "scanner"  // 자동화 스캐너
    | "backup"   // 백업 파일 접근
    | "api"      // API 탐색
    | "sqli"     // SQL Injection
    | "xss"      // Cross-Site Scripting
    | "lfi"      // Local File Inclusion
    | "rce"      // Remote Code Execution
    | "unknown"; // 미분류

// 허니팟 경로 규칙 (OWASP CRS 기반)
export const HONEYPOT_PATHS: Record<AttackCategory, { paths: string[]; severity: Severity }> = {
    admin: {
        severity: "HIGH",
        paths: [
            // WordPress
            "/wp-admin", "/wp-login.php", "/wp-content", "/wp-includes",
            "/wp-json", "/wp-cron.php",
            // 일반 Admin
            "/administrator", "/admin.php", 
            // Database Admin
            "/phpmyadmin", "/pma", "/myadmin", "/mysql", "/mysqladmin",
            "/adminer", "/dbadmin",
            // 호스팅 패널
            "/cpanel", "/webmail", "/plesk",
            // 기타 CMS
            "/joomla/administrator", "/drupal/admin", "/typo3",
            "/bitrix/admin", "/modx/manager",
        ],
    },
    config: {
        severity: "CRITICAL",
        paths: [
            // 환경 파일
            "/.env", "/.env.local", "/.env.production", "/.env.development",
            "/.env.backup", "/.env.bak", "/.env.old",
            // 설정 파일
            "/config.php", "/configuration.php", "/settings.php",
            "/wp-config.php", "/wp-config.php.bak", "/wp-config.php.old",
            "/config.yml", "/config.json", "/config.xml",
            // 웹서버 설정
            "/.htaccess", "/.htpasswd", "/web.config", "/nginx.conf",
            // 앱 설정
            "/database.yml", "/secrets.yml", "/credentials.json",
            "/application.properties", "/application.yml",
        ],
    },
    scanner: {
        severity: "MEDIUM",
        paths: [
            // WordPress 스캐너 대상
            "/xmlrpc.php", "/wp-trackback.php",
            // 취약점 스캐너 대상
            "/cgi-bin", "/cgi-bin/php",
            "/shell.php", "/cmd.php", "/eval.php", "/exec.php",
            "/phpinfo.php", "/info.php", "/test.php", "/debug.php",
            // 클라우드/컨테이너
            "/actuator", "/actuator/health", "/actuator/env",
            "/api/v1/pods", "/.docker", "/Dockerfile",
            // 보안 파일
            "/.well-known/security.txt", "/security.txt",
            "/robots.txt.bak",
        ],
    },
    backup: {
        severity: "HIGH",
        paths: [
            // 백업 파일 확장자
            "/backup.zip", "/backup.tar.gz", "/backup.sql",
            "/db.sql", "/database.sql", "/dump.sql",
            "/site.zip", "/www.zip", "/public.zip",
            // 버전 관리
            "/.svn", "/.svn/entries", "/.svn/wc.db",
            "/.git", "/.git/config", "/.git/HEAD",
            "/.gitignore", "/.gitattributes",
            // 에디터 백업
            "/.DS_Store", "/Thumbs.db",
        ],
    },
    api: {
        severity: "LOW",
        paths: [
            // API 문서/테스트
            "/api/debug", "/api/test", "/api/dev",
            "/swagger", "/swagger-ui", "/swagger.json", "/swagger.yaml",
            "/openapi.json", "/openapi.yaml",
            "/graphql", "/.graphql", "/graphiql",
            "/api-docs", "/redoc",
            // 버전 탐색
            "/v1", "/v2", "/v3", "/api/v1", "/api/v2",
        ],
    },
    // 페이로드 기반 카테고리 (경로 매칭 없음)
    sqli: { severity: "CRITICAL", paths: [] },
    xss: { severity: "HIGH", paths: [] },
    lfi: { severity: "CRITICAL", paths: [] },
    rce: { severity: "CRITICAL", paths: [] },
    unknown: { severity: "LOW", paths: [] },
};

// 모든 허니팟 경로 플랫 리스트
export const ALL_HONEYPOT_PATHS: string[] = Object.values(HONEYPOT_PATHS)
    .flatMap(rule => rule.paths);

/**
 * 경로 규칙이 세그먼트 단위로 일치하는지
 * 예전에는 includes()를 써서 "/v1", "/mysql" 같은 짧은 규칙이 정상 글 주소에도 걸릴 수 있었다.
 * "/wp-admin"은 "/wp-admin", "/wp-admin/x", "/blog/wp-admin"에는 맞지만 "/wp-admin2"에는 맞지 않는다.
 */
export function pathMatchesRule(pathname: string, rule: string): boolean {
    const path = pathname.toLowerCase();
    const target = rule.toLowerCase();
    let index = path.indexOf(target);
    while (index !== -1) {
        const next = path[index + target.length];
        if (next === undefined || next === "/") return true;
        index = path.indexOf(target, index + 1);
    }
    return false;
}

// 경로에서 카테고리 찾기
export function getCategoryFromPath(path: string): { category: AttackCategory; severity: Severity } | null {
    for (const [category, rule] of Object.entries(HONEYPOT_PATHS)) {
        if (rule.paths.some((p) => pathMatchesRule(path, p))) {
            return { category: category as AttackCategory, severity: rule.severity };
        }
    }
    return null;
}

// 페이로드 패턴 (OWASP CRS 기반)
// 예전 규칙은 작은따옴표, #, --, ;단어 만으로도 SQLi/RCE로 판정해서
// 제목에 '가 들어간 글의 OG 이미지, "C#" 검색 등 정상 요청이 404로 차단되었다.
export const PAYLOAD_PATTERNS: Record<AttackCategory, RegExp[]> = {
    sqli: [
        /\bunion\b[\s\S]{0,40}?\bselect\b/i,
        /'\s*(or|and)\s+['"\d(]/i,
        /\b(or|and)\b\s+\d+\s*=\s*\d+/i,
        /'\s*(--|#|\/\*)/,
        /\bsleep\s*\(\s*\d+\s*\)/i,
        /\bbenchmark\s*\(/i,
        /\bwaitfor\s+delay\b/i,
        /\bpg_sleep\s*\(/i,
        /;\s*(drop|delete|update|insert|create|alter|exec|shutdown)\b/i,
        /\b(information_schema|xp_cmdshell|sysobjects)\b/i,
    ],
    xss: [
        /<script\b/i,
        /%3cscript/i,
        /<[a-z][^>]*\bon[a-z]+\s*=/i,
        /<(iframe|object|embed)\b/i,
        /\bjavascript\s*:/i,
        /\bvbscript\s*:/i,
        /\bdata\s*:\s*text\/html/i,
    ],
    lfi: [
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e(%2f|\/|%5c)/i,
        /\.\.%2f/i,
        /\/etc\/(passwd|shadow|hosts)\b/i,
        /\/proc\/(self|version)\b/i,
        /windows\/system32/i,
        /\b(boot|win)\.ini\b/i,
        /\bphp:\/\/(filter|input)/i,
        /\bexpect:\/\//i,
    ],
    rce: [
        /\$\{(jndi|env|sys|java):/i,
        /\$\([^)]*\b(curl|wget|bash|sh|nc|id|whoami|cat)\b[^)]*\)/i,
        /[;&|]\s*(cat|ls|id|whoami|uname|wget|curl|bash|sh|nc|ncat|python3?|perl|powershell)\b/i,
        /\b(passthru|shell_exec|proc_open|popen)\s*\(/i,
    ],
    admin: [],
    config: [],
    scanner: [],
    backup: [],
    api: [],
    unknown: [],
};

// 페이로드 분석
export function analyzePayload(input: string): { category: AttackCategory; severity: Severity; pattern: string } | null {
    if (!input) return null;

    let decoded = input;
    try {
        decoded = decodeURIComponent(input.replace(/\+/g, " "));
    } catch {
        // 잘못된 % 인코딩이면 예외가 나므로 원문 그대로 검사한다
    }

    for (const [category, patterns] of Object.entries(PAYLOAD_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(decoded) || pattern.test(input)) {
                const rule = HONEYPOT_PATHS[category as AttackCategory];
                return {
                    category: category as AttackCategory,
                    severity: rule.severity,
                    pattern: pattern.toString(),
                };
            }
        }
    }
    return null;
}

// 위험 User-Agent 패턴
export const SUSPICIOUS_USER_AGENTS = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /dirbuster/i,
    /gobuster/i,
    /wpscan/i,
    /nuclei/i,
    /burp/i,
    /zap/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /arachni/i,
    /w3af/i,
    /python-requests/i,
    /curl\//i,
    /wget\//i,
    /libwww-perl/i,
    /java\//i,
    /go-http-client/i,
];

export function isSuspiciousUserAgent(userAgent: string): boolean {
    return SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent));
}
