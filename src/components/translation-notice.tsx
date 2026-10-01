import { Languages } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import type { LocalizedArticle } from "@/lib/article";

interface TranslationNoticeProps {
    article: LocalizedArticle;
    locale: Locale;
    originalHref: string; // ?lang=ko 링크
}

/**
 * 번역본/원문 안내 배너
 * - 번역본: AI 번역 안내 + 원문 보기
 * - 원문이 번역 이후 수정됨: 곧 갱신된다는 안내
 * - 번역 없음: 원문을 보여준다는 안내
 */
export function TranslationNotice({ article, locale, originalHref }: TranslationNoticeProps) {
    if (locale === "ko" || (!article.translated && !article.missingTranslation)) return null;

    const message = article.missingTranslation ? t("translated.unavailable", locale) : t("translated.notice", locale);

    return (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
                <p>{message}</p>
                {article.stale && <p className="text-amber-600 dark:text-amber-400">{t("translated.stale", locale)}</p>}
                {article.translated && (
                    // 전체 페이지를 다시 불러와 헤더·언어 설정까지 원문 기준으로 맞춘다 (쿠키는 바꾸지 않음)
                    <a href={originalHref} className="font-medium text-primary hover:underline" hrefLang="ko" lang="ko">
                        {t("translated.viewOriginal", locale)}
                    </a>
                )}
            </div>
        </div>
    );
}
