import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent } from "mdast";

/**
 * 번역 전에 코드 블록과 이미지를 플레이스홀더로 바꾸고, 번역 후 되돌린다.
 *
 * 예전 구현의 문제:
 *  - 정규식이 링크([text](url))까지 이미지로 취급해 링크 텍스트가 번역되지 않았다.
 *  - 들여쓴 코드 펜스나 언어명에 특수문자가 있는 펜스를 놓쳤다.
 *  - String.replace에 코드 문자열을 그대로 넘겨 `$&`, `$'` 같은 패턴이 깨졌다.
 * 여기서는 마크다운 AST의 위치 정보로 정확한 구간을 잘라낸다.
 */

export interface ProtectedMarkdown {
    text: string;
    codeBlocks: string[];
    inlineCodes: string[];
    images: string[];
}

/** 플레이스홀더 패턴 — 번역 모델이 그대로 옮겨야 하는 토큰 */
export const PLACEHOLDER_PATTERN = /\[\[(CODE_BLOCK|INLINE_CODE|IMAGE)_(\d+)\]\]/g;
export const PLACEHOLDER_TEST = /\[\[(?:CODE_BLOCK|INLINE_CODE|IMAGE)_\d+\]\]/;

const HANGUL = /[\uAC00-\uD7A3\u3131-\u318E]/;

const parser = unified().use(remarkParse).use(remarkGfm);

export function parseMarkdown(markdown: string): Root {
    return parser.parse(markdown) as Root;
}

interface Range {
    start: number;
    end: number;
    kind: "code" | "inline" | "image" | "comment";
}

function collectRanges(tree: Root, options: ProtectOptions): Range[] {
    const ranges: Range[] = [];
    const visit = (node: Root | RootContent) => {
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;
        if (node.type === "code" && start !== undefined && end !== undefined) {
            ranges.push({ start, end, kind: "code" });
            return;
        }
        if (node.type === "image" && start !== undefined && end !== undefined) {
            ranges.push({ start, end, kind: "image" });
            return;
        }
        // 한글이 없는 인라인 코드(명령어, 페이로드 등)는 그대로 보존한다.
        // 번역 중 백틱이 빠지면 `<script>` 같은 예시가 실제 HTML로 렌더링될 수 있기 때문.
        // 한글이 들어간 인라인 코드는 강조용 문장인 경우가 많아 번역하도록 둔다.
        if (options.inlineCode && node.type === "inlineCode" && start !== undefined && end !== undefined && !HANGUL.test(node.value)) {
            ranges.push({ start, end, kind: "inline" });
            return;
        }
        // velite가 렌더링 시 제거하는 HTML 주석(<!--more--> 등)은 번역에서도 뺀다
        if (node.type === "html" && /<!--([\s\S]*?)-->/.test(node.value) && start !== undefined && end !== undefined) {
            ranges.push({ start, end, kind: "comment" });
            return;
        }
        if ("children" in node) {
            for (const child of node.children as RootContent[]) visit(child);
        }
    };
    visit(tree);
    return ranges.sort((a, b) => a.start - b.start);
}

export const codePlaceholder = (i: number) => `[[CODE_BLOCK_${i}]]`;
export const inlineCodePlaceholder = (i: number) => `[[INLINE_CODE_${i}]]`;
export const imagePlaceholder = (i: number) => `[[IMAGE_${i}]]`;

export interface ProtectOptions {
    /** 한글이 없는 인라인 코드도 보호할지 (기본 true) */
    inlineCode?: boolean;
}

export function protectMarkdown(markdown: string, options: ProtectOptions = {}): ProtectedMarkdown {
    const source = markdown.replace(/\r\n/g, "\n");
    const ranges = collectRanges(parseMarkdown(source), { inlineCode: options.inlineCode ?? true });

    const codeBlocks: string[] = [];
    const inlineCodes: string[] = [];
    const images: string[] = [];
    let text = "";
    let cursor = 0;

    for (const range of ranges) {
        if (range.start < cursor) continue; // 중첩 구간 방어
        text += source.slice(cursor, range.start);
        const original = source.slice(range.start, range.end);
        if (range.kind === "code") {
            text += codePlaceholder(codeBlocks.length);
            codeBlocks.push(original);
        } else if (range.kind === "inline") {
            text += inlineCodePlaceholder(inlineCodes.length);
            inlineCodes.push(original);
        } else if (range.kind === "image") {
            text += imagePlaceholder(images.length);
            images.push(original);
        }
        cursor = range.end;
    }
    text += source.slice(cursor);

    return { text, codeBlocks, inlineCodes, images };
}

/** 모델이 마크다운 이스케이프를 붙인 플레이스홀더(\[\[CODE\_BLOCK\_0\]\])를 정규화 */
export function normalizePlaceholders(text: string): string {
    return text.replace(
        /\\?\[\\?\[\s*(CODE\\?_BLOCK|INLINE\\?_CODE|IMAGE)\\?_(\d+)\s*\\?\]\\?\]/g,
        (_m, kind: string, n: string) => `[[${kind.replace(/\\/g, "")}_${n}]]`
    );
}

export function listPlaceholders(text: string): string[] {
    return text.match(new RegExp(PLACEHOLDER_PATTERN.source, "g")) || [];
}

export function restoreMarkdown(
    text: string,
    protectedMd: Pick<ProtectedMarkdown, "codeBlocks" | "inlineCodes" | "images">
): string {
    // 함수형 치환으로 `$` 패턴 해석을 막는다
    return text.replace(new RegExp(PLACEHOLDER_PATTERN.source, "g"), (match, kind: string, n: string) => {
        const index = Number(n);
        const list = kind === "CODE_BLOCK" ? protectedMd.codeBlocks : kind === "INLINE_CODE" ? protectedMd.inlineCodes : protectedMd.images;
        return list[index] ?? match;
    });
}
