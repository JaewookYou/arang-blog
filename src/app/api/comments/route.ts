import { NextRequest, NextResponse } from "next/server";
import { addComment, deleteComment, getCommentById, getComments } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSourceItem, isContentType } from "@/lib/translation/source";

/**
 * Comments API
 * GET: 댓글 조회 / POST: 댓글 작성 (IP당 작성 빈도 제한) / DELETE: 관리자만 삭제
 */

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "post";

    if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    try {
        return NextResponse.json({ comments: getComments(slug, type) });
    } catch (error) {
        console.error("Failed to get comments:", error);
        return NextResponse.json({ error: "Failed to get comments" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, author, content, parentId } = body;
        const type = body.type || "post";

        if (typeof slug !== "string" || typeof author !== "string" || typeof content !== "string") {
            return NextResponse.json({ error: "slug, author, and content are required" }, { status: 400 });
        }
        if (!isContentType(type) || !getSourceItem(type, slug)) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const trimmedAuthor = author.trim();
        const trimmedContent = content.trim();
        if (trimmedAuthor.length < 2 || trimmedAuthor.length > 50) {
            return NextResponse.json({ error: "Author name must be 2-50 characters" }, { status: 400 });
        }
        if (trimmedContent.length < 1 || trimmedContent.length > 2000) {
            return NextResponse.json({ error: "Content must be 1-2000 characters" }, { status: 400 });
        }

        let parent: number | undefined;
        if (parentId !== undefined && parentId !== null) {
            const parentComment = getCommentById(Number(parentId));
            if (!parentComment || parentComment.is_deleted || parentComment.post_slug !== slug || parentComment.post_type !== type) {
                return NextResponse.json({ error: "Parent comment not found" }, { status: 400 });
            }
            parent = parentComment.id;
        }

        // 스팸 방지: IP당 10분에 5개, 하루 30개
        const ip = clientIp(request);
        if (!rateLimit(`comment:10m:${ip}`, 5, 10 * 60 * 1000) || !rateLimit(`comment:1d:${ip}`, 30, 24 * 60 * 60 * 1000)) {
            return NextResponse.json({ error: "Too many comments", code: "rate_limited" }, { status: 429 });
        }

        const comment = addComment(slug, type, trimmedAuthor, trimmedContent, parent);
        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Failed to add comment:", error);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
}

// 예전에는 인증 없이 누구나 댓글을 삭제할 수 있었다
export async function DELETE(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        if (deleteComment(id)) return NextResponse.json({ success: true });
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
