"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CodeBlockToolbar } from "@/components/code-block";
import type { Locale } from "@/lib/i18n";

interface ContentRendererProps {
    content: string;
    locale: Locale;
    className?: string;
}

function detectLanguage(pre: HTMLPreElement): string {
    const code = pre.querySelector("code");
    return (
        pre.getAttribute("data-language") ||
        code?.getAttribute("data-language") ||
        pre.className.match(/language-([\w+-]+)/)?.[1] ||
        code?.className.match(/language-([\w+-]+)/)?.[1] ||
        ""
    );
}

/**
 * ContentRenderer
 * 본문 HTML을 서버에서 그대로 렌더링한다. (검색엔진·JS 없는 환경에서도 내용이 보임)
 * 예전에는 브라우저에서 innerHTML로 넣어서 서버 HTML의 본문이 비어 있었다.
 * 마운트 후 각 <pre>에 복사/줄바꿈 버튼만 붙이고, 정리할 때 원래 구조로 되돌린다.
 */
export function ContentRenderer({ content, locale, className }: ContentRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const mounted: { root: Root; wrapper: HTMLElement; pre: HTMLPreElement }[] = [];

        container.querySelectorAll("pre").forEach((pre) => {
            if (pre.parentElement?.classList.contains("code-block")) return;

            const wrapper = document.createElement("div");
            wrapper.className = "code-block group relative";
            pre.parentNode?.insertBefore(wrapper, pre);
            const toolbar = document.createElement("div");
            wrapper.appendChild(toolbar);
            wrapper.appendChild(pre);

            const root = createRoot(toolbar);
            root.render(<CodeBlockToolbar pre={pre} language={detectLanguage(pre)} locale={locale} />);
            mounted.push({ root, wrapper, pre });
        });

        return () => {
            for (const { root, wrapper, pre } of mounted) {
                // React 렌더 중 동기 unmount 경고를 피하기 위해 다음 틱에 정리
                setTimeout(() => root.unmount(), 0);
                if (wrapper.isConnected) {
                    wrapper.parentNode?.insertBefore(pre, wrapper);
                    wrapper.remove();
                }
            }
        };
    }, [content, locale]);

    return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: content }} />;
}
