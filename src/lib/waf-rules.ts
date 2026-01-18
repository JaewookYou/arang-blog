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
            "/administrator", "/admin.php", "/admin/login",
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
            "/cgi-bin", "/.cgi", "/cgi-bin/php",
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

// 경로에서 카테고리 찾기
export function getCategoryFromPath(path: string): { category: AttackCategory; severity: Severity } | null {
    for (const [category, rule] of Object.entries(HONEYPOT_PATHS)) {
        if (rule.paths.some(p => path.startsWith(p) || path.includes(p))) {
            return { category: category as AttackCategory, severity: rule.severity };
        }
    }
    return null;
}

// 페이로드 패턴 (OWASP CRS 기반)
export const PAYLOAD_PATTERNS: Record<AttackCategory, RegExp[]> = {
    sqli: [
        // 기본 SQL Injection
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        // UNION SELECT
        /union\s+(all\s+)?select/i,
        /select\s+.*\s+from\s+/i,
        // Boolean-based
        /\bor\b\s+\d+\s*=\s*\d+/i,
        /\band\b\s+\d+\s*=\s*\d+/i,
        // Time-based
        /sleep\s*\(\s*\d+\s*\)/i,
        /benchmark\s*\(/i,
        /waitfor\s+delay/i,
        // Stacked queries
        /;\s*(drop|delete|update|insert|create|alter|exec)/i,
    ],
    xss: [
        // Script 태그
        /<script[^>]*>[\s\S]*?<\/script>/i,
        /<script[^>]*>/i,
        // Event handlers
        /\bon\w+\s*=/i,
        // JavaScript URI
        /javascript\s*:/i,
        /vbscript\s*:/i,
        /data\s*:/i,
        // 위험 태그
        /<iframe[^>]*>/i,
        /<object[^>]*>/i,
        /<embed[^>]*>/i,
        /<img[^>]+onerror/i,
        /<svg[^>]+onload/i,
        // 인코딩 우회
        /&#x?[0-9a-f]+;/i,
        /%3cscript/i,
    ],
    lfi: [
        // 디렉토리 트래버설
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e%2f/i,
        /%2e%2e\//i,
        /\.\.%2f/i,
        // 민감 파일
        /etc\/passwd/i,
        /etc\/shadow/i,
        /etc\/hosts/i,
        /proc\/self/i,
        /proc\/version/i,
        /windows\/system32/i,
        /boot\.ini/i,
        /win\.ini/i,
        // PHP 래퍼
        /php:\/\/filter/i,
        /php:\/\/input/i,
        /expect:\/\//i,
    ],
    rce: [
        // Log4Shell
        /\$\{jndi:/i,
        /\$\{env:/i,
        /\$\{sys:/i,
        /\$\{java:/i,
        // 커맨드 인젝션
        /;\s*\w+/,
        /\|\s*\w+/,
        /`[^`]+`/,
        /\$\([^)]+\)/,
        // 위험 함수
        /\beval\s*\(/i,
        /\bexec\s*\(/i,
        /\bsystem\s*\(/i,
        /\bpassthru\s*\(/i,
        /\bshell_exec\s*\(/i,
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

    const decoded = decodeURIComponent(input).replace(/\+/g, " ");

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
