import Link from "next/link";
import { Suspense } from "react";
import { posts } from "@/.velite";
import { formatDate } from "@/lib/utils";
import { TagFilter } from "@/components/tag-filter";

/**
 * Posts List Page
 * 블로그 포스트 목록 페이지 (태그 필터링 지원)
 */

export const metadata = {
    title: "Posts",
    description: "기술 블로그 포스트 목록",
};

interface PostsPageProps {
    searchParams: Promise<{ tag?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
    const { tag } = await searchParams;

    // 발행된 포스트만 필터링하고 날짜순 정렬
    const publishedPosts = posts
        .filter((post) => post.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 태그 필터링
    const filteredPosts = tag
        ? publishedPosts.filter((post) => post.tags.includes(tag))
        : publishedPosts;

    // 모든 태그 수집
    const allTags = publishedPosts.flatMap((post) => post.tags);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">📝 Posts</h1>
                <p className="text-muted-foreground">
                    기술 블로그 포스트 모음
                    {tag && (
                        <span className="ml-2 text-primary">
                            #{tag} 태그 필터링 중
                        </span>
                    )}
                </p>
            </div>

            {/* Tag Filter */}
            <Suspense fallback={null}>
                <TagFilter tags={allTags} basePath="/posts" />
            </Suspense>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>
                        {tag
                            ? `"${tag}" 태그를 가진 포스트가 없습니다.`
                            : "아직 작성된 포스트가 없습니다."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                        <article
                            key={post.slug}
                            className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
                        >
                            <Link href={`/posts/${post.slug}`} className="absolute inset-0">
                                <span className="sr-only">{post.title}</span>
                            </Link>

                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {post.title}
                                </h2>

                                {post.description && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {post.description}
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
