"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t, Locale as I18nLocale } from "@/lib/i18n";

/**
 * LanguageSwitcher
 * 헤더에 표시되는 글로벌 언어 전환 컴포넌트
 * 쿠키 기반으로 언어 설정 저장
 */

const LOCALES = ["ko", "en", "ja", "zh"] as const;
type Locale = typeof LOCALES[number];

const LOCALE_INFO: Record<Locale, { flag: string; name: string }> = {
    ko: { flag: "🇰🇷", name: "한국어" },
    en: { flag: "🇺🇸", name: "English" },
    ja: { flag: "🇯🇵", name: "日本語" },
    zh: { flag: "🇨🇳", name: "中文" },
};

export function LanguageSwitcher() {
    const router = useRouter();
    const [currentLocale, setCurrentLocale] = useState<Locale>("ko");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 쿠키에서 현재 언어 읽기
        const readLocaleFromCookie = () => {
            const cookies = document.cookie.split("; ");
            const localeCookie = cookies.find((c) => c.startsWith("locale="));
            if (localeCookie) {
                const locale = localeCookie.split("=")[1] as Locale;
                if (LOCALES.includes(locale)) {
                    setCurrentLocale(locale);
                }
            }
        };

        readLocaleFromCookie();

        // PostLocaleSwitcher에서 언어 변경 시 동기화
        const handleLocaleChange = (e: Event) => {
            const customEvent = e as CustomEvent<{ locale: string }>;
            const newLocale = customEvent.detail.locale as Locale;
            if (LOCALES.includes(newLocale)) {
                setCurrentLocale(newLocale);
            }
        };

        window.addEventListener("localeChange", handleLocaleChange);
        return () => window.removeEventListener("localeChange", handleLocaleChange);
    }, []);

    const switchLocale = (newLocale: Locale) => {
        // 쿠키에 언어 설정 저장
        document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
        setCurrentLocale(newLocale);
        // 페이지 새로고침으로 서버 컴포넌트 재렌더링
        router.refresh();
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
            </Button>
        );
    }

    const currentInfo = LOCALE_INFO[currentLocale];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentInfo.flag}</span>
                    <span className="sr-only">{t("language", currentLocale as I18nLocale)}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LOCALES.map((locale) => {
                    const info = LOCALE_INFO[locale];
                    return (
                        <DropdownMenuItem
                            key={locale}
                            onClick={() => switchLocale(locale)}
                            className={currentLocale === locale ? "bg-accent" : ""}
                        >
                            <span className="mr-2">{info.flag}</span>
                            {info.name}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
