"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface TagFilterProps {
    tags: string[];
    basePath: string;
}

/**
 * Tag Filter Component
 * 태그 필터링 UI (다국어 지원)
 */
export function TagFilter({ tags, basePath }: TagFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const currentTag = searchParams.get("tag");

    // 중복 제거 및 정렬
    const uniqueTags = [...new Set(tags)].sort();

    const handleTagClick = (tag: string) => {
        if (currentTag === tag) {
            // 이미 선택된 태그 클릭 → 필터 해제
            router.push(basePath);
        } else {
            router.push(`${basePath}?tag=${encodeURIComponent(tag)}`);
        }
    };

    const clearFilter = () => {
        router.push(basePath);
    };

    if (uniqueTags.length === 0) return null;

    // 필터 해제 텍스트
    const clearText = locale === "ko" ? "필터 해제" :
        locale === "en" ? "Clear filter" :
            locale === "ja" ? "フィルター解除" : "清除筛选";

    return (
        <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>{t("tags.filter", locale)}</span>
                {currentTag && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={clearFilter}
                    >
                        <X className="w-3 h-3 mr-1" />
                        {clearText}
                    </Button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {uniqueTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${currentTag === tag
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        </div>
    );
}
