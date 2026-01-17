import Database from "better-sqlite3";
import path from "path";

/**
 * SQLite Database Utility
 * 댓글 시스템을 위한 데이터베이스 연결 및 초기화
 */

// 데이터 디렉토리에 DB 파일 저장
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "blog.db");

// 싱글톤 패턴으로 DB 연결 관리
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (!db) {
        // data 디렉토리 생성
        const fs = require("fs");
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = new Database(DB_PATH);
        db.pragma("journal_mode = WAL");

        // 댓글 테이블 생성
        db.exec(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_slug TEXT NOT NULL,
                post_type TEXT NOT NULL DEFAULT 'post',
                author TEXT NOT NULL,
                content TEXT NOT NULL,
                parent_id INTEGER DEFAULT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                is_deleted INTEGER DEFAULT 0,
                FOREIGN KEY (parent_id) REFERENCES comments(id)
            );

            CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug, post_type);
            CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

            -- Honeypot 로그 테이블
            CREATE TABLE IF NOT EXISTS honeypot_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT NOT NULL,
                ip TEXT NOT NULL,
                user_agent TEXT,
                timestamp TEXT DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_honeypot_timestamp ON honeypot_logs(timestamp);
            CREATE INDEX IF NOT EXISTS idx_honeypot_ip ON honeypot_logs(ip);

            -- 번역 테이블
            CREATE TABLE IF NOT EXISTS translations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'post',
                locale TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_unique ON translations(slug, type, locale);
            CREATE INDEX IF NOT EXISTS idx_translations_slug ON translations(slug, type);
        `);
    }

    return db;
}

export interface Comment {
    id: number;
    post_slug: string;
    post_type: string;
    author: string;
    content: string;
    parent_id: number | null;
    created_at: string;
    updated_at: string;
    is_deleted: number;
    replies?: Comment[];
}

// 댓글 조회 (트리 구조로 변환)
export function getComments(postSlug: string, postType: string = "post"): Comment[] {
    const db = getDatabase();
    const comments = db
        .prepare(`
            SELECT * FROM comments 
            WHERE post_slug = ? AND post_type = ? AND is_deleted = 0
            ORDER BY created_at ASC
        `)
        .all(postSlug, postType) as Comment[];

    // 트리 구조로 변환
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
    });

    comments.forEach((comment) => {
        if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id);
            if (parent) {
                parent.replies!.push(comment);
            }
        } else {
            rootComments.push(comment);
        }
    });

    return rootComments;
}

// 댓글 추가
export function addComment(
    postSlug: string,
    postType: string,
    author: string,
    content: string,
    parentId?: number
): Comment {
    const db = getDatabase();

    // XSS 방지를 위한 기본 sanitization
    const sanitizedAuthor = author.slice(0, 50).trim();
    const sanitizedContent = content.slice(0, 2000).trim();

    const stmt = db.prepare(`
        INSERT INTO comments (post_slug, post_type, author, content, parent_id)
        VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(postSlug, postType, sanitizedAuthor, sanitizedContent, parentId || null);

    return db
        .prepare("SELECT * FROM comments WHERE id = ?")
        .get(result.lastInsertRowid) as Comment;
}

// 댓글 삭제 (soft delete)
export function deleteComment(commentId: number): boolean {
    const db = getDatabase();
    const result = db
        .prepare("UPDATE comments SET is_deleted = 1, content = '[삭제된 댓글입니다]', updated_at = datetime('now') WHERE id = ?")
        .run(commentId);

    return result.changes > 0;
}

// 댓글 수 조회
export function getCommentCount(postSlug: string, postType: string = "post"): number {
    const db = getDatabase();
    const result = db
        .prepare("SELECT COUNT(*) as count FROM comments WHERE post_slug = ? AND post_type = ? AND is_deleted = 0")
        .get(postSlug, postType) as { count: number };

    return result.count;
}

// ============================================
// Honeypot 관련 함수
// ============================================

export interface HoneypotLog {
    id: number;
    path: string;
    ip: string;
    user_agent: string | null;
    timestamp: string;
}

