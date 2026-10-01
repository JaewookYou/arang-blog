"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Languages, Loader2, Maximize2, Minimize2, Save } from "lucide-react";
import { EditorToolbar, uploadImage } from "@/components/admin/editor-toolbar";
import { useMarkdownInsert } from "@/components/admin/use-markdown-insert";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Edit Page
 * 기존 글 수정 (Git-CMS). 원래 파일 경로(.md/.mdx)를 유지해서 커밋한다.
 */

type Notice = { type: "info" | "error" | "success"; text: string; link?: { href: string; label: string } };

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") === "writeups" || searchParams.get("type") === "writeup" ? "writeup" : "post";

    const [slug, setSlug] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [content, setContent] = useState("");
    const [savedContent, setSavedContent] = useState("");
    const [sha, setSha] = useState("");
    const [path, setPath] = useState("");
    const [notice, setNotice] = useState<Notice | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const insert = useMarkdownInsert(editorRef, content, setContent);
    const dirty = content !== savedContent;

    useEffect(() => {
        (async () => {
            const { slug: rawSlug } = await params;
            const postSlug = decodeURIComponent(rawSlug);
            setSlug(postSlug);
            try {
                const res = await fetch(`/api/admin/posts/${encodeURIComponent(postSlug)}?type=${type}`, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "파일을 불러올 수 없습니다.");
                setContent(data.content);
                setSavedContent(data.content);
                setSha(data.sha);
                setPath(data.path);
            } catch (e) {
                setNotice({ type: "error", text: e instanceof Error ? e.message : "파일을 불러올 수 없습니다." });
            } finally {
                setIsLoading(false);
            }
        })();
    }, [params, type]);

    // 저장하지 않은 변경이 있으면 페이지 이탈 경고
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (dirty) e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    const handleUpload = useCallback(
        async (file: File) => {
            setIsUploading(true);
            try {
                const url = await uploadImage(file);
                insert(`\n![${file.name || "image"}](${url})\n`);
            } catch (e) {
                setNotice({ type: "error", text: `업로드 실패: ${e instanceof Error ? e.message : ""}` });
            } finally {
                setIsUploading(false);
            }
        },
        [insert]
    );

    // 클립보드 이미지 붙여넣기 → 커서 위치에 삽입
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const handlePaste = (e: ClipboardEvent) => {
            const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
            const file = item?.getAsFile();
            if (!file) return;
            e.preventDefault();
            handleUpload(file);
        };
        editor.addEventListener("paste", handlePaste);
        return () => editor.removeEventListener("paste", handlePaste);
    }, [handleUpload, isLoading]);

    const handleTranslate = async () => {
        if (!confirm("현재 편집 중인 내용으로 영어/일본어/중국어 번역을 생성합니다. 진행할까요?")) return;
        setIsTranslating(true);
        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, type, content }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "번역 요청 실패");
            setNotice({ type: "info", text: data.message, link: { href: "/admin/translations", label: "진행 상황 보기" } });
        } catch (e) {
            setNotice({ type: "error", text: `❌ ${e instanceof Error ? e.message : "번역 요청 실패"}` });
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            setNotice({ type: "error", text: "내용을 입력하세요." });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/admin/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, slug, content, sha, path }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "저장 실패");

            if (result.sha) setSha(result.sha);
            setSavedContent(content);
            setNotice({
                type: "success",
                text: `✅ GitHub에 커밋했습니다. 배포가 끝나면(보통 수 분) 사이트에 반영됩니다.${
                    result.translationQueued ? ` 번역 ${result.translationQueued}건도 갱신 중입니다.` : ""
                }`,
                link: result.translationQueued ? { href: "/admin/translations", label: "번역 진행 상황" } : undefined,
            });
        } catch (err) {
            setNotice({ type: "error", text: `❌ ${err instanceof Error ? err.message : "저장 실패"}` });
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

    const noticeClass = {
        info: "border-blue-500/30 bg-blue-500/10 text-blue-500",
        error: "border-red-500/30 bg-red-500/10 text-red-500 whitespace-pre-line",
        success: "border-green-500/30 bg-green-500/10 text-green-500",
    };

    return (
        <div className={`mx-auto space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : "max-w-5xl"}`}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/manage">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">글 수정: {slug}</h1>
                        <p className="font-mono text-xs text-muted-foreground">
                            {path} {dirty && <span className="text-amber-500">· 저장 안 됨</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Link
                        href={`/${type === "writeup" ? "writeups" : "posts"}/${encodeURIComponent(slug)}`}
                        target="_blank"
                        title="글 보기"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                        <ExternalLink className="h-5 w-5" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {notice && (
                <div className={`rounded-lg border p-3 text-sm ${noticeClass[notice.type]}`}>
                    {notice.text}
                    {notice.link && (
                        <Link href={notice.link.href} className="ml-2 font-medium underline">
                            {notice.link.label}
                        </Link>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <EditorToolbar insert={insert} onFileSelected={handleUpload} isUploading={isUploading}>
                    <div className="h-6 w-px bg-border" />
                    <Button type="button" variant="ghost" size="sm" onClick={handleTranslate} disabled={isTranslating}>
                        {isTranslating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Languages className="mr-1 h-4 w-4" />}
                        번역 생성
                    </Button>
                </EditorToolbar>

                <div data-color-mode="dark" ref={editorRef}>
                    <label className="text-sm font-medium mb-2 block">내용 (프론트매터 포함 Markdown)</label>
                    <MDEditor value={content} onChange={(val) => setContent(val || "")} height={isFullscreen ? 700 : 560} preview="live" />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting || isUploading || !dirty} className="w-full">
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "커밋 중..." : dirty ? "GitHub에 커밋" : "변경 사항 없음"}
                </Button>
            </form>
        </div>
    );
}
