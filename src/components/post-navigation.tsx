"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface PostNavProps {
    prevPost?: {
        slug: string;
        title: string;
    };
    nextPost?: {
        slug: string;
        title: string;
    };
    basePath: string; // "/posts" or "/writeups"
}

/**
 * Post Navigation
 * 이전/다음 포스트로 이동하는 네비게이션 (다국어 지원)
 */
export function PostNavigation({ prevPost, nextPost, basePath }: PostNavProps) {
    const locale = useLocale();

    if (!prevPost && !nextPost) return null;

    return (
        <nav className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
                {/* Previous Post */}
                <div className="col-span-1">
                    {prevPost && (
                        <Link
                            href={`${basePath}/${prevPost.slug}`}
                            className="group flex flex-col p-4 rounded-lg border border-border hover:border-primary transition-colors"
                        >
                            <span className="flex items-center text-sm text-muted-foreground mb-1">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                {t("nav.previous", locale)}
                            </span>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {prevPost.title}
                            </span>
                        </Link>
                    )}
                </div>

                {/* Next Post */}
                <div className="col-span-1">
                    {nextPost && (
                        <Link
                            href={`${basePath}/${nextPost.slug}`}
                            className="group flex flex-col items-end text-right p-4 rounded-lg border border-border hover:border-primary transition-colors"
                        >
                            <span className="flex items-center text-sm text-muted-foreground mb-1">
                                {t("nav.next", locale)}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </span>
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                {nextPost.title}
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
