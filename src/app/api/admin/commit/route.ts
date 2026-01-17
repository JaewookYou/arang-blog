import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Commit API
 * GitHub에 원본 MDX 파일만 커밋 (번역은 DB에 저장)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";
const BRANCH = "main";

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
            scheduledAt,
            ctf,
            category,
            difficulty,
            points,
        } = body;

        // 유효성 검사
        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // 파일 경로 결정
        const basePath = type === "writeup" ? "content/writeups" : "content/posts";
        const filePath = `${basePath}/${slug}.mdx`;

        // Frontmatter 생성
        const date = new Date().toISOString().split("T")[0];
        const tagList = tags
            ? tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
            : [];

        let frontmatter = `---
title: "${title}"
description: "${description || ""}"
date: ${date}
published: true
tags: [${tagList.map((tag: string) => `"${tag}"`).join(", ")}]`;

        if (scheduledAt) {
            frontmatter += `\nscheduledAt: ${scheduledAt}`;
        }

        // Writeup 전용 필드
        if (type === "writeup") {
            frontmatter += `\nctf: "${ctf || ""}"
category: "${category || "web"}"
difficulty: "${difficulty || "medium"}"`;
            if (points) {
                frontmatter += `\npoints: ${points}`;
            }
        }

        frontmatter += `\n---\n\n`;

        // HTML 주석을 MDX 주석으로 변환
        const sanitizedContent = content.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}');
        const fileContent = frontmatter + sanitizedContent;

        // === GitHub에 커밋 ===

        // 1. 현재 브랜치의 최신 커밋 SHA 가져오기
        const { data: refData } = await octokit.rest.git.getRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${BRANCH}`,
        });
        const latestCommitSha = refData.object.sha;

        // 2. 현재 커밋의 트리 SHA 가져오기
        const { data: commitData } = await octokit.rest.git.getCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            commit_sha: latestCommitSha,
        });
        const baseTreeSha = commitData.tree.sha;

        // 3. 새 트리 생성
        const { data: newTree } = await octokit.rest.git.createTree({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            base_tree: baseTreeSha,
            tree: [{
                path: filePath,
                mode: "100644",
                type: "blob",
                content: fileContent,
            }],
        });

        // 4. 새 커밋 생성
        const { data: newCommit } = await octokit.rest.git.createCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            message: `✨ New ${type}: ${title}`,
            tree: newTree.sha,
            parents: [latestCommitSha],
        });

        // 5. 브랜치 레퍼런스 업데이트
        await octokit.rest.git.updateRef({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            ref: `heads/${BRANCH}`,
            sha: newCommit.sha,
        });

        return NextResponse.json({
            success: true,
            message: "Post committed successfully",
            path: filePath,
            commitSha: newCommit.sha,
        });
    } catch (error) {
        console.error("Commit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to commit" },
            { status: 500 }
        );
    }
}
