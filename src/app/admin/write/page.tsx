"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, FileText, Flag, Loader2, Maximize2, Minimize2, Save } from "lucide-react";
import { EditorToolbar, uploadImage } from "@/components/admin/editor-toolbar";
import { useMarkdownInsert } from "@/components/admin/use-markdown-insert";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Write Page
 * 새 글 작성 (Git-CMS) + 이미지 업로드 + 예약 발행
 * 커밋하면 자동 번역이 켜져 있을 때 영어/일본어/중국어 번역이 백그라운드로 생성된다.
 */

interface WriteForm {
    type: "post" | "writeup";
    title: string;
    description: string;
    slug: string;
    tags: string;
    category: string; // post: 자유 입력, writeup: web/pwn/...
    scheduledAt: string; // datetime-local 값 (브라우저 현지 시간)
    ctf: string;
    difficulty: string;
    points: string;
}

const DRAFT_KEY = "admin-write-draft";
const SLUG_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,150}$/u;

function toSlug(title: string) {
    return title
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

const EMPTY_FORM: WriteForm = {
    type: "post",
    title: "",
    description: "",
    slug: "",
    tags: "",
    category: "",
    scheduledAt: "",
    ctf: "",
    difficulty: "medium",
    points: "",
};

export default function WritePage() {
    const [form, setForm] = useState<WriteForm>(EMPTY_FORM);
    const [content, setContent] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ path: string; translationQueued: number } | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const insert = useMarkdownInsert(editorRef, content, setContent);

    // 임시 저장 복원
    useEffect(() => {
        try {
            const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
            if (draft?.form) {
                setForm({ ...EMPTY_FORM, ...draft.form });
                setContent(draft.content || "");
                setSlugEdited(Boolean(draft.slugEdited));
            }
        } catch {
            // 무시
        }
    }, []);

    // 입력할 때마다 임시 저장
    useEffect(() => {
        if (result) return;
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, content, slugEdited }));
            } catch {
                // 저장 공간 부족 등은 무시
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [form, content, slugEdited, result]);

    const update = (patch: Partial<WriteForm>) => setForm((prev) => ({ ...prev, ...patch }));

    const handleTitle = (title: string) => {
        update(slugEdited ? { title } : { title, slug: toSlug(title) });
    };

    const handleUpload = useCallback(
        async (file: File) => {
            setIsUploading(true);
            try {
                const url = await uploadImage(file);
                insert(`\n![${file.name || "image"}](${url})\n`);
            } catch (e) {
                setError(`업로드 실패: ${e instanceof Error ? e.message : ""}`);
            } finally {
                setIsUploading(false);
            }
        },
        [insert]
    );

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
    }, [handleUpload]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.title.trim() || !content.trim()) {
            setError("제목과 내용은 필수입니다.");
            return;
        }
        if (!SLUG_PATTERN.test(form.slug)) {
            setError("슬러그는 글자/숫자로 시작하고 글자, 숫자, -, _ 만 쓸 수 있습니다.");
            return;
        }
        if (form.title.length > 100) {
            setError("제목은 100자 이하여야 합니다.");
            return;
        }
        if (form.description.length > 300) {
            setError("설명은 300자 이하여야 합니다.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/admin/commit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    content,
                    // datetime-local은 시간대가 없으므로 브라우저 현지 시간 기준 ISO로 변환
                    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "커밋 실패");

            localStorage.removeItem(DRAFT_KEY);
            setResult({ path: data.path, translationQueued: data.translationQueued || 0 });
        } catch (err) {
            setError(err instanceof Error ? err.message : "커밋 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 py-12 text-center">
                <h1 className="text-2xl font-bold">✅ 커밋했습니다</h1>
                <p className="text-muted-foreground">
                    <span className="font-mono">{result.path}</span>
                    <br />
                    GitHub Actions 배포가 끝나면(보통 수 분) 사이트에 나타납니다.
                </p>
                <p className="text-sm text-muted-foreground">
                    {result.translationQueued > 0
                        ? `영어·일본어·중국어 번역 ${result.translationQueued}건을 백그라운드에서 만들고 있습니다.`
                        : "자동 번역이 꺼져 있습니다. 배포 후 번역 관리 화면에서 번역을 생성할 수 있습니다."}
                </p>
                <div className="flex justify-center gap-3">
                    <Link href="/admin/translations">
                        <Button variant="outline">번역 관리</Button>
                    </Link>
                    <Link href="/admin">
                        <Button>관리자 홈</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`mx-auto space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : "max-w-5xl"}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">새 글 작성</h1>
                </div>
                <div className="flex items-center gap-2">
                    {(form.title || content) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (!confirm("작성 중인 내용을 지울까요?")) return;
                                setForm(EMPTY_FORM);
                                setContent("");
                                setSlugEdited(false);
                                localStorage.removeItem(DRAFT_KEY);
                            }}
                        >
                            초기화
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                    <Button type="button" variant={form.type === "post" ? "default" : "outline"} onClick={() => update({ type: "post", category: "" })}>
                        <FileText className="mr-2 h-4 w-4" />
                        Post
                    </Button>
                    <Button type="button" variant={form.type === "writeup" ? "default" : "outline"} onClick={() => update({ type: "writeup", category: "web" })}>
                        <Flag className="mr-2 h-4 w-4" />
                        Writeup
                    </Button>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium">제목 <span className="text-muted-foreground">({form.title.length}/100)</span></label>
                        <Input value={form.title} onChange={(e) => handleTitle(e.target.value)} placeholder="글 제목" maxLength={100} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">슬러그 (URL)</label>
                            <div className="flex gap-2">
                                <Input
                                    value={form.slug}
                                    onChange={(e) => {
                                        setSlugEdited(true);
                                        update({ slug: e.target.value.trim() });
                                    }}
                                    placeholder="url-friendly-slug"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSlugEdited(false);
                                        update({ slug: toSlug(form.title) });
                                    }}
                                >
                                    자동
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                예약 발행 (선택)
                            </label>
                            <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => update({ scheduledAt: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">설명 <span className="text-muted-foreground">({form.description.length}/300)</span></label>
                        <Input value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="목록과 검색 결과에 보이는 요약" maxLength={300} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium">태그 (쉼표로 구분)</label>
                            <Input value={form.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="security, web, ctf" />
                        </div>
                        {form.type === "post" && (
                            <div>
                                <label className="text-sm font-medium">카테고리 (선택)</label>
                                <Input value={form.category} onChange={(e) => update({ category: e.target.value })} placeholder="Security Research" />
                            </div>
                        )}
                    </div>
                </div>

                {form.type === "writeup" && (
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-4">
                        <div>
                            <label className="text-sm font-medium">CTF 이름</label>
                            <Input value={form.ctf} onChange={(e) => update({ ctf: e.target.value })} placeholder="Sample CTF 2026" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">카테고리</label>
                            <select
                                value={form.category || "web"}
                                onChange={(e) => update({ category: e.target.value })}
                                className="h-9 w-full rounded-md border border-border bg-background px-3"
                            >
                                {["web", "pwn", "rev", "crypto", "forensics", "misc"].map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">난이도</label>
                            <select
                                value={form.difficulty}
                                onChange={(e) => update({ difficulty: e.target.value })}
                                className="h-9 w-full rounded-md border border-border bg-background px-3"
                            >
                                {["easy", "medium", "hard", "insane"].map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">포인트</label>
                            <Input type="number" value={form.points} onChange={(e) => update({ points: e.target.value })} placeholder="500" />
                        </div>
                    </div>
                )}

                <EditorToolbar insert={insert} onFileSelected={handleUpload} isUploading={isUploading} />

                <div data-color-mode="dark" ref={editorRef}>
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        height={isFullscreen ? 700 : 560}
                        preview="live"
                        textareaProps={{ placeholder: "본문을 마크다운으로 작성하세요. (제목은 위 입력란의 값이 페이지 제목이 됩니다)" }}
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    작성 내용은 이 브라우저에 자동으로 임시 저장됩니다. 커밋하면 영어·일본어·중국어 번역이 자동으로 생성됩니다.
                </p>

                {error && <div className="whitespace-pre-line rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

                <Button type="submit" size="lg" disabled={isSubmitting || isUploading} className="w-full">
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    {isSubmitting ? "커밋 중..." : "GitHub에 커밋"}
                </Button>
            </form>
        </div>
    );
}
