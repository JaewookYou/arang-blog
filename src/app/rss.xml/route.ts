import { posts, writeups } from "@/.velite";

/**
 * RSS Feed 생성
 * Route Handler로 /rss.xml 또는 /feed.xml 제공
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.arang.kr";

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    // 모든 콘텐츠 합치고 날짜순 정렬
    const allContent = [
        ...posts.filter((p) => p.published).map((p) => ({ ...p, type: "post" })),
        ...writeups.filter((w) => w.published).map((w) => ({ ...w, type: "writeup" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Arang Tech Blog</title>
    <link>${baseUrl}</link>
    <description>CTF Writeups, Security Research, and Tech Articles by Arang</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${allContent
            .map(
                (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${baseUrl}/${item.type === "post" ? "posts" : "writeups"}/${item.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${item.type === "post" ? "posts" : "writeups"}/${item.slug}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.description || item.title)}</description>
    </item>`
            )
            .join("")}
  </channel>
</rss>`;

    return new Response(feed, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
