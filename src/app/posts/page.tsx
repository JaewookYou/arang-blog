import Link from "next/link";
import { Suspense } from "react";
import { posts } from "@/.velite";
import { formatDateLocale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { TagFilter } from "@/components/tag-filter";
import { postsPageTranslations } from "@/lib/translations";
import { localizedSummary, visibleSorted } from "@/lib/article";

/**
 * Posts List Page
 * 블로그 포스트 목록 페이지 (다국어 지원)
 */

export const metadata = {
    title: "Posts",
    description: "Tech blog posts",
};

interface PostsPageProps {
    searchParams: Promise<{ tag?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
    const { tag } = await searchParams;

    const locale = await getRequestLocale();
    const tr = postsPageTranslations[locale] || postsPageTranslations.ko;

    // 공개된 포스트만 (예약 발행 포함), 날짜 내림차순
    const publishedPosts = visibleSorted(posts);

    // 태그 필터링
    const filteredPosts = tag ? publishedPosts.filter((post) => post.tags.includes(tag)) : publishedPosts;

    // 모든 태그 수집
    const allTags = publishedPosts.flatMap((post) => post.tags);

    // 번역된 제목/설명
    const postsWithTranslations = filteredPosts.map((post) => {
        const summary = localizedSummary("post", post, locale);
        return { ...post, displayTitle: summary.title, displayDescription: summary.description };
    });

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{tr.title}</h1>
                <p className="text-muted-foreground">
                    {tr.description}
                    {tag && (
                        <span className="ml-2 text-primary">
                            #{tag} {tr.tagFiltering}
                        </span>
                    )}
                </p>
            </div>

            {/* Tag Filter */}
            <Suspense fallback={null}>
                <TagFilter tags={allTags} basePath="/posts" />
            </Suspense>

            {postsWithTranslations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>
                        {tag
                            ? `"${tag}" ${tr.noPostsWithTag}`
                            : tr.noPosts}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {postsWithTranslations.map((post) => (
                        <article
                            key={post.slug}
                            className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
                        >
                            <Link href={`/posts/${post.slug}`} className="absolute inset-0">
                                <span className="sr-only">{post.displayTitle}</span>
                            </Link>

                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {post.displayTitle}
                                </h2>

                                {post.displayDescription && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {post.displayDescription}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <time dateTime={post.date}>{formatDateLocale(post.date, locale)}</time>

                                    {post.tags.length > 0 && (
                                        <div className="flex gap-2">
                                            {post.tags.slice(0, 3).map((t) => (
                                                <span
                                                    key={t}
                                                    className={`px-2 py-0.5 rounded-full text-xs ${t === tag
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                        }`}
                                                >
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
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
