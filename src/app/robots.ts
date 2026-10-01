import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt 생성
 * 검색 엔진 크롤러 지침
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/api/og"],
                disallow: ["/api/", "/admin", "/_next/"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
