import { notFound } from "next/navigation";
import { writeups } from "@/.velite";
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
 * Writeup Detail Page
 * CTF Writeup 상세 페이지 (다국어 지원)
 */

const categoryIcons: Record<string, string> = {
    web: "🌐",
    pwn: "💥",
    rev: "🔍",
    crypto: "🔐",
    forensics: "🔬",
    misc: "🎲",
};

const difficultyColors: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-orange-500",
    insane: "text-red-500",
};

interface WriteupPageProps {
    params: Promise<{ slug: string }>;
}

function findWriteup(rawSlug: string) {
    const slug = decodeURIComponent(rawSlug);
    const writeup = writeups.find((w) => w.slug === slug);
    return writeup && isPostVisible(writeup) ? writeup : null;
}

export async function generateMetadata({ params }: WriteupPageProps) {
    const { slug: rawSlug } = await params;
    const writeup = findWriteup(rawSlug);
    if (!writeup) {
        return { title: "Writeup Not Found", robots: { index: false } };
    }

    const locale = await getRequestLocale();
    const article = localizeArticle("writeup", writeup, locale);
    const description = article.description || `${writeup.ctf ?? "CTF"} - ${writeup.category ?? ""} challenge writeup`;
    const title = writeup.ctf ? `${article.title} | ${writeup.ctf}` : article.title;
    const image = ogImageUrl("writeup", article.title, description);

    return {
        title,
        description,
        alternates: articleAlternates("writeup", writeup.slug, locale),
        openGraph: {
            title,
            description,
            type: "article",
            url: articlePath("writeup", writeup.slug, article.translated ? locale : undefined),
            publishedTime: writeup.date,
            tags: writeup.tags,
            ...ogLocaleFor(article.translated ? locale : "ko"),
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}

export default async function WriteupPage({ params }: WriteupPageProps) {
    const { slug: rawSlug } = await params;
    const writeup = findWriteup(rawSlug);
    if (!writeup) notFound();

    const locale = await getRequestLocale();
    const article = localizeArticle("writeup", writeup, locale);
    const availableLocales = getAvailableLocales(writeup.slug, "writeup");

    // 이전/다음 writeup (날짜순)
    const sorted = visibleSorted(writeups);
    const currentIndex = sorted.findIndex((w) => w.slug === writeup.slug);
    const prev = sorted[currentIndex + 1];
    const next = sorted[currentIndex - 1];

    return (
        <>
            <ReadingProgress />
            <TableOfContents />

            <article className="max-w-3xl mx-auto">
                <PostLocaleSwitcher availableLocales={availableLocales} currentLocale={locale} />

                <header className="mb-8 space-y-4">
                    {/* CTF Info Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {writeup.ctf && (
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{writeup.ctf}</span>
                        )}
                        <span className="px-3 py-1 bg-muted rounded-full">
                            {writeup.category ? `${categoryIcons[writeup.category]} ${writeup.category.toUpperCase()}` : "🏁 CTF"}
                        </span>
                        {writeup.difficulty && (
                            <span className={`px-3 py-1 bg-muted rounded-full font-medium ${difficultyColors[writeup.difficulty]}`}>
                                {writeup.difficulty}
                            </span>
                        )}
                        {article.translated && (
                            <span className="text-xs text-blue-500">🌐 {t("translated", locale)}</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>

                    {article.description && <p className="text-lg text-muted-foreground">{article.description}</p>}

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-y border-border py-4">
                        <time dateTime={writeup.date}>{formatDateLocale(writeup.date, locale)}</time>

                        {writeup.points && (
                            <span className="font-mono">
                                <span className="text-primary">{writeup.points}</span> points
                            </span>
                        )}

                        {writeup.solves && (
                            <span>
                                <span className="text-primary">{writeup.solves}</span> solves
                            </span>
                        )}

                        {writeup.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {writeup.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                <TranslationNotice
                    article={article}
                    locale={locale}
                    originalHref={articlePath("writeup", writeup.slug, "ko") + "?lang=ko"}
                />

                <div className="prose prose-zinc dark:prose-invert max-w-none" lang={HTML_LANG[article.translated ? locale : "ko"]}>
                    <ContentRenderer content={article.html} locale={locale} />
                </div>

                <PostNavigation
                    basePath="/writeups"
                    prevPost={prev ? { slug: prev.slug, title: localizedSummary("writeup", prev, locale).title } : undefined}
                    nextPost={next ? { slug: next.slug, title: localizedSummary("writeup", next, locale).title } : undefined}
                />

                <Comments postSlug={writeup.slug} postType="writeup" />
            </article>
        </>
    );
}
