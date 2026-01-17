#!/usr/bin/env node
/**
 * 블로그 글 다국어 번역 스크립트
 * 모든 posts와 writeups를 en, ja, zh로 번역하여 DB에 저장
 */

import { GoogleGenAI } from "@google/genai";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드 (.env.local 직접 파싱)
function loadEnv() {
    const envPath = path.join(__dirname, "../.env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, "");
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DB_PATH = path.join(__dirname, "../data/blog.db");

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    process.exit(1);
}

// DB 연결
const db = new Database(DB_PATH);

// 번역 upsert 함수
function upsertTranslation(slug, type, locale, title, description, content) {
    const stmt = db.prepare(`
        INSERT INTO translations (slug, type, locale, title, description, content, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(slug, type, locale) 
        DO UPDATE SET title = excluded.title, description = excluded.description, 
                      content = excluded.content, updated_at = datetime('now')
    `);
    stmt.run(slug, type, locale, title, description, content);
}

// 글 목록
const POSTS = [
    { slug: "selenium-v4-error-fix", title: "Selenium v4.10+ TypeError 에러 + webdriver-manager 에러 해결", description: "Selenium 최신 버전에서 발생하는 TypeError와 webdriver-manager LATEST_RELEASE not found 에러 해결 방법" },
    { slug: "fiddler-https-certificate-error", title: "Fiddler HTTPS 인증서 오류 해결", description: "Fiddler에서 HTTPS 트래픽 캡처 시 발생하는 인증서 오류 해결 방법" },
    { slug: "jsp-commons-fileupload-waf-bypass", title: "JSP commons-fileupload WAF Bypass", description: "CCE2019 ENKI 문제를 통해 알아보는 JSP commons-fileupload WAF 필터링 우회 기법" },
    { slug: "csp-bypass-techniques", title: "CSP Bypass 기법", description: "Content Security Policy를 우회하는 다양한 기법 정리" },
    { slug: "ecmascript-xss-bypass", title: "최신 ECMAScript 기능을 활용한 XSS Filtering Bypass", description: "ECMAScript의 새로운 기능들을 활용한 XSS 필터링 우회 기법 및 원리 해설" },
    { slug: "xss-bypass-waf-filtering", title: "XSS Bypass WAF & Filtering 기법", description: "모의해킹 및 버그바운티 시 XSS 취약점 분석에서 얻은 WAF 우회 및 필터링 우회 기법" },
    { slug: "sql-injection-bypass-tips", title: "SQL Injection 우회기법 정리", description: "웹해킹 워게임을 풀면서 배운 SQL Injection 우회기법 모음" },
];

const WRITEUPS = [
    { slug: "wacon-2022-kuncelan", title: "2022 WACon CTF - kuncelan Writeup", description: "WACon 2022 kuncelan(blackbox) 웹 문제 풀이 - LFI, SSRF, Gopher를 이용한 SQL Injection" },
    { slug: "codegate-2022-web-blockchain", title: "Codegate 2022 Web/Blockchain Writeup", description: "Codegate 2022 예선 Web 전체 문제 및 Blockchain(NFT) 문제 풀이" },
    { slug: "fiesta-2021-chatservice", title: "금융보안원 FIESTA 2021 - 출제자 Writeup", description: "FSI cha tin gse rvi ce! 웹해킹 문제 출제자 풀이 - SSRF로 MySQL 임의 쿼리 실행" },
    { slug: "whitehat-2021-web", title: "2021 화이트햇콘테스트 웹 분야 Writeup", description: "2021 화이트햇콘테스트 예선 웹 문제 풀이 - Imageflare, mudbox, mini-realworld" },
    { slug: "cyberwarfare-2020-vaccine-paper", title: "2020 사이버작전 경연대회 - Vaccine Paper Writeup", description: "CSP를 이용한 XS-Leak 공격으로 관리자 키 탈취" },
    { slug: "cyberwarfare-2020-intranet", title: "2020 사이버작전 경연대회 - Intranet Writeup", description: "Nginx route 설정 오류와 NoSQL Injection, Race Condition을 이용한 권한 상승" },
    { slug: "tsg-ctf-2020-slick-logger", title: "2020 TSG CTF - Slick Logger Writeup", description: "Time-based Blind Regex Injection으로 플래그 탈취" },
    { slug: "defenit-ctf-2020-osint", title: "Defenit CTF 2020 OSINT 출제자 Writeup", description: "암호화폐와 악성코드 C2 서버를 주제로 한 OSINT 문제 출제자 풀이" },
    { slug: "hacklu-2019-rpdg", title: "2019 hack.lu CTF - RPDG Writeup", description: "SQL Injection과 빈도수 분석을 통한 admin password 유추" },
    { slug: "asis-ctf-2018-neighbour", title: "ASIS CTF 2018 - Neighbour Writeup", description: "효율적인 수학 계산으로 x^y 형태의 숫자 중 n에 가장 가까운 값 찾기" },
];

const LOCALES = ["en", "ja", "zh"];
const LANG_NAMES = { en: "English", ja: "Japanese", zh: "Simplified Chinese" };

async function translateContent(ai, title, description, content, targetLocale) {
    const targetLang = LANG_NAMES[targetLocale];

    const prompt = `You are a professional translator. Translate the following Korean blog post content to ${targetLang}.

IMPORTANT RULES:
1. Keep all Markdown syntax intact (headings, code blocks, links, images, etc.)
2. Keep all code snippets unchanged
3. Translate naturally, not literally
4. Preserve the technical accuracy
5. Do NOT add any explanations, just output the translation

---
TITLE: ${title}

DESCRIPTION: ${description || ""}

CONTENT:
${content}
---

Output format (JSON only, no markdown code blocks):
{"title": "translated title", "description": "translated description", "content": "translated content (Markdown)"}`;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
    });

    const responseText = response.text || "";

    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                title: parsed.title || title,
                description: parsed.description || description || "",
                content: parsed.content || content,
            };
        }
    } catch (e) {
        console.log(`    ⚠️ JSON parse failed`);
    }

    return {
        title: title,
        description: description || "",
        content: responseText,
    };
}

