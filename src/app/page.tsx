/**
 * Arang Tech Blog - Home Page
 * CTF/Security Research 블로그 메인 페이지
 */
export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                    Security Research
                    <br />
                    <span className="text-primary">&</span> CTF Writeups
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
                    웹 보안, 리버스 엔지니어링, 포렌식 등 다양한 보안 연구와
                    CTF 대회 문제 풀이를 공유합니다.
                </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                <a
                    href="/posts"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        📝 블로그 포스트
                    </span>
                </a>
                <a
                    href="/writeups"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        🚩 CTF Writeups
                    </span>
                </a>
                <a
                    href="/about"
                    className="group px-6 py-3 bg-card border border-border rounded-lg hover:border-primary hover:bg-card/80 transition-all"
                >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        🔐 About
                    </span>
                </a>
            </div>

            {/* Terminal-style footer */}
            <div className="mt-12 font-mono text-sm text-muted-foreground text-center">
                <span className="text-primary">$</span> whoami
                <br />
                <span className="text-muted-foreground/60">
                    Security Researcher | CTF Player | Developer
                </span>
            </div>
        </div>
    );
}
