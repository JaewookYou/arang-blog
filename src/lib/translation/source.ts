import { posts, writeups } from "@/.velite";
import { isPostVisible } from "@/lib/i18n";

/**
 * 번역 원문(velite 콘텐츠) 조회와 원문 해시 계산
 */

export type ContentType = "post" | "writeup";

export interface SourceItem {
    type: ContentType;
    slug: string;
    title: string;
    description: string;
    markdown: string; // 프론트매터 제외 원문
    html: string; // velite가 렌더링한 원문 HTML
    date: string;
    published: boolean;
    scheduledAt?: string;
    hash: string;
}

/** 공개 여부 (예약 발행 시간은 호출 시점 기준으로 판단) */
export function isSourceVisible(item: SourceItem): boolean {
    return isPostVisible(item);
}

export { computeSourceHash } from "./source-hash";
import { computeSourceHash } from "./source-hash";

type VeliteDoc = {
    slug: string;
    title: string;
    description?: string;
    raw: string;
    body: string;
    date: string;
    published: boolean;
    scheduledAt?: string;
};

function toSource(type: ContentType, doc: VeliteDoc): SourceItem {
    const description = doc.description || "";
    return {
        type,
        slug: doc.slug,
        title: doc.title,
        description,
        markdown: doc.raw,
        html: doc.body,
        date: doc.date,
        published: doc.published,
        scheduledAt: doc.scheduledAt,
        hash: computeSourceHash({ title: doc.title, description, markdown: doc.raw }),
    };
}

let cache: SourceItem[] | null = null;

export function getSourceItems(): SourceItem[] {
    if (!cache) {
        cache = [
            ...(posts as unknown as VeliteDoc[]).map((p) => toSource("post", p)),
            ...(writeups as unknown as VeliteDoc[]).map((w) => toSource("writeup", w)),
        ];
    }
    return cache;
}

export function getSourceItem(type: string, slug: string): SourceItem | null {
    return getSourceItems().find((item) => item.type === type && item.slug === slug) || null;
}

export function isContentType(value: unknown): value is ContentType {
    return value === "post" || value === "writeup";
}
