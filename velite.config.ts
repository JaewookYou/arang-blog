import { defineConfig, defineCollection, s } from "velite";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

/**
 * Velite Configuration
 * MDX 콘텐츠를 타입-안전하게 관리
 * Zod 스키마로 프론트매터 검증
 */

// 공통 필드 스키마
const baseFields = {
    title: s.string().max(100),
    description: s.string().max(300).optional(),
    date: s.isodate(),
    published: s.boolean().default(true),
    tags: s.array(s.string()).default([]),
    // 예약 발행 - 지정된 날짜 이후에만 공개
    scheduledAt: s.isodate().optional(),
    // 다국어 지원 - 원본 언어 표시
    locale: s.enum(["ko", "en", "ja", "zh"]).default("ko"),
    // 원본 슬러그 참조 (번역본인 경우)
    originalSlug: s.string().optional(),
};

// 블로그 포스트 컬렉션
const posts = defineCollection({
    name: "Post",
    pattern: "posts/**/*.{mdx,md}",
    schema: s.object({
        ...baseFields,
        slug: s.path().transform((path) => path.split("/").pop() || path),
        cover: s.image().optional(),
        category: s.string().optional(),
        body: s.markdown(),
    }),
});

// CTF Writeup 컬렉션
const writeups = defineCollection({
    name: "Writeup",
    pattern: "writeups/**/*.{mdx,md}",
    schema: s.object({
        ...baseFields,
        slug: s.path().transform((path) => path.split("/").pop() || path),
        ctf: s.string().optional(),
        category: s.enum(["web", "pwn", "rev", "crypto", "forensics", "misc"]).optional(),
        difficulty: s.enum(["easy", "medium", "hard", "insane"]).optional(),
        points: s.number().optional(),
        solves: s.number().optional(),
        body: s.markdown(),
    }),
});

export default defineConfig({
    root: "content",
    output: {
        data: ".velite",
        assets: "public/static",
        base: "/static/",
        name: "[name]-[hash:6].[ext]",
        clean: true,
    },
    collections: { posts, writeups },
    markdown: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            [
                rehypePrettyCode,
                {
                    theme: "tokyo-night",
                    keepBackground: true,
                    defaultLang: "plaintext",
                },
            ],
        ],
    },
});


