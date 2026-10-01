import { getHomeTranslation } from "@/lib/translations";
import { getRequestLocale } from "@/lib/locale-server";
import { InlineMarkdown } from "@/components/inline-markdown";

/**
 * Arang Tech Blog - Home Page
 * CTF/Security Research 블로그 메인 페이지 (다국어 지원)
 * DB 저장된 콘텐츠 우선, fallback은 하드코딩 데이터
 */
export default async function HomePage() {
    const locale = await getRequestLocale();
    const t = getHomeTranslation(locale);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    <InlineMarkdown text={t.heroTitle1} />
                    <br />
                    <span className="text-primary">&</span> <InlineMarkdown text={t.heroTitle2} />
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                    <InlineMarkdown text={t.heroDescription1} />
                    <br />
                    <InlineMarkdown text={t.heroDescription2} />
                </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <a
                    href="/posts"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        <InlineMarkdown text={t.blogPosts} />
                    </span>
                </a>
                <a
                    href="/writeups"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        <InlineMarkdown text={t.ctfWriteups} />
                    </span>
                </a>
                <a
                    href="/about"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        <InlineMarkdown text={t.about} />
                    </span>
                </a>
            </div>

            {/* Terminal-style footer */}
            <div className="mt-12 font-mono text-sm text-muted-foreground text-center">
                <span className="text-primary">$</span> <InlineMarkdown text={t.whoami} />
                <br />
                <span className="text-muted-foreground/60">
                    <InlineMarkdown text={t.role} />
                </span>
            </div>
        </div>
    );
}
