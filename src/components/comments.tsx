"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Reply, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateLocale, t, Locale } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface Comment {
    id: number;
    post_slug: string;
    post_type: string;
    author: string;
    content: string;
    parent_id: number | null;
    created_at: string;
    replies?: Comment[];
}

interface CommentsProps {
    postSlug: string;
    postType?: "post" | "writeup";
}

/**
 * Comments Component
 * SQLite 기반 댓글 시스템 (다국어 지원)
 */
export function Comments({ postSlug, postType = "post" }: CommentsProps) {
    const locale = useLocale();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState({ author: "", content: "" });
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 댓글 불러오기
    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/comments?slug=${postSlug}&type=${postType}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [postSlug, postType]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // 댓글 작성
    const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
        e.preventDefault();

        if (!newComment.author.trim() || !newComment.content.trim()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: postSlug,
                    type: postType,
                    author: newComment.author,
                    content: newComment.content,
                    parentId: parentId,
                }),
            });

            if (res.ok) {
                setNewComment({ author: "", content: "" });
                setReplyTo(null);
                await fetchComments();
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 댓글 렌더링 (재귀)
    const renderComment = (comment: Comment, depth: number = 0) => (
        <div
            key={comment.id}
            className={`${depth > 0 ? "ml-8 border-l-2 border-border pl-4" : ""}`}
        >
            <div className="py-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatDateLocale(comment.created_at, locale)}
                    </span>
                </div>
                <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                {depth < 3 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    >
                        <Reply className="w-3 h-3 mr-1" />
                        {t("comments.reply", locale)}
                    </Button>
                )}

                {/* 답글 폼 */}
                {replyTo === comment.id && (
                    <form
                        onSubmit={(e) => handleSubmit(e, comment.id)}
                        className="mt-4 space-y-3"
                    >
                        <Input
                            placeholder={t("comments.nickname", locale)}
                            value={newComment.author}
                            onChange={(e) =>
                                setNewComment((prev) => ({ ...prev, author: e.target.value }))
                            }
                            maxLength={50}
                        />
                        <textarea
                            placeholder={t("comments.reply.placeholder", locale)}
                            value={newComment.content}
                            onChange={(e) =>
                                setNewComment((prev) => ({ ...prev, content: e.target.value }))
                            }
                            className="w-full min-h-[80px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            maxLength={2000}
                        />
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                <Send className="w-3 h-3 mr-1" />
                                {isSubmitting ? t("comments.submitting", locale) : t("comments.reply.submit", locale)}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyTo(null)}
                            >
                                {t("comments.cancel", locale)}
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* 대댓글 */}
            {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
        </div>
    );

    return (
        <section className="mt-12 pt-8 border-t border-border">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6">
                <MessageSquare className="w-5 h-5" />
                {t("comments.title", locale)} {comments.length > 0 && `(${comments.length})`}
            </h2>

            {/* 새 댓글 폼 */}
            {replyTo === null && (
                <form onSubmit={(e) => handleSubmit(e)} className="mb-8 space-y-3">
                    <Input
                        placeholder={t("comments.nickname", locale)}
                        value={newComment.author}
                        onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, author: e.target.value }))
                        }
                        maxLength={50}
                    />
                    <textarea
                        placeholder={t("comments.placeholder", locale)}
                        value={newComment.content}
                        onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, content: e.target.value }))
                        }
                        className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={2000}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? t("comments.submitting", locale) : t("comments.submit", locale)}
                    </Button>
                </form>
            )}

            {/* 댓글 목록 */}
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    {t("comments.loading", locale)}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    {t("comments.empty", locale)}
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {comments.map((comment) => renderComment(comment))}
                </div>
            )}
        </section>
    );
}
