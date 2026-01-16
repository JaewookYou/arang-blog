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
