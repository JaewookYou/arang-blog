import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

/**
 * Admin Image Upload API
 * 이미지를 data/uploads/YYYY/MM/ 에 저장
 */

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function POST(request: NextRequest) {
    // 인증 확인
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 파일 타입 검증
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: jpg, png, gif, webp" },
                { status: 400 }
            );
        }

        // 파일 크기 제한 (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Max 5MB" },
                { status: 400 }
            );
        }

        // 날짜 기반 폴더 구조
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const uploadPath = path.join(UPLOAD_DIR, year, month);

        // 디렉토리 생성
        if (!existsSync(uploadPath)) {
            await mkdir(uploadPath, { recursive: true });
        }

        // 파일명 생성 (timestamp + random)
        const ext = file.name.split(".").pop() || "png";
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}-${random}.${ext}`;

        // 파일 저장
        const filePath = path.join(uploadPath, filename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 접근 URL 생성
        const url = `/uploads/${year}/${month}/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            filename,
            size: file.size,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
