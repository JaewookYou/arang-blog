---
title: "OpenClaw Antigravity OAuth 에러 트러블슈팅 - 버전 체크 우회하기"
description: "OpenClaw에서 Google Antigravity 사용 시 'This version of Antigravity is no longer supported' 에러가 발생했을 때의 해결 방법. User-Agent 패치로 버전 체크를 우회하는 방법을 정리했다."
date: 2026-02-01
tags: ["OpenClaw", "Antigravity", "트러블슈팅", "AI"]
category: "Development"
published: true
---

## 문제 상황

OpenClaw(구 Moltbot/Clawdbot)에서 Google Antigravity 모델을 사용하던 중, 갑자기 다음과 같은 에러가 발생했다:

```
This version of Antigravity is no longer supported. Please update to receive the latest features!
```

봇이 응답을 생성하지 못하고, 위 메시지만 반환하는 상황이었다.

GitHub 이슈([#4111](https://github.com/openclaw/openclaw/issues/4111))를 확인해보니, 같은 문제를 겪는 사람들이 많았다.

---

## 원인 분석

문제의 원인은 **Google 서버 측에서 Antigravity 클라이언트 버전을 체크**하고 있었기 때문이다.

OpenClaw 내부에서 사용하는 `pi-ai` 패키지가 User-Agent 헤더에 버전 정보를 포함해서 요청을 보내는데:

```
User-Agent: antigravity/1.11.5 darwin/arm64
```

이 버전이 Google 서버에서 지원하지 않는 구버전으로 판단되어 요청이 거부된 것이다.

---

## 해결 방법: User-Agent 패치

GitHub 이슈의 [workaround 댓글](https://github.com/openclaw/openclaw/issues/4111#issuecomment-3819579969)을 참고하여 해결했다.

### Step 1: 문제 파일 찾기

먼저 `pi-ai` 패키지 내의 Google Gemini CLI 프로바이더 파일을 찾는다:

```bash
# OpenClaw 설치 경로로 이동
cd /opt/homebrew/lib/node_modules/openclaw

# 또는 pnpm으로 설치했다면
cd node_modules/.pnpm/@mariozechner+pi-ai@*/node_modules/@mariozechner/pi-ai/dist/providers/
```

파일 위치:
```
@mariozechner/pi-ai/dist/providers/google-gemini-cli.js
```

### Step 2: User-Agent 버전 수정

파일을 열어서 User-Agent 버전 문자열을 찾는다:

```javascript
// 수정 전
'User-Agent': 'antigravity/1.11.5 darwin/arm64'

// 수정 후
'User-Agent': 'antigravity/1.15.8 darwin/arm64'
```

**변경 포인트:**
- `1.11.5` → `1.15.8` (현재 지원되는 버전으로 업데이트)

### Step 3: OpenClaw 재시작

```bash
# Gateway 재시작
openclaw gateway restart

# 또는 전체 재시작
openclaw gateway stop
openclaw gateway start
```

### Step 4: 동작 확인

재시작 후 메시지를 보내보면 정상적으로 응답이 온다!

---

## 실제 적용 로그

내 환경에서의 적용 과정:

```bash
# 1. 파일 위치 확인
$ find /opt/homebrew/lib/node_modules/openclaw -name "google-gemini-cli.js" -type f
/opt/homebrew/lib/node_modules/openclaw/node_modules/.pnpm/@mariozechner+pi-ai@0.49.3_ws@8.19.0_zod@4.3.6/node_modules/@mariozechner/pi-ai/dist/providers/google-gemini-cli.js

# 2. 백업 생성
$ cp google-gemini-cli.js google-gemini-cli.js.bak

# 3. 버전 문자열 수정
$ sed -i 's/antigravity\/1.11.5/antigravity\/1.15.8/g' google-gemini-cli.js

# 4. 변경 확인
$ grep -n "antigravity" google-gemini-cli.js
42:        'User-Agent': 'antigravity/1.15.8 darwin/arm64',

# 5. 재시작
$ openclaw gateway restart
Gateway restarted successfully.
```

---

## 주의사항

⚠️ **이 방법은 임시 해결책이다!**

- `openclaw update`나 `npm update`로 패키지가 업데이트되면 수정 내용이 덮어씌워진다
- 정식 수정은 upstream `pi-ai` 패키지에서 이루어져야 한다
- 향후 Google에서 또 버전 체크를 강화하면 다시 문제가 생길 수 있다

**영구 해결책:**
1. `pi-ai` 패키지 업데이트 대기
2. 또는 OpenClaw 공식 업데이트 대기

---

## 정리

| 항목 | 내용 |
|------|------|
| **문제** | "This version of Antigravity is no longer supported" 에러 |
| **원인** | User-Agent 버전 문자열이 구버전으로 설정됨 |
| **해결** | `google-gemini-cli.js`에서 버전을 `1.15.8`로 수정 |
| **재시작** | `openclaw gateway restart` |

같은 문제를 겪고 있다면 위 방법으로 해결할 수 있다. 다만 근본적인 수정은 upstream에서 이루어져야 하니, 가능하면 공식 업데이트를 기다리는 것이 좋다.

---

## 참고 링크

- [GitHub Issue #4111](https://github.com/openclaw/openclaw/issues/4111)
- [OpenClaw 공식 문서](https://docs.openclaw.ai)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
