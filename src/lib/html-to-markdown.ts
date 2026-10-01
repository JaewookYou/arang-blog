import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import type { Root, Element, ElementContent, RootContent } from "hast";

/**
 * HTML → 마크다운 변환
 * 예전 번역은 렌더링된 HTML만 DB에 저장되어 있어서 관리자 화면에서 편집할 수 없었다.
 * rehype-pretty-code가 만든 코드 블록(<figure><pre><code><span data-line>…)을
 * 일반 코드 블록으로 되돌린 뒤 마크다운으로 변환한다.
 */

function textContent(node: ElementContent | RootContent): string {
    if (node.type === "text") return node.value;
    if (node.type === "element") return node.children.map(textContent).join("");
    return "";
}

function rehypeUnwrapPrettyCode() {
    return (tree: Root) => {
        const transform = (children: (RootContent | ElementContent)[]): (RootContent | ElementContent)[] => {
            const out: (RootContent | ElementContent)[] = [];
            for (const node of children) {
                if (node.type !== "element") {
                    out.push(node);
                    continue;
                }
                const el = node as Element;

                // <figure data-rehype-pretty-code-figure> → 내부 요소만 남김 (코드 제목 figcaption은 버림)
                if (el.tagName === "figure" && el.properties?.dataRehypePrettyCodeFigure !== undefined) {
                    const inner = el.children.filter(
                        (c) => !(c.type === "element" && c.tagName === "figcaption")
                    );
                    out.push(...transform(inner));
                    continue;
                }

                if (el.tagName === "pre") {
                    const code = el.children.find(
                        (c): c is Element => c.type === "element" && c.tagName === "code"
                    );
                    const language = String(
                        code?.properties?.dataLanguage ?? el.properties?.dataLanguage ?? ""
                    );
                    const text = textContent(code ?? el).replace(/\n$/, "");
                    const codeEl: Element = {
                        type: "element",
                        tagName: "code",
                        properties:
                            language && language !== "plaintext" ? { className: [`language-${language}`] } : {},
                        children: [{ type: "text", value: text }],
                    };
                    out.push({ type: "element", tagName: "pre", properties: {}, children: [codeEl] });
                    continue;
                }

                // 인라인 코드 하이라이팅(<code data-language><span data-line>) → 일반 인라인 코드
                if (el.tagName === "code" && el.properties?.dataLanguage !== undefined) {
                    out.push({
                        type: "element",
                        tagName: "code",
                        properties: {},
                        children: [{ type: "text", value: textContent(el) }],
                    });
                    continue;
                }

                el.children = transform(el.children) as ElementContent[];
                out.push(el);
            }
            return out;
        };
        tree.children = transform(tree.children) as RootContent[];
    };
}

export async function htmlToMarkdown(html: string): Promise<string> {
    if (!html || !html.trim()) return "";

    const file = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeUnwrapPrettyCode)
        .use(rehypeRemark)
        .use(remarkGfm)
        .use(remarkStringify, {
            bullet: "-",
            fence: "`",
            fences: true,
            rule: "-",
            emphasis: "*",
            strong: "*",
            listItemIndent: "one",
        })
        .process(html);

    return String(file).trim() + "\n";
}

/** 문자열이 렌더링된 HTML인지(마크다운이 아닌지) 대략 판별 */
export function looksLikeHtml(content: string): boolean {
    const trimmed = content.trim();
    if (!trimmed.startsWith("<")) return false;
    return /<(p|h[1-6]|ul|ol|pre|figure|div|table|blockquote)[\s>]/i.test(trimmed);
}
