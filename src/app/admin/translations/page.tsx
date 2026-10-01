"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    Flag,
    Globe,
    Loader2,
    Pencil,
    RefreshCw,
    Sparkles,
    Trash2,
    XCircle,
} from "lucide-react";

/**
 * Admin Translations Page
 * 글별·언어별 번역 상태를 한눈에 보고, 누락/오래된 번역을 생성하거나 다시 번역한다.
 */

type LocaleState = "ok" | "stale" | "invalid" | "missing" | "queued" | "running" | "failed";
type TranslationLocale = "en" | "ja" | "zh";

interface LocaleStatus {
    locale: TranslationLocale;
    state: LocaleState;
    title?: string;
    updatedAt?: string;
    model?: string | null;
    legacy?: boolean;
    problems?: string[];
    error?: string | null;
    attempts?: number;
}

interface ItemStatus {
    type: "post" | "writeup";
    slug: string;
    title: string;
    date: string;
    visible: boolean;
    locales: Record<TranslationLocale, LocaleStatus>;
}

interface Overview {
    items: ItemStatus[];
    orphans: { slug: string; type: string; locale: string; title: string; updatedAt: string }[];
    summary: Record<LocaleState, number>;
    config: {
        geminiConfigured: boolean;
        models: string[];
        autoTranslate: boolean;
        queueLength: number;
        running: { type: string; slug: string; locale: string } | null;
        pausedUntil: string | null;
        pauseReason: string | null;
    };
}

const LOCALES: { code: TranslationLocale; label: string }[] = [
    { code: "en", label: "🇺🇸 EN" },
    { code: "ja", label: "🇯🇵 JA" },
    { code: "zh", label: "🇨🇳 ZH" },
];

