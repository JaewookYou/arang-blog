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

    // 프로필은 한국어로 고정 (영문 번역은 별도로 추가 가능)
    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        유재욱 <span className="text-primary">(arang)</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Security Researcher & CTF Player
                    </p>
                </div>

                {/* Career */}
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <h2>💼 Career</h2>
                    <ul>
                        <li><strong>금융보안원</strong> 보안평가부 RED IRIS팀 (모의해킹팀) (2019 ~ )</li>
                        <li>공격자 관점의 인증 우회 취약점 프로파일링 : 인사이트 리포트(Campaign Poltergeist) 발간 (2025)</li>
                        <li><strong>KITRI BoB & Whitehat School</strong> 멘토 (2023 ~ )</li>
                        <li>구름톤 트레이닝 정보보호과정 멘토 (2023 ~ 2024)</li>
                        <li>금융보안원 전문강사 & 내부강사 (2023 ~ )</li>
                        <li>가천대학교 스마트보안학과 자문위원 (2022 ~ )</li>
                        <li><strong>CTF Team Defenit</strong> (2019 ~ )</li>
                        <li>라온화이트햇 프로젝트팀 전임연구원 (2018.04. ~ 2019.08.)</li>
                        <li>가천대학교 정보보호 동아리 <strong>Pay1oad</strong> 설립</li>
                    </ul>

                    <h2>🏆 Awards & Publications</h2>
                    <ul>
                        <li>2019.09. 특허 등록 - &quot;이중 패킹을 이용한 코드 난독화&quot; (특허 제 10-2018960호)</li>
                        <li>2018.12. 한국정보보호학회 동계학술대회 <strong>우수논문상</strong></li>
                        <li>2018.08. [KCI 등재] 한국정보보호학회 논문지 투고</li>
                        <li>2018.04. <strong>KITRI BoB 6기 Best 10</strong> (과학기술정보통신부 장관상)</li>
                        <li>2018.04. KITRI BoB 6기 Grand Prix 팀 선정 (Team. JGG)</li>
                        <li>2017.12. 금융보안원 보안 취약점 제보 인증서</li>
                        <li>2017.12. 스틸리언 보안 취약점 탐지 인증서</li>
                        <li>2017.12. LG유플러스 보안 취약점 탐지 특별상</li>
                        <li>2017.04. Codegate 2017 해킹시연영상 공모전 특별상</li>
                    </ul>

                    <h2>🔐 Interests</h2>
                    <ul>
                        <li><strong>Web Security</strong> - XSS, CSRF, SQL Injection, SSRF 등</li>
                        <li><strong>Reverse Engineering</strong> - Binary 분석, 악성코드 분석</li>
                        <li><strong>Cryptography</strong> - 암호 알고리즘, 프로토콜 분석</li>
                        <li><strong>Forensics</strong> - 메모리 포렌식, 네트워크 포렌식</li>
                    </ul>

                    <h2>🛠️ Tech Stack</h2>
                    <ul>
                        <li><strong>Languages</strong> - Python, TypeScript, Go, C/C++</li>
                        <li><strong>Web</strong> - Next.js, React, Node.js</li>
                        <li><strong>Tools</strong> - Burp Suite, IDA Pro, Ghidra, Wireshark</li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="border-t border-border pt-8">
                    <h2 className="text-xl font-semibold mb-4">📬 Contact</h2>
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
                        <a
                            href="mailto:jaewook376@naver.com"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                        >
                            📧 Personal
                        </a>
                        <a
                            href="mailto:jwyou@fsec.or.kr"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                        >
                            💼 Business
                        </a>
                        <Link
                            href="https://arang.kr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors"
                        >
                            🌐 arang.kr
                        </Link>
                    </div>
                </div>

                {/* Terminal Quote */}
                <div className="font-mono text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
                    <span className="text-primary">$</span> echo &quot;Happy Hacking!&quot; 🏴‍☠️
                    <br />
                    <span className="text-muted-foreground/60">Happy Hacking! 🏴‍☠️</span>
                </div>
            </div>
        </div>
    );
}
