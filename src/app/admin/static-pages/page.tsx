"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowDown,
    ArrowUp,
    Bold,
    Braces,
    Code,
    Globe,
    Home,
    Italic,
    Link2,
    Loader2,
    Plus,
    RefreshCw,
    RotateCcw,
    Save,
    Strikethrough,
    Trash2,
    User,
} from "lucide-react";
import { htmlToInlineMarkdown, renderInlineMarkdown } from "@/lib/inline-markdown";

/**
 * Admin Static Pages Editor
 * Home, About 페이지 문구를 항목별 입력란으로 편집한다.
 * - 값은 인라인 마크다운 (**굵게**, *기울임*, `코드`, [링크](url)) — 기존 HTML도 그대로 동작
 * - 한국어로 저장하면 다른 언어로 자동 번역
 */

type PageKey = "home" | "about";
type Locale = "ko" | "en" | "ja" | "zh";
type PageData = Record<string, string | string[]>;

const LOCALES: { code: Locale; label: string }[] = [
    { code: "ko", label: "🇰🇷 한국어" },
    { code: "en", label: "🇺🇸 English" },
    { code: "ja", label: "🇯🇵 日本語" },
    { code: "zh", label: "🇨🇳 中文" },
];

interface FieldMeta {
    label: string;
    hint?: string;
}

const FIELDS: Record<PageKey, Record<string, FieldMeta>> = {
    home: {
        heroTitle1: { label: "메인 제목 첫 줄" },
        heroTitle2: { label: "메인 제목 둘째 줄", hint: "'&' 기호 뒤에 붙습니다" },
        heroDescription1: { label: "소개 문구 첫 줄" },
        heroDescription2: { label: "소개 문구 둘째 줄" },
        blogPosts: { label: "블로그 포스트 버튼" },
        ctfWriteups: { label: "CTF Writeups 버튼" },
        about: { label: "About 버튼" },
        whoami: { label: "터미널 명령" },
        role: { label: "터미널 출력" },
    },
    about: {
        name: { label: "이름", hint: "뒤에 (arang)이 붙습니다" },
        subtitle: { label: "부제" },
        career: { label: "섹션 제목" },
        careerItems: { label: "항목" },
        awards: { label: "섹션 제목" },
        awardItems: { label: "항목" },
        bugBounty: { label: "섹션 제목" },
        bugBountyItems: { label: "항목", hint: "CVSS 9.4처럼 쓰면 점수에 따라 색이 자동으로 붙습니다" },
        ctf: { label: "섹션 제목" },
        ctfItems: { label: "항목" },
        interests: { label: "섹션 제목" },
        interestItems: { label: "태그" },
        contact: { label: "섹션 제목" },
    },
};

const GROUPS: Record<PageKey, { title: string; keys: string[] }[]> = {
    home: [
        { title: "메인 문구", keys: ["heroTitle1", "heroTitle2", "heroDescription1", "heroDescription2"] },
        { title: "바로가기 버튼", keys: ["blogPosts", "ctfWriteups", "about"] },
        { title: "터미널 문구", keys: ["whoami", "role"] },
    ],
    about: [
        { title: "프로필", keys: ["name", "subtitle"] },
        { title: "💼 경력", keys: ["career", "careerItems"] },
        { title: "🏆 수상·논문", keys: ["awards", "awardItems"] },
        { title: "🐛 버그바운티·CVE", keys: ["bugBounty", "bugBountyItems"] },
        { title: "🚩 CTF 기록", keys: ["ctf", "ctfItems"] },
        { title: "🔐 관심 분야", keys: ["interests", "interestItems"] },
        { title: "📬 연락처", keys: ["contact"] },
    ],
};

const LOCALE_LABEL: Record<string, string> = { en: "영어", ja: "일본어", zh: "중국어" };

/** 예전 HTML 값을 편집하기 쉬운 마크다운으로 바꾸고, 키 순서를 기본 템플릿에 맞춘다 */
function toEditable(raw: Record<string, unknown>, template: Record<string, unknown>): PageData {
    const result: PageData = {};
    const keys = [...Object.keys(template), ...Object.keys(raw).filter((k) => !(k in template))];
    for (const key of keys) {
        const value = key in raw ? raw[key] : template[key];
        if (Array.isArray(value)) result[key] = value.map((v) => htmlToInlineMarkdown(String(v)));
        else if (value !== undefined && value !== null) result[key] = htmlToInlineMarkdown(String(value));
    }
    return result;
}

