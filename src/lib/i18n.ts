/**
 * i18n Utilities
 * 다국어 지원을 위한 유틸리티 함수들
 */

export const LOCALES = ["ko", "en", "ja", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
};

export const DEFAULT_LOCALE: Locale = "ko";

// 번역 사전
const translations: Record<Locale, Record<string, string>> = {
    ko: {
        // 공통
        "language": "언어",
        "translated": "번역됨",

        // 목차/댓글
        "toc.title": "목차",
        "comments.title": "댓글",
        "comments.loading": "댓글을 불러오는 중...",
        "comments.empty": "첫 댓글을 작성해보세요!",
        "comments.nickname": "닉네임",
        "comments.placeholder": "댓글을 작성하세요...",
        "comments.reply.placeholder": "답글을 작성하세요...",
        "comments.submit": "댓글 작성",
        "comments.submitting": "작성 중...",
        "comments.reply": "답글",
        "comments.reply.submit": "답글 작성",
        "comments.cancel": "취소",

        // 이전/다음 글
        "nav.previous": "이전 글",
        "nav.next": "다음 글",

        // 태그 필터
        "tags.filter": "태그 필터",

        // 검색
        "search.placeholder": "게시글 검색...",
        "search.noresults": "검색 결과가 없습니다",

        // 테마
        "theme.light": "라이트 모드",
        "theme.dark": "다크 모드",
        "theme.system": "시스템 설정",
        "theme.toggle": "테마 변경",
    },
    en: {
        "language": "Language",
        "translated": "Translated",
        "toc.title": "Table of Contents",
        "comments.title": "Comments",
        "comments.loading": "Loading comments...",
        "comments.empty": "Be the first to comment!",
        "comments.nickname": "Nickname",
        "comments.placeholder": "Write a comment...",
        "comments.reply.placeholder": "Write a reply...",
        "comments.submit": "Post Comment",
        "comments.submitting": "Posting...",
        "comments.reply": "Reply",
        "comments.reply.submit": "Post Reply",
        "comments.cancel": "Cancel",
        "nav.previous": "Previous",
        "nav.next": "Next",
        "tags.filter": "Tag Filter",
        "search.placeholder": "Search posts...",
        "search.noresults": "No results found",
        "theme.light": "Light Mode",
        "theme.dark": "Dark Mode",
        "theme.system": "System",
        "theme.toggle": "Toggle theme",
    },
    ja: {
        "language": "言語",
        "translated": "翻訳済み",
        "toc.title": "目次",
        "comments.title": "コメント",
        "comments.loading": "コメントを読み込み中...",
        "comments.empty": "最初のコメントを書いてみましょう！",
        "comments.nickname": "ニックネーム",
        "comments.placeholder": "コメントを書く...",
        "comments.reply.placeholder": "返信を書く...",
        "comments.submit": "コメント投稿",
        "comments.submitting": "投稿中...",
        "comments.reply": "返信",
        "comments.reply.submit": "返信投稿",
        "comments.cancel": "キャンセル",
        "nav.previous": "前の記事",
        "nav.next": "次の記事",
        "tags.filter": "タグフィルター",
        "search.placeholder": "記事を検索...",
        "search.noresults": "検索結果がありません",
        "theme.light": "ライトモード",
        "theme.dark": "ダークモード",
        "theme.system": "システム設定",
        "theme.toggle": "テーマ切替",
    },
    zh: {
        "language": "语言",
        "translated": "已翻译",
        "toc.title": "目录",
        "comments.title": "评论",
        "comments.loading": "正在加载评论...",
        "comments.empty": "来写第一条评论吧！",
        "comments.nickname": "昵称",
        "comments.placeholder": "写评论...",
        "comments.reply.placeholder": "写回复...",
        "comments.submit": "发表评论",
        "comments.submitting": "发送中...",
        "comments.reply": "回复",
        "comments.reply.submit": "发表回复",
        "comments.cancel": "取消",
        "nav.previous": "上一篇",
        "nav.next": "下一篇",
        "tags.filter": "标签筛选",
        "search.placeholder": "搜索文章...",
        "search.noresults": "未找到结果",
        "theme.light": "浅色模式",
        "theme.dark": "深色模式",
        "theme.system": "跟随系统",
        "theme.toggle": "切换主题",
    },
};

/**
 * 번역 텍스트 가져오기
 */
export function t(key: string, locale: Locale = "ko"): string {
    return translations[locale]?.[key] || translations.ko[key] || key;
}

/**
 * 날짜 포맷팅 (로케일 기반)
 */
export function formatDateLocale(date: Date | string, locale: Locale = "ko"): string {
    const d = typeof date === "string" ? new Date(date) : date;

    const localeMap: Record<Locale, string> = {
        ko: "ko-KR",
        en: "en-US",
        ja: "ja-JP",
        zh: "zh-CN",
    };

    return d.toLocaleDateString(localeMap[locale], {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

/**
 * 브라우저 언어를 감지하여 지원 언어로 매핑
 */
export function detectLocale(acceptLanguage: string | null): Locale {
    if (!acceptLanguage) return DEFAULT_LOCALE;

    const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim().toLowerCase());

    for (const lang of languages) {
        if (lang.startsWith("ko")) return "ko";
        if (lang.startsWith("en")) return "en";
        if (lang.startsWith("ja")) return "ja";
        if (lang.startsWith("zh")) return "zh";
    }

    return DEFAULT_LOCALE;
}

/**
 * 포스트가 현재 공개 가능한지 확인 (예약 발행 체크)
 */
export function isPostVisible(post: {
    published: boolean;
    scheduledAt?: string;
}): boolean {
    if (!post.published) return false;
    if (!post.scheduledAt) return true;
    return new Date(post.scheduledAt) <= new Date();
}

/**
 * 로케일별 URL 생성
 */
export function getLocalizedPath(path: string, locale: Locale): string {
    if (locale === DEFAULT_LOCALE) return path;
    return `/${locale}${path}`;
}

