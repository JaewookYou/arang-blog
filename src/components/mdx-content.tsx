"use client";

import * as runtime from "react/jsx-runtime";
import { CodeBlock } from "@/components/code-block";

/**
 * MDX Content Renderer
 * Velite에서 생성된 MDX 코드를 React 컴포넌트로 변환
 * 
 * 사용법:
 * import { posts } from "@/.velite";
 * <MDXContent code={post.body} />
 */

// 글로벌 공유 컴포넌트
const sharedComponents = {
    // pre 태그를 CodeBlock 컴포넌트로 오버라이드 (wrap 토글 기능)
    pre: CodeBlock,
};

/**
 * Velite MDX 코드를 React 컴포넌트 함수로 파싱
 * @param code - Velite에서 컴파일된 MDX 코드 문자열
 */
const useMDXComponent = (code: string) => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
};

interface MDXContentProps {
    code: string;
    components?: Record<string, React.ComponentType>;
}

/**
 * MDX 콘텐츠 렌더링 컴포넌트
 * @param code - Velite에서 컴파일된 MDX 코드
 * @param components - 커스텀 컴포넌트 오버라이드
 */
export function MDXContent({ code, components }: MDXContentProps) {
    const Component = useMDXComponent(code);
    return <Component components={{ ...sharedComponents, ...components }} />;
}
