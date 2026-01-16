import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blog.arang.kr"),
    title: {
        default: "Arang | Security Research & CTF",
        template: "%s | Arang",
    },
    description: "CTF Writeups, Security Research, and Tech Articles by Arang",
    keywords: ["CTF", "Security", "Writeup", "Hacking", "Cybersecurity"],
    authors: [{ name: "Arang" }],
    creator: "Arang",
    openGraph: {
        type: "website",
        locale: "ko_KR",
        siteName: "Arang.dev",
    },
    twitter: {
        card: "summary_large_image",
        creator: "@Arang",
    },
    // Security-First: 기본 robots 설정
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen flex flex-col`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SiteHeader />
                    <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
                        {children}
                    </main>
                    <SiteFooter />
                </ThemeProvider>
            </body>
        </html>
    );
}

