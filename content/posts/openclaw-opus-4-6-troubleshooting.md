---
title: "OpenClaw에서 Claude Opus 4.6 모델 적용하기 – Unknown Model 에러 해결"
date: "2026-02-07"
description: "OpenClaw에서 Claude Opus 4.6 Thinking 모델 사용 시 'Unknown model' 에러가 발생하는 원인과 해결 과정을 정리했다."
tags: ["OpenClaw", "Claude", "Opus 4.6", "Troubleshooting", "AI"]
---

## 상황

Google Antigravity에서 Claude Opus 4.5가 단종되고 Opus 4.6으로 전환됐다. Antigravity 앱에서는 정상적으로 Opus 4.6을 사용할 수 있지만, OpenClaw에서 모델을 `google-antigravity/claude-opus-4-6-thinking`으로 변경하면 에러가 발생했다.

```
⚠️ Agent failed before reply: Unknown model: google-antigravity/claude-opus-4-6-thinking
```

## 원인 분석

### 1. npm 설치 → git 설치 전환 필요

기존에 npm으로 설치한 OpenClaw는 `/opt/homebrew/lib/node_modules/openclaw`에 위치하는데, 이 형태는 소스 수정이나 의존성 업데이트가 어렵다. 모델 레지스트리 수정을 위해 git 기반 설치로 전환해야 했다.

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- \
  --install-method git \
  --git-dir ~/src/openclaw \
  --no-onboard
```

### 2. Control UI Origin 에러

git 설치 후 게이트웨이를 띄우니 Control UI에서 WebSocket 연결이 끊겼다.

```
disconnected (1008): origin not allowed
```

이건 Control UI의 Origin이 게이트웨이 허용 목록에 없어서 발생한 문제다. `openclaw.json`에 `controlUi.allowedOrigins`를 추가하거나, 게이트웨이가 제공하는 UI(`http://127.0.0.1:18789/`)로 접속하면 해결된다.

### 3. gateway.mode 문제

게이트웨이 서비스가 시작되지만 포트가 열리지 않는 증상이 있었다.

```
Gateway start blocked: set gateway.mode=local (current: remote) or pass --allow-unconfigured.
```

`gateway.mode`가 `remote`로 설정되어 있으면 로컬에서 서비스가 시작을 거부한다.

```bash
openclaw config set gateway.mode local
```

### 4. 핵심 원인: pi-ai 모델 레지스트리 미반영

`openclaw models list`로 확인하면 Opus 4.6이 목록에 아예 없었다.

```bash
$ openclaw models list --provider google-antigravity --all --plain
google-antigravity/claude-opus-4-5-thinking
google-antigravity/claude-sonnet-4-5
google-antigravity/claude-sonnet-4-5-thinking
google-antigravity/gemini-3-flash
google-antigravity/gemini-3-pro-high
# ... Opus 4.6이 없다
```

OpenClaw는 모델 검증을 내부 패키지 `@mariozechner/pi-ai`의 모델 카탈로그에 의존한다. [PR #10720](https://github.com/openclaw/openclaw/pull/10720)에서 기본 모델을 Opus 4.6으로 변경했지만, 실제 모델 정의는 `pi-ai` 패키지 업데이트가 필요했다.

## 해결 과정

### Step 1: 이슈 확인

[GitHub Issue #10716](https://github.com/openclaw/openclaw/issues/10716)에서 동일한 문제가 보고되어 있었고, 댓글에서 수정 방법을 확인했다.

### Step 2: 소스 코드 수정

이슈 댓글을 참고해서 3개 파일을 수정했다. 핵심은 모델 레지스트리에 Opus 4.6 모델 정의를 추가하는 것이다.

1. **모델 카탈로그에 Opus 4.6 추가** — `pi-ai` 패키지 내 모델 정의 파일에 `claude-opus-4-6-thinking` 엔트리 추가
2. **모델 매핑/라우팅 설정** — Antigravity provider가 해당 모델 ID를 인식하도록 매핑 추가
3. **기본 모델 변경** — 기본값을 `claude-opus-4-6-thinking`으로 업데이트

### Step 3: 빌드 및 적용

```bash
cd ~/src/openclaw
pnpm install
pnpm build
openclaw gateway restart
```

### Step 4: 서비스 복구

LaunchAgent가 꼬인 경우가 많았다. 완전 초기화 후 재설치:

```bash
# 기존 서비스 정리
openclaw gateway stop || true
launchctl bootout gui/$UID/ai.openclaw.gateway 2>/dev/null || true

# lock 파일 정리 (OAuth 락 꼬임 방지)
find ~/.openclaw /tmp/openclaw -type f -name "*.lock" -delete 2>/dev/null

# 재설치
openclaw doctor --repair
openclaw gateway install --force
openclaw gateway start
```

### Step 5: 확인

```bash
$ openclaw models list --provider google-antigravity --all --plain | grep 4-6
google-antigravity/claude-opus-4-6-thinking
google-antigravity/claude-sonnet-4-6-thinking

$ openclaw gateway status
# RPC probe: ok ✅
```

## 발생한 부수 문제들

### OAuth Token Refresh Lock

여러 게이트웨이 프로세스가 동시에 OAuth 토큰을 갱신하려다 락이 걸리는 문제가 있었다.

```
OAuth token refresh failed: Lock file is already being held
```

모든 게이트웨이 프로세스를 종료하고 lock 파일을 삭제한 후 하나만 재시작하면 해결된다.

### gateway.bind 값 혼동

`gateway.bind`에 `local`을 넣으면 validation 에러가 난다. 유효한 값은 `loopback`, `lan` 등이다. 로컬 전용이라면 `loopback`을 사용한다.

```bash
openclaw config set gateway.bind loopback  # ✅
openclaw config set gateway.bind local     # ❌ Invalid input
```

### Alpine Linux의 localhost → IPv6 문제

이건 별도 이슈인데, Docker 컨테이너(Alpine 기반)에서 `localhost`가 IPv6(`::1`)로 해석되면서 healthcheck가 실패하는 경우가 있다. `127.0.0.1`로 명시하면 해결된다.

## 교훈

1. **npm 설치 ↔ git 설치 전환은 생각보다 간단하다.** `~/.openclaw/` 디렉토리가 상태를 전부 보관하기 때문에, 설치 경로만 바뀌고 설정/세션/인증은 그대로 유지된다.
2. **모델 지원은 여러 레이어에 걸친다.** Provider가 모델을 지원하더라도, 클라이언트(OpenClaw)의 모델 레지스트리에 등록되어야 실제로 사용할 수 있다.
3. **LaunchAgent는 자주 꼬인다.** macOS에서 서비스 관리 시 `launchctl bootout` → `install --force` 패턴을 기억해두면 좋다.
4. **로그를 먼저 보자.** `~/.openclaw/logs/gateway.err.log`가 대부분의 답을 가지고 있다.
