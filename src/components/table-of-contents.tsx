"use client";

import { useState, useEffect } from "react";
import { List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

/**
 * Table of Contents
 * 현재 페이지의 헤딩을 기반으로 목차 생성 (다국어 지원)
 */
export function TableOfContents() {
    const locale = useLocale();
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 페이지 내 h2, h3 헤딩 수집
        const elements = document.querySelectorAll("article h2, article h3");
        const items: TocItem[] = Array.from(elements).map((el) => ({
            id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, "-") || "",
            text: el.textContent || "",
            level: parseInt(el.tagName.charAt(1)),
        }));

        // ID가 없는 헤딩에 ID 부여
        elements.forEach((el, i) => {
            if (!el.id) {
                el.id = items[i].id;
            }
        });

        setHeadings(items);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-80px 0px -80% 0px" }
        );

        headings.forEach((heading) => {
            const el = document.getElementById(heading.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile TOC Toggle */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
                <Button
                    variant="default"
                    size="icon"
                    className="rounded-full shadow-lg"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <List className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile TOC Drawer */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
                    <div className="container mx-auto px-4 py-20">
                        <h3 className="text-lg font-semibold mb-4">{t("toc.title", locale)}</h3>
                        <nav className="space-y-2">
                            {headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={`block w-full text-left text-sm py-1 transition-colors ${heading.level === 3 ? "pl-4" : ""
                                        } ${activeId === heading.id
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </nav>
                        <Button
                            variant="outline"
                            className="mt-6 w-full"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4 mr-2" />
                            {t("comments.cancel", locale)}
                        </Button>
                    </div>
                </div>
            )}

            {/* Desktop TOC Sidebar */}
            <aside className="hidden lg:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">{t("toc.title", locale)}</h3>
                <nav className="space-y-1 border-l border-border pl-4">
                    {headings.map((heading) => (
                        <button
                            key={heading.id}
                            onClick={() => scrollToHeading(heading.id)}
                            className={`block w-full text-left text-sm py-1 transition-colors ${heading.level === 3 ? "pl-3 text-xs" : ""
                                } ${activeId === heading.id
                                    ? "text-primary font-medium border-l-2 border-primary -ml-[17px] pl-[15px]"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {heading.text}
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
}
