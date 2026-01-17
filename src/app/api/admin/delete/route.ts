import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Delete Post API
 * GitHub에서 MDX 파일 삭제
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

export async function DELETE(request: NextRequest) {
    // 인증 확인
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get("slug");
        const type = searchParams.get("type") || "post";

        if (!slug) {
            return NextResponse.json({ error: "Missing slug" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // 파일 경로 결정
        const basePath = type === "writeup" ? "content/writeups" : "content/posts";
        const filePath = `${basePath}/${slug}.mdx`;

        // 파일 SHA 가져오기
        let sha: string;
        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: filePath,
            });
            if ("sha" in data) {
                sha = data.sha;
            } else {
                return NextResponse.json({ error: "File not found" }, { status: 404 });
            }
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // 파일 삭제
        await octokit.rest.repos.deleteFile({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: filePath,
            message: `🗑️ Delete ${type}: ${slug}`,
            sha,
            branch: "main",
        });

        // 번역 파일도 삭제 시도 (있으면)
        const locales = ["en", "ja", "zh"];
        for (const locale of locales) {
            const translationPath = `${basePath}/${slug}-${locale}.mdx`;
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    path: translationPath,
                });
                if ("sha" in data) {
                    await octokit.rest.repos.deleteFile({
                        owner: REPO_OWNER,
                        repo: REPO_NAME,
                        path: translationPath,
                        message: `🗑️ Delete translation: ${slug}-${locale}`,
                        sha: data.sha,
                        branch: "main",
                    });
                }
            } catch {
                // 번역 파일이 없으면 무시
            }
        }

        return NextResponse.json({
            success: true,
            message: `Deleted ${slug} and its translations`,
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete" },
            { status: 500 }
        );
    }
}
