import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { upsertTranslation } from "@/lib/db";
import { markdownToHtml } from "@/lib/markdown";

/**
 * Internal Translation API (토큰 인증)
 * 스크립트에서 호출하여 번역 자동 생성
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

interface TranslateRequest {
    content: string;
    title: string;
    description?: string;
    slug: string;
    type: "post" | "writeup";
    targetLocales: ("en" | "ja" | "zh")[];
}

const LANG_NAMES: Record<string, string> = {
    en: "English",
    ja: "Japanese",
    zh: "Simplified Chinese"
};

function extractCodeBlocks(content: string): { processed: string; codeBlocks: string[] } {
    const codeBlocks: string[] = [];
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

/**
 * 개선된 JSON 추출 함수
 * LLM 응답에서 JSON을 안전하게 추출
 */
function extractJsonFromResponse(responseText: string): { title?: string; description?: string; content?: string } | null {
    // 1. 마크다운 코드블록 제거
    let jsonStr = responseText;
    
    // ```json ... ``` 또는 ``` ... ``` 제거
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
    }
    
    // 2. 첫 번째 { 부터 마지막 } 까지 추출 (greedy)
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        console.error("[Translation] No valid JSON braces found");
        return null;
    }
    
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    
    // 3. 먼저 직접 파싱 시도
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.log("[Translation] Direct parse failed, trying recovery...");
    }
    
    // 4. 줄바꿈 복구 시도 - content 필드 내 실제 줄바꿈을 \n으로 변환
    try {
        // JSON 키:값 패턴으로 분리해서 처리
        const titleMatch = jsonStr.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const descMatch = jsonStr.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        
        // content는 마지막이므로 더 유연하게 처리
        const contentStartMatch = jsonStr.match(/"content"\s*:\s*"/);
        if (contentStartMatch && titleMatch) {
            const contentStart = jsonStr.indexOf(contentStartMatch[0]) + contentStartMatch[0].length;
            // 마지막 "} 찾기
            let contentEnd = jsonStr.lastIndexOf('"}');
            if (contentEnd === -1) contentEnd = jsonStr.lastIndexOf('"');
            
            if (contentEnd > contentStart) {
                let contentValue = jsonStr.substring(contentStart, contentEnd);
                // 이스케이프되지 않은 줄바꿈을 \n으로 변환
                contentValue = contentValue.replace(/(?<!\\)\n/g, '\\n');
                // 이스케이프되지 않은 따옴표 처리
                contentValue = contentValue.replace(/(?<!\\)"/g, '\\"');
                
                return {
                    title: titleMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
                    description: descMatch ? descMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : "",
                    content: contentValue.replace(/\\"/g, '"').replace(/\\n/g, '\n')
                };
            }
        }
    } catch (e) {
        console.error("[Translation] Recovery parse failed:", e);
    }
    
    // 5. 최후의 수단: 정규식으로 각 필드 추출
    try {
        const result: { title?: string; description?: string; content?: string } = {};
        
        // title 추출
        const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/);
        if (titleMatch) result.title = titleMatch[1].replace(/\\"/g, '"');
        
        // description 추출
        const descMatch = jsonStr.match(/"description"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/);
        if (descMatch) result.description = descMatch[1].replace(/\\"/g, '"');
        
        // content는 나머지 전체
        const contentMatch = jsonStr.match(/"content"\s*:\s*"([\s\S]*)"\s*\}?\s*$/);
        if (contentMatch) {
            result.content = contentMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\t/g, '\t');
        }
        
        if (result.title && result.content) {
            return result;
        }
    } catch (e) {
        console.error("[Translation] Regex extraction failed:", e);
    }
    
    return null;
}

export async function POST(request: NextRequest) {
    // 토큰 인증
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    
    if (!INTERNAL_API_TOKEN || token !== INTERNAL_API_TOKEN) {
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
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const translations: Record<string, { title: string; description: string; content: string }> = {};
        const errors: string[] = [];

        const { processed: contentNoCode, codeBlocks } = extractCodeBlocks(content);
        const { processed: contentClean, images } = extractImages(contentNoCode);

        for (const locale of targetLocales) {
            const targetLang = LANG_NAMES[locale] || "English";

            // 개선된 프롬프트: JSON 형식을 더 명확하게 지시
            const prompt = `You are a professional technical translator specializing in cybersecurity and software development.

Translate the following Korean blog post to ${targetLang}.

## CRITICAL RULES:
1. Output ONLY valid JSON, nothing else.
2. Escape all special characters properly in JSON strings.
3. Use \\n for newlines inside JSON string values.
4. Keep all placeholders like [[CODE_BLOCK_0]], [[IMAGE_0]] EXACTLY as they are.
5. Do NOT translate technical terms inside backticks.
6. Preserve Markdown formatting.

---
TITLE: ${title}

DESCRIPTION: ${description || ""}

CONTENT:
${contentClean}
---

Respond with ONLY this JSON structure (no markdown, no explanation):
{"title": "translated title here", "description": "translated description here", "content": "translated content here with proper escaping"}`;

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: prompt,
                });

                const responseText = response.text || "";
                console.log(`[Translation ${locale}] Response length: ${responseText.length}`);

                const parsed = extractJsonFromResponse(responseText);
                
                if (parsed && parsed.content) {
                    let translatedContent = parsed.content;
                    translatedContent = restoreImages(translatedContent, images);
                    translatedContent = restoreCodeBlocks(translatedContent, codeBlocks);

                    translations[locale] = {
                        title: parsed.title || title,
                        description: parsed.description || description || "",
                        content: translatedContent,
                    };
                    
                    console.log(`[Translation ${locale}] Success: title=${translations[locale].title.substring(0, 30)}...`);
                } else {
                    // 파싱 실패 시 원본 저장 (fallback)
                    console.error(`[Translation ${locale}] Parse failed, using fallback`);
                    errors.push(`${locale}: JSON parse failed`);
                    
                    let fallbackContent = restoreImages(contentClean, images);
                    fallbackContent = restoreCodeBlocks(fallbackContent, codeBlocks);
                    translations[locale] = {
                        title: title,
                        description: description || "",
                        content: fallbackContent,
                    };
                }
            } catch (genError) {
                console.error(`[Translation ${locale}] Generation error:`, genError);
                errors.push(`${locale}: ${genError instanceof Error ? genError.message : 'Unknown error'}`);
                
                // 에러 시에도 원본으로 fallback
                let fallbackContent = restoreImages(contentClean, images);
                fallbackContent = restoreCodeBlocks(fallbackContent, codeBlocks);
                translations[locale] = {
                    title: title,
                    description: description || "",
                    content: fallbackContent,
                };
            }

            // DB에 저장 (성공/실패 모두)
            try {
                const htmlContent = await markdownToHtml(translations[locale].content);
                upsertTranslation(
                    slug,
                    type,
                    locale,
                    translations[locale].title,
                    translations[locale].description,
                    htmlContent
                );
                console.log(`[Translation ${locale}] Saved to DB`);
            } catch (dbError) {
                console.error(`[Translation ${locale}] DB save error:`, dbError);
                errors.push(`${locale}: DB save failed`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Translated to: ${targetLocales.join(", ")}`,
            translations,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Translation failed" },
            { status: 500 }
        );
    }
}
