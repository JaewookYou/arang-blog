"use client";

import { useState } from "react";
import { WrapText, ArrowLeftRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { t, type Locale } from "@/lib/i18n";

interface CodeBlockToolbarProps {
    pre: HTMLPreElement;
    language: string;
    locale: Locale;
}

/**
 * 코드 블록 도구 모음 (언어 표시, 복사, 줄바꿈/스크롤 전환)
 * 서버에서 렌더링된 <pre>는 그대로 두고 그 위에 버튼만 붙인다.
 * 기본은 줄바꿈 모드이며 CSS(.code-scroll)로 스크롤 모드를 전환한다.
 */
export function CodeBlockToolbar({ pre, language, locale }: CodeBlockToolbarProps) {
    const [isWrapped, setIsWrapped] = useState(!pre.classList.contains("code-scroll"));
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
            await navigator.clipboard.writeText(code);
        } catch {
            // http 등 clipboard API를 못 쓰는 환경
            const textarea = document.createElement("textarea");
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            textarea.remove();
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const toggleWrap = () => {
        pre.classList.toggle("code-scroll", isWrapped);
        setIsWrapped(!isWrapped);
    };

    return (
        <div className="absolute right-2 top-2 z-10 flex items-center space-x-1 opacity-80 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
            {language && language !== "plaintext" && (
                <span className="rounded bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground">
                    {language}
                </span>
            )}
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-background/80 hover:bg-accent"
                            onClick={copyToClipboard}
                            aria-label={t(isCopied ? "code.copied" : "code.copy", locale)}
                        >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t(isCopied ? "code.copied" : "code.copy", locale)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-background/80 hover:bg-accent"
                            onClick={toggleWrap}
                            aria-label={t(isWrapped ? "code.scroll" : "code.wrap", locale)}
                        >
                            {isWrapped ? <ArrowLeftRight className="h-3.5 w-3.5" /> : <WrapText className="h-3.5 w-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t(isWrapped ? "code.scroll" : "code.wrap", locale)}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