function describeResult(
    data: { translated?: string[]; failed?: { locale: string; error: string }[] },
    translatedExpected: boolean
): { type: "success" | "error"; text: string } {
    if (!translatedExpected) return { type: "success", text: "저장했습니다." };
    const ok = (data.translated || []).map((l) => LOCALE_LABEL[l] || l);
    const failed = data.failed || [];
    if (failed.length === 0) {
        return { type: "success", text: `저장했습니다. 번역도 갱신했습니다 (${ok.join(", ")}).` };
    }
    const failedText = failed.map((f) => `${LOCALE_LABEL[f.locale] || f.locale}: ${f.error}`).join(" / ");
    return {
        type: "error",
        text: `한국어는 저장했지만 번역 일부가 실패했습니다.${ok.length ? ` 성공: ${ok.join(", ")}.` : ""} 실패 — ${failedText}`,
    };
}

/** 내용에 맞춰 높이가 늘어나는 입력란 */
function AutoTextarea(
    props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { inputRef?: (el: HTMLTextAreaElement | null) => void }
) {
    const { inputRef, value, className, ...rest } = props;
    const local = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
        const el = local.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);
    return (
        <textarea
            {...rest}
            value={value}
            rows={1}
            ref={(el) => {
                local.current = el;
                inputRef?.(el);
            }}
            className={`w-full resize-none overflow-hidden rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary ${className || ""}`}
        />
    );
}

interface ActiveField {
    key: string;
    index: number; // 문자열 필드는 -1
}

