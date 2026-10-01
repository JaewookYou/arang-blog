import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { findContentFile, isGitHubConfigured, isValidSlug, normalizeKind } from "@/lib/github";

/**
 * Admin Post Detail API
 * GitHub에서 글 원본(.md/.mdx)을 가져온다.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const denied = await requireAdmin();
    if (denied) return denied;
    if (!isGitHubConfigured()) {
        return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 500 });
    }

    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    if (!isValidSlug(slug)) {
        return NextResponse.json({ error: "잘못된 slug입니다." }, { status: 400 });
    }
    const kind = normalizeKind(new URL(request.url).searchParams.get("type"));

    try {
        const file = await findContentFile(kind, slug);
        if (!file) {
            return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
        }
        return NextResponse.json({ slug, path: file.path, sha: file.sha, content: file.content });
    } catch (error) {
        console.error("Get post error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get post" },
            { status: 500 }
        );
    }
}
