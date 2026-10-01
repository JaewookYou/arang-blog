import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllStaticPageContent, getStaticPageContent, saveStaticPageContent } from "@/lib/db";
import { homeTranslations, profileTranslations } from "@/lib/translations";
import { isGeminiConfigured } from "@/lib/gemini";
import { isLocale, TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n";
import { translateStaticPageJson } from "@/lib/translation/static-pages";

/**
 * Admin Static Pages API
 * 정적 페이지(Home, About) 콘텐츠 관리
 * 한국어 저장 시 다른 언어로 자동 번역하고, 언어별 성공/실패를 그대로 알려준다.
 * (예전에는 번역이 실패해도 "저장 완료"라고만 표시되어 About 페이지가 6월부터 갱신되지 않았다)
 */

const PAGE_KEYS = ["home", "about"] as const;
type PageKey = (typeof PAGE_KEYS)[number];

function isPageKey(value: unknown): value is PageKey {
    return typeof value === "string" && (PAGE_KEYS as readonly string[]).includes(value);
}

function getDefaultTemplate(pageKey: PageKey): string {
    return JSON.stringify(pageKey === "home" ? homeTranslations.ko : profileTranslations.ko, null, 2);
}

export async function GET(request: Request) {
    const denied = await requireAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("page");
    const locale = searchParams.get("locale");

    if (!isPageKey(pageKey)) {
        return NextResponse.json({ error: "page parameter required (home | about)" }, { status: 400 });
    }

    const defaultTemplate = getDefaultTemplate(pageKey);
    if (locale) {
        return NextResponse.json({ content: getStaticPageContent(pageKey, locale), defaultTemplate });
    }
    return NextResponse.json({
        contents: getAllStaticPageContent(pageKey),
        defaultTemplate,
        geminiConfigured: isGeminiConfigured(),
    });
}

async function translateAll(page: PageKey, koContent: string) {
    const translated: TranslationLocale[] = [];
    const failed: { locale: TranslationLocale; error: string }[] = [];

    if (!isGeminiConfigured()) {
        return { translated, failed: TRANSLATION_LOCALES.map((locale) => ({ locale, error: "GEMINI_API_KEY 없음" })) };
    }

    // 세 언어를 동시에 번역
    await Promise.all(
        TRANSLATION_LOCALES.map(async (locale) => {
            try {
                const json = await translateStaticPageJson(koContent, locale);
                saveStaticPageContent(page, locale, json);
                translated.push(locale);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                console.error(`[static-pages] ${page} ${locale} 번역 실패: ${message}`);
                failed.push({ locale, error: message });
            }
        })
    );
    return { translated, failed };
}

/**
 * POST { page, content, locale = "ko", autoTranslate = true }  저장 (+ 한국어면 자동 번역)
 * POST { page, action: "translate" }                           저장된 한국어 기준으로 번역만 다시 실행
 */
export async function POST(request: Request) {
    const denied = await requireAdmin();
    if (denied) return denied;

    try {
        const body = await request.json();
        const page = body.page;
        if (!isPageKey(page)) {
            return NextResponse.json({ error: "page는 home 또는 about이어야 합니다." }, { status: 400 });
        }

        if (body.action === "translate") {
            const ko = getStaticPageContent(page, "ko")?.content ?? getDefaultTemplate(page);
            const result = await translateAll(page, ko);
            return NextResponse.json({ success: result.failed.length === 0, ...result, contents: getAllStaticPageContent(page) });
        }

        const { content, locale = "ko", autoTranslate = true } = body;
        if (typeof content !== "string" || !content.trim() || !isLocale(locale)) {
            return NextResponse.json({ error: "page, content, locale이 필요합니다." }, { status: 400 });
        }

        try {
            const parsed = JSON.parse(content);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
        } catch {
            return NextResponse.json({ error: "올바른 JSON 객체가 아닙니다." }, { status: 400 });
        }

        saveStaticPageContent(page, locale, content);

        let result: { translated: TranslationLocale[]; failed: { locale: TranslationLocale; error: string }[] } = {
            translated: [],
            failed: [],
        };
        if (locale === "ko" && autoTranslate) {
            result = await translateAll(page, content);
        }

        return NextResponse.json({
            success: result.failed.length === 0,
            message: "Static page content saved",
            ...result,
            contents: getAllStaticPageContent(page),
        });
    } catch (error) {
        console.error("Error saving static page content:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save static page content" },
            { status: 500 }
        );
    }
}
