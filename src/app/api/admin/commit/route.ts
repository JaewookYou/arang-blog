import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Commit API
 * GitHub에 새 MDX 파일 커밋 (번역 파일 포함)
 * 모든 파일을 하나의 커밋으로 푸시하여 Actions 중복 실행 방지
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";
const BRANCH = "main";

interface TranslationContent {
    title: string;
    description: string;
    content: string;
}

interface FileToCommit {
    path: string;
    content: string;
}

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
            translations, // 번역 데이터 (JSON string)
        } = body;

        // 유효성 검사
        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // 파일 경로 결정
        const basePath = type === "writeup" ? "content/writeups" : "content/posts";

        // Frontmatter 생성 함수
        const createFrontmatter = (
            t: string,
            d: string,
            locale: string = "ko",
            originalSlug?: string
        ) => {
            const date = new Date().toISOString().split("T")[0];
            const tagList = tags
                ? tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
                : [];

            let fm = `---
title: "${t}"
description: "${d || ""}"
date: ${date}
published: true
tags: [${tagList.map((tag: string) => `"${tag}"`).join(", ")}]
locale: "${locale}"`;

            if (originalSlug) {
                fm += `\noriginalSlug: "${originalSlug}"`;
            }

            if (scheduledAt) {
                fm += `\nscheduledAt: ${scheduledAt}`;
            }

            // Writeup 전용 필드
            if (type === "writeup") {
                fm += `\nctf: "${ctf || ""}"
category: "${category || "web"}"
difficulty: "${difficulty || "medium"}"`;
                if (points) {
                    fm += `\npoints: ${points}`;
                }
            }

            fm += `\n---\n\n`;
            return fm;
        };

        // HTML 주석을 MDX 주석으로 변환
        const sanitizeContent = (c: string) => c.replace(/<!--\s*([\s\S]*?)\s*-->/g, '{/* $1 */}');

        // 커밋할 파일 목록
        const filesToCommit: FileToCommit[] = [];

        // 1. 원본 파일 (한국어)
        const originalContent = createFrontmatter(title, description, "ko") + sanitizeContent(content);
        filesToCommit.push({ path: `${basePath}/${slug}.mdx`, content: originalContent });

        // 2. 번역 파일들 (있는 경우)
        if (translations) {
            try {
                const translationsData: Record<string, TranslationContent> = JSON.parse(translations);

                for (const [locale, trans] of Object.entries(translationsData)) {
                    if (trans && trans.content) {
                        const translatedContent = createFrontmatter(
                            trans.title || title,
                            trans.description || description,
                            locale,
                            slug
                        ) + sanitizeContent(trans.content);

                        filesToCommit.push({
                            path: `${basePath}/${slug}-${locale}.mdx`,
                            content: translatedContent,
                        });
                    }
                }
            } catch {
                console.error("Failed to parse translations");
            }
        }

        // === 모든 파일을 하나의 커밋으로 푸시 ===

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

        // 3. 새 트리 생성 (모든 파일 포함)
        const tree = filesToCommit.map((file) => ({
            path: file.path,
            mode: "100644" as const,
            type: "blob" as const,
            content: file.content,
        }));

        const { data: newTree } = await octokit.rest.git.createTree({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            base_tree: baseTreeSha,
            tree,
        });

        // 4. 새 커밋 생성
        const commitMessage = translations
            ? `✨ New ${type}: ${title} (+ translations)`
            : `✨ New ${type}: ${title}`;

        const { data: newCommit } = await octokit.rest.git.createCommit({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            message: commitMessage,
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
            message: `Committed ${filesToCommit.length} file(s) in single commit`,
            files: filesToCommit.map((f) => f.path),
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
