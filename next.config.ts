import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Docker 배포를 위한 standalone 출력 모드
    output: "standalone",

    // Velite 빌드 출력과 통합
    // Velite는 .velite/ 디렉토리에 타입-안전 콘텐츠를 생성함
    webpack: (config) => {
        config.plugins.push(new VeliteWebpackPlugin());
        return config;
    },

    // Security Headers - Security-First 원칙
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY", // Clickjacking 방지
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff", // MIME 스니핑 방지
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                ],
            },
        ];
    },
};

/**
 * Velite Webpack Plugin
 * 개발 모드에서 Velite 빌드가 완료될 때까지 대기
 * 프로덕션에서는 velite 명령어가 먼저 실행됨
 */
class VeliteWebpackPlugin {
    static started = false;

    apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, fn: () => Promise<void>) => void } } }) {
        compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
            if (VeliteWebpackPlugin.started) return;
            VeliteWebpackPlugin.started = true;

            const dev = process.env.NODE_ENV !== "production";
            // 동적 import로 velite 로드 (ESM 호환성)
            const { build } = await import("velite");
            await build({ watch: dev, clean: !dev });
        });
    }
}

export default nextConfig;
