#!/usr/bin/env node
/**
 * 번역 DB 마이그레이션 스크립트
 * 기존 마크다운을 HTML로 변환해서 DB에 다시 저장
 * Velite와 동일한 rehype-pretty-code 파이프라인 사용
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "../data/blog.db");
const db = new Database(DB_PATH);

/**
 * 마크다운을 HTML로 변환 (Velite와 동일한 파이프라인)
 */
async function markdownToHtml(markdown) {
    if (!markdown) return "";

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypePrettyCode, {
            theme: "tokyo-night",
            keepBackground: true,
            defaultLang: "plaintext",
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(result);
}

async function migrateTranslations() {
    console.log("🔄 번역 DB 마이그레이션 시작...\n");

    // 모든 번역 조회
    const translations = db.prepare(`
        SELECT id, slug, type, locale, title, description, content
        FROM translations
    `).all();

    console.log(`📊 총 ${translations.length}개 번역 발견\n`);

    // 업데이트 구문
    const updateStmt = db.prepare(`
        UPDATE translations 
        SET content = ?, updated_at = datetime('now')
        WHERE id = ?
    `);

    let successCount = 0;
    let errorCount = 0;

    for (const t of translations) {
        process.stdout.write(`[${t.id}] ${t.slug} (${t.locale})... `);

        try {
            // 이미 HTML인지 확인 (간단한 체크)
            if (t.content.startsWith("<") || t.content.includes("<pre") || t.content.includes("<code")) {
                console.log("⏭️ 이미 HTML");
                continue;
            }

            const html = await markdownToHtml(t.content);
            updateStmt.run(html, t.id);
            console.log("✅ 변환 완료");
            successCount++;
        } catch (error) {
            console.log(`❌ 오류: ${error.message}`);
            errorCount++;
        }
    }

    console.log("\n=========================================");
    console.log(`✅ 성공: ${successCount}`);
    console.log(`❌ 실패: ${errorCount}`);
    console.log(`⏭️ 스킵: ${translations.length - successCount - errorCount}`);
    console.log("=========================================\n");

    db.close();
}

migrateTranslations().catch(console.error);
