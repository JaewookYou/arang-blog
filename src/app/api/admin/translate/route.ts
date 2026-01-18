import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { upsertTranslation } from "@/lib/db";

/**
 * Admin Translation API
 * Gemini를 사용하여 콘텐츠 번역 후 DB에 저장
 * 코드블럭/이미지를 사전 추출하여 번역 시 보존
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface TranslateRequest {
    content: string;
    title: string;
    description?: string;
    slug: string;
    type: "post" | "writeup";
    targetLocales: ("en" | "ja" | "zh")[];
}

interface TranslatedContent {
    title: string;
    description: string;
    content: string;
}

const LANG_NAMES: Record<string, string> = {
    en: "English",
    ja: "Japanese",
    zh: "Simplified Chinese"
};

/**
 * 코드블럭 추출 및 플레이스홀더로 대체
 */
function extractCodeBlocks(content: string): { processed: string; codeBlocks: string[] } {
    const codeBlocks: string[] = [];
    // 3개 이상의 백틱 + 옵션 언어 + 내용 + 닫는 백틱
    const codeBlockRegex = /(```[\w-]*\n[\s\S]*?\n```)/g;

    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        codeBlocks.push(match[1]);
    }

    let processed = content;
    for (let i = 0; i < codeBlocks.length; i++) {
        processed = processed.replace(codeBlocks[i], `[[CODE_BLOCK_${i}]]`);
    }

    return { processed, codeBlocks };
}

function restoreCodeBlocks(content: string, codeBlocks: string[]): string {
    let restored = content;
    for (let i = 0; i < codeBlocks.length; i++) {
        restored = restored.replace(`[[CODE_BLOCK_${i}]]`, codeBlocks[i]);
    }
    return restored;
}

/**
 * 이미지 추출 및 플레이스홀더로 대체
 */
function extractImages(content: string): { processed: string; images: string[] } {
    const images: string[] = [];
    const imageRegex = /(!?\[.*?\]\(.*?\))/g;

    let match;
    while ((match = imageRegex.exec(content)) !== null) {
        images.push(match[1]);
    }

    let processed = content;
    for (let i = 0; i < images.length; i++) {
        processed = processed.replace(images[i], `[[IMAGE_${i}]]`);
    }

    return { processed, images };
}

function restoreImages(content: string, images: string[]): string {
    let restored = content;
    for (let i = 0; i < images.length; i++) {
        restored = restored.replace(`[[IMAGE_${i}]]`, images[i]);
    }
    return restored;
}

export async function POST(request: NextRequest) {
    // 인증 확인
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY not configured" },
            { status: 500 }
        );
    }

    try {
        const body: TranslateRequest = await request.json();
        const { content, title, description, slug, type, targetLocales } = body;

        if (!content || !title || !slug || !type || !targetLocales?.length) {
            return NextResponse.json(
                { error: "Missing required fields: content, title, slug, type, targetLocales" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const translations: Record<string, TranslatedContent> = {};

        // 1. 코드블럭 추출
        const { processed: contentNoCode, codeBlocks } = extractCodeBlocks(content);

        // 2. 이미지 추출
        const { processed: contentClean, images } = extractImages(contentNoCode);

        // 각 언어로 번역
        for (const locale of targetLocales) {
            const targetLang = LANG_NAMES[locale] || "English";

            const prompt = `You are a professional technical translator specializing in cybersecurity and software development.

Translate the following Korean blog post to ${targetLang}.

## RULES:
1. Translate text naturally, not literally.
2. Keep all placeholders like [[CODE_BLOCK_0]], [[IMAGE_0]] etc. EXACTLY as they are - do NOT translate or modify them.
3. Do NOT translate any technical terms inside backticks (\`code\`).
4. Preserve all Markdown formatting (headers ##, lists -, bold **, etc.)
5. Keep paragraph breaks (empty lines between paragraphs).
6. Do NOT add any explanations, just output the translation.

---
TITLE: ${title}

DESCRIPTION: ${description || ""}

CONTENT:
${contentClean}
---

Output format (JSON only, no markdown code blocks):
{"title": "translated title", "description": "translated description", "content": "translated content with all placeholders preserved"}`;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: prompt,
            });

            const responseText = response.text || "";

            // JSON 파싱 시도
            try {
                // JSON 블록에서 ```json ... ``` 제거
                let jsonStr = responseText;
                if (jsonStr.includes("```json")) {
                    jsonStr = jsonStr.replace(/```json\s*/g, "").replace(/```\s*/g, "");
                } else if (jsonStr.includes("```")) {
                    jsonStr = jsonStr.replace(/```\s*/g, "");
                }

                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);

                    let translatedContent = parsed.content || content;

                    // 3. 이미지 복원
                    translatedContent = restoreImages(translatedContent, images);

                    // 4. 코드블럭 복원
                    translatedContent = restoreCodeBlocks(translatedContent, codeBlocks);

                    translations[locale] = {
                        title: parsed.title || title,
                        description: parsed.description || description || "",
                        content: translatedContent,
                    };
                } else {
                    // JSON 매칭 실패 시 원본 복원
                    let fallbackContent = restoreImages(contentClean, images);
                    fallbackContent = restoreCodeBlocks(fallbackContent, codeBlocks);

                    translations[locale] = {
                        title: title,
                        description: description || "",
                        content: fallbackContent,
                    };
                }
            } catch {
                // 파싱 실패 시 원본 복원
                let fallbackContent = restoreImages(contentClean, images);
                fallbackContent = restoreCodeBlocks(fallbackContent, codeBlocks);

                translations[locale] = {
                    title: title,
                    description: description || "",
                    content: fallbackContent,
                };
            }

            // DB에 저장
            upsertTranslation(
                slug,
                type,
                locale,
                translations[locale].title,
                translations[locale].description,
                translations[locale].content
            );
        }

        return NextResponse.json({
            success: true,
            message: `Translated and saved to DB for locales: ${targetLocales.join(", ")}`,
            translations,
        });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Translation failed" },
            { status: 500 }
        );
    }
}
