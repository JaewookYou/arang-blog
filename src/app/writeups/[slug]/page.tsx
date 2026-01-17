import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { writeups } from "@/.velite";
import { MDXContent } from "@/components/mdx-content";
import { formatDate } from "@/lib/utils";
import { Comments } from "@/components/comments";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { PostLocaleSwitcher } from "@/components/post-locale-switcher";
import { getTranslation, getAvailableLocales, type Locale } from "@/lib/db";

/**
 * Writeup Detail Page
 * CTF Writeup 상세 페이지 (다국어 지원)
 */

interface WriteupPageProps {
    params: Promise<{ slug: string }>;
}

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

// 정적 경로 생성
export async function generateStaticParams() {
    return writeups
        .filter((w) => !w.slug.endsWith("-en") && !w.slug.endsWith("-ja") && !w.slug.endsWith("-zh"))
        .map((writeup) => ({ slug: writeup.slug }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: WriteupPageProps) {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const writeup = writeups.find((w) => w.slug === slug);

    if (!writeup) {
        return { title: "Writeup Not Found" };
    }

    // 쿠키에서 언어 확인
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value as Locale || "ko";

    let title = writeup.title;
    let description = writeup.description || `${writeup.ctf} - ${writeup.category} challenge writeup`;

    if (locale !== "ko") {
        const translation = getTranslation(slug, "writeup", locale);
        if (translation) {
            title = translation.title;
            description = translation.description || description;
        }
    }

    const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&type=writeup&description=${encodeURIComponent(description)}`;

    return {
        title: `${title} | ${writeup.ctf}`,
        description,
        openGraph: {
            title: `${title} | ${writeup.ctf}`,
            description,
            type: "article",
            publishedTime: writeup.date,
            tags: writeup.tags,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${writeup.ctf}`,
            description,
            images: [ogImageUrl],
        },
    };
}

export default async function WriteupPage({ params }: WriteupPageProps) {
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const writeup = writeups.find((w) => w.slug === slug);

    if (!writeup || !writeup.published) {
        notFound();
    }

    // 쿠키에서 현재 언어 확인
    const cookieStore = await cookies();
    const currentLocale = (cookieStore.get("locale")?.value as Locale) || "ko";

    // 사용 가능한 번역 언어 조회
    const availableLocales = getAvailableLocales(slug, "writeup");

    // 번역 데이터 조회
    let displayTitle = writeup.title;
    let displayDescription = writeup.description;
    let displayContent = writeup.body;
    let isTranslated = false;

    if (currentLocale !== "ko") {
        const translation = getTranslation(slug, "writeup", currentLocale);
        if (translation) {
            // 동적 import로 marked 사용 (서버 컴포넌트에서)
            const { marked } = await import("marked");
            marked.setOptions({ gfm: true, breaks: true });

            displayTitle = translation.title;
            displayDescription = translation.description || writeup.description;
            displayContent = marked.parse(translation.content) as string;
            isTranslated = true;
        }
    }

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
                    {/* CTF Info Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {writeup.ctf}
                        </span>
                        <span className="px-3 py-1 bg-muted rounded-full">
                            {writeup.category ? `${categoryIcons[writeup.category]} ${writeup.category.toUpperCase()}` : '🏁 CTF'}
                        </span>
                        {writeup.difficulty && (
                            <span className={`px-3 py-1 bg-muted rounded-full font-medium ${difficultyColors[writeup.difficulty]}`}>
                                {writeup.difficulty}
                            </span>
                        )}
                        {isTranslated && (
                            <span className="text-xs text-blue-500">
                                🌐 번역됨
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {displayTitle}
                    </h1>

                    {displayDescription && (
                        <p className="text-lg text-muted-foreground">
                            {displayDescription}
                        </p>
                    )}

                    {/* Stats Bar */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
                        <time dateTime={writeup.date}>{formatDate(writeup.date)}</time>

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
                            <div className="flex gap-2">
                                {writeup.tags.map((tag) => (
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
                    <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                </div>

                {/* Comments */}
                <Comments postSlug={slug} postType="writeup" />
            </article>
        </>
    );
}
