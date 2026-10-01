import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import type { Root as MdastRoot, RootContent as MdastContent, Parent as MdastParent } from "mdast";
import type { Root as HastRoot, Element as HastElement, RootContent as HastContent } from "hast";
import { prettyCodeOptions } from "./markdown-options";
import { rehypeSafeHtml } from "./rehype-safe-html";

/**
 * 마크다운 → HTML 변환
 * velite의 s.markdown() 파이프라인과 동일하게 맞춘다.
 *   remark-parse → remark-gfm → HTML 주석 제거 → remark-rehype
 *   → meta 문자열 보존 → rehype-raw → 실행 요소 무력화 → rehype-slug → rehype-pretty-code → stringify
 * 원문과 번역본이 같은 HTML 구조(코드 하이라이팅, 헤딩 id)를 갖게 하기 위함이다.
 */

/** velite의 remarkRemoveComments와 동일: 주석이 포함된 html 노드를 제거 */
function remarkRemoveComments() {
    return (tree: MdastRoot) => {
        const walk = (node: MdastParent) => {
            node.children = node.children.filter(
                (child: MdastContent) => !(child.type === "html" && /<!--([\s\S]*?)-->/.test(child.value))
            ) as typeof node.children;
            for (const child of node.children) {
                if ("children" in child) walk(child as MdastParent);
            }
        };
        walk(tree);
    };
}

/** velite의 rehypeMetaString과 동일: rehype-raw를 거쳐도 코드 meta가 남도록 속성에 복사 */
function rehypeMetaString() {
    return (tree: HastRoot) => {
        const walk = (nodes: HastContent[]) => {
            for (const node of nodes) {
                if (node.type !== "element") continue;
                const el = node as HastElement & { data?: { meta?: string } };
                if (el.tagName === "code" && el.data?.meta) {
                    el.properties = el.properties || {};
                    el.properties.metastring = el.data.meta;
                }
                walk(el.children as HastContent[]);
            }
        };
        walk(tree.children as HastContent[]);
    };
}

export async function markdownToHtml(markdown: string): Promise<string> {
    if (!markdown || !markdown.trim()) return "";

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRemoveComments)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeMetaString)
        .use(rehypeRaw)
        .use(rehypeSafeHtml)
        .use(rehypeSlug)
        .use(rehypePrettyCode, { ...prettyCodeOptions })
        .use(rehypeStringify)
        .process(markdown);

    return String(result);
}
