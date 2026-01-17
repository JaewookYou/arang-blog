import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { upsertTranslation } from "@/lib/db";

/**
 * Admin Translation API
 * Gemini를 사용하여 콘텐츠 번역 후 DB에 저장
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
                model: "gemini-3-pro-preview",
                contents: prompt,
            });

            const responseText = response.text || "";

            // JSON 파싱 시도
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    translations[locale] = {
                        title: parsed.title || title,
                        description: parsed.description || description || "",
                        content: parsed.content || content,
                    };
                } else {
                    translations[locale] = {
                        title: title,
                        description: description || "",
                        content: responseText,
                    };
                }
            } catch {
                translations[locale] = {
                    title: title,
                    description: description || "",
                    content: responseText,
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
