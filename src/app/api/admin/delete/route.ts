import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteContentFile, findContentFile, isGitHubConfigured, isValidSlug, normalizeKind } from "@/lib/github";
import { deleteTranslation } from "@/lib/db";

/**
 * Admin Delete Post API
 * GitHub에서 글 파일(.md/.mdx)을 삭제하고 DB의 번역도 함께 지운다.
 */
export async function DELETE(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;
    if (!isGitHubConfigured()) {
        return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const kind = normalizeKind(searchParams.get("type"));

        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: "잘못된 slug입니다." }, { status: 400 });
        }

        const file = await findContentFile(kind, slug);
        if (!file) {
            return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
        }

        await deleteContentFile(file.path, file.sha, `🗑️ Delete ${kind}: ${slug}`);
        const deletedTranslations = deleteTranslation(slug, kind);

        return NextResponse.json({
            success: true,
            message: `Deleted ${file.path} and ${deletedTranslations} translation(s)`,
            deletedTranslations,
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete" },
            { status: 500 }
        );
    }
}
