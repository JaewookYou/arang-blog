"use client";

import { Bold, Code, Image as ImageIcon, Italic, Link2, List, Loader2, Quote, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
    insert: (before: string, after?: string, placeholder?: string) => void;
    onFileSelected: (file: File) => void;
    isUploading: boolean;
    children?: React.ReactNode; // 오른쪽 추가 버튼
}

/** 글쓰기/수정 화면 공용 마크다운 툴바 (커서 위치에 삽입) */
export function EditorToolbar({ insert, onFileSelected, isUploading, children }: EditorToolbarProps) {
    const tools = [
        { icon: <Heading2 className="h-4 w-4" />, title: "Heading", action: () => insert("\n## ", "", "제목") },
        { icon: <Bold className="h-4 w-4" />, title: "Bold", action: () => insert("**", "**", "굵게") },
        { icon: <Italic className="h-4 w-4" />, title: "Italic", action: () => insert("*", "*", "기울임") },
        { icon: <Code className="h-4 w-4" />, title: "Inline Code", action: () => insert("`", "`", "code") },
        { icon: <Link2 className="h-4 w-4" />, title: "Link", action: () => insert("[", "](https://)", "링크 텍스트") },
        { icon: <Quote className="h-4 w-4" />, title: "Quote", action: () => insert("\n> ", "", "인용") },
        { icon: <List className="h-4 w-4" />, title: "List", action: () => insert("\n- ", "", "항목") },
        { icon: <span className="font-mono text-xs">{"{ }"}</span>, title: "Code Block", action: () => insert("\n```\n", "\n```\n", "code") },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-2">
            <div className="flex flex-wrap items-center gap-1">
                {tools.map((tool) => (
                    <Button key={tool.title} type="button" variant="ghost" size="sm" onClick={tool.action} title={tool.title}>
                        {tool.icon}
                    </Button>
                ))}
            </div>

            <div className="h-6 w-px bg-border" />

            <label className="cursor-pointer" title="이미지 업로드">
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileSelected(file);
                        e.target.value = "";
                    }}
                />
                <Button type="button" variant="ghost" size="sm" asChild disabled={isUploading}>
                    <span>
                        {isUploading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-1 h-4 w-4" />}
                        이미지
                    </span>
                </Button>
            </label>

            {children}

            <span className="ml-auto text-xs text-muted-foreground">Ctrl+V로 이미지 붙여넣기</span>
        </div>
    );
}

/** 이미지 업로드 API 호출 */
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "업로드 실패");
    return data.url as string;
}
