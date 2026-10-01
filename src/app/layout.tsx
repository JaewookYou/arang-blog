import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { NaverAnalytics } from "@/components/naver-analytics";
import { LocaleProvider } from "@/components/locale-provider";
import { getRequestLocale } from "@/lib/locale-server";
import { HTML_LANG } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * 폰트 설정
 * - Inter: 본문용 산세리프
 * - JetBrains Mono: 코드 블록용 모노스페이스
 */
const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

const DEFAULT_OG_IMAGE = `/api/og?title=Arang&type=home&description=${encodeURIComponent("Security Research & CTF Writeups")}`;

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "Arang | Security Research & CTF",
        template: "%s | Arang",
    },
    description: "CTF Writeups, Security Research, and Tech Articles by Arang",
    keywords: ["CTF", "Security", "Writeup", "Hacking", "Cybersecurity"],
    authors: [{ name: "Arang" }],
    creator: "Arang",
    icons: {
        icon: "/favicon.svg",
        apple: "/apple-touch-icon.svg",
    },
    openGraph: {
        type: "website",
        locale: "ko_KR",
        siteName: "Arang.dev",
        title: "Arang | Security Research & CTF",
        description: "CTF Writeups, Security Research, and Tech Articles",
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: "Arang - Security Research & CTF",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        creator: "@Arang",
        title: "Arang | Security Research & CTF",
        description: "CTF Writeups, Security Research, and Tech Articles",
        images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
        types: { "application/rss+xml": "/rss.xml" },
    },
    // Security-First: 기본 robots 설정
    robots: {
        index: true,
        follow: true,
    },
    // 사이트 인증
    verification: {
        other: {
            "naver-site-verification": "05e4796147e82c78a57bbff763940a24a43fa55b",
        },
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getRequestLocale();

    return (
        <html lang={HTML_LANG[locale]} suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen flex flex-col`}
            >
                <GoogleAnalytics />
                <NaverAnalytics />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <LocaleProvider locale={locale}>
                        <SiteHeader />
                        <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
                            {children}
                        </main>
                        <SiteFooter />
                    </LocaleProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

