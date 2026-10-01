import { GoogleGenAI, ApiError, ThinkingLevel, type Schema, type ThinkingConfig } from "@google/genai";

/**
 * Gemini 호출 래퍼
 *
 * 예전 코드는 모델 이름(gemini-2.0-flash, gemini-3-pro-preview)을 하드코딩해서
 * 해당 모델이 종료되자 번역이 조용히 실패했다. 여기서는
 *  - GEMINI_MODEL(쉼표 구분) → 기본 모델 목록 순서로 시도하고
 *  - 모델이 없거나(404) 지원하지 않으면 다음 모델로 넘어가며
 *  - 429/5xx는 지수 백오프로 재시도하고
 *  - JSON 모드(responseSchema)로 응답을 받아 파싱 오류를 없앤다.
 */

export const DEFAULT_GEMINI_MODELS = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-2.5-flash"];

export function isGeminiConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiModels(): string[] {
    const configured = (process.env.GEMINI_MODEL || "")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    return [...new Set([...configured, ...DEFAULT_GEMINI_MODELS])];
}

export class GeminiError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = "GeminiError";
    }
}

/** 프로젝트 지출 한도/할당량 소진 — 재시도해도 소용없으므로 즉시 중단한다 */
export class GeminiQuotaError extends GeminiError {
    constructor(message: string) {
        super(message, 429);
        this.name = "GeminiQuotaError";
    }
}

interface GeminiState {
    client: GoogleGenAI | null;
    apiKey: string | null;
    unavailable: Set<string>;
    lastWorkingModel: string | null;
}

// 라우트 핸들러와 instrumentation이 서로 다른 번들이어도 같은 상태를 공유하도록 globalThis에 둔다
const STATE_KEY = Symbol.for("arang.blog.gemini");
function state(): GeminiState {
    const g = globalThis as unknown as Record<symbol, GeminiState | undefined>;
    if (!g[STATE_KEY]) {
        g[STATE_KEY] = { client: null, apiKey: null, unavailable: new Set(), lastWorkingModel: null };
    }
    return g[STATE_KEY]!;
}

function getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new GeminiError("GEMINI_API_KEY가 설정되지 않았습니다.");
    const s = state();
    if (!s.client || s.apiKey !== apiKey) {
        s.client = new GoogleGenAI({ apiKey });
        s.apiKey = apiKey;
    }
    return s.client;
}

export interface GenerateJsonOptions {
    system: string;
    prompt: string;
    schema: Schema;
    temperature?: number;
    maxOutputTokens?: number;
}

