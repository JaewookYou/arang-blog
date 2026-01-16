"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Save,
    FileText,
    Flag,
    ArrowLeft,
    Upload,
    Loader2,
    Languages,
    Calendar,
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
 * Admin Write Page
 * 새 글 작성 (Git-CMS) + 이미지 업로드 + 예약 발행 + 다국어 번역
 */

interface FormData {
    type: "post" | "writeup";
    title: string;
    description: string;
    slug: string;
    content: string;
    tags: string;
    scheduledAt: string;
    // Writeup 전용
    ctf?: string;
    category?: string;
    difficulty?: string;
    points?: string;
}

export default function WritePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<FormData>({
        type: "post",
        title: "",
        description: "",
        slug: "",
        content: `# 제목

본문을 작성하세요...
`,
        tags: "",
        scheduledAt: "",
        ctf: "",
        category: "web",
        difficulty: "medium",
        points: "",
    });

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
                        setFormData((prev) => ({
                            ...prev,
                            content: prev.content + "\n" + imageMarkdown + "\n",
                        }));
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
        if (!formData.content || !formData.title) {
            alert("제목과 내용을 먼저 작성해주세요.");
            return;
        }

        if (!confirm("영어/일본어/중국어로 번역을 생성합니다. 진행할까요?")) return;

        setIsTranslating(true);

        try {
            const res = await fetch("/api/admin/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: formData.content,
                    title: formData.title,
                    description: formData.description,
                    targetLocales: ["en", "ja", "zh"],
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(
                    `✅ 번역 완료!
• 영어: ${data.translations.en?.title || "실패"}
• 일본어: ${data.translations.ja?.title || "실패"}
• 중국어: ${data.translations.zh?.title || "실패"}

번역된 내용은 글 저장 시 함께 커밋됩니다.`
                );
                // 번역 결과를 localStorage에 임시 저장
                localStorage.setItem(
                    `translations_${formData.slug}`,
                    JSON.stringify(data.translations)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.slug || !formData.content) {
            alert("제목, 슬러그, 내용은 필수입니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/admin/commit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    translations: localStorage.getItem(`translations_${formData.slug}`),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.removeItem(`translations_${formData.slug}`);
                alert("✅ 성공적으로 커밋되었습니다!");
                router.push("/admin");
            } else {
                alert(`❌ 오류: ${result.error}`);
            }
        } catch {
            alert("❌ 네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, "-")
            .replace(/^-+|-+$/g, "");
        setFormData({ ...formData, slug });
    };

    // 파일 선택 업로드
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const url = await uploadImage(file);
        if (url) {
            const imageMarkdown = `![${file.name}](${url})`;
            setFormData((prev) => ({
                ...prev,
                content: prev.content + "\n" + imageMarkdown + "\n",
            }));
        }
        setIsUploading(false);
        e.target.value = "";
    };

    // 마크다운 삽입 헬퍼
    const insertMarkdown = (before: string, after: string = "") => {
        setFormData((prev) => ({
            ...prev,
            content: prev.content + before + after,
        }));
    };

    return (
        <div
            className={`mx-auto space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto" : "max-w-4xl"
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">✍️ 새 글 작성</h1>
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
                {/* Type Selection */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant={formData.type === "post" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, type: "post" })}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Post
                    </Button>
                    <Button
                        type="button"
                        variant={formData.type === "writeup" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, type: "writeup" })}
                    >
                        <Flag className="mr-2 h-4 w-4" />
                        Writeup
                    </Button>
                </div>

                {/* Basic Fields */}
                <div className="grid gap-4">
                    <div>
                        <label className="text-sm font-medium">제목</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="글 제목"
                            onBlur={generateSlug}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">슬러그 (URL)</label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    placeholder="url-friendly-slug"
                                />
                                <Button type="button" variant="outline" onClick={generateSlug}>
                                    자동
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                예약 발행
                            </label>
                            <Input
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) =>
                                    setFormData({ ...formData, scheduledAt: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">설명</label>
                        <Input
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="간단한 설명"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">태그 (쉼표로 구분)</label>
                        <Input
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="security, web, ctf"
                        />
                    </div>
                </div>

                {/* Writeup-specific Fields */}
                {formData.type === "writeup" && (
                    <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg">
                        <div>
                            <label className="text-sm font-medium">CTF 이름</label>
                            <Input
                                value={formData.ctf}
                                onChange={(e) =>
                                    setFormData({ ...formData, ctf: e.target.value })
                                }
                                placeholder="Sample CTF 2026"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">카테고리</label>
                            <select
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: e.target.value })
                                }
                                className="w-full h-9 rounded-md border border-border bg-background px-3"
                            >
                                <option value="web">Web</option>
                                <option value="pwn">Pwn</option>
                                <option value="rev">Rev</option>
                                <option value="crypto">Crypto</option>
                                <option value="forensics">Forensics</option>
                                <option value="misc">Misc</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">난이도</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) =>
                                    setFormData({ ...formData, difficulty: e.target.value })
                                }
                                className="w-full h-9 rounded-md border border-border bg-background px-3"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                                <option value="insane">Insane</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">포인트</label>
                            <Input
                                type="number"
                                value={formData.points}
                                onChange={(e) =>
                                    setFormData({ ...formData, points: e.target.value })
                                }
                                placeholder="500"
                            />
                        </div>
                    </div>
                )}

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
                    <MDEditor
                        value={formData.content}
                        onChange={(val) => setFormData({ ...formData, content: val || "" })}
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
                    {isSubmitting ? "커밋 중..." : "GitHub에 커밋"}
                </Button>
            </form>
        </div>
    );
}
