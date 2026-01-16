"use client";

import { useState, useRef, useEffect } from "react";
import { WrapText, ArrowLeftRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
    children: React.ReactNode;
    className?: string;
    "data-language"?: string;
}

/**
 * CodeBlock Component
 * rehype-pretty-code에서 생성된 pre 태그를 감싸는 클라이언트 컴포넌트
 * - 기본적으로 wrap 활성화
 * - 토글 버튼으로 wrap/scroll 전환 가능
 * - 코드 복사 버튼
 */
export function CodeBlock({ children, className, ...props }: CodeBlockProps) {
    const [isWrapped, setIsWrapped] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);
    const language = props["data-language"] || "";

    const copyToClipboard = async () => {
        if (preRef.current) {
            const code = preRef.current.textContent || "";
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="relative group my-4">
            {/* Language badge + Toggle button + Copy button */}
            <div className="absolute right-2 top-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {language && (
                    <span className="text-xs font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded">
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
                            >
                                {isCopied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isCopied ? "복사됨!" : "코드 복사"}</p>
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
                                onClick={() => setIsWrapped(!isWrapped)}
                            >
                                {isWrapped ? (
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                ) : (
                                    <WrapText className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isWrapped ? "스크롤 모드" : "줄바꿈 모드"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Code block */}
            <pre
                ref={preRef}
                className={`${className || ""} ${isWrapped ? "whitespace-pre-wrap break-words" : "overflow-x-auto"
                    }`}
                {...props}
            >
                {children}
            </pre>
        </div>
    );
}
