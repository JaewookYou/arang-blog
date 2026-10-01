"use client";

import { useEffect, useState } from "react";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { useServerLocale } from "@/components/locale-provider";

/**
 * useLocale Hook
 * 서버가 내려준 언어로 시작하고, 언어 전환 이벤트를 따라간다.
 */
export function useLocale(): Locale {
    const serverLocale = useServerLocale();
    const [locale, setLocale] = useState<Locale>(serverLocale);

    useEffect(() => {
        setLocale(serverLocale);
    }, [serverLocale]);

    useEffect(() => {
        const handleLocaleChange = (e: Event) => {
            setLocale(normalizeLocale((e as CustomEvent<{ locale: string }>).detail?.locale));
        };
        window.addEventListener("localeChange", handleLocaleChange);
        return () => window.removeEventListener("localeChange", handleLocaleChange);
    }, []);

    return locale;
}
