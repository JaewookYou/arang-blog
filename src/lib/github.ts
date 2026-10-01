import { Octokit } from "octokit";
import yaml from "js-yaml";

/**
 * Git-CMS: GitHub 저장소의 content/ 파일을 읽고 쓴다.
 * main 브랜치에 커밋하면 GitHub Actions가 서버에 배포한다.
 *
 * 예전 코드는 경로를 항상 `${slug}.mdx`로 가정해서
 * 실제로는 .md인 기존 글의 수정·삭제가 모두 실패했다.
 */

export const REPO_OWNER = process.env.GITHUB_REPO_OWNER || "JaewookYou";
export const REPO_NAME = process.env.GITHUB_REPO_NAME || "arang-blog";
export const BRANCH = process.env.GITHUB_BRANCH || "main";

export type ContentKind = "post" | "writeup";

export function normalizeKind(value: string | null | undefined): ContentKind {
    return value === "writeup" || value === "writeups" ? "writeup" : "post";
}

export function contentDir(kind: ContentKind): string {
    return kind === "writeup" ? "content/writeups" : "content/posts";
}

let octokit: Octokit | null = null;

export function isGitHubConfigured(): boolean {
    return Boolean(process.env.GITHUB_TOKEN);
}

export function getOctokit(): Octokit {
    if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN이 설정되지 않았습니다.");
    if (!octokit) octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    return octokit;
}

/** URL·파일명에 안전한 슬러그인지 (한글 허용, 경로 문자 금지) */
export function isValidSlug(slug: unknown): slug is string {
    return typeof slug === "string" && /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,150}$/u.test(slug);
}

/** content/(posts|writeups)/<slug>.(md|mdx) 형식인지 */
export function isContentPath(path: unknown, kind: ContentKind, slug: string): path is string {
    return path === `${contentDir(kind)}/${slug}.md` || path === `${contentDir(kind)}/${slug}.mdx`;
}

export interface ContentFile {
    path: string;
    sha: string;
    content: string;
}

function isNotFound(error: unknown): boolean {
    return (error as { status?: number })?.status === 404;
}

/** .md → .mdx 순서로 실제 파일을 찾는다 */
export async function findContentFile(kind: ContentKind, slug: string): Promise<ContentFile | null> {
    const client = getOctokit();
    for (const ext of [".md", ".mdx"]) {
        const path = `${contentDir(kind)}/${slug}${ext}`;
        try {
            const { data } = await client.rest.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path, ref: BRANCH });
            if (!Array.isArray(data) && data.type === "file" && "content" in data) {
                return { path: data.path, sha: data.sha, content: Buffer.from(data.content, "base64").toString("utf-8") };
            }
        } catch (error) {
            if (!isNotFound(error)) throw error;
        }
    }
    return null;
}

export interface ContentListItem {
    name: string;
    slug: string;
    path: string;
    sha: string;
}

export async function listContentFiles(kind: ContentKind): Promise<ContentListItem[]> {
    const client = getOctokit();
    const { data } = await client.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: contentDir(kind),
        ref: BRANCH,
    });
    if (!Array.isArray(data)) return [];
    return data
        .filter((f) => f.type === "file" && /\.(md|mdx)$/.test(f.name))
        .map((f) => ({ name: f.name, slug: f.name.replace(/\.(md|mdx)$/, ""), path: f.path, sha: f.sha }));
}

export async function putContentFile(
    path: string,
    content: string,
    message: string,
    sha?: string
): Promise<{ commitSha: string; fileSha: string }> {
    const client = getOctokit();
    const { data } = await client.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        message,
        content: Buffer.from(content, "utf-8").toString("base64"),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
    });
    return { commitSha: data.commit.sha || "", fileSha: data.content?.sha || "" };
}

export async function deleteContentFile(path: string, sha: string, message: string): Promise<void> {
    const client = getOctokit();
    await client.rest.repos.deleteFile({ owner: REPO_OWNER, repo: REPO_NAME, path, message, sha, branch: BRANCH });
}

