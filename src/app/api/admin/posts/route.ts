import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Posts List API
 * GitHub에서 posts/writeups 목록 가져오기
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "posts";

    try {
        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        const path = type === "writeups" ? "content/writeups" : "content/posts";

        const { data } = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path,
        });

        if (!Array.isArray(data)) {
            return NextResponse.json({ error: "Not a directory" }, { status: 400 });
        }

        const files = data
            .filter((file) => file.name.endsWith(".mdx"))
            .map((file) => ({
                name: file.name,
                slug: file.name.replace(".mdx", ""),
                path: file.path,
                sha: file.sha,
            }));

        return NextResponse.json({ files });
    } catch (error) {
        console.error("List posts error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to list posts" },
            { status: 500 }
        );
    }
}
