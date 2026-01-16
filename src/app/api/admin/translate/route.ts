import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

/**
 * Admin Translation API
 * Gemini 3 Pro Preview를 사용하여 콘텐츠 번역
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface TranslateRequest {
    content: string;
    title: string;
    description?: string;
    targetLocales: ("en" | "ja" | "zh")[];
}

interface TranslatedContent {
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

    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY not configured" },
            { status: 500 }
        );
    }

    try {
        const body: TranslateRequest = await request.json();
        const { content, title, description, targetLocales } = body;

        if (!content || !title || !targetLocales?.length) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const translations: Record<string, TranslatedContent> = {};

        // 각 언어로 번역
        for (const locale of targetLocales) {
            const targetLang =
                locale === "en" ? "English" :
                    locale === "ja" ? "Japanese" :
                        "Simplified Chinese";

            const prompt = `You are a professional translator. Translate the following Korean blog post content to ${targetLang}.

IMPORTANT RULES:
1. Keep all Markdown/MDX syntax intact (headings, code blocks, links, images, etc.)
2. Keep all code snippets unchanged
3. Translate naturally, not literally
4. Preserve the technical accuracy
5. Keep frontmatter format like "---" separators unchanged
6. Do NOT add any explanations, just output the translation

---
TITLE: ${title}

DESCRIPTION: ${description || ""}

CONTENT:
${content}
---

Output format (JSON):
{
  "title": "translated title",
  "description": "translated description",
  "content": "translated content (Markdown)"
}`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-05-20",
                contents: prompt,
            });

            const responseText = response.text || "";

            // JSON 파싱 시도
            try {
                // JSON 블록 추출
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    translations[locale] = {
                        title: parsed.title || title,
                        description: parsed.description || description || "",
                        content: parsed.content || content,
                    };
                } else {
                    // JSON 형식이 아니면 전체를 content로
                    translations[locale] = {
                        title: title,
                        description: description || "",
                        content: responseText,
                    };
                }
            } catch {
                // JSON 파싱 실패시 원문 그대로
                translations[locale] = {
                    title: title,
                    description: description || "",
                    content: responseText,
                };
            }
        }

        return NextResponse.json({
            success: true,
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
