import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
    findContentFile,
    isContentPath,
    isGitHubConfigured,
    isValidSlug,
    normalizeKind,
    parseFrontmatter,
    putContentFile,
    validateFrontmatter,
} from "@/lib/github";
import { enqueueTranslations, isAutoTranslateEnabled } from "@/lib/translation/service";

/**
 * Admin Update API
 * 기존 글을 원래 경로(.md 또는 .mdx) 그대로 GitHub에 커밋한다.
 * 프론트매터를 검사해서 빌드를 깨뜨리는 커밋을 막고, 자동 번역이 켜져 있으면 번역도 갱신한다.
 */
export async function POST(request: NextRequest) {
    const denied = await requireAdmin();
    if (denied) return denied;
    if (!isGitHubConfigured()) {
        return NextResponse.json({ error: "GITHUB_TOKEN이 설정되지 않았습니다." }, { status: 500 });
    }

    try {
        const body = await request.json();
        const kind = normalizeKind(body.type);
        const slug = body.slug;
        const content: unknown = body.content;

        if (!isValidSlug(slug) || typeof content !== "string" || !content.trim()) {
            return NextResponse.json({ error: "slug와 content가 필요합니다." }, { status: 400 });
        }

        let parsed;
        try {
            parsed = parseFrontmatter(content);
        } catch (error) {
            return NextResponse.json(
                { error: `프론트매터 YAML 오류: ${error instanceof Error ? error.message : String(error)}` },
                { status: 400 }
            );
        }
        const problems = validateFrontmatter(parsed.data, kind);
        if (problems.length) {
            return NextResponse.json({ error: problems.join("\n") }, { status: 400 });
        }

        // 편집기에서 받은 경로가 유효하면 사용하고, 아니면 실제 파일을 찾는다
        let path: string | null = isContentPath(body.path, kind, slug) ? body.path : null;
        let sha: string | undefined = typeof body.sha === "string" ? body.sha : undefined;
        if (!path || !sha) {
            const existing = await findContentFile(kind, slug);
            if (!existing) {
                return NextResponse.json({ error: "수정할 파일을 찾을 수 없습니다." }, { status: 404 });
            }
            path = existing.path;
            sha = existing.sha;
        }

        let commit: { commitSha: string; fileSha: string };
        try {
            commit = await putContentFile(path, content, `📝 Update: ${slug}`, sha);
        } catch (error) {
            const status = (error as { status?: number })?.status;
            if (status === 409 || status === 422) {
                return NextResponse.json(
                    { error: "다른 곳에서 파일이 먼저 수정되었습니다. 새로고침 후 다시 시도하세요." },
                    { status: 409 }
                );
            }
            throw error;
        }

        let translationQueued = 0;
        if (isAutoTranslateEnabled()) {
            const { queued } = enqueueTranslations([
                {
                    type: kind,
                    slug,
                    source: {
                        title: String(parsed.data.title),
                        description: typeof parsed.data.description === "string" ? parsed.data.description : "",
                        markdown: parsed.body,
                    },
                    reason: "update",
                    skipUpToDate: true,
                },
            ]);
            translationQueued = queued;
        }

        return NextResponse.json({
            success: true,
            message: "Updated successfully",
            path,
            commitSha: commit.commitSha,
            sha: commit.fileSha, // 다음 저장에 쓸 새 파일 SHA
            translationQueued,
        });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update" },
            { status: 500 }
        );
    }
}
