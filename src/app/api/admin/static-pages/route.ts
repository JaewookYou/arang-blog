import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    getStaticPageContent,
    getAllStaticPageContent,
    saveStaticPageContent,
} from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Admin Static Pages API
 * 정적 페이지(Home, About 등) 콘텐츠 관리
 * 한국어 저장 시 자동으로 다른 언어로 번역
 */

const LOCALES = ["ko", "en", "ja", "zh"] as const;

// GET: 정적 페이지 콘텐츠 조회
export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("page");
    const locale = searchParams.get("locale");

    if (!pageKey) {
        return NextResponse.json({ error: "page parameter required" }, { status: 400 });
    }

    if (locale) {
        // 특정 언어 조회
        const content = getStaticPageContent(pageKey, locale);
        return NextResponse.json({ content });
    } else {
        // 모든 언어 조회
        const contents = getAllStaticPageContent(pageKey);
        return NextResponse.json({ contents });
    }
}

// POST: 정적 페이지 콘텐츠 저장 (한국어 저장 시 자동 번역)
export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { page, content, autoTranslate = true } = body;

        if (!page || !content) {
            return NextResponse.json(
                { error: "page and content are required" },
                { status: 400 }
            );
        }

        // 1. 한국어로 먼저 저장
        saveStaticPageContent(page, "ko", content);

        // 2. 자동 번역 옵션이 켜져 있으면 다른 언어로 번역
        if (autoTranslate) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                console.warn("GEMINI_API_KEY not set, skipping translation");
            } else {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const targetLocales = LOCALES.filter((l) => l !== "ko");

                for (const locale of targetLocales) {
                    try {
                        const localeNames: Record<string, string> = {
                            en: "English",
                            ja: "Japanese",
                            zh: "Simplified Chinese",
                        };

                        const prompt = `Translate the following JSON content to ${localeNames[locale]}. 
Keep the JSON structure exactly the same, only translate the string values.
Do NOT translate technical terms like CVE IDs, company names, team names, or proper nouns.
Keep HTML tags like <strong>, <span> intact.
Return ONLY the translated JSON, no markdown or explanation.

JSON to translate:
${content}`;

                        const result = await model.generateContent(prompt);
                        let translatedContent = result.response.text();

                        // Clean up markdown code blocks if present
                        translatedContent = translatedContent
                            .replace(/```json\s*/g, "")
                            .replace(/```\s*/g, "")
                            .trim();

                        // Validate JSON
                        JSON.parse(translatedContent);

                        saveStaticPageContent(page, locale, translatedContent);
                    } catch (error) {
                        console.error(`Translation to ${locale} failed:`, error);
                    }
                }
            }
        }

        const contents = getAllStaticPageContent(page);
        return NextResponse.json({
            success: true,
            message: "Static page content saved",
            contents,
        });
    } catch (error) {
        console.error("Error saving static page content:", error);
        return NextResponse.json(
            { error: "Failed to save static page content" },
            { status: 500 }
        );
    }
}
