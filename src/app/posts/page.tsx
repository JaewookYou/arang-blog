import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { posts } from "@/.velite";
import { formatDate } from "@/lib/utils";
import { TagFilter } from "@/components/tag-filter";
import { isPostVisible } from "@/lib/i18n";
import { postsPageTranslations, type Locale } from "@/lib/translations";
import { getTranslation } from "@/lib/db";

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

    // 쿠키에서 현재 언어
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value as Locale) || "ko";
    const t = postsPageTranslations[locale] || postsPageTranslations.ko;

    // 발행된 포스트만 필터링 (번역 파일 제외)
    const publishedPosts = posts
        .filter((post) => isPostVisible(post) && !post.slug.endsWith("-en") && !post.slug.endsWith("-ja") && !post.slug.endsWith("-zh"))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 태그 필터링
    const filteredPosts = tag
        ? publishedPosts.filter((post) => post.tags.includes(tag))
        : publishedPosts;

    // 모든 태그 수집
    const allTags = publishedPosts.flatMap((post) => post.tags);

    // 번역된 제목/설명 가져오기
    const postsWithTranslations = filteredPosts.map((post) => {
        if (locale !== "ko") {
            const translation = getTranslation(post.slug, "post", locale);
            if (translation) {
                return {
                    ...post,
                    displayTitle: translation.title,
                    displayDescription: translation.description || post.description,
                };
            }
        }
        return {
            ...post,
            displayTitle: post.title,
            displayDescription: post.description,
        };
    });

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
                <p className="text-muted-foreground">
                    {t.description}
                    {tag && (
                        <span className="ml-2 text-primary">
                            #{tag} {t.tagFiltering}
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
                            ? `"${tag}" ${t.noPostsWithTag}`
                            : t.noPosts}
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
                                    <time dateTime={post.date}>{formatDate(post.date)}</time>

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
