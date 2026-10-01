/**
 * 사이트 전역 설정
 * NEXT_PUBLIC_SITE_URL이 없으면 운영 도메인을 기본값으로 사용한다.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://blog.arang.kr").replace(/\/+$/, "");

export const SITE_NAME = "Arang.dev";

/** 절대 URL 생성 */
export function absoluteUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