async function translatePost(ai, post, type) {
    const mdPath = path.join(__dirname, `../content/${type}s/${post.slug}.md`);

    if (!fs.existsSync(mdPath)) {
        console.log(`  ⚠️ File not found: ${mdPath}`);
        return;
    }

    const content = fs.readFileSync(mdPath, "utf-8");
    const bodyMatch = content.match(/---[\s\S]*?---\n([\s\S]*)/);
    const body = bodyMatch ? bodyMatch[1] : content;

    for (const locale of LOCALES) {
        console.log(`    → ${locale.toUpperCase()}...`);

        try {
            const translated = await translateContent(ai, post.title, post.description, body, locale);
            upsertTranslation(post.slug, type, locale, translated.title, translated.description, translated.content);
            console.log(`    ✓ ${locale.toUpperCase()} saved`);
        } catch (error) {
            console.error(`    ✗ ${locale.toUpperCase()} failed: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

async function main() {
    console.log("🌐 Blog Translation Script");
    console.log("==========================\n");

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    console.log("📝 Translating Posts...\n");
    for (const post of POSTS) {
        console.log(`[POST] ${post.slug}`);
        await translatePost(ai, post, "post");
        console.log();
    }

    console.log("🚩 Translating Writeups...\n");
    for (const writeup of WRITEUPS) {
        console.log(`[WRITEUP] ${writeup.slug}`);
        await translatePost(ai, writeup, "writeup");
        console.log();
    }

    console.log("==========================");
    console.log("✅ Translation complete!");
    console.log(`   Total: ${(POSTS.length + WRITEUPS.length) * LOCALES.length} translations`);

    db.close();
}

main().catch(console.error);
