import { renderInlineMarkdown } from "@/lib/inline-markdown";

type Tag = "span" | "li" | "p" | "div" | "h1" | "h2" | "h3";

/** 정적 페이지 문구 렌더링 (인라인 마크다운 + 기존 HTML 호환) */
export function InlineMarkdown({ text, as = "span", className }: { text: string; as?: Tag; className?: string }) {
    const Component = as;
    return <Component className={className} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(text) }} />;
}
