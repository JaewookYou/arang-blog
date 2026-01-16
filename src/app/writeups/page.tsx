import Link from "next/link";
import { writeups } from "@/.velite";
import { formatDate } from "@/lib/utils";

/**
 * Writeups List Page
 * CTF Writeup 목록 페이지
 */

export const metadata = {
    title: "CTF Writeups",
    description: "CTF 대회 문제 풀이 모음",
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

export default function WriteupsPage() {
    // 발행된 writeup만 필터링하고 날짜순 정렬
    const publishedWriteups = writeups
        .filter((writeup) => writeup.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">🚩 CTF Writeups</h1>
                <p className="text-muted-foreground">
                    CTF 대회 문제 풀이 모음
                </p>
            </div>

            {publishedWriteups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>아직 작성된 Writeup이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {publishedWriteups.map((writeup) => (
                        <article
                            key={writeup.slug}
                            className="group relative rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
                        >
                            <Link href={`/writeups/${writeup.slug}`} className="absolute inset-0">
                                <span className="sr-only">{writeup.title}</span>
                            </Link>

                            <div className="space-y-3">
                                {/* CTF & Category Badge */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                        {writeup.ctf}
                                    </span>
                                    <span className="px-2 py-0.5 bg-muted rounded-full">
                                        {categoryIcons[writeup.category]} {writeup.category.toUpperCase()}
                                    </span>
                                    {writeup.difficulty && (
                                        <span className={`font-medium ${difficultyColors[writeup.difficulty]}`}>
                                            {writeup.difficulty}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                    {writeup.title}
                                </h2>

                                {writeup.description && (
                                    <p className="text-muted-foreground line-clamp-2">
                                        {writeup.description}
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
