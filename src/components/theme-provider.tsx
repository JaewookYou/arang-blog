"use client";

/**
 * Theme Provider
 * next-themes 래퍼 컴포넌트
 * 다크모드 기본값으로 설정 (CTF/보안 블로그 특성)
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
