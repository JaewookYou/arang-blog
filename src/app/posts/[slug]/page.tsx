import { notFound } from "next/navigation";
import { posts } from "@/.velite";
import { formatDateLocale, HTML_LANG, isPostVisible, t } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { PostNavigation } from "@/components/post-navigation";
import { Comments } from "@/components/comments";
import { PostLocaleSwitcher } from "@/components/post-locale-switcher";
import { ContentRenderer } from "@/components/content-renderer";
import { TranslationNotice } from "@/components/translation-notice";
import { getAvailableLocales } from "@/lib/db";
import {
    articleAlternates,
    articlePath,
    localizeArticle,
    localizedSummary,
    ogImageUrl,
    ogLocaleFor,
    visibleSorted,
} from "@/lib/article";

/**
 * Post Detail Page
 * 블로그 포스트 상세 페이지 (다국어 지원)
 */

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

function findPost(rawSlug: string) {
    const slug = decodeURIComponent(rawSlug);
    const post = posts.find((p) => p.slug === slug);
    return post && isPostVisible(post) ? post : null;
}

export async function generateMetadata({ params }: PostPageProps) {
    const { slug: rawSlug } = await params;
    const post = findPost(rawSlug);
    if (!post) {
        return { title: "Post Not Found", robots: { index: false } };
    }

    const locale = await getRequestLocale();
    const article = localizeArticle("post", post, locale);
    const image = ogImageUrl("post", article.title, article.description);

    return {
        title: article.title,
        description: article.description,
        alternates: articleAlternates("post", post.slug, locale),
        openGraph: {
            title: article.title,
            description: article.description,
            type: "article",
            url: articlePath("post", post.slug, article.translated ? locale : undefined),
            publishedTime: post.date,
            tags: post.tags,
            ...ogLocaleFor(article.translated ? locale : "ko"),
            images: [{ url: image, width: 1200, height: 630, alt: article.title }],
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.description,
            images: [image],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug: rawSlug } = await params;
    const post = findPost(rawSlug);
    if (!post) notFound();

    const locale = await getRequestLocale();
    const article = localizeArticle("post", post, locale);
    const availableLocales = getAvailableLocales(post.slug, "post");

    // 이전/다음 포스트 (날짜순)
    const sortedPosts = visibleSorted(posts);
    const currentIndex = sortedPosts.findIndex((p) => p.slug === post.slug);
    const prevPost = sortedPosts[currentIndex + 1];
    const nextPost = sortedPosts[currentIndex - 1];

    return (
        <>
            <ReadingProgress />
            <TableOfContents />

            <article className="max-w-3xl mx-auto">
                <PostLocaleSwitcher availableLocales={availableLocales} currentLocale={locale} />

                <header className="mb-8 space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>

                    {article.description && <p className="text-lg text-muted-foreground">{article.description}</p>}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground border-b border-border pb-4">
                        <time dateTime={post.date}>{formatDateLocale(post.date, locale)}</time>

                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {article.translated && (
                            <span className="text-xs text-blue-500">🌐 {t("translated", locale)}</span>
                        )}
                    </div>
                </header>

                <TranslationNotice article={article} locale={locale} originalHref={articlePath("post", post.slug, "ko") + "?lang=ko"} />

                <div className="prose prose-zinc dark:prose-invert max-w-none" lang={HTML_LANG[article.translated ? locale : "ko"]}>
                    <ContentRenderer content={article.html} locale={locale} />
                </div>

                <PostNavigation
                    basePath="/posts"
                    prevPost={prevPost ? { slug: prevPost.slug, title: localizedSummary("post", prevPost, locale).title } : undefined}
                    nextPost={nextPost ? { slug: nextPost.slug, title: localizedSummary("post", nextPost, locale).title } : undefined}
                />

                <Comments postSlug={post.slug} postType="post" />
            </article>
        </>
    );
}
