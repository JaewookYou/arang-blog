import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
    buildDocument,
    contentDir,
    findContentFile,
    isGitHubConfigured,
    isValidSlug,
    normalizeKind,
    putContentFile,
    validateFrontmatter,
} from "@/lib/github";
import { enqueueTranslations, isAutoTranslateEnabled } from "@/lib/translation/service";

/**
 * Admin Commit API — 새 글 작성
 * content/(posts|writeups)/<slug>.md 로 커밋한다. (번역은 DB에 저장)
 * - 기존 파일이 있으면 덮어쓰지 않는다.
 * - 프론트매터는 js-yaml로 만들어 따옴표 등이 들어간 제목도 안전하게 저장한다.
 * - velite는 .md/.mdx 모두 일반 마크다운으로 처리하므로 HTML 주석을 바꾸지 않는다.
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
        const slug = typeof body.slug === "string" ? body.slug.trim() : "";
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";
        const content = typeof body.content === "string" ? body.content : "";

        if (!title || !content.trim()) {
            return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 });
        }
        if (!isValidSlug(slug)) {
            return NextResponse.json(
                { error: "슬러그는 글자/숫자로 시작하고 글자, 숫자, -, _ 만 사용할 수 있습니다." },
                { status: 400 }
            );
        }

        const tags = String(body.tags || "")
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean);

        // 예약 발행: 클라이언트가 보낸 ISO 시각(시간대 포함)을 그대로 사용
        let scheduledAt: string | undefined;
        if (body.scheduledAt) {
            const parsed = new Date(body.scheduledAt);
            if (isNaN(parsed.getTime())) {
                return NextResponse.json({ error: "예약 발행 시간이 올바르지 않습니다." }, { status: 400 });
            }
            scheduledAt = parsed.toISOString();
        }

        const data: Record<string, unknown> = {
            title,
            description: description || undefined,
            date: new Date().toISOString().slice(0, 10),
            published: true,
            tags,
            scheduledAt,
        };
        if (kind === "post" && typeof body.category === "string" && body.category.trim()) {
            data.category = body.category.trim();
        }
        if (kind === "writeup") {
            data.ctf = typeof body.ctf === "string" && body.ctf.trim() ? body.ctf.trim() : undefined;
            data.category = body.category || "web";
            data.difficulty = body.difficulty || "medium";
            const points = Number(body.points);
            if (body.points !== undefined && body.points !== "" && Number.isFinite(points)) data.points = points;
        }

        const problems = validateFrontmatter(data, kind);
        if (problems.length) {
            return NextResponse.json({ error: problems.join("\n") }, { status: 400 });
        }

        if (await findContentFile(kind, slug)) {
            return NextResponse.json({ error: `이미 같은 슬러그의 글이 있습니다: ${slug}` }, { status: 409 });
        }

        const path = `${contentDir(kind)}/${slug}.md`;
        const fileContent = buildDocument(data, content);
        const { commitSha } = await putContentFile(path, fileContent, `✨ New ${kind}: ${title}`);

        // 배포가 끝나기 전에 번역을 미리 만들어 둔다
        let translationQueued = 0;
        if (isAutoTranslateEnabled()) {
            translationQueued = enqueueTranslations([
                { type: kind, slug, source: { title, description, markdown: content }, reason: "publish" },
            ]).queued;
        }

        return NextResponse.json({
            success: true,
            message: "Post committed successfully",
            path,
            commitSha,
            translationQueued,
        });
    } catch (error) {
        console.error("Commit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to commit" },
            { status: 500 }
        );
    }
}
