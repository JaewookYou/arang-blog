import { posts, writeups } from "@/.velite";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listTranslations } from "@/lib/db";
import { isPostVisible } from "@/lib/i18n";

/**
 * Sitemap 생성
 * 공개된 글과 언어별 주소(?lang=)를 hreflang으로 함께 알린다.
 */

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/posts`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/writeups`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ];

    // 글별로 번역이 있는 언어 목록
    const translated = new Map<string, Set<string>>();
    try {
        for (const t of listTranslations()) {
            const key = `${t.type}/${t.slug}`;
            if (!translated.has(key)) translated.set(key, new Set());
            translated.get(key)!.add(t.locale);
        }
    } catch (error) {
        console.warn("sitemap: translations unavailable", error);
    }

    const entries = (type: "post" | "writeup", docs: typeof posts | typeof writeups) =>
        docs.filter((doc) => isPostVisible(doc)).map((doc) => {
            const url = `${SITE_URL}/${type === "post" ? "posts" : "writeups"}/${encodeURIComponent(doc.slug)}`;
            const languages: Record<string, string> = { ko: url };
            for (const locale of translated.get(`${type}/${doc.slug}`) ?? []) {
                languages[locale === "zh" ? "zh-CN" : locale] = `${url}?lang=${locale}`;
            }
            return {
                url,
                lastModified: new Date(doc.date),
                changeFrequency: "monthly" as const,
                priority: 0.6,
                alternates: { languages },
            };
        });

    return [...staticRoutes, ...entries("post", posts), ...entries("writeup", writeups)];
}
