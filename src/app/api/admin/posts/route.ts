import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isGitHubConfigured, listContentFiles, normalizeKind } from "@/lib/github";
import { getSourceItem } from "@/lib/translation/source";

/**
 * Admin Posts List API
 * GitHub의 content/posts, content/writeups 목록 (배포 전 파일 포함)
 */
export async function GET(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;
    if (!isGitHubConfigured()) {
        return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 500 });
    }

    const kind = normalizeKind(new URL(request.url).searchParams.get("type"));

    try {
        const files = (await listContentFiles(kind)).map((file) => {
            const deployed = getSourceItem(kind, file.slug);
            return {
                ...file,
                title: deployed?.title ?? null,
                date: deployed?.date ?? null,
                deployed: Boolean(deployed),
            };
        });
        files.sort((a, b) => (b.date || "9999").localeCompare(a.date || "9999"));
        return NextResponse.json({ files });
    } catch (error) {
        console.error("List posts error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to list posts" },
            { status: 500 }
        );
    }
}
