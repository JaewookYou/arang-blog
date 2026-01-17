import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Post Detail API
 * GitHub에서 특정 파일 내용 가져오기
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "posts";

    try {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        const baseDir = type === "writeups" ? "content/writeups" : "content/posts";

        // .md 먼저 시도, 없으면 .mdx 시도
        let path = `${baseDir}/${slug}.md`;
        let data;

        try {
            const response = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path,
            });
            data = response.data;
        } catch {
            // .md 없으면 .mdx 시도
            path = `${baseDir}/${slug}.mdx`;
            const response = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path,
            });
            data = response.data;
        }

        if (Array.isArray(data) || !("content" in data)) {
            return NextResponse.json({ error: "Not a file" }, { status: 400 });
        }

        const content = Buffer.from(data.content, "base64").toString("utf-8");

        return NextResponse.json({
            slug,
            path: data.path,
            sha: data.sha,
            content,
        });
    } catch (error) {
        console.error("Get post error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get post" },
            { status: 500 }
        );
    }
}
