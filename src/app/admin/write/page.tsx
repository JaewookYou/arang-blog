"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, FileText, Flag, ArrowLeft } from "lucide-react";
import Link from "next/link";

// MDX 에디터는 클라이언트 사이드에서만 로드
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Write Page
 * 새 글 작성 (Git-CMS)
 */

interface FormData {
    type: "post" | "writeup";
    title: string;
    description: string;
    slug: string;
    content: string;
    tags: string;
    // Writeup 전용
    ctf?: string;
    category?: string;
    difficulty?: string;
    points?: string;
}

export default function WritePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        type: "post",
        title: "",
        description: "",
        slug: "",
        content: `# 제목

본문을 작성하세요...
`,
        tags: "",
        ctf: "",
        category: "web",
        difficulty: "medium",
        points: "",
    });

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
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ 성공적으로 커밋되었습니다!");
                router.push("/admin");
            } else {
                alert(`❌ 오류: ${result.error}`);
            }
        } catch (error) {
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">✍️ 새 글 작성</h1>
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

                    <div>
                        <label className="text-sm font-medium">슬러그 (URL)</label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="url-friendly-slug"
                            />
                            <Button type="button" variant="outline" onClick={generateSlug}>
                                자동 생성
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">설명</label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, ctf: e.target.value })}
                                placeholder="Sample CTF 2026"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">카테고리</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                placeholder="500"
                            />
                        </div>
                    </div>
                )}

                {/* MDX Editor */}
                <div data-color-mode="dark">
                    <label className="text-sm font-medium mb-2 block">내용 (MDX)</label>
                    <MDEditor
                        value={formData.content}
                        onChange={(val) => setFormData({ ...formData, content: val || "" })}
                        height={500}
                        preview="edit"
                    />
                </div>

                {/* Submit */}
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "커밋 중..." : "GitHub에 커밋"}
                </Button>
            </form>
        </div>
    );
}
