"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * 서버에서 결정한 언어를 클라이언트 컴포넌트에 전달한다.
 * (예전에는 클라이언트가 쿠키를 읽기 전까지 한국어로 그려졌다가 바뀌는 깜빡임이 있었다)
 */
const LocaleContext = createContext<Locale>("ko");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
    return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useServerLocale(): Locale {
    return useContext(LocaleContext);
}
