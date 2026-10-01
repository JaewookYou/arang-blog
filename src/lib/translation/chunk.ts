import { parseMarkdown } from "./protect";

/**
 * 긴 글을 번역 단위 조각으로 나눈다.
 *
 * 한 번에 통째로 번역하면 모델이 뒷부분을 생략하거나 출력 한도에 걸려 잘리는 문제가 있었다.
 * (예: n8n 글의 일본어 번역이 원문의 일부만 저장되고, 원시 HTML로 된 writeup은 1/3만 번역됨)
 *
 * 1) 마크다운 최상위 블록 경계에서 나누고 (헤딩 앞을 선호)
 * 2) 그래도 큰 블록(예: 티스토리에서 가져온 거대한 HTML 표)은 빈 줄 → 닫는 블록 태그 → 줄바꿈 순으로 나눈다.
 * 각 조각은 앞뒤 공백(구분자)을 따로 보관해서, 번역 후 원문과 같은 구분자로 다시 이어 붙인다.
 */

export interface Chunk {
    lead: string; // 조각 앞 공백
    body: string; // 번역할 내용
    trail: string; // 조각 뒤 공백 (다음 조각과의 구분자)
}

const MAX_CHUNK = 5000;
const PREFERRED_MIN = 2000;

/** 블록 경계 기준 1차 분할 — 이어 붙이면 원문과 정확히 같다 */
function splitByBlocks(text: string, maxChunk: number): string[] {
    if (text.length <= maxChunk) return [text];

    const tree = parseMarkdown(text);
    const starts = tree.children
        .map((node) => ({ offset: node.position?.start.offset ?? 0, isHeading: node.type === "heading" }))
        .filter((b, i, arr) => i === 0 || b.offset > arr[i - 1].offset);

    if (starts.length <= 1) return [text];

    const pieces: string[] = [];
    let pieceStart = 0;

    for (let i = 1; i < starts.length; i++) {
        const blockStart = starts[i].offset;
        const currentLength = blockStart - pieceStart;
        const nextEnd = i + 1 < starts.length ? starts[i + 1].offset : text.length;
        const wouldBe = nextEnd - pieceStart;

        const tooBig = wouldBe > maxChunk && currentLength > 0;
        const niceBreak = starts[i].isHeading && currentLength >= PREFERRED_MIN && wouldBe > maxChunk * 0.6;

        if (tooBig || niceBreak) {
            pieces.push(text.slice(pieceStart, blockStart));
            pieceStart = blockStart;
        }
    }
    pieces.push(text.slice(pieceStart));
    return pieces.filter((p) => p.length > 0);
}

const BOUNDARY_PATTERNS: RegExp[] = [
    /\n[ \t]*\n/g, // 빈 줄
    /<\/(?:p|li|tr|table|div|ul|ol|blockquote|h[1-6]|figure|section)>[ \t]*\n?/gi, // 닫는 블록 태그
    /\n/g, // 줄바꿈
];

/** 너무 큰 조각을 경계 후보 위치에서 다시 나눈다 */
function splitOversized(piece: string, maxChunk: number): string[] {
    if (piece.length <= maxChunk) return [piece];

    for (const pattern of BOUNDARY_PATTERNS) {
        const cuts: number[] = [];
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(piece)) !== null) {
            const cut = match.index + match[0].length;
            if (cut > 0 && cut < piece.length) cuts.push(cut);
        }
        if (cuts.length === 0) continue;

        const result: string[] = [];
        let start = 0;
        let lastCut = 0;
        for (const cut of cuts) {
            if (cut - start > maxChunk && lastCut > start) {
                result.push(piece.slice(start, lastCut));
                start = lastCut;
            }
            lastCut = cut;
        }
        result.push(piece.slice(start));

        if (result.length > 1) {
            return result.flatMap((r) => splitOversized(r, maxChunk));
        }
    }
    return [piece]; // 더 나눌 곳이 없으면 그대로 (모델 출력 한도 안에서 처리)
}

export function splitMarkdown(text: string, maxChunk = MAX_CHUNK): Chunk[] {
    const pieces = splitByBlocks(text, maxChunk).flatMap((p) => splitOversized(p, maxChunk));
    return pieces.map((piece) => {
        const lead = piece.match(/^\s*/)?.[0] ?? "";
        const rest = piece.slice(lead.length);
        const trail = rest.match(/\s*$/)?.[0] ?? "";
        return { lead, body: rest.slice(0, rest.length - trail.length), trail };
    });
}

/** 번역된 본문들을 원래 구분자로 다시 이어 붙인다 */
export function joinChunks(chunks: Chunk[], bodies: string[]): string {
    return chunks.map((c, i) => c.lead + bodies[i].trim() + c.trail).join("");
}
