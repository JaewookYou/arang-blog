import { getAvailableLocales, getTranslation } from "@/lib/db";
import { isPostVisible, OG_LOCALE, type Locale } from "@/lib/i18n";
import { computeSourceHash, type ContentType } from "@/lib/translation/source";
import { sanitizeStoredHtml } from "@/lib/safe-html";

/**
 * 글 상세/목록 페이지 공용 헬퍼
 * - 현재 언어에 맞는 제목·설명·본문 선택 (번역이 없으면 원문 + 안내)
 * - 언어별 URL(?lang=)과 canonical/hreflang 메타데이터
 */

export interface ArticleDoc {
    slug: string;
    title: string;
    description?: string;
    body: string;
    raw: string;
    date: string;
    tags: string[];
    published: boolean;
    scheduledAt?: string;
}

export interface LocalizedArticle {
    title: string;
    description: string;
    html: string;
    translated: boolean; // 번역본을 보여주는 중
    stale: boolean; // 번역 이후 원문이 수정됨
    missingTranslation: boolean; // 요청 언어의 번역이 없어 원문을 보여주는 중
}

export function basePathFor(type: ContentType): string {
    return type === "writeup" ? "/writeups" : "/posts";
}

export function articlePath(type: ContentType, slug: string, locale?: Locale): string {
    const path = `${basePathFor(type)}/${encodeURIComponent(slug)}`;
    return locale && locale !== "ko" ? `${path}?lang=${locale}` : path;
}

export function localizeArticle(type: ContentType, doc: ArticleDoc, locale: Locale): LocalizedArticle {
    const original: LocalizedArticle = {
        title: doc.title,
        description: doc.description || "",
        html: doc.body,
        translated: false,
        stale: false,
        missingTranslation: false,
    };
    if (locale === "ko") return original;

    const translation = getTranslation(doc.slug, type, locale);
    if (!translation) return { ...original, missingTranslation: true };

    const currentHash = computeSourceHash({ title: doc.title, description: doc.description, markdown: doc.raw });
    return {
        title: translation.title,
        description: translation.description || doc.description || "",
        // DB의 번역 HTML은 예전 파이프라인으로 만들어졌을 수 있으므로 출력 전에 무력화 처리
        html: sanitizeStoredHtml(translation.content, `${type}/${doc.slug}/${locale}/${translation.updated_at}`),
        translated: true,
        stale: Boolean(translation.source_hash && translation.source_hash !== currentHash),
        missingTranslation: false,
    };
}

/** 목록·이전/다음 글 등에서 쓸 제목/설명 */
export function localizedSummary(
    type: ContentType,
    doc: { slug: string; title: string; description?: string },
    locale: Locale
): { title: string; description: string } {
    if (locale !== "ko") {
        const translation = getTranslation(doc.slug, type, locale);
        if (translation) {
            return { title: translation.title, description: translation.description || doc.description || "" };
        }
    }
    return { title: doc.title, description: doc.description || "" };
}

/** 공개된 글만 날짜 내림차순으로 */
export function visibleSorted<T extends { published: boolean; scheduledAt?: string; date: string }>(docs: T[]): T[] {
    return docs
        .filter((d) => isPostVisible(d))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** canonical + hreflang (번역이 있는 언어만) */
export function articleAlternates(type: ContentType, slug: string, locale: Locale) {
    const available = new Set(["ko", ...getAvailableLocales(slug, type)]);
    const languages: Record<string, string> = {};
    for (const l of ["ko", "en", "ja", "zh"] as Locale[]) {
        if (available.has(l)) languages[l === "zh" ? "zh-CN" : l] = articlePath(type, slug, l);
    }
    languages["x-default"] = articlePath(type, slug);
    const canonicalLocale: Locale = available.has(locale) ? locale : "ko";
    return { canonical: articlePath(type, slug, canonicalLocale), languages };
}

export function ogLocaleFor(locale: Locale) {
    return {
        locale: OG_LOCALE[locale],
        alternateLocale: (Object.keys(OG_LOCALE) as Locale[]).filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    };
}

export function ogImageUrl(type: "post" | "writeup", title: string, description: string): string {
    return `/api/og?title=${encodeURIComponent(title)}&type=${type}&description=${encodeURIComponent(description)}`;
}
