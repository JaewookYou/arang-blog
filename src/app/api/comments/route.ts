import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment, deleteComment } from "@/lib/db";

/**
 * Comments API
 * GET: 댓글 조회
 * POST: 댓글 추가
 * DELETE: 댓글 삭제
 */

// GET /api/comments?slug=xxx&type=post
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "post";

    if (!slug) {
        return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    try {
        const comments = getComments(slug, type);
        return NextResponse.json({ comments });
    } catch (error) {
        console.error("Failed to get comments:", error);
        return NextResponse.json({ error: "Failed to get comments" }, { status: 500 });
    }
}

// POST /api/comments
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, type, author, content, parentId } = body;

        if (!slug || !author || !content) {
            return NextResponse.json(
                { error: "slug, author, and content are required" },
                { status: 400 }
            );
        }

        // 기본 유효성 검사
        if (author.length < 2 || author.length > 50) {
            return NextResponse.json(
                { error: "Author name must be 2-50 characters" },
                { status: 400 }
            );
        }

        if (content.length < 1 || content.length > 2000) {
            return NextResponse.json(
                { error: "Content must be 1-2000 characters" },
                { status: 400 }
            );
        }

        const comment = addComment(slug, type || "post", author, content, parentId);
        return NextResponse.json({ comment }, { status: 201 });
    } catch (error) {
        console.error("Failed to add comment:", error);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        const success = deleteComment(parseInt(id, 10));
        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
