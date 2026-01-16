import Link from "next/link";

/**
 * Site Footer Component
 * 터미널 스타일 해커 미학 디자인
 */

export function SiteFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border/40 py-6 md:py-8">
            <div className="container mx-auto max-w-4xl flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
                {/* Copyright */}
                <div className="flex flex-col items-center gap-1 md:items-start">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear}{" "}
                        <Link href="/" className="font-medium text-primary hover:underline">
                            Arang
                        </Link>
                        . All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        Security Researcher & CTF Player
                    </p>
                </div>

                {/* Terminal Style Quote */}
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground/60">
                    <span className="text-primary">$</span>
                    <span>echo &quot;Happy Hacking!&quot; 🏴‍☠️</span>
                </div>

                {/* Links */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/rss.xml"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        RSS
                    </Link>
                    <Link
                        href="https://github.com/JaewookYou/arang-blog"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Source
                    </Link>
                </div>
            </div>
        </footer>
    );
}
