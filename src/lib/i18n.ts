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

/** 원문(ko)을 제외한 번역 대상 언어 */
export const TRANSLATION_LOCALES = ["en", "ja", "zh"] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

/** <html lang> 값 */
export const HTML_LANG: Record<Locale, string> = {
    ko: "ko",
    en: "en",
    ja: "ja",
    zh: "zh-CN",
};

/** Open Graph locale 값 */
export const OG_LOCALE: Record<Locale, string> = {
    ko: "ko_KR",
    en: "en_US",
    ja: "ja_JP",
    zh: "zh_CN",
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function isTranslationLocale(value: unknown): value is TranslationLocale {
    return typeof value === "string" && (TRANSLATION_LOCALES as readonly string[]).includes(value);
}

/** 알 수 없는 값은 기본 언어(ko)로 정규화 */
export function normalizeLocale(value: string | null | undefined): Locale {
    return isLocale(value) ? value : DEFAULT_LOCALE;
}

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
        "search.label": "검색",
        "search.title": "검색",
        "search.description": "포스트와 CTF Writeup을 검색하세요",
        "search.enterquery": "검색어를 입력하세요",
        "search.results": "검색 결과",
        "menu": "메뉴",

        // 테마
        "theme.light": "라이트 모드",
        "theme.dark": "다크 모드",
        "theme.system": "시스템 설정",
        "theme.toggle": "테마 변경",
        // 번역 안내
        "translated.notice": "",
        "translated.viewOriginal": "원문 보기",
        "translated.stale": "",
        "translated.unavailable": "",

        // 코드 블록
        "code.copy": "코드 복사",
        "code.copied": "복사됨!",
        "code.wrap": "줄바꿈 모드",
        "code.scroll": "스크롤 모드",

        // 댓글 오류
        "comments.error": "댓글 작성에 실패했습니다.",
        "comments.ratelimit": "댓글을 너무 자주 작성했습니다. 잠시 후 다시 시도해주세요.",
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
        "search.label": "Search",
        "search.title": "Search",
        "search.description": "Search posts and CTF writeups",
        "search.enterquery": "Enter a search term",
        "search.results": "results",
        "menu": "Menu",
        "theme.light": "Light Mode",
        "theme.dark": "Dark Mode",
        "theme.system": "System",
        "theme.toggle": "Toggle theme",
        "translated.notice": "This post was machine-translated from Korean by AI. Some expressions may differ from the original.",
        "translated.viewOriginal": "Read the original (Korean)",
        "translated.stale": "The original post was updated after this translation. The translation will be refreshed shortly.",
        "translated.unavailable": "A translation is not available yet, so the original Korean post is shown.",
        "code.copy": "Copy code",
        "code.copied": "Copied!",
        "code.wrap": "Wrap lines",
        "code.scroll": "Scroll horizontally",
        "comments.error": "Failed to post your comment.",
        "comments.ratelimit": "You are commenting too often. Please try again later.",
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
        "search.label": "検索",
        "search.title": "検索",
        "search.description": "記事とCTF Writeupを検索",
        "search.enterquery": "検索キーワードを入力",
        "search.results": "件",
        "menu": "メニュー",
        "theme.light": "ライトモード",
        "theme.dark": "ダークモード",
        "theme.system": "システム設定",
        "theme.toggle": "テーマ切替",
        "translated.notice": "この記事はAIによって韓国語から機械翻訳されています。原文と表現が異なる場合があります。",
        "translated.viewOriginal": "原文（韓国語）を読む",
        "translated.stale": "この翻訳の作成後に原文が更新されました。翻訳はまもなく更新されます。",
        "translated.unavailable": "翻訳がまだないため、韓国語の原文を表示しています。",
        "code.copy": "コードをコピー",
        "code.copied": "コピーしました",
        "code.wrap": "折り返して表示",
        "code.scroll": "横スクロールで表示",
        "comments.error": "コメントの投稿に失敗しました。",
        "comments.ratelimit": "コメントの投稿が多すぎます。しばらくしてから再度お試しください。",
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
        "search.label": "搜索",
        "search.title": "搜索",
        "search.description": "搜索博文和CTF解题报告",
        "search.enterquery": "请输入搜索关键词",
        "search.results": "条结果",
        "menu": "菜单",
        "theme.light": "浅色模式",
        "theme.dark": "深色模式",
        "theme.system": "跟随系统",
        "theme.toggle": "切换主题",
        "translated.notice": "本文由 AI 从韩语机器翻译，部分表达可能与原文有所不同。",
        "translated.viewOriginal": "阅读原文（韩语）",
        "translated.stale": "原文在本译文生成后已更新，译文将很快刷新。",
        "translated.unavailable": "本文暂无译文，因此显示韩语原文。",
        "code.copy": "复制代码",
        "code.copied": "已复制",
        "code.wrap": "自动换行",
        "code.scroll": "横向滚动",
        "comments.error": "评论发表失败。",
        "comments.ratelimit": "评论过于频繁，请稍后再试。",
    },
};

/**
 * 번역 텍스트 가져오기
 */
export function t(key: string, locale: Locale = "ko"): string {
    const value = translations[locale]?.[key] ?? translations.ko[key];
    return value ?? key;
}

/**
 * 날짜 포맷팅 (로케일 기반)
 */
export function formatDateLocale(date: Date | string, locale: Locale = "ko"): string {
    // SQLite datetime('now')는 "YYYY-MM-DD HH:MM:SS"(UTC) 형식이라 시간대 정보가 없다
    const d = typeof date === "string"
        ? new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date) ? `${date.replace(" ", "T")}Z` : date)
        : date;

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


