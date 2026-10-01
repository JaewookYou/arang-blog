import { TRANSLATION_LOCALES, type TranslationLocale } from "@/lib/i18n";
import {
    clearTranslationJob,
    listTranslationJobs,
    listTranslations,
    resetStaleTranslationJobs,
    saveTranslation,
    setTranslationJob,
    type Translation,
    type TranslationJob,
} from "@/lib/db";
import { GeminiQuotaError, getGeminiModels, isGeminiConfigured } from "@/lib/gemini";
import { computeSourceHash, getSourceItem, getSourceItems, isSourceVisible, type ContentType, type SourceItem } from "./source";
import { inspectStoredTranslation, PROBLEM_LABELS } from "./validate";
import { translateDocument } from "./translate";

/**
 * 번역 상태 계산 + 백그라운드 번역 작업 대기열
 *
 * - 원문(velite)과 DB 번역을 비교해 언어별 상태(최신/오래됨/문제/없음/실패/진행 중)를 계산한다.
 * - 번역 작업은 프로세스 안의 대기열에서 하나씩 처리하고, 진행/실패 상태는 translation_jobs 테이블에 남긴다.
 * - 서버 시작 시(instrumentation)와 주기적으로 누락·오래된 번역을 자동으로 채운다.
 */

export type LocaleState = "ok" | "stale" | "invalid" | "missing" | "queued" | "running" | "failed";

export interface LocaleStatus {
    locale: TranslationLocale;
    state: LocaleState;
    title?: string;
    updatedAt?: string;
    model?: string | null;
    legacy?: boolean; // 원문 해시 없이 저장된 예전 번역
    problems?: string[];
    error?: string | null;
    attempts?: number;
}

export interface ItemStatus {
    type: ContentType;
    slug: string;
    title: string;
    date: string;
    visible: boolean;
    locales: Record<TranslationLocale, LocaleStatus>;
}

export interface OrphanTranslation {
    slug: string;
    type: string;
    locale: string;
    title: string;
    updatedAt: string;
}

