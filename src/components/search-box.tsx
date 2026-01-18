"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, FileText, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface SearchItem {
    title: string;
    slug: string;
    description?: string;
    type: "post" | "writeup";
    date: string;
    tags: string[];
    // writeup specific
    ctf?: string;
    category?: string;
}

interface SearchBoxProps {
    items: SearchItem[];
}

/**
 * 검색 컴포넌트 (다국어 지원)
 * 클라이언트 사이드 퍼지 검색
 */
export function SearchBox({ items }: SearchBoxProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [results, setResults] = useState<SearchItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // 검색 로직
    const search = useCallback(
        (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setResults([]);
                return;
            }

            const lowerQuery = searchQuery.toLowerCase();
            const filtered = items.filter((item) => {
                const titleMatch = item.title.toLowerCase().includes(lowerQuery);
                const descMatch = item.description?.toLowerCase().includes(lowerQuery);
                const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
                const ctfMatch = item.ctf?.toLowerCase().includes(lowerQuery);
                const categoryMatch = item.category?.toLowerCase().includes(lowerQuery);

                return titleMatch || descMatch || tagMatch || ctfMatch || categoryMatch;
            });

            setResults(filtered);
        },
        [items]
    );

    useEffect(() => {
        search(query);
    }, [query, search]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
    };

    return (
        <div className="relative w-full max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={t("search.placeholder", locale)}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={clearSearch}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </form>

            {/* 검색 결과 드롭다운 */}
            {isOpen && query && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {results.slice(0, 8).map((item) => (
                        <Link
                            key={`${item.type}-${item.slug}`}
                            href={`/${item.type === "post" ? "posts" : "writeups"}/${item.slug}`}
                            className="flex items-start gap-3 p-3 hover:bg-accent transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="mt-0.5">
                                {item.type === "post" ? (
                                    <FileText className="h-4 w-4 text-primary" />
                                ) : (
                                    <Flag className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{item.title}</p>
                                {item.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                        {item.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {item.type === "post" ? "Post" : item.ctf}
                                    </span>
                                    {item.tags.slice(0, 2).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs bg-muted px-1.5 py-0.5 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                    {results.length > 8 && (
                        <div className="p-2 text-center border-t border-border">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    router.push(`/search?q=${encodeURIComponent(query)}`);
                                    setIsOpen(false);
                                }}
                            >
                                {locale === "ko" ? `모든 결과 보기 (${results.length})` :
                                    locale === "en" ? `View all results (${results.length})` :
                                        locale === "ja" ? `すべての結果を見る (${results.length})` :
                                            `查看所有结果 (${results.length})`}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* 결과 없음 */}
            {isOpen && query && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
                    {t("search.noresults", locale)}
                </div>
            )}

            {/* 클릭 외부 감지 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
