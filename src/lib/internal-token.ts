/**
 * middleware → /api/honeypot 내부 호출 검증용 토큰
 * Edge(middleware)와 Node(route) 양쪽에서 같은 값을 계산할 수 있도록 Web Crypto를 쓴다.
 */
export async function getHoneypotToken(): Promise<string | null> {
    const secret = process.env.AUTH_SECRET || process.env.INTERNAL_API_TOKEN;
    if (!secret) return null;
    const data = new TextEncoder().encode(`honeypot:${secret}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
