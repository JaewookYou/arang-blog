"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft, Loader2, Globe } from "lucide-react";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Translation Edit Page
 * DB에 저장된 번역 수정
 */

interface Translation {
    id: number;
    slug: string;
    type: string;
    locale: string;
    title: string;
    description: string | null;
    content: string;
}

const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
    ko: { flag: "🇰🇷", name: "한국어" },
    en: { flag: "🇺🇸", name: "English" },
    ja: { flag: "🇯🇵", name: "日本語" },
    zh: { flag: "🇨🇳", name: "中文" },
};

export default function TranslationEditPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "post";
    const locale = searchParams.get("locale") || "en";

    const [slug, setSlug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        const loadTranslation = async () => {
            const { slug: postSlug } = await params;
            setSlug(postSlug);

            try {
                const res = await fetch(`/api/translations?slug=${postSlug}&type=${type}&locale=${locale}`);
                const data = await res.json();

                if (res.ok && data.translation) {
                    setTitle(data.translation.title);
                    setDescription(data.translation.description || "");
                    setContent(data.translation.content);
                    setIsNew(false);
                } else {
                    // 번역이 없으면 새로 생성 모드
                    setIsNew(true);
                }
            } catch {
                setIsNew(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadTranslation();
    }, [params, type, locale]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content) {
            alert("제목과 내용을 입력하세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/translations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    type,
                    locale,
                    title,
                    description,
                    content,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ 저장 완료!");
                router.push("/admin/translations");
            } else {
                alert(`❌ 오류: ${result.error}`);
            }
        } catch {
            alert("❌ 네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const localeInfo = LOCALE_INFO[locale] || { flag: "🌐", name: locale };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/translations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <h1 className="text-2xl font-bold">
                        {isNew ? "🆕 번역 추가" : "✏️ 번역 수정"}: {slug}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-muted rounded-full">
                    {type === "writeup" ? "Writeup" : "Post"}
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {localeInfo.flag} {localeInfo.name}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-sm font-medium mb-2 block">제목</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="번역된 제목"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium mb-2 block">설명</label>
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="번역된 설명 (선택사항)"
                    />
                </div>

                <div data-color-mode="dark">
                    <label className="text-sm font-medium mb-2 block">내용 (Markdown)</label>
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        height={500}
                        preview="edit"
                    />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "저장 중..." : "DB에 저장"}
                </Button>
            </form>
        </div>
    );
}