const STATE_INFO: Record<LocaleState, { label: string; className: string; icon: React.ReactNode }> = {
    ok: { label: "최신", className: "bg-green-500/10 text-green-500 border-green-500/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    stale: { label: "원문 변경", className: "bg-amber-500/10 text-amber-500 border-amber-500/30", icon: <Clock className="h-3.5 w-3.5" /> },
    invalid: { label: "문제", className: "bg-red-500/10 text-red-500 border-red-500/30", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    missing: { label: "없음", className: "bg-muted text-muted-foreground border-border", icon: <XCircle className="h-3.5 w-3.5" /> },
    failed: { label: "실패", className: "bg-red-500/10 text-red-500 border-red-500/30", icon: <XCircle className="h-3.5 w-3.5" /> },
    queued: { label: "대기", className: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: <Clock className="h-3.5 w-3.5" /> },
    running: { label: "번역 중", className: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
};

const NEEDS_ATTENTION: LocaleState[] = ["stale", "invalid", "missing", "failed"];

function formatTime(value?: string) {
    if (!value) return "";
    const d = new Date(/Z|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.replace(" ", "T")}Z`);
    return d.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });
}

export default function TranslationsPage() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"post" | "writeup">("post");
    const [onlyAttention, setOnlyAttention] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/translations", { cache: "no-store" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "불러오기 실패");
            setOverview(data);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : "불러오기 실패");
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // 작업이 진행 중이면 5초마다 갱신
    const active = Boolean(overview && (overview.config.running || overview.config.queueLength > 0));
    useEffect(() => {
        const timer = setInterval(load, active ? 5000 : 30000);
        return () => clearInterval(timer);
    }, [active, load]);

    const post = async (body: object, key: string, success: (data: Record<string, unknown>) => string) => {
        setBusy(key);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "요청 실패");
            setMessage(success(data));
            await load();
        } catch (e) {
            setMessage(`❌ ${e instanceof Error ? e.message : "요청 실패"}`);
        } finally {
            setBusy(null);
        }
    };

    const syncAll = () =>
        post({ action: "sync" }, "sync", (d) =>
            Number(d.queued) > 0 ? `✅ 번역 ${d.queued}건을 시작했습니다.` : "모든 번역이 최신 상태입니다."
        );

    const translate = (item: ItemStatus, locales?: TranslationLocale[]) =>
        post(
            { action: "translate", type: item.type, slug: item.slug, locales },
            `${item.type}/${item.slug}/${locales?.join(",") || "all"}`,
            (d) => `✅ ${item.title} — ${d.queued}개 언어 번역을 시작했습니다.`
        );

    const deleteOrphans = () => {
        if (!overview?.orphans.length) return;
        if (!confirm(`원문이 없는 번역 ${overview.orphans.length}건을 삭제할까요?`)) return;
        post({ action: "delete-orphans" }, "orphans", (d) => `🗑️ ${d.deleted}건 삭제했습니다.`);
    };

    const items = useMemo(() => {
        if (!overview) return [];
        return overview.items
            .filter((item) => item.type === activeTab)
            .filter((item) => !onlyAttention || LOCALES.some((l) => NEEDS_ATTENTION.includes(item.locales[l.code].state)));
    }, [overview, activeTab, onlyAttention]);

    const attentionCount = overview
        ? NEEDS_ATTENTION.reduce((sum, state) => sum + (overview.summary[state] || 0), 0)
        : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        <h1 className="text-2xl font-bold">번역 관리</h1>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={load}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    새로고침
                </Button>
            </div>

            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

            {!overview ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <>
                    {/* 설정/상태 */}
                    <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                            <span>
                                Gemini:{" "}
                                {overview.config.geminiConfigured ? (
                                    <span className="text-green-500">설정됨</span>
                                ) : (
                                    <span className="text-red-500">GEMINI_API_KEY 없음</span>
                                )}
                            </span>
                            <span>
                                자동 번역:{" "}
                                {overview.config.autoTranslate ? (
                                    <span className="text-green-500">켜짐 (서버 시작 시·6시간마다)</span>
                                ) : (
                                    <span className="text-muted-foreground">꺼짐</span>
                                )}
                            </span>
                            <span className="text-muted-foreground">모델: {overview.config.models.join(" → ")}</span>
                        </div>
                        {(overview.config.running || overview.config.queueLength > 0) && (
                            <div className="flex items-center gap-2 text-blue-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {overview.config.running
                                    ? `번역 중: ${overview.config.running.slug} (${overview.config.running.locale})`
                                    : "번역 대기 중"}
                                {overview.config.queueLength > 0 && ` · 대기 ${overview.config.queueLength}건`}
                            </div>
                        )}
                        {overview.config.pauseReason && (
                            <div className="flex items-start gap-2 text-red-500">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    자동 번역 일시 중지{overview.config.pausedUntil && ` (${formatTime(overview.config.pausedUntil)}까지)`}:{" "}
                                    {overview.config.pauseReason}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 요약 + 일괄 작업 */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                            {(Object.keys(STATE_INFO) as LocaleState[])
                                .filter((state) => overview.summary[state] > 0)
                                .map((state) => (
                                    <span key={state} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 ${STATE_INFO[state].className}`}>
                                        {STATE_INFO[state].icon}
                                        {STATE_INFO[state].label} {overview.summary[state]}
                                    </span>
                                ))}
                        </div>
                        <Button onClick={syncAll} disabled={busy === "sync" || !overview.config.geminiConfigured}>
                            {busy === "sync" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            누락·오래된 번역 모두 생성{attentionCount > 0 && ` (${attentionCount})`}
                        </Button>
                    </div>

                    {message && <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">{message}</div>}

                    {/* 탭 */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant={activeTab === "post" ? "default" : "outline"} onClick={() => setActiveTab("post")}>
                            <FileText className="mr-2 h-4 w-4" />
                            Posts
                        </Button>
                        <Button variant={activeTab === "writeup" ? "default" : "outline"} onClick={() => setActiveTab("writeup")}>
                            <Flag className="mr-2 h-4 w-4" />
                            Writeups
                        </Button>
                        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" checked={onlyAttention} onChange={(e) => setOnlyAttention(e.target.checked)} />
                            확인이 필요한 글만
                        </label>
                    </div>

                    {/* 목록 */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3 text-left">글</th>
                                    {LOCALES.map((l) => (
                                        <th key={l.code} className="p-3 text-left whitespace-nowrap">
                                            {l.label}
                                        </th>
                                    ))}
                                    <th className="p-3 text-right">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const basePath = item.type === "post" ? "/posts" : "/writeups";
                                    const rowKey = `${item.type}/${item.slug}`;
                                    return (
                                        <tr key={rowKey} className="border-t border-border align-top">
                                            <td className="p-3 min-w-[220px]">
                                                <div className="font-medium">{item.title}</div>
                                                <div className="mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                                                    {item.slug}
                                                    {!item.visible && <span className="rounded bg-muted px-1.5">비공개/예약</span>}
                                                    <Link href={`${basePath}/${encodeURIComponent(item.slug)}`} target="_blank" className="hover:text-primary">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </td>
                                            {LOCALES.map(({ code }) => {
                                                const status = item.locales[code];
                                                const info = STATE_INFO[status.state];
                                                const detail = [
                                                    status.title,
                                                    status.updatedAt && `수정: ${formatTime(status.updatedAt)}`,
                                                    status.model && `모델: ${status.model}`,
                                                    ...(status.problems || []),
                                                    status.error && `오류: ${status.error}`,
                                                ]
                                                    .filter(Boolean)
                                                    .join("\n");
                                                const busyKey = `${rowKey}/${code}`;
                                                return (
                                                    <td key={code} className="p-3">
                                                        <div className="flex flex-col items-start gap-1.5">
                                                            <span
                                                                title={detail}
                                                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${info.className}`}
                                                            >
                                                                {info.icon}
                                                                {info.label}
                                                            </span>
                                                            {(status.problems?.length || status.error) && (
                                                                <span className="max-w-[180px] text-xs text-red-400 line-clamp-2" title={detail}>
                                                                    {status.problems?.[0] || status.error}
                                                                </span>
                                                            )}
                                                            <div className="flex gap-1">
                                                                <Link
                                                                    href={`/admin/translations/${encodeURIComponent(item.slug)}?type=${item.type}&locale=${code}`}
                                                                    title="편집"
                                                                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    title="이 언어만 다시 번역"
                                                                    disabled={busy === busyKey || status.state === "running" || status.state === "queued"}
                                                                    onClick={() => {
                                                                        setBusy(busyKey);
                                                                        translate(item, [code]);
                                                                    }}
                                                                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                                                                >
                                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={busy === `${rowKey}/all`}
                                                    onClick={() => translate(item)}
                                                >
                                                    <Sparkles className="mr-1 h-4 w-4" />
                                                    전체 재번역
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                                            {onlyAttention ? "확인이 필요한 글이 없습니다." : "글이 없습니다."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 고아 번역 */}
                    {overview.orphans.length > 0 && (
                        <div className="space-y-3 rounded-lg border border-border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold">원문이 없는 번역 ({overview.orphans.length})</h2>
                                    <p className="text-sm text-muted-foreground">삭제되었거나 이름이 바뀐 글, 테스트로 만든 번역입니다.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={deleteOrphans} disabled={busy === "orphans"}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    모두 삭제
                                </Button>
                            </div>
                            <ul className="space-y-1 font-mono text-xs text-muted-foreground">
                                {overview.orphans.map((o) => (
                                    <li key={`${o.type}/${o.slug}/${o.locale}`}>
                                        {o.type}/{o.slug} ({o.locale}) — {o.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
