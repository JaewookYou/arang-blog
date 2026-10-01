import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import type { Root, ElementContent, RootContent } from "hast";
import { rehypeSafeHtml } from "./rehype-safe-html";

/**
 * 정적 페이지(Home/About) 문구용 인라인 마크다운
 * - **굵게**, *기울임*, `코드`, [링크](https://...), ~~취소선~~ 지원
 * - 예전처럼 HTML(<strong> 등)을 써도 그대로 렌더링된다
 * - "CVSS 9.4"처럼 쓰면 점수에 맞는 색이 자동으로 붙는다
 * 서버(페이지 렌더링)와 브라우저(관리자 미리보기)에서 같은 결과를 내도록 동기 처리만 쓴다.
 */

/** 기존 About 데이터의 색 규칙: 8.0 이상 빨강, 7.0 이상 주황, 4.0 이상 노랑, 그 외 초록 */
export function cvssColor(score: number): string {
    if (score >= 8) return "text-red-500";
    if (score >= 7) return "text-orange-500";
    if (score >= 4) return "text-yellow-500";
    return "text-green-500";
}

const CVSS_PATTERN = /\bCVSS\s+(\d{1,2}(?:\.\d)?)\b/g;
const EXPLICIT_COLOR = /<span[^>]*\btext-(?:red|orange|yellow|green)-500\b/i;

/** 인라인 코드 밖의 "CVSS 9.4"에 색상 span을 붙인다 (이미 색을 지정한 항목은 그대로 둔다) */
function colorizeCvss(text: string): string {
    if (EXPLICIT_COLOR.test(text) || !/CVSS/.test(text)) return text;
    return text
        .split(/(`[^`]*`)/)
        .map((part, i) =>
            i % 2 === 1
                ? part
                : part.replace(CVSS_PATTERN, (match, score: string) => `<span class="${cvssColor(parseFloat(score))}">${match}</span>`)
        )
        .join("");
}

/** 줄 맨 앞의 목록/제목/인용 기호가 블록으로 해석되지 않게 이스케이프 */
function keepInline(line: string): string {
    return line
        .replace(/^(\s*)(\d+)([.)])(\s)/, "$1$2\\$3$4")
        .replace(/^(\s*)([-+*])(\s)/, "$1\\$2$3")
        .replace(/^(\s*)(#{1,6})(\s)/, "$1\\$2$3")
        .replace(/^(\s*)>/, "$1\\>");
}

/** 외부 링크는 새 탭으로 */
function rehypeExternalLinks() {
    return (tree: Root) => {
        const walk = (nodes: (RootContent | ElementContent)[]) => {
            for (const node of nodes) {
                if (node.type !== "element") continue;
                if (node.tagName === "a" && /^https?:\/\//.test(String(node.properties?.href ?? ""))) {
                    node.properties = { ...node.properties, target: "_blank", rel: ["noopener", "noreferrer"] };
                }
                walk(node.children);
            }
        };
        walk(tree.children);
    };
}

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSafeHtml)
    .use(rehypeExternalLinks)
    .use(rehypeStringify);

const cache = new Map<string, string>();

export function renderInlineMarkdown(text: string | null | undefined): string {
    if (!text) return "";
    const cached = cache.get(text);
    if (cached !== undefined) return cached;

    const markdown = text
        .split(/\r?\n/)
        .map((line) => keepInline(colorizeCvss(line)))
        .join("  \n"); // 줄바꿈은 같은 문단 안의 줄바꿈으로
    let html = String(processor.processSync(markdown)).trim();
    const single = html.match(/^<p>([\s\S]*)<\/p>$/);
    if (single && !single[1].includes("<p>")) html = single[1];

    if (cache.size > 500) cache.clear();
    cache.set(text, html);
    return html;
}

/**
 * 예전 HTML 값을 편집하기 쉬운 마크다운으로 바꾼다 (관리자 편집기에서 불러올 때 사용)
 * 표현할 수 없는 HTML은 그대로 남긴다.
 */
export function htmlToInlineMarkdown(value: string): string {
    return value
        .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
        .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*")
        .replace(/<code>([^<`]*)<\/code>/gi, "`$1`")
        .replace(/<a\s+[^>]*?href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, "[$3]($2)")
        .replace(
            /<span\s+class=(["'])(text-(?:red|orange|yellow|green)-500)\1\s*>\s*(CVSS\s+(\d{1,2}(?:\.\d)?))\s*<\/span>/gi,
            (match, _q: string, cls: string, label: string, score: string) => (cvssColor(parseFloat(score)) === cls ? label : match)
        )
        .replace(/<br\s*\/?>/gi, "\n");
}

/** 마크다운/HTML 기호를 걷어낸 순수 텍스트 (번역 검증 등에 사용) */
export function markdownMarkers(value: string): string {
    const markers = value.match(/\*\*|~~|`|\]\(/g) || [];
    return markers.join(" ");
}
