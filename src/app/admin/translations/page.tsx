"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Edit, Trash2, Globe, FileText, Flag } from "lucide-react";

/**
 * Admin Translations Page
 * DB에 저장된 모든 번역 목록
 */

interface Translation {
    id: number;
    slug: string;
    type: string;
    locale: string;
    title: string;
    updated_at: string;
}

const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
    en: { flag: "🇺🇸", name: "English" },
    ja: { flag: "🇯🇵", name: "日本語" },
    zh: { flag: "🇨🇳", name: "中文" },
};

export default function TranslationsPage() {
    const [translations, setTranslations] = useState<Translation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"post" | "writeup">("post");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        loadTranslations();
    }, []);

    const loadTranslations = async () => {
        try {
            // DB에서 모든 번역 목록 가져오기
            const res = await fetch("/api/admin/translations");
            const data = await res.json();

            if (res.ok) {
                setTranslations(data.translations || []);
            }
        } catch {
            console.error("Failed to load translations");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (slug: string, type: string, locale: string, id: number) => {
        if (!confirm(`정말 "${slug}"의 ${LOCALE_INFO[locale]?.name || locale} 번역을 삭제하시겠습니까?`)) {
            return;
        }

        setDeletingId(id);

        try {
            const res = await fetch(`/api/translations?slug=${slug}&type=${type}&locale=${locale}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("✅ 삭제되었습니다.");
                setTranslations(translations.filter(t => t.id !== id));
            } else {
                const data = await res.json();
                alert(`❌ 삭제 실패: ${data.error}`);
            }
        } catch {
            alert("❌ 네트워크 오류");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredTranslations = translations.filter(t => t.type === activeTab);

    // slug별로 그룹화
    const groupedBySlug = filteredTranslations.reduce((acc, t) => {
        if (!acc[t.slug]) {
            acc[t.slug] = [];
        }
        acc[t.slug].push(t);
        return acc;
    }, {} as Record<string, Translation[]>);

    const slugs = Object.keys(groupedBySlug).sort();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <h1 className="text-2xl font-bold">🌐 번역 관리</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={activeTab === "post" ? "default" : "outline"}
                    onClick={() => setActiveTab("post")}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Posts
                </Button>
                <Button
                    variant={activeTab === "writeup" ? "default" : "outline"}
                    onClick={() => setActiveTab("writeup")}
                >
                    <Flag className="mr-2 h-4 w-4" />
                    Writeups
                </Button>
            </div>

            {/* Translation List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : slugs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    번역 데이터가 없습니다.
                </div>
            ) : (
                <div className="space-y-4">
                    {slugs.map(slug => (
                        <div key={slug} className="rounded-lg border border-border overflow-hidden">
                            <div className="bg-muted px-4 py-2 font-mono text-sm font-medium">
                                {slug}
                            </div>
                            <table className="w-full text-sm">
                                <tbody>
                                    {groupedBySlug[slug].map(t => {
                                        const localeInfo = LOCALE_INFO[t.locale];
                                        return (
                                            <tr key={t.id} className="border-t border-border">
                                                <td className="p-3">
                                                    <span className="mr-2">{localeInfo?.flag || "🌐"}</span>
                                                    {localeInfo?.name || t.locale}
                                                </td>
                                                <td className="p-3 text-muted-foreground truncate max-w-[300px]">
                                                    {t.title}
                                                </td>
                                                <td className="p-3 text-right space-x-2">
                                                    <Link href={`/admin/translations/${slug}?type=${t.type}&locale=${t.locale}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            수정
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(t.slug, t.type, t.locale, t.id)}
                                                        disabled={deletingId === t.id}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        {deletingId === t.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                        )}
                                                        삭제
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
