"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, LOCALE_NAMES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

/**
 * LanguageSwitcher
 * 언어 전환 드롭다운 컴포넌트
 */

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [currentLocale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        // URL에서 현재 로케일 감지
        const pathLocale = LOCALES.find(
            (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
        );
        setCurrentLocale(pathLocale || DEFAULT_LOCALE);
    }, [pathname]);

    const switchLocale = (newLocale: Locale) => {
        // 현재 로케일 제거하고 새 로케일 추가
        let basePath = pathname;

        // 기존 로케일 프리픽스 제거
        for (const locale of LOCALES) {
            if (basePath.startsWith(`/${locale}/`)) {
                basePath = basePath.slice(locale.length + 1);
                break;
            } else if (basePath === `/${locale}`) {
                basePath = "/";
                break;
            }
        }

        // 새 경로 생성
        const newPath = newLocale === DEFAULT_LOCALE
            ? basePath
            : `/${newLocale}${basePath}`;

        // 쿠키에 언어 설정 저장
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`;

        router.push(newPath);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">언어 선택</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LOCALES.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onClick={() => switchLocale(locale)}
                        className={currentLocale === locale ? "bg-accent" : ""}
                    >
                        {LOCALE_NAMES[locale]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
