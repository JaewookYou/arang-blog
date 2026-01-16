/**
 * i18n Utilities
 * 다국어 지원을 위한 유틸리티 함수들
 */

export const LOCALES = ["ko", "en", "ja", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
};

export const DEFAULT_LOCALE: Locale = "ko";

/**
 * 브라우저 언어를 감지하여 지원 언어로 매핑
 */
export function detectLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return DEFAULT_LOCALE;

    const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim().toLowerCase());

    for (const lang of languages) {
        if (lang.startsWith("ko")) return "ko";
        if (lang.startsWith("en")) return "en";
        if (lang.startsWith("ja")) return "ja";
        if (lang.startsWith("zh")) return "zh";
    }

    return DEFAULT_LOCALE;
}

/**
 * 포스트가 현재 공개 가능한지 확인 (예약 발행 체크)
 */
export function isPostVisible(post: {
    published: boolean;
    scheduledAt?: string;
}): boolean {
    if (!post.published) return false;
    if (!post.scheduledAt) return true;
    return new Date(post.scheduledAt) <= new Date();
}

/**
 * 로케일별 URL 생성
 */
export function getLocalizedPath(path: string, locale: Locale): string {
    if (locale === DEFAULT_LOCALE) return path;
    return `/${locale}${path}`;
}
