import { notFound } from "next/navigation";
import { posts } from "@/.velite";
import { MDXContent } from "@/components/mdx-content";
import { formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { PostNavigation } from "@/components/post-navigation";

/**
 * Post Detail Page
 * 블로그 포스트 상세 페이지
 */

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

// 정적 경로 생성
export async function generateStaticParams() {
    return posts.map((post) => ({ slug: post.slug }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: PostPageProps) {
    const { slug } = await params;
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    const ogImageUrl = `/api/og?title=${encodeURIComponent(post.title)}&type=post&description=${encodeURIComponent(post.description || "")}`;

    return {
        title: post.title,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            publishedTime: post.date,
            tags: post.tags,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            images: [ogImageUrl],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;

    // 날짜순 정렬된 포스트 목록
    const sortedPosts = posts
        .filter((p) => p.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
    const post = sortedPosts[currentIndex];

    if (!post) {
        notFound();
    }

    // 이전/다음 포스트 (날짜순)
    const prevPost = sortedPosts[currentIndex + 1];
    const nextPost = sortedPosts[currentIndex - 1];

    return (
        <>
            <ReadingProgress />
            <TableOfContents />

            <article className="max-w-3xl mx-auto">
                {/* Header */}
                <header className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {post.title}
                    </h1>

                    {post.description && (
                        <p className="text-lg text-muted-foreground">
                            {post.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-4">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>

                        {post.tags.length > 0 && (
                            <div className="flex gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 bg-muted rounded-full text-xs"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <MDXContent code={post.body} />
                </div>

                {/* Navigation */}
                <PostNavigation
                    basePath="/posts"
                    prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : undefined}
                    nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : undefined}
                />
            </article>
        </>
    );
}
