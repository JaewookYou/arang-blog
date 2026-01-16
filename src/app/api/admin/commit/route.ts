import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

/**
 * Admin Commit API
 * GitHub에 새 MDX 파일 커밋 (번역 파일 포함)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";

interface TranslationContent {
    title: string;
    description: string;
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
        const filePath = `${basePath}/${slug}.mdx`;

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
        const filesToCommit: { path: string; content: string }[] = [];

        // 1. 원본 파일 (한국어)
        const originalContent = createFrontmatter(title, description, "ko") + sanitizeContent(content);
        filesToCommit.push({ path: filePath, content: originalContent });

        // 2. 번역 파일들 (있는 경우)
        if (translations) {
            try {
                const translationsData: Record<string, TranslationContent> = JSON.parse(translations);

                for (const [locale, trans] of Object.entries(translationsData)) {
                    if (trans && trans.content) {
                        const translatedPath = `${basePath}/${slug}-${locale}.mdx`;
                        const translatedContent = createFrontmatter(
                            trans.title || title,
                            trans.description || description,
                            locale,
                            slug
                        ) + sanitizeContent(trans.content);

                        filesToCommit.push({ path: translatedPath, content: translatedContent });
                    }
                }
            } catch {
                console.error("Failed to parse translations");
            }
        }

        // 모든 파일 커밋
        for (const file of filesToCommit) {
            // 기존 파일 확인 (SHA 필요)
            let sha: string | undefined;
            try {
                const { data: existingFile } = await octokit.rest.repos.getContent({
                    owner: REPO_OWNER,
                    repo: REPO_NAME,
                    path: file.path,
                });
                if ("sha" in existingFile) {
                    sha = existingFile.sha;
                }
            } catch {
                // 파일이 없으면 OK (새로 생성)
            }

            // 파일 생성/업데이트
            const isTranslation = file.path !== filePath;
            const commitMessage = sha
                ? `📝 Update: ${title}${isTranslation ? ` (${file.path.split("-").pop()?.replace(".mdx", "")})` : ""}`
                : `✨ New ${type}: ${title}${isTranslation ? ` (translated)` : ""}`;

            await octokit.rest.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: file.path,
                message: commitMessage,
                content: Buffer.from(file.content).toString("base64"),
                sha,
                branch: "main",
            });
        }

        return NextResponse.json({
            success: true,
            message: `Committed ${filesToCommit.length} file(s) successfully`,
            files: filesToCommit.map(f => f.path),
        });
    } catch (error) {
        console.error("Commit error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to commit" },
            { status: 500 }
        );
    }
}
