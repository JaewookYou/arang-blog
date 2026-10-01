"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ExternalLink, FileText, Flag, Loader2, Trash2 } from "lucide-react";

/**
 * Admin Manage Page
 * GitHub에 있는 글 목록 (배포 전 글 포함) — 수정, 삭제
 */

interface FileItem {
    name: string;
    slug: string;
    path: string;
    sha: string;
    title: string | null;
    date: string | null;
    deployed: boolean;
}

export default function ManagePage() {
    const [files, setFiles] = useState<Record<"posts" | "writeups", FileItem[]>>({ posts: [], writeups: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"posts" | "writeups">("posts");

    useEffect(() => {
        (async () => {
            try {
                const [postsRes, writeupsRes] = await Promise.all([
                    fetch("/api/admin/posts?type=posts", { cache: "no-store" }),
                    fetch("/api/admin/posts?type=writeups", { cache: "no-store" }),
                ]);
                const [postsData, writeupsData] = await Promise.all([postsRes.json(), writeupsRes.json()]);
                if (!postsRes.ok) throw new Error(postsData.error || "목록을 불러오지 못했습니다.");
                if (!writeupsRes.ok) throw new Error(writeupsData.error || "목록을 불러오지 못했습니다.");
                setFiles({ posts: postsData.files || [], writeups: writeupsData.files || [] });
            } catch (e) {
                setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleDelete = async (file: FileItem) => {
        const label = file.title || file.slug;
        if (!confirm(`정말 "${label}"을(를) 삭제할까요?\nGitHub에서 파일이 삭제되고 번역도 함께 지워집니다.`)) return;

        setDeletingSlug(file.slug);
        try {
            const type = activeTab === "posts" ? "post" : "writeup";
            const res = await fetch(`/api/admin/delete?slug=${encodeURIComponent(file.slug)}&type=${type}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "삭제 실패");
            setFiles((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((f) => f.slug !== file.slug) }));
        } catch (e) {
            alert(`❌ ${e instanceof Error ? e.message : "삭제 실패"}`);
        } finally {
            setDeletingSlug(null);
        }
    };

    const currentFiles = files[activeTab];
    const basePath = activeTab === "posts" ? "/posts" : "/writeups";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">글 관리</h1>
                </div>
                <Link href="/admin/write">
                    <Button>새 글 작성</Button>
                </Link>
            </div>

            <div className="flex gap-2">
                <Button variant={activeTab === "posts" ? "default" : "outline"} onClick={() => setActiveTab("posts")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Posts ({files.posts.length})
                </Button>
                <Button variant={activeTab === "writeups" ? "default" : "outline"} onClick={() => setActiveTab("writeups")}>
                    <Flag className="mr-2 h-4 w-4" />
                    Writeups ({files.writeups.length})
                </Button>
            </div>

            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">글</th>
                                <th className="p-3 text-left whitespace-nowrap">날짜</th>
                                <th className="p-3 text-right">작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFiles.map((file) => (
                                <tr key={file.path} className="border-t border-border">
                                    <td className="p-3">
                                        <div className="font-medium">
                                            {file.title || <span className="text-muted-foreground">(배포 전)</span>}
                                        </div>
                                        <div className="font-mono text-xs text-muted-foreground">{file.name}</div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                                        {file.date ? new Date(file.date).toLocaleDateString("ko-KR") : "-"}
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                                        {file.deployed && (
                                            <Link href={`${basePath}/${encodeURIComponent(file.slug)}`} target="_blank">
                                                <Button variant="ghost" size="sm" title="글 보기">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/admin/edit/${encodeURIComponent(file.slug)}?type=${activeTab}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="mr-1 h-4 w-4" />
                                                수정
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(file)}
                                            disabled={deletingSlug === file.slug}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {deletingSlug === file.slug ? (
                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="mr-1 h-4 w-4" />
                                            )}
                                            삭제
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {currentFiles.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-muted-foreground">
                                        파일이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
