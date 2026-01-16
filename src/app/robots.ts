import type { MetadataRoute } from "next";

/**
 * robots.txt 생성
 * 검색 엔진 크롤러 지침
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arang.dev";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/_next/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
