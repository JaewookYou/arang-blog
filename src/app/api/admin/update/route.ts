import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Update API
 * GitHub에 기존 파일 업데이트
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { type, slug, content, sha } = body;

        if (!slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const filePath = type === "writeup"
            ? `content/writeups/${slug}.mdx`
            : `content/posts/${slug}.mdx`;

        // HTML 주석을 MDX 주석으로 변환
        const sanitizedContent = content.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}');

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // 파일 업데이트
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: filePath,
            message: `📝 Update: ${slug}`,
            content: Buffer.from(sanitizedContent).toString("base64"),
            sha,
            branch: "main",
        });

        return NextResponse.json({
            success: true,
            message: "Updated successfully",
            path: filePath,
        });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to update" },
            { status: 500 }
        );
    }
}