export interface GenerateJsonResult<T> {
    data: T;
    model: string;
    finishReason: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function errorStatus(error: unknown): number | undefined {
    if (error instanceof ApiError) return error.status;
    const status = (error as { status?: unknown })?.status;
    return typeof status === "number" ? status : undefined;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

/** 모델 자체를 쓸 수 없는 오류인지 (다음 모델로 넘어가야 하는지) */
function isModelUnavailable(error: unknown): boolean {
    const status = errorStatus(error);
    const message = errorMessage(error).toLowerCase();
    if (status === 404) return true;
    return (
        (status === 400 || status === 403) &&
        /(model|not found|not supported|unsupported|deprecated|no longer available)/.test(message)
    );
}

/**
 * 지출 한도(spending cap)나 일/월 할당량 소진 여부
 * 무료 등급의 분당 제한(PerMinute)도 "exceeded your current quota"라는 문구를 쓰므로
 * 그것은 기다렸다가 재시도하고, 한도/일·월 할당량일 때만 중단한다.
 */
function isQuotaExhausted(error: unknown): boolean {
    if (errorStatus(error) !== 429) return false;
    const message = errorMessage(error);
    return /spending cap|spend cap|PerDay|per day|PerMonth|per month|monthly/i.test(message);
}

/** 429 응답에 들어 있는 재시도 대기 시간 (예: "retryDelay": "37s") */
function retryDelayMs(error: unknown): number | null {
    const match = errorMessage(error).match(/retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/);
    return match ? Math.min(60000, Math.ceil(parseFloat(match[1]) * 1000)) : null;
}

function isRetryable(error: unknown): boolean {
    const status = errorStatus(error);
    if (status === undefined) return true; // 네트워크 오류 등
    return status === 408 || status === 429 || status >= 500;
}

function thinkingConfigFor(model: string): ThinkingConfig | undefined {
    // Gemini 2.x는 thinkingBudget, 3.x 이상은 thinkingLevel을 사용한다
    if (/^gemini-2\./.test(model)) {
        return /flash/.test(model) ? { thinkingBudget: 0 } : undefined;
    }
    return { thinkingLevel: ThinkingLevel.LOW };
}

export async function generateJson<T>(options: GenerateJsonOptions): Promise<GenerateJsonResult<T>> {
    const client = getClient();
    const s = state();
    const models = getGeminiModels().filter((m) => !s.unavailable.has(m));
    if (s.lastWorkingModel && models.includes(s.lastWorkingModel)) {
        models.splice(models.indexOf(s.lastWorkingModel), 1);
        models.unshift(s.lastWorkingModel);
    }
    if (models.length === 0) {
        s.unavailable.clear(); // 모두 실패로 표시되었다면 다음 호출에서 다시 시도
        throw new GeminiError("사용 가능한 Gemini 모델이 없습니다. GEMINI_MODEL 설정을 확인하세요.");
    }

    let lastError: unknown = null;

    for (const model of models) {
        let useThinking = true;
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const thinkingConfig = useThinking ? thinkingConfigFor(model) : undefined;
                const response = await client.models.generateContent({
                    model,
                    contents: options.prompt,
                    config: {
                        systemInstruction: options.system,
                        responseMimeType: "application/json",
                        responseSchema: options.schema,
                        temperature: options.temperature ?? 0.2,
                        maxOutputTokens: options.maxOutputTokens ?? 32768,
                        ...(thinkingConfig ? { thinkingConfig } : {}),
                    },
                });

                const candidate = response.candidates?.[0];
                const finishReason = String(candidate?.finishReason ?? "UNKNOWN");
                const text = response.text ?? "";
                if (!text) {
                    throw new GeminiError(`빈 응답 (finishReason=${finishReason})`);
                }

                let data: T;
                try {
                    data = JSON.parse(text) as T;
                } catch {
                    throw new GeminiError(`JSON 파싱 실패 (finishReason=${finishReason}, length=${text.length})`);
                }

                s.lastWorkingModel = model;
                return { data, model, finishReason };
            } catch (error) {
                lastError = error;

                if (isQuotaExhausted(error)) {
                    throw new GeminiQuotaError(
                        "Gemini API 사용 한도를 초과했습니다. Google AI Studio(https://ai.studio/spend)에서 지출 한도를 확인하세요."
                    );
                }
                if (useThinking && errorStatus(error) === 400 && /thinking/i.test(errorMessage(error))) {
                    useThinking = false; // thinking 설정을 지원하지 않는 모델
                    attempt--;
                    continue;
                }
                if (isModelUnavailable(error)) {
                    console.warn(`[gemini] ${model} 사용 불가, 다음 모델로 전환: ${errorMessage(error)}`);
                    s.unavailable.add(model);
                    break;
                }
                if (error instanceof GeminiError && attempt >= 2) {
                    // 빈 응답/JSON 오류가 반복되면 다음 모델로 넘어간다
                    break;
                }
                if (error instanceof GeminiError || isRetryable(error)) {
                    const delay =
                        retryDelayMs(error) ?? Math.min(30000, 2000 * 2 ** attempt) + Math.floor(Math.random() * 1000);
                    console.warn(`[gemini] ${model} 호출 실패(${attempt + 1}/5), ${delay}ms 후 재시도: ${errorMessage(error)}`);
                    await sleep(delay);
                    continue;
                }
                throw new GeminiError(errorMessage(error), errorStatus(error));
            }
        }
    }

    throw new GeminiError(`Gemini 호출 실패: ${errorMessage(lastError)}`, errorStatus(lastError));
}
