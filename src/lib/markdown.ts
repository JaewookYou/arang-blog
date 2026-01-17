import { marked } from "marked";

/**
 * 마크다운을 HTML로 변환
 * @param markdown 마크다운 문자열
 * @returns HTML 문자열
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown) return "";

    // marked 설정
    marked.setOptions({
        gfm: true,        // GitHub Flavored Markdown
        breaks: true,     // 줄바꿈을 <br>로 변환
    });

    return marked.parse(markdown) as string;
}
