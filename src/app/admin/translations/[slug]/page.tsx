"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Globe, Loader2, Save, Sparkles } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Translation Edit Page
 * 번역을 마크다운으로 편집한다. (저장 시 서버에서 HTML로 렌더링)
 * 예전에는 렌더링된 HTML을 마크다운 편집기에 그대로 띄우고, 저장한 마크다운을 변환 없이 저장해서
 * 글이 마크다운 원문 그대로 보이는 문제가 있었다.
 */

interface SourceDoc {
    title: string;
    description: string;
    markdown: string;
    hash: string;
}

const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
    en: { flag: "🇺🇸", name: "English" },
    ja: { flag: "🇯🇵", name: "日本語" },
    zh: { flag: "🇨🇳", name: "中文" },
};

export default function TranslationEditPage({ params }: { params: Promise<{ slug: string }> }) {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") === "writeup" ? "writeup" : "post";
    const locale = searchParams.get("locale") || "en";

    const [slug, setSlug] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRetranslating, setIsRetranslating] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [isNew, setIsNew] = useState(false);
    const [converted, setConverted] = useState(false);
    const [source, setSource] = useState<SourceDoc | null>(null);
    const [showSource, setShowSource] = useState(false);
    const [notice, setNotice] = useState<{ type: "info" | "error" | "success"; text: string } | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const load = useCallback(async (postSlug: string) => {
        const res = await fetch(
            `/api/translations?slug=${encodeURIComponent(postSlug)}&type=${type}&locale=${locale}`,
            { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "불러오기 실패");
        setSource(data.source ?? null);
        if (data.translation) {
            setTitle(data.translation.title);
            setDescription(data.translation.description || "");
            setContent(data.markdown ?? "");
            setConverted(Boolean(data.markdownConverted));
            setIsNew(false);
        } else {
            setIsNew(true);
        }
    }, [type, locale]);

    useEffect(() => {
        (async () => {
            const { slug: rawSlug } = await params;
            const postSlug = decodeURIComponent(rawSlug);
            setSlug(postSlug);
            try {
                await load(postSlug);
            } catch (e) {
                setNotice({ type: "error", text: e instanceof Error ? e.message : "불러오기 실패" });
            } finally {
                setIsLoading(false);
            }
        })();
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [params, load]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setNotice({ type: "error", text: "제목과 내용을 입력하세요." });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/translations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, type, locale, title, description, markdown: content }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "저장 실패");
            setConverted(false);
            setIsNew(false);
            setNotice({ type: "success", text: "✅ 저장했습니다. 글 페이지에 바로 반영됩니다." });
        } catch (err) {
            setNotice({ type: "error", text: `❌ ${err instanceof Error ? err.message : "저장 실패"}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetranslate = async () => {
        if (!confirm("AI로 이 언어를 다시 번역합니다. 지금 편집 중인 내용은 덮어써집니다. 진행할까요?")) return;
        setIsRetranslating(true);
        setNotice({ type: "info", text: "번역 작업을 시작했습니다. 긴 글은 몇 분 걸릴 수 있습니다..." });
        try {
            const res = await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "translate", type, slug, locales: [locale] }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "요청 실패");

            // 작업이 끝날 때까지 상태 확인
            pollRef.current = setInterval(async () => {
                const statusRes = await fetch("/api/admin/translations", { cache: "no-store" });
                const overview = await statusRes.json();
                const item = overview.items?.find((i: { type: string; slug: string }) => i.type === type && i.slug === slug);
                const status = item?.locales?.[locale];
                if (!status || status.state === "queued" || status.state === "running") return;

                if (pollRef.current) clearInterval(pollRef.current);
                setIsRetranslating(false);
                if (status.error) {
                    setNotice({ type: "error", text: `❌ 번역 실패: ${status.error}` });
                } else {
                    await load(slug);
                    setNotice({ type: "success", text: "✅ 다시 번역했습니다." });
                }
            }, 4000);
        } catch (err) {
            setIsRetranslating(false);
            setNotice({ type: "error", text: `❌ ${err instanceof Error ? err.message : "요청 실패"}` });
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
    const noticeClass = {
        info: "border-blue-500/30 bg-blue-500/10 text-blue-500",
        error: "border-red-500/30 bg-red-500/10 text-red-500",
        success: "border-green-500/30 bg-green-500/10 text-green-500",
    };

    return (
        <div className={`mx-auto space-y-6 ${showSource ? "max-w-7xl" : "max-w-4xl"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/translations">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <h1 className="text-2xl font-bold">
                            {isNew ? "번역 추가" : "번역 수정"}: {slug}
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    {source && (
                        <Button variant="outline" size="sm" onClick={() => setShowSource(!showSource)}>
                            {showSource ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                            원문 {showSource ? "숨기기" : "보기"}
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRetranslate} disabled={isRetranslating || !source}>
                        {isRetranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        AI로 다시 번역
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="px-3 py-1 bg-muted rounded-full">{type === "writeup" ? "Writeup" : "Post"}</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {localeInfo.flag} {localeInfo.name}
                </span>
                <Link
                    href={`/${type === "writeup" ? "writeups" : "posts"}/${encodeURIComponent(slug)}?lang=${locale}`}
                    target="_blank"
                    className="hover:text-primary hover:underline"
                >
                    글 페이지에서 보기 ↗
                </Link>
            </div>

            {notice && <div className={`rounded-lg border p-3 text-sm ${noticeClass[notice.type]}`}>{notice.text}</div>}
            {converted && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                    예전 방식으로 저장된 번역이라 HTML을 마크다운으로 변환해 보여줍니다. 저장하면 마크다운으로 보관됩니다.
                </div>
            )}

            <div className={showSource ? "grid gap-6 lg:grid-cols-2" : ""}>
                {showSource && source && (
                    <div className="space-y-3">
                        <div className="text-sm font-medium">원문 (한국어)</div>
                        <div className="rounded-lg border border-border p-3 text-sm">
                            <div className="font-semibold">{source.title}</div>
                            {source.description && <div className="mt-1 text-muted-foreground">{source.description}</div>}
                        </div>
                        <pre className="max-h-[640px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs">
                            {source.markdown}
                        </pre>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium mb-2 block">제목</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="번역된 제목" />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">설명</label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="번역된 설명 (선택사항)" />
                    </div>

                    <div data-color-mode="dark">
                        <label className="text-sm font-medium mb-2 block">내용 (Markdown)</label>
                        <MDEditor value={content} onChange={(val) => setContent(val || "")} height={600} preview="edit" />
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting || isRetranslating} className="w-full">
                        <Save className="mr-2 h-5 w-5" />
                        {isSubmitting ? "저장 중..." : "저장"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
