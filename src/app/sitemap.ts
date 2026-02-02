import { posts, writeups } from "@/.velite";
import type { MetadataRoute } from "next";

/**
 * Sitemap 생성
 * SEO를 위한 사이트맵 자동 생성
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.arang.kr";

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/posts`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/writeups`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];

    // 블로그 포스트 라우트
    const postRoutes: MetadataRoute.Sitemap = posts
        .filter((post) => post.published)
        .map((post) => ({
            url: `${baseUrl}/posts/${post.slug}`,
            lastModified: new Date(post.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));

    // CTF Writeup 라우트
    const writeupRoutes: MetadataRoute.Sitemap = writeups
        .filter((writeup) => writeup.published)
        .map((writeup) => ({
            url: `${baseUrl}/writeups/${writeup.slug}`,
            lastModified: new Date(writeup.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        }));

    return [...staticRoutes, ...postRoutes, ...writeupRoutes];
}
