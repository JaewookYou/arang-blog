/**
 * 단순 메모리 기반 rate limiter (단일 컨테이너 환경용)
 */
interface Bucket {
    hits: number[];
}

const BUCKETS_KEY = Symbol.for("arang.blog.rateLimit");
function buckets(): Map<string, Bucket> {
    const g = globalThis as unknown as Record<symbol, Map<string, Bucket> | undefined>;
    if (!g[BUCKETS_KEY]) g[BUCKETS_KEY] = new Map();
    return g[BUCKETS_KEY]!;
}

/** windowMs 동안 limit회까지 허용. 허용되면 true */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const map = buckets();
    const bucket = map.get(key) ?? { hits: [] };
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length >= limit) {
        map.set(key, bucket);
        return false;
    }
    bucket.hits.push(now);
    map.set(key, bucket);

    // 오래된 키 정리
    if (map.size > 5000) {
        for (const [k, b] of map) {
            if (b.hits.every((t) => now - t >= windowMs)) map.delete(k);
        }
    }
    return true;
}

/**
 * 프록시(Apache) 뒤에서 클라이언트 IP 추출
 * 클라이언트가 X-Forwarded-For를 직접 보내면 앞쪽 값은 위조될 수 있으므로,
 * 신뢰하는 프록시(Apache)가 마지막에 덧붙인 값을 사용한다.
 */
export function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
        if (parts.length) return parts[parts.length - 1];
    }
    return request.headers.get("x-real-ip") || "unknown";
}
