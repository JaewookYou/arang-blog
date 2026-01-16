import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Commit API
 * GitHub에 새 MDX 파일 커밋
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

export async function POST(request: NextRequest) {
    // 인증 확인
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
        return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const {
            type,
            title,
            description,
            slug,
            content,
            tags,
            ctf,
            category,
            difficulty,
            points,
        } = body;

        // 유효성 검사
        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 파일 경로 결정
        const filePath = type === "writeup"
            ? `content/writeups/${slug}.mdx`
            : `content/posts/${slug}.mdx`;

        // Frontmatter 생성
        const date = new Date().toISOString().split("T")[0];
        const tagList = tags
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [];

        let frontmatter = `---
title: "${title}"
description: "${description || ""}"
date: ${date}
published: true
tags: [${tagList.map((t: string) => `"${t}"`).join(", ")}]`;

        // Writeup 전용 필드
        if (type === "writeup") {
            frontmatter += `
ctf: "${ctf || ""}"
category: "${category || "web"}"
difficulty: "${difficulty || "medium"}"`;
            if (points) {
                frontmatter += `
points: ${points}`;
            }
        }

        frontmatter += `
---

`;

        const fileContent = frontmatter + content;

        // Octokit 초기화
        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // 기존 파일 확인 (SHA 필요)
        let sha: string | undefined;
        try {
            const { data: existingFile } = await octokit.rest.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: filePath,
            });
            if ("sha" in existingFile) {
                sha = existingFile.sha;
            }
        } catch {
            // 파일이 없으면 OK (새로 생성)
        }

        // 파일 생성/업데이트
        const commitMessage = sha
            ? `📝 Update: ${title}`
            : `✨ New ${type}: ${title}`;

        await octokit.rest.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: filePath,
            message: commitMessage,
            content: Buffer.from(fileContent).toString("base64"),
            sha,
            branch: "main",
        });

        return NextResponse.json({
            success: true,
            message: "Committed successfully",
            path: filePath,
        });
    } catch (error) {
        console.error("Commit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to commit" },
            { status: 500 }
        );
    }
}
