/**
 * Next.js instrumentation hook — 서버 프로세스가 시작될 때 한 번 실행된다.
 * 배포(컨테이너 재시작) 직후 누락되거나 원문이 바뀐 번역을 자동으로 채운다.
 * (Edge 번들에서 Node 전용 모듈이 빠지도록 NEXT_RUNTIME 조건 블록 안에서만 import한다)
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { startAutoTranslation } = await import("./lib/translation/service");
        startAutoTranslation();
    }
}
