import { posts, writeups } from "@/.velite";
import { SearchBox } from "@/components/search-box";
import { formatDateLocale, t } from "@/lib/i18n";
import Link from "next/link";
import { FileText, Flag } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getRequestLocale } from "@/lib/locale-server";
import { localizedSummary, visibleSorted } from "@/lib/article";

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

    const locale = await getRequestLocale();

    // 검색 데이터 준비: 화면에는 현재 언어 제목을, 검색에는 원문+번역을 모두 사용
    const searchItems = [
        ...visibleSorted(posts).map((p) => {
            const summary = localizedSummary("post", p, locale);
            return {
                title: summary.title,
                slug: p.slug,
                description: summary.description,
                type: "post" as const,
                date: p.date,
                tags: p.tags,
                keywords: `${p.title} ${p.description ?? ""}`,
            };
        }),
        ...visibleSorted(writeups).map((w) => {
            const summary = localizedSummary("writeup", w, locale);
            return {
                title: summary.title,
                slug: w.slug,
                description: summary.description,
                type: "writeup" as const,
                date: w.date,
                tags: w.tags,
                ctf: w.ctf,
                category: w.category,
                keywords: `${w.title} ${w.description ?? ""}`,
            };
        }),
    ];

    // 서버 사이드 검색 (초기 결과)
    const lowerQuery = query.toLowerCase().trim();
    const results = lowerQuery
        ? searchItems.filter((item) => {
            const haystack = [
                item.title,
                item.description,
                item.keywords,
                ...item.tags,
                "ctf" in item ? item.ctf : "",
                "category" in item ? item.category : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(lowerQuery);
        })
        : [];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">{t("search.title", locale)}</h1>
                <p className="text-muted-foreground">{t("search.description", locale)}</p>
            </div>

            {/* 검색 박스 */}
            <Suspense fallback={null}>
                <SearchBox items={searchItems} />
            </Suspense>

            {/* 검색 결과 */}
            {query && (
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        &quot;{query}&quot; {t("search.results", locale)}: {results.length}
                        {locale === "ko" ? "건" : ""}
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
