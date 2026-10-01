import { posts, writeups } from "@/.velite";
import { SITE_URL } from "@/lib/site";
import { isPostVisible } from "@/lib/i18n";

/**
 * RSS Feed 생성 (/rss.xml)
 */

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    const allContent = [
        ...posts.filter((p) => isPostVisible(p)).map((p) => ({ ...p, type: "post" as const })),
        ...writeups.filter((w) => isPostVisible(w)).map((w) => ({ ...w, type: "writeup" as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const items = allContent
        .map((item) => {
            const link = `${SITE_URL}/${item.type === "post" ? "posts" : "writeups"}/${encodeURIComponent(item.slug)}`;
            const categories = item.tags.map((tag) => `\n      <category>${escapeXml(tag)}</category>`).join("");
            return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.description || item.title)}</description>${categories}
    </item>`;
        })
        .join("");

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Arang Tech Blog</title>
    <link>${SITE_URL}</link>
    <description>CTF Writeups, Security Research, and Tech Articles by Arang</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;

    return new Response(feed, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
