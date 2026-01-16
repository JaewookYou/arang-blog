"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

/**
 * Admin Edit Page
 * 기존 글 수정 (Git-CMS)
 */

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "posts";

    const [slug, setSlug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState("");
    const [sha, setSha] = useState("");

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

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/manage">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">✏️ 글 수정: {slug}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-sm font-medium mb-2 block">타입</label>
                    <Input value={type === "writeups" ? "Writeup" : "Post"} disabled />
                </div>

                <div data-color-mode="dark">
                    <label className="text-sm font-medium mb-2 block">내용 (MDX - Frontmatter 포함)</label>
                    <MDEditor
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        height={600}
                        preview="edit"
                    />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "수정 중..." : "GitHub에 커밋"}
                </Button>
            </form>
        </div>
    );
}