// Honeypot 로그 추가
export function addHoneypotLog(path: string, ip: string, userAgent: string): void {
    const db = getDatabase();
    db.prepare(`
        INSERT INTO honeypot_logs (path, ip, user_agent)
        VALUES (?, ?, ?)
    `).run(path, ip, userAgent);
}

// Honeypot 로그 조회 (최근 N개)
export function getHoneypotLogs(limit: number = 100): HoneypotLog[] {
    const db = getDatabase();
    return db
        .prepare("SELECT * FROM honeypot_logs ORDER BY timestamp DESC LIMIT ?")
        .all(limit) as HoneypotLog[];
}

// IP별 Honeypot 접근 횟수
export function getHoneypotStatsByIp(): { ip: string; count: number }[] {
    const db = getDatabase();
    return db
        .prepare(`
            SELECT ip, COUNT(*) as count 
            FROM honeypot_logs 
            GROUP BY ip 
            ORDER BY count DESC 
            LIMIT 50
        `)
        .all() as { ip: string; count: number }[];
}

// 경로별 Honeypot 접근 횟수
export function getHoneypotStatsByPath(): { path: string; count: number }[] {
    const db = getDatabase();
    return db
        .prepare(`
            SELECT path, COUNT(*) as count 
            FROM honeypot_logs 
            GROUP BY path 
            ORDER BY count DESC 
            LIMIT 20
        `)
        .all() as { path: string; count: number }[];
}

// 전체 Honeypot 로그 수
export function getHoneypotLogCount(): number {
    const db = getDatabase();
    const result = db
        .prepare("SELECT COUNT(*) as count FROM honeypot_logs")
        .get() as { count: number };
    return result.count;
}

// 전체 댓글 수 (모든 포스트)
export function getTotalCommentCount(): number {
    const db = getDatabase();
    const result = db
        .prepare("SELECT COUNT(*) as count FROM comments WHERE is_deleted = 0")
        .get() as { count: number };
    return result.count;
}

// ============================================
// Translation 관련 함수
// ============================================

export interface Translation {
    id: number;
    slug: string;
    type: string;
    locale: string;
    title: string;
    description: string | null;
    content: string;
    created_at: string;
    updated_at: string;
}

export type Locale = "ko" | "en" | "ja" | "zh";

// 번역 조회
export function getTranslation(slug: string, type: string, locale: string): Translation | null {
    const db = getDatabase();
    return db
        .prepare("SELECT * FROM translations WHERE slug = ? AND type = ? AND locale = ?")
        .get(slug, type, locale) as Translation | null;
}

// 특정 글의 모든 번역 조회
export function getAllTranslations(slug: string, type: string): Translation[] {
    const db = getDatabase();
    return db
        .prepare("SELECT * FROM translations WHERE slug = ? AND type = ?")
        .all(slug, type) as Translation[];
}

// 번역 추가/업데이트 (upsert)
export function upsertTranslation(
    slug: string,
    type: string,
    locale: string,
    title: string,
    description: string | null,
    content: string
): Translation {
    const db = getDatabase();

    // UPSERT (INSERT OR REPLACE)
    db.prepare(`
        INSERT INTO translations (slug, type, locale, title, description, content)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug, type, locale) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            content = excluded.content,
            updated_at = datetime('now')
    `).run(slug, type, locale, title, description, content);

    return getTranslation(slug, type, locale)!;
}

// 번역 삭제
export function deleteTranslation(slug: string, type: string, locale?: string): number {
    const db = getDatabase();

    if (locale) {
        // 특정 언어만 삭제
        const result = db
            .prepare("DELETE FROM translations WHERE slug = ? AND type = ? AND locale = ?")
            .run(slug, type, locale);
        return result.changes;
    } else {
        // 모든 언어 삭제
        const result = db
            .prepare("DELETE FROM translations WHERE slug = ? AND type = ?")
            .run(slug, type);
        return result.changes;
    }
}

// 사용 가능한 언어 목록 조회
export function getAvailableLocales(slug: string, type: string): string[] {
    const db = getDatabase();
    const results = db
        .prepare("SELECT DISTINCT locale FROM translations WHERE slug = ? AND type = ?")
        .all(slug, type) as { locale: string }[];
    return results.map(r => r.locale);
}
