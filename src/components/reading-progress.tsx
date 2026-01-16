"use client";

import { useState, useEffect } from "react";

/**
 * Reading Progress Bar
 * 스크롤 진행률을 상단에 표시하는 컴포넌트
 */
export function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(scrollPercent);
        };

        window.addEventListener("scroll", updateProgress, { passive: true });
        updateProgress();

        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
