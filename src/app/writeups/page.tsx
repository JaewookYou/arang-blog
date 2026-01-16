import Link from "next/link";
import { Suspense } from "react";
import { writeups } from "@/.velite";
import { formatDate } from "@/lib/utils";
import { TagFilter } from "@/components/tag-filter";

/**
 * Writeups List Page
 * CTF Writeup 목록 페이지 (태그 필터링 지원)
 */

export const metadata = {
    title: "CTF Writeups",
    description: "CTF 대회 문제 풀이 모음",
};

// 카테고리 아이콘 매핑
const categoryIcons: Record<string, string> = {
    web: "🌐",
    pwn: "💥",
    rev: "🔍",
    crypto: "🔐",
    forensics: "🔬",
    misc: "🎲",
};

// 난이도 색상 매핑
const difficultyColors: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-orange-500",
    insane: "text-red-500",
};

interface WriteupsPageProps {
    searchParams: Promise<{ tag?: string; category?: string }>;
}

export default async function WriteupsPage({ searchParams }: WriteupsPageProps) {
    const { tag, category } = await searchParams;

    // 발행된 writeup만 필터링하고 날짜순 정렬
    const publishedWriteups = writeups
        .filter((writeup) => writeup.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 태그/카테고리 필터링
    let filteredWriteups = publishedWriteups;
    if (tag) {
        filteredWriteups = filteredWriteups.filter((w) => w.tags.includes(tag));
    }
    if (category) {
        filteredWriteups = filteredWriteups.filter((w) => w.category === category);
    }

    // 모든 태그 수집
    const allTags = publishedWriteups.flatMap((writeup) => writeup.tags);

    // 카테고리 목록
    const categories = [...new Set(publishedWriteups.map((w) => w.category))].sort();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">🚩 CTF Writeups</h1>
                <p className="text-muted-foreground">
                    CTF 대회 문제 풀이 모음
                    {tag && (
                        <span className="ml-2 text-primary">#{tag} 필터링 중</span>
                    )}
                    {category && (
                        <span className="ml-2 text-primary">{categoryIcons[category]} {category} 필터링 중</span>
                    )}
                </p>
            </div>

            {/* Category Filter */}
            <div className="mb-4 flex flex-wrap gap-2">
                <Link
                    href="/writeups"
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${!category
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                >
                    All
                </Link>
                {categories.map((cat) => (
                    <Link
                        key={cat}
                        href={`/writeups?category=${cat}`}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${category === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                    >
                        {categoryIcons[cat]} {cat.toUpperCase()}
                    </Link>
                ))}
            </div>

            {/* Tag Filter */}
            <Suspense fallback={null}>
                <TagFilter tags={allTags} basePath="/writeups" />
            </Suspense>

            {filteredWriteups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>
                        {tag || category
                            ? "해당 조건의 Writeup이 없습니다."
                            : "아직 작성된 Writeup이 없습니다."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredWriteups.map((writeup) => (
                        <article
                            key={writeup.slug}
                            className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
                        >
                            <Link href={`/writeups/${writeup.slug}`} className="absolute inset-0">
                                <span className="sr-only">{writeup.title}</span>
                            </Link>

                            <div className="space-y-3">
                                {/* CTF & Category Badge */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                        {writeup.ctf}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${category === writeup.category
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}>
                                        {categoryIcons[writeup.category]} {writeup.category.toUpperCase()}
                                    </span>
                                    {writeup.difficulty && (
                                        <span className={`font-medium ${difficultyColors[writeup.difficulty]}`}>
                                            {writeup.difficulty}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {writeup.title}
                                </h2>

                                {writeup.description && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {writeup.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <time dateTime={writeup.date}>{formatDate(writeup.date)}</time>

                                    {writeup.points && (
                                        <span className="font-mono">{writeup.points} pts</span>
                                    )}

                                    {writeup.solves && (
                                        <span className="text-muted-foreground/60">
                                            {writeup.solves} solves
                                        </span>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