export default function StaticPagesAdmin() {
    const [page, setPage] = useState<PageKey>("about");
    const [locale, setLocale] = useState<Locale>("ko");
    const [baseline, setBaseline] = useState<Partial<Record<Locale, PageData>>>({});
    const [savedLocales, setSavedLocales] = useState<Locale[]>([]);
    const [defaults, setDefaults] = useState<Partial<Record<Locale, PageData>>>({});
    const [data, setData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoTranslate, setAutoTranslate] = useState(true);
    const [jsonMode, setJsonMode] = useState(false);
    const [jsonText, setJsonText] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [active, setActive] = useState<ActiveField | null>(null);
    const inputs = useRef(new Map<string, HTMLTextAreaElement>());
    const pendingFocus = useRef<string | null>(null);

    const template = defaults.ko;
    const dirty = useMemo(
        () => Boolean(data && baseline[locale] && JSON.stringify(data) !== JSON.stringify(baseline[locale])),
        [data, baseline, locale]
    );

    const load = useCallback(async (pageKey: PageKey, keepLocale: Locale) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/static-pages?page=${pageKey}`, { cache: "no-store" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "불러오기 실패");

            const defs = json.defaults as Record<Locale, Record<string, unknown>>;
            const tmpl = defs.ko;
            const defaultData: Partial<Record<Locale, PageData>> = {};
            const base: Partial<Record<Locale, PageData>> = {};
            const saved: Locale[] = [];
            for (const { code } of LOCALES) defaultData[code] = toEditable(defs[code] || tmpl, tmpl);
            for (const row of json.contents as { locale: Locale; content: string }[]) {
                try {
                    base[row.locale] = toEditable(JSON.parse(row.content), tmpl);
                    saved.push(row.locale);
                } catch {
                    // 깨진 JSON이면 기본값으로
                }
            }
            for (const { code } of LOCALES) base[code] = base[code] || defaultData[code];

            setDefaults(defaultData);
            setBaseline(base);
            setSavedLocales(saved);
            setData(structuredClone(base[keepLocale]!));
            setJsonMode(false);
        } catch (error) {
            setMessage({ type: "error", text: error instanceof Error ? error.message : "불러오기 실패" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(page, locale);
        // 언어 전환은 switchLocale에서 이미 불러온 데이터로 처리하므로 page가 바뀔 때만 다시 불러온다
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, load]);

    // 저장하지 않은 변경이 있으면 이탈 경고
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (dirty) e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    // 새 항목 추가·이동 후 포커스
    useEffect(() => {
        if (!pendingFocus.current) return;
        const el = inputs.current.get(pendingFocus.current);
        if (el) {
            el.focus();
            pendingFocus.current = null;
        }
    });

    const confirmDiscard = () => !dirty || confirm("저장하지 않은 변경 사항이 있습니다. 버리고 이동할까요?");

    const switchPage = (next: PageKey) => {
        if (next === page || !confirmDiscard()) return;
        setMessage(null);
        setActive(null);
        setPage(next);
    };

    const switchLocale = (next: Locale) => {
        if (next === locale || !confirmDiscard()) return;
        setMessage(null);
        setActive(null);
        setLocale(next);
        setData(structuredClone(baseline[next]!));
        setJsonMode(false);
    };

    // ---------- 값 수정 ----------

    const setField = (key: string, value: string) => setData((prev) => (prev ? { ...prev, [key]: value } : prev));

    const setItem = (key: string, index: number, value: string) =>
        setData((prev) => {
            if (!prev) return prev;
            const items = [...((prev[key] as string[]) || [])];
            items[index] = value;
            return { ...prev, [key]: items };
        });

    const updateList = (key: string, fn: (items: string[]) => string[]) =>
        setData((prev) => (prev ? { ...prev, [key]: fn([...((prev[key] as string[]) || [])]) } : prev));

    const addItem = (key: string, at: number) => {
        updateList(key, (items) => {
            items.splice(at, 0, "");
            return items;
        });
        pendingFocus.current = `${key}:${at}`;
    };

    const removeItem = (key: string, index: number) => {
        updateList(key, (items) => {
            items.splice(index, 1);
            return items;
        });
        setActive(null);
        if (index > 0) pendingFocus.current = `${key}:${index - 1}`;
    };

    const moveItem = (key: string, index: number, delta: number) => {
        updateList(key, (items) => {
            const target = index + delta;
            if (target < 0 || target >= items.length) return items;
            [items[index], items[target]] = [items[target], items[index]];
            return items;
        });
        pendingFocus.current = `${key}:${index + delta}`;
    };

    /** 선택 영역을 마크다운 기호로 감싼다 (툴바·단축키) */
    const wrapSelection = (before: string, after: string, placeholder: string) => {
        if (!active) return;
        const el = inputs.current.get(`${active.key}:${active.index}`);
        if (!el) return;
        const value = el.value;
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        const selected = value.slice(start, end) || placeholder;
        const next = value.slice(0, start) + before + selected + after + value.slice(end);
        if (active.index < 0) setField(active.key, next);
        else setItem(active.key, active.index, next);
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start + before.length, start + before.length + selected.length);
        });
    };

    const handleShortcut = (e: React.KeyboardEvent) => {
        if (!(e.ctrlKey || e.metaKey)) return false;
        const k = e.key.toLowerCase();
        if (k === "b") wrapSelection("**", "**", "굵게");
        else if (k === "i") wrapSelection("*", "*", "기울임");
        else if (k === "k") wrapSelection("[", "](https://)", "링크 텍스트");
        else if (k === "e") wrapSelection("`", "`", "code");
        else return false;
        e.preventDefault();
        return true;
    };

    // ---------- 저장 ----------

    const save = async () => {
        if (!data) return;
        setSaving(true);
        setMessage(null);
        const translate = locale === "ko" && autoTranslate;
        try {
            const res = await fetch("/api/admin/static-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page, locale, content: JSON.stringify(data, null, 2), autoTranslate: translate }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "저장 실패");
            setMessage(describeResult(json, translate));
            await load(page, locale);
        } catch (error) {
            setMessage({ type: "error", text: error instanceof Error ? error.message : "저장 실패" });
        } finally {
            setSaving(false);
        }
    };

    const retranslate = async () => {
        if (dirty && !confirm("저장하지 않은 변경 사항은 번역에 반영되지 않습니다. 저장된 한국어 기준으로 번역할까요?")) return;
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/static-pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page, action: "translate" }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "번역 실패");
            setMessage(describeResult(json, true));
            await load(page, locale);
        } catch (error) {
            setMessage({ type: "error", text: error instanceof Error ? error.message : "번역 실패" });
        } finally {
            setSaving(false);
        }
    };

    const resetToDefault = () => {
        if (!defaults[locale] || !confirm("코드에 들어 있는 기본 문구로 되돌릴까요? 저장하기 전까지는 반영되지 않습니다.")) return;
        setData(structuredClone(defaults[locale]!));
        setJsonMode(false);
    };

    // ---------- JSON 고급 편집 ----------

    const toggleJson = () => {
        if (!jsonMode) {
            setJsonText(JSON.stringify(data, null, 2));
            setJsonError(null);
            setJsonMode(true);
            return;
        }
        try {
            const parsed = JSON.parse(jsonText);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("JSON 객체여야 합니다.");
            for (const [key, expected] of Object.entries(template || {})) {
                if (!(key in parsed)) continue;
                const value = parsed[key];
                const ok = Array.isArray(expected)
                    ? Array.isArray(value) && value.every((v: unknown) => typeof v === "string")
                    : typeof value === "string";
                if (!ok) throw new Error(`${key}: ${Array.isArray(expected) ? "문자열 목록" : "문자열"}이어야 합니다.`);
            }
            setData(toEditable(parsed, (template || {}) as Record<string, unknown>));
            setJsonMode(false);
            setJsonError(null);
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : "JSON 오류");
        }
    };

    // ---------- 렌더링 ----------

    const groups = useMemo(() => {
        const result = GROUPS[page].map((g) => ({ ...g, keys: g.keys.filter((k) => data && k in data) }));
        const known = new Set(GROUPS[page].flatMap((g) => g.keys));
        const extra = Object.keys(data || {}).filter((k) => !known.has(k));
        if (extra.length) result.push({ title: "기타", keys: extra });
        return result.filter((g) => g.keys.length);
    }, [page, data]);

    const html = (text: string) => ({ __html: renderInlineMarkdown(text) });

    const renderField = (key: string) => {
        if (!data) return null;
        const meta = FIELDS[page][key] || { label: key };
        const value = data[key];

        if (Array.isArray(value)) {
            return (
                <div key={key} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                        <label className="text-sm font-medium">
                            {meta.label} <span className="text-muted-foreground">({value.length})</span>
                        </label>
                        {meta.hint && <span className="text-right text-xs text-muted-foreground">{meta.hint}</span>}
                    </div>
                    <ol className="space-y-2">
                        {value.map((item, index) => {
                            const id = `${key}:${index}`;
                            const isActive = active?.key === key && active.index === index;
                            return (
                                <li key={index} className="group flex items-start gap-2">
                                    <span className="mt-2 w-6 shrink-0 text-right text-xs text-muted-foreground">{index + 1}</span>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <AutoTextarea
                                            value={item}
                                            inputRef={(el) => {
                                                if (el) inputs.current.set(id, el);
                                                else inputs.current.delete(id);
                                            }}
                                            onFocus={() => setActive({ key, index })}
                                            onChange={(e) => setItem(key, index, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (handleShortcut(e)) return;
                                                // 한글 조합 중 Enter는 글자 확정이므로 무시
                                                const composing = e.nativeEvent.isComposing || e.keyCode === 229;
                                                if (e.key === "Enter" && !e.shiftKey && !composing) {
                                                    e.preventDefault();
                                                    addItem(key, index + 1);
                                                } else if (e.key === "Backspace" && item === "" && value.length > 1) {
                                                    e.preventDefault();
                                                    removeItem(key, index);
                                                }
                                            }}
                                        />
                                        {isActive && item && (
                                            <div
                                                className="rounded-md bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground [&_a]:text-primary [&_code]:rounded [&_code]:bg-muted [&_code]:px-1"
                                                dangerouslySetInnerHTML={html(item)}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-1 flex shrink-0 items-center opacity-60 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                                        <button
                                            type="button"
                                            title="위로"
                                            onClick={() => moveItem(key, index, -1)}
                                            disabled={index === 0}
                                            className="rounded p-1 hover:bg-accent disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            title="아래로"
                                            onClick={() => moveItem(key, index, 1)}
                                            disabled={index === value.length - 1}
                                            className="rounded p-1 hover:bg-accent disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            title="삭제"
                                            onClick={() => removeItem(key, index)}
                                            className="rounded p-1 text-red-500 hover:bg-accent"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                    <Button type="button" variant="outline" size="sm" onClick={() => addItem(key, value.length)}>
                        <Plus className="mr-1 h-4 w-4" />
                        항목 추가
                    </Button>
                </div>
            );
        }

        const id = `${key}:-1`;
        const isActive = active?.key === key && active.index === -1;
        return (
            <div key={key} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    <label className="text-sm font-medium">{meta.label}</label>
                    {meta.hint && <span className="text-right text-xs text-muted-foreground">{meta.hint}</span>}
                </div>
                <AutoTextarea
                    value={value}
                    inputRef={(el) => {
                        if (el) inputs.current.set(id, el);
                        else inputs.current.delete(id);
                    }}
                    onFocus={() => setActive({ key, index: -1 })}
                    onChange={(e) => setField(key, e.target.value)}
                    onKeyDown={(e) => {
                        handleShortcut(e);
                    }}
                />
                {isActive && value && /[*`[\]<~]/.test(value) && (
                    <div className="rounded-md bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground" dangerouslySetInnerHTML={html(value)} />
                )}
            </div>
        );
    };

    const str = (key: string) => (typeof data?.[key] === "string" ? (data[key] as string) : "");
    const items = (key: string) => (Array.isArray(data?.[key]) ? (data[key] as string[]) : []);

    const preview =
        data &&
        (page === "about" ? (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span dangerouslySetInnerHTML={html(str("name"))} /> <span className="text-primary">(arang)</span>
                    </h1>
                    <p className="text-muted-foreground" dangerouslySetInnerHTML={html(str("subtitle"))} />
                </div>
                {[
                    ["career", "careerItems"],
                    ["awards", "awardItems"],
                    ["bugBounty", "bugBountyItems"],
                    ["ctf", "ctfItems"],
                ].map(([title, listKey]) => (
                    <section key={title} className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
                        <h2 className="mb-2 text-lg font-semibold" dangerouslySetInnerHTML={html(str(title))} />
                        <ul className="space-y-1 text-sm">
                            {items(listKey).map((item, i) => (
                                <li key={i} dangerouslySetInnerHTML={html(item)} />
                            ))}
                        </ul>
                    </section>
                ))}
                <section>
                    <h2 className="mb-2 text-lg font-semibold" dangerouslySetInnerHTML={html(str("interests"))} />
                    <div className="flex flex-wrap gap-2">
                        {items("interestItems").map((item, i) => (
                            <span
                                key={i}
                                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                dangerouslySetInnerHTML={html(item)}
                            />
                        ))}
                    </div>
                </section>
                <h2 className="border-t border-border pt-4 text-lg font-semibold" dangerouslySetInnerHTML={html(str("contact"))} />
            </div>
        ) : (
            <div className="space-y-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span dangerouslySetInnerHTML={html(str("heroTitle1"))} />
                    <br />
                    <span className="text-primary">&amp;</span> <span dangerouslySetInnerHTML={html(str("heroTitle2"))} />
                </h1>
                <p className="text-muted-foreground">
                    <span dangerouslySetInnerHTML={html(str("heroDescription1"))} />
                    <br />
                    <span dangerouslySetInnerHTML={html(str("heroDescription2"))} />
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {["blogPosts", "ctfWriteups", "about"].map((key) => (
                        <span
                            key={key}
                            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium"
                            dangerouslySetInnerHTML={html(str(key))}
                        />
                    ))}
                </div>
                <div className="font-mono text-sm text-muted-foreground">
                    <span className="text-primary">$</span> <span dangerouslySetInnerHTML={html(str("whoami"))} />
                    <br />
                    <span className="text-muted-foreground/60" dangerouslySetInnerHTML={html(str("role"))} />
                </div>
            </div>
        ));

    const tools = [
        { icon: <Bold className="h-4 w-4" />, title: "굵게 (Ctrl+B)", run: () => wrapSelection("**", "**", "굵게") },
        { icon: <Italic className="h-4 w-4" />, title: "기울임 (Ctrl+I)", run: () => wrapSelection("*", "*", "기울임") },
        { icon: <Strikethrough className="h-4 w-4" />, title: "취소선", run: () => wrapSelection("~~", "~~", "취소선") },
        { icon: <Code className="h-4 w-4" />, title: "코드 (Ctrl+E)", run: () => wrapSelection("`", "`", "code") },
        { icon: <Link2 className="h-4 w-4" />, title: "링크 (Ctrl+K)", run: () => wrapSelection("[", "](https://)", "링크 텍스트") },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">정적 페이지 편집</h1>
                    <p className="text-sm text-muted-foreground">
                        Home, About 문구를 항목별로 편집합니다. 한국어로 저장하면 다른 언어로 자동 번역됩니다.
                    </p>
                </div>
                <Link href="/admin">
                    <Button variant="outline">← 관리자 홈</Button>
                </Link>
            </div>

            {/* Page + Locale */}
            <div className="flex flex-wrap items-center gap-2">
                <Button variant={page === "home" ? "default" : "outline"} onClick={() => switchPage("home")}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                </Button>
                <Button variant={page === "about" ? "default" : "outline"} onClick={() => switchPage("about")}>
                    <User className="mr-2 h-4 w-4" />
                    About
                </Button>
                <div className="mx-2 h-6 w-px bg-border" />
                {LOCALES.map(({ code, label }) => (
                    <Button key={code} size="sm" variant={locale === code ? "default" : "ghost"} onClick={() => switchLocale(code)}>
                        {label}
                        {!loading && !savedLocales.includes(code) && <span className="ml-1 text-xs opacity-60">기본값</span>}
                    </Button>
                ))}
            </div>

            {locale !== "ko" && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm">
                    한국어에서 자동 번역과 함께 저장하면 이 언어는 번역 결과로 덮어써집니다. 여기서 직접 고친 내용은 이 언어에만 저장됩니다.
                </div>
            )}

            {/* Toolbar */}
            <div className="sticky top-14 z-20 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background/95 p-2 backdrop-blur">
                {tools.map((tool) => (
                    <Button
                        key={tool.title}
                        type="button"
                        variant="ghost"
                        size="sm"
                        title={tool.title}
                        disabled={!active || jsonMode}
                        onMouseDown={(e) => e.preventDefault()} // 입력란 포커스 유지
                        onClick={tool.run}
                    >
                        {tool.icon}
                    </Button>
                ))}
                <span className="ml-2 hidden text-xs text-muted-foreground md:inline">
                    목록에서 Enter는 새 항목, Shift+Enter는 줄바꿈 · HTML도 그대로 쓸 수 있습니다
                </span>
                <div className="ml-auto flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="hidden lg:inline-flex">
                        미리보기 {showPreview ? "숨기기" : "보기"}
                    </Button>
                    <Button type="button" variant={jsonMode ? "default" : "ghost"} size="sm" onClick={toggleJson} title="JSON 직접 편집">
                        <Braces className="mr-1 h-4 w-4" />
                        {jsonMode ? "JSON 적용" : "JSON"}
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {message.text}
                </div>
            )}

            {loading || !data ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className={showPreview ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]" : ""}>
                    {/* Form */}
                    <div className="space-y-4">
                        {jsonMode ? (
                            <div className="space-y-2">
                                <textarea
                                    value={jsonText}
                                    onChange={(e) => setJsonText(e.target.value)}
                                    className="h-[640px] w-full rounded-lg border border-border bg-card p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                    spellCheck={false}
                                />
                                {jsonError && <p className="text-sm text-red-500">{jsonError}</p>}
                                <p className="text-xs text-muted-foreground">편집 후 위의 &quot;JSON 적용&quot;을 누르면 입력란으로 돌아갑니다.</p>
                            </div>
                        ) : (
                            groups.map((group) => (
                                <div key={group.title} className="space-y-4 rounded-lg border border-border p-4">
                                    <h2 className="font-semibold">{group.title}</h2>
                                    {group.keys.map(renderField)}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Preview */}
                    {showPreview && (
                        <div className="hidden lg:block">
                            <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-lg border border-border p-6">
                                <div className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">미리보기</div>
                                {preview}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 py-3 backdrop-blur">
                <Button onClick={save} disabled={saving || loading || jsonMode || !data}>
                    {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? "저장 중..." : "저장"}
                </Button>
                {locale === "ko" && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} />
                        저장할 때 영어·일본어·중국어 자동 번역
                    </label>
                )}
                {dirty && <span className="text-sm text-amber-500">저장하지 않은 변경 사항이 있습니다</span>}
                <div className="ml-auto flex flex-wrap gap-2">
                    {locale === "ko" && (
                        <Button variant="outline" onClick={retranslate} disabled={saving || loading}>
                            <Globe className="mr-2 h-4 w-4" />
                            번역만 다시 실행
                        </Button>
                    )}
                    <Button variant="outline" onClick={resetToDefault} disabled={saving || loading}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        기본값으로
                    </Button>
                </div>
            </div>
        </div>
    );
}
