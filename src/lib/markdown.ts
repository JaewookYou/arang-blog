import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

/**
 * 마크다운을 HTML로 변환 (Velite와 동일한 파이프라인)
 * - remark-gfm: GitHub Flavored Markdown
 * - rehype-pretty-code: Syntax highlighting (tokyo-night 테마)
 * 
 * @param markdown 마크다운 문자열
 * @returns HTML 문자열
 */
export async function markdownToHtml(markdown: string): Promise<string> {
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
