import { notFound } from "next/navigation";
import { writeups } from "@/.velite";
import { MDXContent } from "@/components/mdx-content";
import { formatDate } from "@/lib/utils";
import { Comments } from "@/components/comments";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";

/**
 * Writeup Detail Page
 * CTF Writeup 상세 페이지
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
    return writeups.map((writeup) => ({ slug: writeup.slug }));
}

// 동적 메타데이터
export async function generateMetadata({ params }: WriteupPageProps) {
    const { slug } = await params;
    const writeup = writeups.find((w) => w.slug === slug);

    if (!writeup) {
        return { title: "Writeup Not Found" };
    }

    const description = writeup.description || `${writeup.ctf} - ${writeup.category} challenge writeup`;
    const ogImageUrl = `/api/og?title=${encodeURIComponent(writeup.title)}&type=writeup&description=${encodeURIComponent(description)}`;

    return {
        title: `${writeup.title} | ${writeup.ctf}`,
        description,
        openGraph: {
            title: `${writeup.title} | ${writeup.ctf}`,
            description,
            type: "article",
            publishedTime: writeup.date,
            tags: writeup.tags,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: writeup.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${writeup.title} | ${writeup.ctf}`,
            description,
            images: [ogImageUrl],
        },
    };
}

export default async function WriteupPage({ params }: WriteupPageProps) {
    const { slug } = await params;
    const writeup = writeups.find((w) => w.slug === slug);

    if (!writeup || !writeup.published) {
        notFound();
    }

    return (
        <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-8 space-y-4">
                {/* CTF Info Bar */}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {writeup.ctf}
                    </span>
                    <span className="px-3 py-1 bg-muted rounded-full">
                        {categoryIcons[writeup.category]} {writeup.category.toUpperCase()}
                    </span>
                    {writeup.difficulty && (
                        <span className={`px-3 py-1 bg-muted rounded-full font-medium ${difficultyColors[writeup.difficulty]}`}>
                            {writeup.difficulty}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {writeup.title}
                </h1>

                {writeup.description && (
                    <p className="text-lg text-muted-foreground">
                        {writeup.description}
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
                <MDXContent code={writeup.body} />
            </div>

            {/* Comments */}
            <Comments postSlug={slug} postType="writeup" />
        </article>
    );
}