// ============ 프론트매터 ============

export interface ParsedDocument {
    data: Record<string, unknown>;
    body: string;
}

/** "---\nYAML\n---\n본문" 형식 분리 */
export function parseFrontmatter(source: string): ParsedDocument {
    const normalized = source.replace(/\r\n/g, "\n");
    const match = normalized.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
    if (!match) return { data: {}, body: normalized };
    const loaded = yaml.load(match[1]);
    const data = loaded && typeof loaded === "object" && !Array.isArray(loaded) ? (loaded as Record<string, unknown>) : {};
    return { data, body: match[2] };
}

const WRITEUP_CATEGORIES = ["web", "pwn", "rev", "crypto", "forensics", "misc"];
const DIFFICULTIES = ["easy", "medium", "hard", "insane"];

/**
 * velite.config.ts 스키마와 같은 규칙으로 프론트매터를 검사한다.
 * 잘못된 프론트매터가 커밋되면 배포 빌드가 실패하므로 커밋 전에 막는다.
 */
export function validateFrontmatter(data: Record<string, unknown>, kind: ContentKind): string[] {
    const errors: string[] = [];
    const isDate = (v: unknown) => (v instanceof Date && !isNaN(v.getTime())) || (typeof v === "string" && !isNaN(Date.parse(v)));

    if (typeof data.title !== "string" || !data.title.trim()) errors.push("title이 필요합니다.");
    else if (data.title.length > 100) errors.push(`title은 100자 이하여야 합니다. (현재 ${data.title.length}자)`);

    if (data.description !== undefined && data.description !== null) {
        if (typeof data.description !== "string") errors.push("description은 문자열이어야 합니다.");
        else if (data.description.length > 300) errors.push(`description은 300자 이하여야 합니다. (현재 ${data.description.length}자)`);
    }
    if (!isDate(data.date)) errors.push("date가 올바른 날짜가 아닙니다. (예: 2026-01-18)");
    if (data.published !== undefined && typeof data.published !== "boolean") errors.push("published는 true/false여야 합니다.");
    if (data.scheduledAt !== undefined && data.scheduledAt !== null && !isDate(data.scheduledAt)) {
        errors.push("scheduledAt이 올바른 날짜가 아닙니다.");
    }
    if (data.tags !== undefined && !(Array.isArray(data.tags) && data.tags.every((t) => typeof t === "string"))) {
        errors.push("tags는 문자열 배열이어야 합니다.");
    }
    if (data.locale !== undefined && !["ko", "en", "ja", "zh"].includes(String(data.locale))) {
        errors.push("locale은 ko/en/ja/zh 중 하나여야 합니다.");
    }
    if (kind === "writeup") {
        if (data.category !== undefined && !WRITEUP_CATEGORIES.includes(String(data.category))) {
            errors.push(`category는 ${WRITEUP_CATEGORIES.join("/")} 중 하나여야 합니다.`);
        }
        if (data.difficulty !== undefined && !DIFFICULTIES.includes(String(data.difficulty))) {
            errors.push(`difficulty는 ${DIFFICULTIES.join("/")} 중 하나여야 합니다.`);
        }
        for (const field of ["points", "solves"]) {
            if (data[field] !== undefined && typeof data[field] !== "number") errors.push(`${field}는 숫자여야 합니다.`);
        }
    } else if (data.category !== undefined && typeof data.category !== "string") {
        errors.push("category는 문자열이어야 합니다.");
    }
    return errors;
}

/** 프론트매터 + 본문으로 파일 내용을 만든다 (YAML 이스케이프는 js-yaml이 처리) */
export function buildDocument(data: Record<string, unknown>, body: string): string {
    const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined && v !== null && v !== ""));
    const frontmatter = yaml.dump(clean, { lineWidth: -1, quotingType: '"', forceQuotes: false }).trimEnd();
    return `---\n${frontmatter}\n---\n\n${body.replace(/^\n+/, "")}`;
}
