/**
 * Markdown 렌더링 공용 옵션
 * velite.config.ts(원문)와 src/lib/markdown.ts(번역본)가 같은 값을 쓰도록 한 곳에 둔다.
 * velite 설정에서도 import하므로 경로 별칭(@/)을 쓰지 않는다.
 */
export const prettyCodeOptions = {
    theme: "tokyo-night",
    keepBackground: true,
    defaultLang: "plaintext",
} as const;
