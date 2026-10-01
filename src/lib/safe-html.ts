import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { rehypeSafeHtml } from "./rehype-safe-html";

/**
 * DB에 저장된 번역 HTML을 화면에 내보내기 전에 실행 요소를 무력화한다.
 * (예전 파이프라인으로 저장된 번역에는 원문의 <script> 예시가 살아 있다)
 * 같은 HTML은 다시 처리하지 않도록 결과를 캐시한다.
 */

const processor = unified().use(rehypeParse, { fragment: true }).use(rehypeSafeHtml).use(rehypeStringify);
const cache = new Map<string, string>();
const MAX_CACHE = 300;

const RISKY = /<(script|noscript|style|template|object|embed|base|meta|link|frame|applet)[\s>/]|\son[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html/i;

export function sanitizeStoredHtml(html: string, cacheKey?: string): string {
    // 대부분의 번역은 위험 요소가 없으므로 빠르게 그대로 반환
    if (!RISKY.test(html)) return html;

    const key = cacheKey ? `${cacheKey}:${html.length}` : undefined;
    if (key && cache.has(key)) return cache.get(key)!;

    const result = String(processor.processSync(html));
    if (key) {
        if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
        cache.set(key, result);
    }
    return result;
}
