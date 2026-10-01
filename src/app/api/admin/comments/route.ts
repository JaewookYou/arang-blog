import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDatabase, deleteComment } from "@/lib/db";

/**
 * Admin Comments API
 * 댓글 관리 (목록 조회, 삭제)
 */

export async function GET(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 500);

        const db = getDatabase();
        const comments = db
            .prepare(`
                SELECT * FROM comments 
                WHERE is_deleted = 0
                ORDER BY created_at DESC
                LIMIT ?
            `)
            .all(limit);

        return NextResponse.json({ comments });
    } catch (error) {
        console.error("Get comments error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get comments" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });
        }

        const success = deleteComment(parseInt(id));

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Delete comment error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete comment" },
            { status: 500 }
        );
    }
}
