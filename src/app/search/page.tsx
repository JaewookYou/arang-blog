import { posts, writeups } from "@/.velite";
import { SearchBox } from "@/components/search-box";
import { formatDateLocale, t, Locale } from "@/lib/i18n";
import Link from "next/link";
import { FileText, Flag } from "lucide-react";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search",
    description: "Search posts and CTF writeups",
};

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q || "";

    // 쿠키에서 현재 언어
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value as Locale) || "ko";

    // 검색 데이터 준비
    const searchItems = [
        ...posts
            .filter((p) => p.published)
            .map((p) => ({
                title: p.title,
                slug: p.slug,
                description: p.description,
                type: "post" as const,
                date: p.date,
                tags: p.tags,
            })),
        ...writeups
            .filter((w) => w.published)
            .map((w) => ({
                title: w.title,
                slug: w.slug,
                description: w.description,
                type: "writeup" as const,
                date: w.date,
                tags: w.tags,
                ctf: w.ctf,
                category: w.category,
            })),
    ];

    // 서버 사이드 검색 (초기 결과)
    const lowerQuery = query.toLowerCase();
    const results = query
        ? searchItems.filter((item) => {
            const titleMatch = item.title.toLowerCase().includes(lowerQuery);
            const descMatch = item.description?.toLowerCase().includes(lowerQuery);
            const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
            const ctfMatch = "ctf" in item && item.ctf?.toLowerCase().includes(lowerQuery);
            const categoryMatch = "category" in item && item.category?.toLowerCase().includes(lowerQuery);
            return titleMatch || descMatch || tagMatch || ctfMatch || categoryMatch;
        })
        : [];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{t("search.title", locale)}</h1>
                <p className="text-muted-foreground">{t("search.description", locale)}</p>
            </div>

            {/* 검색 박스 */}
            <SearchBox items={searchItems} />

            {/* 검색 결과 */}
            {query && (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        &quot;{query}&quot; {t("search.results", locale)}: {results.length}
                        {locale === "ko" ? "건" : locale === "ja" ? "" : locale === "zh" ? "" : ""}
                    </p>

                    {results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((item) => (
                                <Link
                                    key={`${item.type}-${item.slug}`}
                                    href={`/${item.type === "post" ? "posts" : "writeups"}/${item.slug}`}
                                    className="block p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {item.type === "post" ? (
                                                <FileText className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Flag className="h-5 w-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-lg font-semibold">{item.title}</h2>
                                            {item.description && (
                                                <p className="text-muted-foreground mt-1">
                                                    {item.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>{formatDateLocale(item.date, locale)}</span>
                                                <span>•</span>
                                                <span>
                                                    {item.type === "post" ? "Post" : `${("ctf" in item && item.ctf) || "CTF"}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {t("search.noresults", locale)}
                        </div>
                    )}
                </div>
            )}

            {/* 검색 쿼리 없을 때 */}
            {!query && (
                <div className="text-center py-12 text-muted-foreground">
                    {t("search.enterquery", locale)}
                </div>
            )}
        </div>
    );
}
