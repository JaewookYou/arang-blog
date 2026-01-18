"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Save,
    ArrowLeft,
    Upload,
    Loader2,
    Languages,
    Maximize2,
    Minimize2,
    Bold,
    Italic,
    Code,
    Link2,
    Image,
    Quote,
    List,
} from "lucide-react";
import Link from "next/link";

// MDX 에디터는 클라이언트 사이드에서만 로드
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Edit Page
 * 기존 글 수정 (Git-CMS) + 이미지 업로드 + 다국어 번역
 * write 페이지와 동일한 기능 제공
 */

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "posts";

    const [slug, setSlug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [content, setContent] = useState("");
    const [sha, setSha] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);

    // 기존 글 로드
    useEffect(() => {
        const loadPost = async () => {
            const { slug: postSlug } = await params;
            setSlug(postSlug);

            try {
                const res = await fetch(`/api/admin/posts/${postSlug}?type=${type}`);
                const data = await res.json();

                if (res.ok) {
                    setContent(data.content);
                    setSha(data.sha);
                } else {
                    alert(`오류: ${data.error}`);
                }
            } catch {
                alert("파일을 불러올 수 없습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        loadPost();
    }, [params, type]);

    // 이미지 업로드 함수
    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                alert(`업로드 실패: ${error.error}`);
                return null;
            }

            const data = await res.json();
            return data.url;
        } catch {
            alert("업로드 중 오류가 발생했습니다.");
            return null;
        }
    }, []);

    // 클립보드 이미지 붙여넣기 핸들러
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    setIsUploading(true);

                    const file = item.getAsFile();
                    if (!file) continue;

                    const url = await uploadImage(file);
                    if (url) {
                        const imageMarkdown = `![image](${url})`;
                        setContent((prev) => prev + "\n" + imageMarkdown + "\n");
                    }

                    setIsUploading(false);
                    return;
                }
            }
        };

        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener("paste", handlePaste);
            return () => editor.removeEventListener("paste", handlePaste);
        }
    }, [uploadImage]);

    // 번역 생성
    const handleTranslate = async () => {
        if (!content) {
            alert("내용을 먼저 작성해주세요.");
            return;
        }

        // frontmatter에서 title 추출
        const titleMatch = content.match(/^---[\s\S]*?title:\s*["']?(.+?)["']?\s*$/m);
        const title = titleMatch ? titleMatch[1] : slug;

        // frontmatter에서 description 추출
        const descMatch = content.match(/^---[\s\S]*?description:\s*["']?(.+?)["']?\s*$/m);
        const description = descMatch ? descMatch[1] : "";

        if (!confirm("영어/일본어/중국어로 번역을 생성합니다. 진행할까요?")) return;

        setIsTranslating(true);

        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: content,
                    title: title,
                    description: description,
                    slug: slug,
                    type: type === "writeups" ? "writeup" : "post",
                    targetLocales: ["en", "ja", "zh"],
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(
                    `✅ 번역 완료! (DB에 저장됨)
• 영어: ${data.translations.en?.title || "실패"}
• 일본어: ${data.translations.ja?.title || "실패"}
• 중국어: ${data.translations.zh?.title || "실패"}

방문자의 언어 설정에 따라 자동으로 표시됩니다.`
                );
            } else {
                alert(`❌ 번역 실패: ${data.error}`);
            }
        } catch {
            alert("❌ 네트워크 오류");
        } finally {
            setIsTranslating(false);
        }
    };

    // 저장 (GitHub 커밋)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content) {
            alert("내용을 입력하세요.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 직접 GitHub API로 업데이트
            const response = await fetch("/api/admin/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type === "writeups" ? "writeup" : "post",
                    slug,
                    content,
                    sha,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ 수정 완료!");
                router.push("/admin/manage");
            } else {
                alert(`❌ 오류: ${result.error}`);
            }
        } catch {
            alert("❌ 네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 파일 선택 업로드
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const url = await uploadImage(file);
        if (url) {
            const imageMarkdown = `![${file.name}](${url})`;
            setContent((prev) => prev + "\n" + imageMarkdown + "\n");
        }
        setIsUploading(false);
        e.target.value = "";
    };

    // 마크다운 삽입 헬퍼
    const insertMarkdown = (before: string, after: string = "") => {
        setContent((prev) => prev + before + after);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div
            className={`mx-auto space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : "max-w-4xl"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/manage">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">✏️ 글 수정: {slug}</h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-5 w-5" />
                    ) : (
                        <Maximize2 className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 타입 표시 */}
                <div>
                    <label className="text-sm font-medium mb-2 block">타입</label>
                    <Input value={type === "writeups" ? "Writeup" : "Post"} disabled />
                </div>

                {/* Editor Toolbar */}
                <div className="flex items-center gap-2 flex-wrap p-2 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("**", "**")}
                            title="Bold (Ctrl+B)"
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("*", "*")}
                            title="Italic (Ctrl+I)"
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("`", "`")}
                            title="Inline Code"
                        >
                            <Code className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("[", "](url)")}
                            title="Link"
                        >
                            <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("> ")}
                            title="Quote"
                        >
                            <Quote className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("- ")}
                            title="List"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMarkdown("\n```\n", "\n```\n")}
                            title="Code Block"
                        >
                            {"{ }"}
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-border" />

                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            asChild
                            disabled={isUploading}
                        >
                            <span>
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Image className="h-4 w-4" />
                                )}
                            </span>
                        </Button>
                    </label>
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button type="button" variant="ghost" size="sm" asChild disabled={isUploading}>
                            <span>
                                <Upload className="h-4 w-4 mr-1" />
                                이미지
                            </span>
                        </Button>
                    </label>

                    <div className="h-6 w-px bg-border" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleTranslate}
                        disabled={isTranslating}
                    >
                        {isTranslating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                            <Languages className="h-4 w-4 mr-1" />
                        )}
                        번역 생성
                    </Button>

                    <span className="text-xs text-muted-foreground ml-auto">
                        Ctrl+V로 이미지 붙여넣기
                    </span>
                </div>

                {/* MDX Editor */}
                <div data-color-mode="dark" ref={editorRef}>
                    <label className="text-sm font-medium mb-2 block">내용 (MDX - Frontmatter 포함)</label>
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        height={isFullscreen ? 600 : 500}
                        preview="live"
                    />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || isUploading || isTranslating}
                    className="w-full"
                >
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "수정 중..." : "GitHub에 커밋"}
                </Button>
            </form>
        </div>
    );
}
