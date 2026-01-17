"use client";

import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { CodeBlock } from "@/components/code-block";

interface ContentRendererProps {
    content: string;
    className?: string;
}

/**
 * ContentRenderer
 * HTML 콘텐츠를 렌더링하면서 pre 태그를 CodeBlock 컴포넌트로 대체
 * dangerouslySetInnerHTML 대신 사용하여 코드블럭 기능(복사, 줄바꿈 토글) 제공
 */
export function ContentRenderer({ content, className }: ContentRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rootsRef = useRef<Map<HTMLElement, ReturnType<typeof createRoot>>>(new Map());

    useEffect(() => {
        if (!containerRef.current) return;

        // HTML 콘텐츠 설정
        containerRef.current.innerHTML = content;

        // pre 태그 찾아서 CodeBlock으로 대체
        const preElements = containerRef.current.querySelectorAll("pre");

        preElements.forEach((pre) => {
            // 이미 처리된 pre는 스킵
            if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

            // wrapper div 생성
            const wrapper = document.createElement("div");
            wrapper.className = "code-block-wrapper";
            pre.parentNode?.insertBefore(wrapper, pre);

            // pre 속성에서 언어 추출 (다양한 위치에서 시도)
            let language = pre.getAttribute("data-language") || "";

            // code 태그에서 시도
            if (!language) {
                const code = pre.querySelector("code");
                language = code?.getAttribute("data-language") || "";
            }

            // pre 클래스에서 시도 (language-*)
            if (!language) {
                const match = pre.className.match(/language-(\w+)/);
                language = match ? match[1] : "";
            }

            // code 클래스에서 시도
            if (!language) {
                const code = pre.querySelector("code");
                const match = code?.className.match(/language-(\w+)/);
                language = match ? match[1] : "";
            }

            // parent figure에서 data-language 시도 (rehype-pretty-code 구조)
            if (!language) {
                const figure = pre.closest("figure");
                language = figure?.getAttribute("data-language") || "";
            }

            // figcaption에서 텍스트 추출 (일부 테마에서 사용)
            if (!language) {
                const figure = pre.closest("figure");
                const caption = figure?.querySelector("figcaption");
                language = caption?.getAttribute("data-language") || caption?.textContent?.trim() || "";
            }

            const codeContent = pre.innerHTML;

            // React root 생성 및 CodeBlock 렌더링
            const root = createRoot(wrapper);
            rootsRef.current.set(wrapper, root);

            root.render(
                <CodeBlock data-language={language}>
                    <code dangerouslySetInnerHTML={{ __html: codeContent }} />
                </CodeBlock>
            );

            // 원본 pre 제거
            pre.remove();
        });

        // Cleanup
        return () => {
            rootsRef.current.forEach((root) => {
                root.unmount();
            });
            rootsRef.current.clear();
        };
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={className}
        />
    );
}
