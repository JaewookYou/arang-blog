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
};

// 블로그 포스트 컬렉션
const posts = defineCollection({
    name: "Post",
    pattern: "posts/**/*.mdx",
    schema: s.object({
        ...baseFields,
        slug: s.path().transform((path) => path.split("/").pop() || path),
        cover: s.image().optional(),
        body: s.mdx(),
    }),
});

// CTF Writeup 컬렉션
const writeups = defineCollection({
    name: "Writeup",
    pattern: "writeups/**/*.mdx",
    schema: s.object({
        ...baseFields,
        slug: s.path().transform((path) => path.split("/").pop() || path),
        ctf: s.string(),
        category: s.enum(["web", "pwn", "rev", "crypto", "forensics", "misc"]),
        difficulty: s.enum(["easy", "medium", "hard", "insane"]).optional(),
        points: s.number().optional(),
        solves: s.number().optional(),
        body: s.mdx(),
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
    mdx: {
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


