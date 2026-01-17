import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { posts } from "@/.velite";
import { MDXContent } from "@/components/mdx-content";
import { formatDate } from "@/lib/utils";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { PostNavigation } from "@/components/post-navigation";
import { Comments } from "@/components/comments";
import { PostLocaleSwitcher } from "@/components/post-locale-switcher";
import { getTranslation, getAvailableLocales, type Locale } from "@/lib/db";

/**
 * Post Detail Page
 * 블로그 포스트 상세 페이지 (다국어 지원)
 */

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

// 정적 경로 생성 (원본 slug만)
export async function generateStaticParams() {
    // locale 접미사가 없는 원본 포스트만 포함
    return posts
        .filter((post) => !post.slug.endsWith("-en") && !post.slug.endsWith("-ja") && !post.slug.endsWith("-zh"))
        .map((post) => ({ slug: post.slug }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: PostPageProps) {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
        return { title: "Post Not Found" };
    }

    // 쿠키에서 언어 확인
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value as Locale || "ko";

    // 번역이 있으면 번역된 제목/설명 사용
    let title = post.title;
    let description = post.description;

    if (locale !== "ko") {
        const translation = getTranslation(slug, "post", locale);
        if (translation) {
            title = translation.title;
            description = translation.description || post.description;
        }
    }

    const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&type=post&description=${encodeURIComponent(description || "")}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: post.date,
            tags: post.tags,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);

    // 날짜순 정렬된 포스트 목록 (번역 파일 제외)
    const sortedPosts = posts
        .filter((p) => p.published && !p.slug.endsWith("-en") && !p.slug.endsWith("-ja") && !p.slug.endsWith("-zh"))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const currentIndex = sortedPosts.findIndex((p) => p.slug === slug);
    const post = sortedPosts[currentIndex];

    if (!post) {
        notFound();
    }

    // 쿠키에서 현재 언어 확인
    const cookieStore = await cookies();
    const currentLocale = (cookieStore.get("locale")?.value as Locale) || "ko";

    // 사용 가능한 번역 언어 조회
    const availableLocales = getAvailableLocales(slug, "post");

    // 번역 데이터 조회
    let displayTitle = post.title;
    let displayDescription = post.description;
    let displayContent = post.body;
    let isTranslated = false;

    if (currentLocale !== "ko") {
        const translation = getTranslation(slug, "post", currentLocale);
        if (translation) {
            // 동적 import로 marked 사용 (서버 컴포넌트에서)
            const { marked } = await import("marked");
            marked.setOptions({ gfm: true, breaks: true });

            displayTitle = translation.title;
            displayDescription = translation.description || post.description;
            displayContent = marked.parse(translation.content) as string;
            isTranslated = true;
        }
    }

    // 이전/다음 포스트 (날짜순)
    const prevPost = sortedPosts[currentIndex + 1];
    const nextPost = sortedPosts[currentIndex - 1];

    return (
        <>
            <ReadingProgress />
            <TableOfContents />

            <article className="max-w-3xl mx-auto">
                {/* 언어 선택 */}
                <PostLocaleSwitcher
                    availableLocales={availableLocales}
                    currentLocale={currentLocale}
                />

                {/* Header */}
                <header className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {displayTitle}
                    </h1>

                    {displayDescription && (
                        <p className="text-lg text-muted-foreground">
                            {displayDescription}
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

                        {isTranslated && (
                            <span className="text-xs text-blue-500">
                                🌐 번역됨
                            </span>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                </div>

                {/* Navigation */}
                <PostNavigation
                    basePath="/posts"
                    prevPost={prevPost ? { slug: prevPost.slug, title: prevPost.title } : undefined}
                    nextPost={nextPost ? { slug: nextPost.slug, title: nextPost.title } : undefined}
                />

                {/* Comments */}
                <Comments postSlug={slug} postType="post" />
            </article>
        </>
    );
}
