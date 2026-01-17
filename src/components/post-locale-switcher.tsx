"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

/**
 * PostLocaleSwitcher
 * 게시글 상단에 표시되는 언어 선택 버튼
 */

const LOCALE_INFO: Record<string, { flag: string; name: string }> = {
    ko: { flag: "🇰🇷", name: "한국어" },
    en: { flag: "🇺🇸", name: "English" },
    ja: { flag: "🇯🇵", name: "日本語" },
    zh: { flag: "🇨🇳", name: "中文" },
};

interface PostLocaleSwitcherProps {
    availableLocales: string[];
    currentLocale: string;
}

export function PostLocaleSwitcher({ availableLocales, currentLocale }: PostLocaleSwitcherProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLocaleChange = (locale: string) => {
        // 쿠키 설정
        document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
        // 페이지 새로고침
        router.refresh();
    };

    if (!mounted) {
        return null;
    }

    // 사용 가능한 언어가 원본(ko)만 있으면 표시 안 함
    const allLocales = ["ko", ...availableLocales.filter(l => l !== "ko")];
    if (allLocales.length <= 1) {
        return null;
    }

    const currentInfo = LOCALE_INFO[currentLocale] || LOCALE_INFO.en;

    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">언어:</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{currentInfo.flag} {currentInfo.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {allLocales.map((locale) => {
                        const info = LOCALE_INFO[locale];
                        if (!info) return null;
                        return (
                            <DropdownMenuItem
                                key={locale}
                                onClick={() => handleLocaleChange(locale)}
                                className={locale === currentLocale ? "bg-accent" : ""}
                            >
                                <span className="mr-2">{info.flag}</span>
                                {info.name}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
