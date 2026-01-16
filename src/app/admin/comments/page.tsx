"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2, MessageSquare, ExternalLink } from "lucide-react";

/**
 * Admin Comments Page
 * 댓글 관리
 */

interface Comment {
    id: number;
    post_slug: string;
    post_type: string;
    author: string;
    content: string;
    parent_id: number | null;
    created_at: string;
}

export default function CommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const res = await fetch("/api/admin/comments?limit=100");
            const data = await res.json();

            if (res.ok) {
                setComments(data.comments || []);
            }
        } catch {
            console.error("Failed to load comments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        setDeletingId(id);

        try {
            const res = await fetch(`/api/admin/comments?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setComments(comments.filter((c) => c.id !== id));
            } else {
                alert("삭제 실패");
            }
        } catch {
            alert("네트워크 오류");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("ko-KR");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">💬 댓글 관리</h1>
                <span className="text-muted-foreground">({comments.length}개)</span>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="p-4 rounded-lg border border-border space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(comment.created_at)}
                                    </span>
                                    {comment.parent_id && (
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                            답글
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/${comment.post_type === "writeup" ? "writeups" : "posts"}/${comment.post_slug}`}
                                        target="_blank"
                                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                    >
                                        {comment.post_slug}
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        {deletingId === comment.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                        </div>
                    ))}

                    {comments.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>댓글이 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
