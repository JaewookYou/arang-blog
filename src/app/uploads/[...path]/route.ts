import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * Static file serving for uploads
 * /uploads/2026/01/image.png -> data/uploads/2026/01/image.png
 */

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;
    const filePath = path.join(UPLOAD_DIR, ...pathSegments);

    // 보안: 경로 탈출 방지
    if (!filePath.startsWith(UPLOAD_DIR)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!existsSync(filePath)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const file = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();

        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(file, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
    }
}
