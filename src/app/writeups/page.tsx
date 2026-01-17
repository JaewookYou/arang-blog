import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { writeups } from "@/.velite";
import { formatDate } from "@/lib/utils";
import { TagFilter } from "@/components/tag-filter";
import { writeupsPageTranslations, type Locale } from "@/lib/translations";
import { getTranslation } from "@/lib/db";

/**
 * Writeups List Page
 * CTF Writeup 목록 페이지 (다국어 지원)
 */

export const metadata = {
    title: "CTF Writeups",
    description: "CTF challenge writeups",
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

    // 쿠키에서 현재 언어
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value as Locale) || "ko";
    const t = writeupsPageTranslations[locale] || writeupsPageTranslations.ko;

    // 발행된 writeup만 필터링 (번역 파일 제외)
    const publishedWriteups = writeups
        .filter((w) => w.published && !w.slug.endsWith("-en") && !w.slug.endsWith("-ja") && !w.slug.endsWith("-zh"))
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

    // 카테고리 목록 (undefined 필터링)
    const categories = [...new Set(publishedWriteups.map((w) => w.category).filter(Boolean))].sort() as string[];

    // 번역된 제목/설명 가져오기
    const writeupsWithTranslations = filteredWriteups.map((writeup) => {
        if (locale !== "ko") {
            const translation = getTranslation(writeup.slug, "writeup", locale);
            if (translation) {
                return {
                    ...writeup,
                    displayTitle: translation.title,
                    displayDescription: translation.description || writeup.description,
                };
            }
        }
        return {
            ...writeup,
            displayTitle: writeup.title,
            displayDescription: writeup.description,
        };
    });

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-muted-foreground">
                    {t.description}
                    {tag && (
                        <span className="ml-2 text-primary">#{tag} {t.tagFiltering}</span>
                    )}
                    {category && (
                        <span className="ml-2 text-primary">{categoryIcons[category]} {category} {t.categoryFiltering}</span>
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

            {writeupsWithTranslations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>
                        {tag || category
                            ? t.noWriteupsFiltered
                            : t.noWriteups}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {writeupsWithTranslations.map((writeup) => (
                        <article
                            key={writeup.slug}
                            className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
                        >
                            <Link href={`/writeups/${writeup.slug}`} className="absolute inset-0">
                                <span className="sr-only">{writeup.displayTitle}</span>
                            </Link>

                            <div className="space-y-3">
                                {/* CTF & Category Badge */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                        {writeup.ctf}
                                    </span>
                                    {writeup.category && (
                                        <span className={`px-2 py-0.5 rounded-full ${category === writeup.category
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}>
                                            {categoryIcons[writeup.category]} {writeup.category.toUpperCase()}
                                        </span>
                                    )}
                                    {writeup.difficulty && (
                                        <span className={`font-medium ${difficultyColors[writeup.difficulty]}`}>
                                            {writeup.difficulty}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {writeup.displayTitle}
                                </h2>

                                {writeup.displayDescription && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {writeup.displayDescription}
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
