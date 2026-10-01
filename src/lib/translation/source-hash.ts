import { createHash } from "crypto";

/** 제목·설명·본문을 정규화해 해시한다. 원문이 바뀌면 해시가 바뀌어 재번역 대상이 된다. */
export function computeSourceHash(input: { title: string; description?: string | null; markdown: string }): string {
    const normalized = JSON.stringify([
        input.title.trim(),
        (input.description || "").trim(),
        input.markdown.replace(/\r\n/g, "\n").trim(),
    ]);
    return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