export interface TranslationOverview {
    items: ItemStatus[];
    orphans: OrphanTranslation[];
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

const key = (type: string, slug: string, locale: string) => `${type}/${slug}/${locale}`;

export function isAutoTranslateEnabled(): boolean {
    return process.env.AUTO_TRANSLATE !== "false" && isGeminiConfigured();
}

function computeLocaleStatus(
    item: SourceItem,
    locale: TranslationLocale,
    translation: Translation | undefined,
    job: TranslationJob | undefined
): LocaleStatus {
    const status: LocaleStatus = { locale, state: "missing" };

    if (translation) {
        status.title = translation.title;
        status.updatedAt = translation.updated_at;
        status.model = translation.model;
        status.legacy = !translation.source_hash;

        const problems = inspectStoredTranslation(translation.content, item.html, locale);
        if (problems.length > 0) {
            status.state = "invalid";
            status.problems = problems.map((p) => PROBLEM_LABELS[p]);
        } else if (translation.source_hash && translation.source_hash !== item.hash) {
            status.state = "stale";
        } else {
            status.state = "ok";
        }
    }

    if (job) {
        status.attempts = job.attempts;
        if (job.status === "queued" || job.status === "running") {
            status.state = job.status;
        } else if (job.status === "failed") {
            status.error = job.error;
            if (!translation) status.state = "failed";
        }
    }

    return status;
}

export function getTranslationOverview(): TranslationOverview {
    const translations = listTranslations();
    const jobs = listTranslationJobs();
    const trMap = new Map(translations.map((t) => [key(t.type, t.slug, t.locale), t]));
    const jobMap = new Map(jobs.map((j) => [key(j.type, j.slug, j.locale), j]));
    const sources = getSourceItems();
    const sourceKeys = new Set(sources.map((s) => `${s.type}/${s.slug}`));

    const summary: Record<LocaleState, number> = {
        ok: 0, stale: 0, invalid: 0, missing: 0, queued: 0, running: 0, failed: 0,
    };

    const items: ItemStatus[] = sources
        .map((item) => {
            const locales = {} as Record<TranslationLocale, LocaleStatus>;
            for (const locale of TRANSLATION_LOCALES) {
                const k = key(item.type, item.slug, locale);
                locales[locale] = computeLocaleStatus(item, locale, trMap.get(k), jobMap.get(k));
                summary[locales[locale].state]++;
            }
            return {
                type: item.type,
                slug: item.slug,
                title: item.title,
                date: item.date,
                visible: isSourceVisible(item),
                locales,
            };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const orphans = translations
        .filter((t) => !sourceKeys.has(`${t.type}/${t.slug}`))
        .map((t) => ({ slug: t.slug, type: t.type, locale: t.locale, title: t.title, updatedAt: t.updated_at }));

    const q = queue();
    return {
        items,
        orphans,
        summary,
        config: {
            geminiConfigured: isGeminiConfigured(),
            models: getGeminiModels(),
            autoTranslate: isAutoTranslateEnabled(),
            queueLength: q.tasks.length,
            running: q.running ? { type: q.running.type, slug: q.running.slug, locale: q.running.locale } : null,
            pausedUntil: q.pausedUntil ? new Date(q.pausedUntil).toISOString() : null,
            pauseReason: q.pauseReason,
        },
    };
}

/** 특정 글의 언어별 상태 (글 페이지에서 오래된 번역 안내용) */
export function getLocaleStatus(type: string, slug: string, locale: TranslationLocale): LocaleStatus | null {
    const item = getSourceItem(type, slug);
    if (!item) return null;
    const translation = listTranslations().find((t) => t.type === type && t.slug === slug && t.locale === locale);
    const job = listTranslationJobs().find((j) => j.type === type && j.slug === slug && j.locale === locale);
    return computeLocaleStatus(item, locale, translation, job);
}

// ============ 작업 대기열 ============

export interface ProvidedSource {
    title: string;
    description: string;
    markdown: string;
}

interface QueueTask {
    type: ContentType;
    slug: string;
    locale: TranslationLocale;
    source?: ProvidedSource; // 관리자 편집기에서 보낸 원문 (배포 전 콘텐츠)
    reason: string;
}

interface QueueState {
    tasks: QueueTask[];
    running: QueueTask | null;
    worker: Promise<void> | null;
    pausedUntil: number | null;
    pauseReason: string | null;
    autoStarted: boolean;
}

const QUEUE_KEY = Symbol.for("arang.blog.translationQueue");
function queue(): QueueState {
    const g = globalThis as unknown as Record<symbol, QueueState | undefined>;
    if (!g[QUEUE_KEY]) {
        g[QUEUE_KEY] = { tasks: [], running: null, worker: null, pausedUntil: null, pauseReason: null, autoStarted: false };
    }
    return g[QUEUE_KEY]!;
}

const QUOTA_PAUSE_MS = 60 * 60 * 1000; // 한도 초과 시 1시간 동안 자동 번역 중지
const MAX_AUTO_ATTEMPTS = 3; // 같은 원문으로 이 횟수만큼 실패하면 자동 재시도 중단

export interface EnqueueRequest {
    type: ContentType;
    slug: string;
    locales?: TranslationLocale[];
    source?: ProvidedSource;
    reason?: string;
    /** 같은 원문으로 이미 번역된 언어는 건너뛴다 (태그만 바꾼 수정 등) */
    skipUpToDate?: boolean;
}

export function enqueueTranslations(requests: EnqueueRequest[]): { queued: number } {
    if (!isGeminiConfigured()) {
        throw new Error("GEMINI_API_KEY가 설정되지 않아 번역할 수 없습니다.");
    }
    const q = queue();
    let queued = 0;

    for (const request of requests) {
        let locales = request.locales?.length ? request.locales : [...TRANSLATION_LOCALES];
        if (request.skipUpToDate) {
            const source = request.source ?? getSourceItem(request.type, request.slug);
            if (source) {
                const hash = computeSourceHash(source);
                const current = new Map(
                    listTranslations()
                        .filter((t) => t.type === request.type && t.slug === request.slug)
                        .map((t) => [t.locale, t.source_hash])
                );
                locales = locales.filter((locale) => current.get(locale) !== hash);
            }
        }
        for (const locale of locales) {
            const task: QueueTask = {
                type: request.type,
                slug: request.slug,
                locale,
                source: request.source,
                reason: request.reason || "manual",
            };
            const existing = q.tasks.findIndex(
                (t) => t.type === task.type && t.slug === task.slug && t.locale === task.locale
            );
            if (existing >= 0) {
                q.tasks[existing] = task; // 최신 원문으로 교체
            } else {
                q.tasks.push(task);
            }
            setTranslationJob(task, "queued");
            queued++;
        }
    }

    // 수동 요청은 자동 번역 일시정지를 해제한다
    if (requests.some((r) => (r.reason || "manual") === "manual")) {
        q.pausedUntil = null;
        q.pauseReason = null;
    }

    startWorker();
    return { queued };
}

function startWorker() {
    const q = queue();
    if (q.worker) return;
    q.worker = processQueue().finally(() => {
        q.worker = null;
        q.running = null;
        // 마지막 작업이 끝나는 사이에 새 작업이 들어왔다면 다시 시작
        if (q.tasks.length > 0) startWorker();
    });
}

const sameKey = (a: QueueTask, b: QueueTask) => a.type === b.type && a.slug === b.slug && a.locale === b.locale;

function taskSource(task: QueueTask): ProvidedSource | null {
    const item = getSourceItem(task.type, task.slug);
    return task.source ?? (item ? { title: item.title, description: item.description, markdown: item.markdown } : null);
}

async function runTask(task: QueueTask): Promise<void> {
    const source = taskSource(task);
    if (!source || !source.markdown.trim()) {
        throw new Error("원문을 찾을 수 없습니다. 글이 배포되었는지 확인하세요.");
    }

    const result = await translateDocument({
        title: source.title,
        description: source.description,
        markdown: source.markdown,
        locale: task.locale,
    });

    saveTranslation({
        slug: task.slug,
        type: task.type,
        locale: task.locale,
        title: result.title,
        description: result.description || null,
        content: result.html,
        contentMd: result.markdown,
        sourceHash: computeSourceHash(source),
        model: result.model,
    });

    if (result.warnings.length) {
        console.warn(`[translation] ${key(task.type, task.slug, task.locale)} 경고: ${result.warnings.join("; ")}`);
    }
}

async function processQueue(): Promise<void> {
    const q = queue();
    while (q.tasks.length > 0) {
        const task = q.tasks.shift()!;
        q.running = task;
        const label = key(task.type, task.slug, task.locale);
        const source = taskSource(task);
        const sourceHash = source ? computeSourceHash(source) : null;
        setTranslationJob(task, "running", { sourceHash });
        const started = Date.now();

        try {
            await runTask(task);
            // 번역 중에 같은 글·언어 요청이 다시 들어왔으면 그 작업의 '대기' 상태를 유지한다
            if (q.tasks.some((t) => sameKey(t, task))) setTranslationJob(task, "queued");
            else clearTranslationJob(task);
            console.log(`[translation] ${label} 완료 (${((Date.now() - started) / 1000).toFixed(0)}s, ${task.reason})`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const pendingAgain = q.tasks.some((t) => sameKey(t, task));
            // 사용 한도 초과는 글의 문제가 아니므로 실패 횟수에 넣지 않는다
            setTranslationJob(task, pendingAgain ? "queued" : "failed", {
                error: message,
                sourceHash,
                countAttempt: !(error instanceof GeminiQuotaError),
            });
            console.error(`[translation] ${label} 실패: ${message}`);

            if (error instanceof GeminiQuotaError) {
                // 남은 작업도 같은 이유로 실패하므로 모두 실패 처리하고 잠시 멈춘다
                for (const rest of q.tasks.splice(0)) {
                    setTranslationJob(rest, "failed", { error: message });
                }
                q.pausedUntil = Date.now() + QUOTA_PAUSE_MS;
                q.pauseReason = message;
                break;
            }
        }
    }
    q.running = null;
}

export interface SyncOptions {
    reason?: string;
    retryFailed?: boolean; // 실패한 작업도 즉시 다시 시도 (수동 실행 기본값)
}

/** 누락·오래됨·문제 있는 번역(공개된 글만)을 대기열에 넣는다 */
export function syncTranslations(options: SyncOptions = {}): { queued: number; skipped?: string } {
    const reason = options.reason || "manual";
    const q = queue();
    if (reason !== "manual" && q.pausedUntil && Date.now() < q.pausedUntil) {
        return { queued: 0, skipped: q.pauseReason || "paused" };
    }

    const overview = getTranslationOverview();
    const failedCooldownMs = 60 * 60 * 1000;
    const retryFailed = options.retryFailed ?? reason === "manual";
    const jobs = new Map(listTranslationJobs().map((j) => [key(j.type, j.slug, j.locale), j]));
    const sourceHashes = new Map(getSourceItems().map((item) => [`${item.type}/${item.slug}`, item.hash]));
    const requests: EnqueueRequest[] = [];

    for (const item of overview.items) {
        if (!item.visible) continue;
        const locales: TranslationLocale[] = [];
        for (const locale of TRANSLATION_LOCALES) {
            const status = item.locales[locale];
            const job = jobs.get(key(item.type, item.slug, locale));
            const failedRecently =
                job?.status === "failed" &&
                Date.now() - new Date(`${job.updated_at.replace(" ", "T")}Z`).getTime() < failedCooldownMs;

            if (status.state === "queued" || status.state === "running") continue;
            if (job?.status === "failed" && !retryFailed) {
                // 자동 실행은 최근 실패한 작업을 쿨다운 동안 건너뛰고,
                // 같은 원문으로 여러 번 실패했으면 더 이상 자동으로 시도하지 않는다 (수동 실행은 항상 재시도)
                const sameSource = job.source_hash === sourceHashes.get(`${item.type}/${item.slug}`);
                if (failedRecently) continue;
                if (sameSource && job.attempts >= MAX_AUTO_ATTEMPTS) continue;
            }

            if (["missing", "stale", "invalid", "failed"].includes(status.state)) locales.push(locale);
        }
        if (locales.length) requests.push({ type: item.type, slug: item.slug, locales, reason });
    }

    if (requests.length === 0) return { queued: 0 };
    return enqueueTranslations(requests);
}

/** 서버 시작 시 1회 호출: 중단된 작업 정리 후 자동 번역 시작 */
export function startAutoTranslation(): void {
    const q = queue();
    if (q.autoStarted) return;
    q.autoStarted = true;

    try {
        const cleared = resetStaleTranslationJobs();
        if (cleared) console.log(`[translation] 중단된 작업 ${cleared}건 정리`);
    } catch (error) {
        console.error("[translation] 작업 정리 실패:", error);
    }

    if (!isAutoTranslateEnabled()) {
        console.log("[translation] 자동 번역 비활성화 (AUTO_TRANSLATE=false 또는 GEMINI_API_KEY 없음)");
        return;
    }

    const run = (reason: string) => {
        try {
            const result = syncTranslations({ reason });
            if (result.queued) console.log(`[translation] 자동 번역 ${result.queued}건 예약 (${reason})`);
        } catch (error) {
            console.error("[translation] 자동 번역 동기화 실패:", error);
        }
    };

    setTimeout(() => run("startup"), 20_000).unref?.();
    setInterval(() => run("periodic"), 6 * 60 * 60 * 1000).unref?.();
}
