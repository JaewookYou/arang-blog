"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Globe, Home, User } from "lucide-react";
import Link from "next/link";

/**
 * Admin Static Pages Editor
 * Home, About 페이지의 번역 데이터 편집
 * 한국어로 저장하면 자동으로 다른 언어로 번역
 */

type PageType = "home" | "about";
type Locale = "ko" | "en" | "ja" | "zh";

interface PageContent {
    [key: string]: string | string[];
}

// 기본 템플릿 (translations.ts 구조 기반)
const defaultTemplates: Record<PageType, PageContent> = {
    home: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription: "웹 보안, 리버스 엔지니어링, 포렌식 등 다양한 보안 연구와 CTF 대회 문제 풀이를 공유합니다.",
        blogPosts: "📝 블로그 포스트",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Developer",
    },
    about: {
        name: "유재욱",
        subtitle: "Security Researcher & CTF Player",
        careerItems: [
            "금융보안원 보안평가부 RED IRIS팀 (모의해킹팀) (2019 ~ )",
            "KITRI Best of the Best & Whitehat School 멘토 (2023 ~ )",
        ],
        awardItems: [
            "2019.09. 특허 등록 - 이중 패킹을 이용한 코드 난독화",
            "2018.12. 한국정보보호학회 동계학술대회 우수논문상",
        ],
        bugBountyItems: [
            "CVE-2025-11221 - GTONE ChangeFlow RCE",
            "CVE-2025-11182 - GTONE ChangeFlow Path Traversal",
        ],
        ctfItems: [
            "2025 DEF CON CTF 예선 2위",
            "2024 DEF CON CTF 예선 2위, 본선 3위",
        ],
        interestItems: ["Web Security", "CTF", "Penetration Testing"],
    },
};

const localeNames: Record<Locale, string> = {
    ko: "🇰🇷 한국어",
    en: "🇺🇸 English",
    ja: "🇯🇵 日本語",
    zh: "🇨🇳 中文",
};

export default function StaticPagesAdmin() {
    const [selectedPage, setSelectedPage] = useState<PageType>("home");
    const [selectedLocale, setSelectedLocale] = useState<Locale>("ko");
    const [content, setContent] = useState<string>("");
    const [savedContents, setSavedContents] = useState<Record<Locale, string>>({} as Record<Locale, string>);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // 콘텐츠 불러오기
    const loadContent = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/static-pages?page=${selectedPage}`);
            const data = await res.json();

            const contents: Record<Locale, string> = {} as Record<Locale, string>;
            if (data.contents) {
                data.contents.forEach((c: { locale: Locale; content: string }) => {
                    contents[c.locale] = c.content;
                });
            }

            // 저장된 콘텐츠가 없으면 기본 템플릿 사용
            if (!contents.ko) {
                contents.ko = JSON.stringify(defaultTemplates[selectedPage], null, 2);
            }

            setSavedContents(contents);
            setContent(contents[selectedLocale] || contents.ko || "");
        } catch (error) {
            console.error("Failed to load content:", error);
            setContent(JSON.stringify(defaultTemplates[selectedPage], null, 2));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadContent();
    }, [selectedPage]);

    useEffect(() => {
        setContent(savedContents[selectedLocale] || savedContents.ko || "");
    }, [selectedLocale, savedContents]);

    // 저장 (한국어로 저장 시 자동 번역)
    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // JSON 유효성 검사
            JSON.parse(content);

            const res = await fetch("/api/admin/static-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    page: selectedPage,
                    content: content,
                    autoTranslate: selectedLocale === "ko", // 한국어일 때만 자동 번역
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    type: "success",
                    text: selectedLocale === "ko"
                        ? "저장 완료! 다른 언어로 자동 번역 중..."
                        : "저장 완료!",
                });
                await loadContent(); // 번역 결과 다시 불러오기
            } else {
                setMessage({ type: "error", text: data.error || "저장 실패" });
            }
        } catch (error) {
            if (error instanceof SyntaxError) {
                setMessage({ type: "error", text: "잘못된 JSON 형식입니다." });
            } else {
                setMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
            }
        }

        setSaving(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">정적 페이지 편집</h1>
                    <p className="text-muted-foreground">
                        Home, About 페이지 콘텐츠를 편집합니다. 한국어로 저장하면 자동으로 번역됩니다.
                    </p>
                </div>
                <Link href="/admin">
                    <Button variant="outline">← 관리자 홈</Button>
                </Link>
            </div>

            {/* Page Selector */}
            <div className="flex gap-4">
                <Button
                    variant={selectedPage === "home" ? "default" : "outline"}
                    onClick={() => setSelectedPage("home")}
                    className="flex items-center gap-2"
                >
                    <Home className="h-4 w-4" />
                    Home
                </Button>
                <Button
                    variant={selectedPage === "about" ? "default" : "outline"}
                    onClick={() => setSelectedPage("about")}
                    className="flex items-center gap-2"
                >
                    <User className="h-4 w-4" />
                    About
                </Button>
            </div>

            {/* Locale Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
                {(Object.keys(localeNames) as Locale[]).map((locale) => (
                    <Button
                        key={locale}
                        variant={selectedLocale === locale ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedLocale(locale)}
                        className="flex items-center gap-1"
                    >
                        <Globe className="h-3 w-3" />
                        {localeNames[locale]}
                        {savedContents[locale] && (
                            <span className="ml-1 text-xs text-green-500">✓</span>
                        )}
                    </Button>
                ))}
            </div>

            {/* Editor */}
            <div className="space-y-4">
                {selectedLocale !== "ko" && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm">
                        ⚠️ 한국어(ko)에서 편집하면 자동으로 다른 언어로 번역됩니다.
                        다른 언어에서 직접 편집하면 해당 언어만 저장됩니다.
                    </div>
                )}

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-[500px] p-4 font-mono text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="JSON 형식으로 콘텐츠를 입력하세요..."
                    disabled={loading}
                />

                {/* Message */}
                {message && (
                    <div
                        className={`p-3 rounded-lg ${message.type === "success"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {saving ? "저장 중..." : "저장"}
                        {selectedLocale === "ko" && " (+ 자동 번역)"}
                    </Button>
                    <Button variant="outline" onClick={loadContent} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        새로고침
                    </Button>
                </div>
            </div>

            {/* Help */}
            <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
                <h3 className="font-semibold mb-2">💡 사용 방법</h3>
                <ul className="space-y-1 list-disc list-inside">
                    <li>JSON 형식으로 콘텐츠를 편집합니다.</li>
                    <li>한국어(ko)에서 저장하면 영어, 일본어, 중국어로 자동 번역됩니다.</li>
                    <li>배열 항목(careerItems, ctfItems 등)도 자동으로 번역됩니다.</li>
                    <li>CVE ID, 팀 이름 등 고유명사는 번역되지 않습니다.</li>
                </ul>
            </div>
        </div>
    );
}
