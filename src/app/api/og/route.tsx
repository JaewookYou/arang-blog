import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

/**
 * 동적 OG 이미지 생성
 * /api/og?title=...&type=post|writeup|default
 */

export const runtime = "edge";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Arang Tech Blog";
    const type = searchParams.get("type") || "default";
    const description = searchParams.get("description") || "Security Research & CTF Writeups";

    // 타입별 아이콘/배지
    const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
        post: { icon: "📝", label: "Blog Post", color: "#10b981" },
        writeup: { icon: "🚩", label: "CTF Writeup", color: "#f59e0b" },
        default: { icon: "🔐", label: "Arang.dev", color: "#10b981" },
    };

    const config = typeConfig[type] || typeConfig.default;

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-end",
                    backgroundColor: "#09090b",
                    backgroundImage: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
                    padding: "60px",
                }}
            >
                {/* 상단 배지 */}
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        left: "60px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <span style={{ fontSize: "32px" }}>{config.icon}</span>
                    <span
                        style={{
                            fontSize: "24px",
                            color: config.color,
                            fontWeight: "600",
                        }}
                    >
                        {config.label}
                    </span>
                </div>

                {/* 로고 (우상단) */}
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        right: "60px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span style={{ fontSize: "28px", fontWeight: "700", color: "#10b981" }}>
                        Arang
                    </span>
                    <span style={{ fontSize: "28px", fontWeight: "400", color: "#71717a" }}>
                        .dev
                    </span>
                </div>

                {/* 메인 타이틀 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        maxWidth: "900px",
                    }}
                >
                    <h1
                        style={{
                            fontSize: title.length > 40 ? "48px" : "64px",
                            fontWeight: "700",
                            color: "#fafafa",
                            lineHeight: 1.2,
                            margin: 0,
                        }}
                    >
                        {title}
                    </h1>
                    {description && type !== "default" && (
                        <p
                            style={{
                                fontSize: "24px",
                                color: "#a1a1aa",
                                margin: 0,
                                lineHeight: 1.4,
                            }}
                        >
                            {description.length > 100 ? description.slice(0, 100) + "..." : description}
                        </p>
                    )}
                </div>

                {/* 하단 장식 라인 */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        right: "0",
                        height: "4px",
                        background: `linear-gradient(90deg, ${config.color} 0%, transparent 100%)`,
                    }}
                />
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
