"use client";

import { useState, useEffect } from "react";
import { Locale } from "@/lib/i18n";

/**
 * useLocale Hook
 * 클라이언트에서 현재 로케일을 가져오고 변경을 감지
 */
export function useLocale(): Locale {
    const [locale, setLocale] = useState<Locale>("ko");

    useEffect(() => {
        // 초기 로케일 설정
        const getLocale = () => {
            const match = document.cookie.match(/locale=(\w+)/);
            return (match?.[1] as Locale) || "ko";
        };

        setLocale(getLocale());

        // localeChange 이벤트 리스너
        const handleLocaleChange = (e: CustomEvent<{ locale: Locale }>) => {
            setLocale(e.detail.locale);
        };

        window.addEventListener("localeChange", handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener("localeChange", handleLocaleChange as EventListener);
        };
    }, []);

    return locale;
}
