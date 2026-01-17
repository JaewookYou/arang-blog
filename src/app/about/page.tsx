import Link from "next/link";
import { cookies } from "next/headers";
import { aboutTranslations, type Locale } from "@/lib/translations";

/**
 * About Page
 * 소개 페이지 (다국어 지원)
 */

export const metadata = {
    title: "About",
    description: "Arang - Security Researcher & CTF Player",
};

export default async function AboutPage() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get("locale")?.value as Locale) || "ko";
    const t = aboutTranslations[locale] || aboutTranslations.ko;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        {t.title} <span className="text-primary">Arang</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t.subtitle}
                    </p>
                </div>

                {/* Bio */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <p>{t.bio}</p>

                    <h2>{t.interests}</h2>
                    <ul>
                        {t.interestsList.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                    </ul>

                    <h2>{t.ctfSection}</h2>
                    <p>{t.ctfDescription}</p>

                    <h2>{t.techStack}</h2>
                    <ul>
                        {t.techStackList.map((item, i) => (
                            <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div className="border-t border-border pt-8">
                    <h2 className="text-xl font-semibold mb-4">{t.contact}</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="https://github.com/JaewookYou"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </Link>
                    </div>
                </div>

                {/* Terminal Quote */}
                <div className="font-mono text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
                    <span className="text-primary">$</span> echo &quot;{t.terminalQuote}&quot;
                    <br />
                    <span className="text-muted-foreground/60">{t.terminalQuote}</span>
                </div>
            </div>
        </div>
    );
}
