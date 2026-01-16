"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Flag, Edit, ArrowLeft, Loader2 } from "lucide-react";

/**
 * Admin Manage Page
 * 기존 글 목록 및 수정 링크
 */

interface FileItem {
    name: string;
    slug: string;
    path: string;
    sha: string;
}

export default function ManagePage() {
    const [posts, setPosts] = useState<FileItem[]>([]);
    const [writeups, setWriteups] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"posts" | "writeups">("posts");

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const [postsRes, writeupsRes] = await Promise.all([
                    fetch("/api/admin/posts?type=posts"),
                    fetch("/api/admin/posts?type=writeups"),
                ]);

                const postsData = await postsRes.json();
                const writeupsData = await writeupsRes.json();

                if (postsRes.ok) setPosts(postsData.files || []);
                if (writeupsRes.ok) setWriteups(writeupsData.files || []);
            } catch {
                console.error("Failed to load files");
            } finally {
                setIsLoading(false);
            }
        };

        loadFiles();
    }, []);

    const currentFiles = activeTab === "posts" ? posts : writeups;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">📂 글 관리</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={activeTab === "posts" ? "default" : "outline"}
                    onClick={() => setActiveTab("posts")}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Posts ({posts.length})
                </Button>
                <Button
                    variant={activeTab === "writeups" ? "default" : "outline"}
                    onClick={() => setActiveTab("writeups")}
                >
                    <Flag className="mr-2 h-4 w-4" />
                    Writeups ({writeups.length})
                </Button>
            </div>

            {/* File List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-3">파일명</th>
                                <th className="text-right p-3">액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFiles.map((file) => (
                                <tr key={file.slug} className="border-t border-border">
                                    <td className="p-3">
                                        <span className="font-mono">{file.name}</span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Link href={`/admin/edit/${file.slug}?type=${activeTab}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4 mr-1" />
                                                수정
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {currentFiles.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="p-6 text-center text-muted-foreground">
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
