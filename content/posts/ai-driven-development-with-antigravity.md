---
title: "AI 페어 프로그래밍으로 테크 블로그를 만들어보았다 (Antigravity + MCP)"
description: "Gemini 기반 AI 코딩 어시스턴트 Antigravity와 MCP 도구를 활용해 Next.js 15 기반 기술 블로그를 만든 경험기. AI 활용 개발 팁과 실전 트러블슈팅 사례."
date: 2026-01-18
tags: ["AI", "Antigravity", "MCP", "Next.js", "개발경험"]
category: "Development"
published: true
---

## 들어가며

최근 AI 코딩 어시스턴트의 발전이 눈부시다. GitHub Copilot을 시작으로, Cursor, Cody, Continue 등 다양한 도구들이 등장했지만, 이번에는 조금 특별한 녀석을 사용해봤다.

바로 **Antigravity** - Google DeepMind 팀이 만든 "Agentic AI" 코딩 어시스턴트다. 단순히 코드 자동완성을 넘어, 실제로 **파일을 생성하고, 터미널 명령을 실행하고, 브라우저를 조작하고, GitHub에 커밋/푸시**까지 할 수 있는 녀석이다.

이 글에서는 Antigravity와 MCP(Model Context Protocol)를 활용해 이 블로그를 처음부터 끝까지 만든 경험을 공유하려 한다.

![완성된 블로그 홈페이지](/images/posts/ai-dev/homepage.png)

---

## 기술 스택 (Tech Stack)

이 블로그에 사용된 기술들:

| 카테고리 | 기술 | 설명 |
|---------|------|------|
| **프레임워크** | Next.js 15 | App Router, React Server Components |
| **콘텐츠** | Velite | MDX/Markdown을 타입 안전하게 처리 |
| **스타일링** | Tailwind CSS + shadcn/ui | 다크 미니멀 디자인 시스템 |
| **DB** | SQLite (better-sqlite3) | 댓글, 번역, 허니팟 로그 저장 |
| **인증** | Auth.js (NextAuth v5) | GitHub OAuth 관리자 인증 |
| **번역** | Gemini API | AI 기반 자동 번역 |
| **배포** | Ubuntu Server + PM2 | Nginx 리버스 프록시 |
| **CI/CD** | GitHub Actions | SSH 자동 배포 |
| **코드 하이라이팅** | rehype-pretty-code | tokyo-night 테마 |

---

## 블로그 구조

```
arang-blog/
├── content/           # 콘텐츠 (Velite)
│   ├── posts/        # 블로그 글 (.md)
│   └── writeups/     # CTF Writeup (.md)
├── data/
│   └── blog.db       # SQLite (댓글, 번역, 로그)
├── public/
│   ├── images/       # 이미지 파일
│   └── uploads/      # 업로드된 파일
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── admin/    # 관리자 페이지
│   │   ├── api/      # API 라우트
│   │   ├── posts/    # 블로그 글 페이지
│   │   └── writeups/ # Writeup 페이지
│   ├── components/   # React 컴포넌트
│   ├── hooks/        # Custom Hooks
│   └── lib/          # 유틸리티 (DB, Auth, i18n)
├── velite.config.ts  # Velite 설정
└── next.config.ts    # Next.js 설정
```

---

## 시작: 최초 프롬프트 하나로 프로젝트 킥오프

이 블로그 개발은 단 하나의 프롬프트로 시작됐다:

```markdown
# Project Kickoff: Arang Tech Blog (Deep Dark & Aesthetic)

**목표:** Next.js 15 + Velite + Shadcn/ui를 사용한 CTF/기술 블로그 구축.
**현재 상황:** 로컬 폴더만 생성됨. Git 초기화 안 됨.
**Target Repo:** `https://github.com/JaewookYou/arang-blog`

---

## 🚨 Phase 0: Git Initialization (Handshake)
1. **상태 확인:** `filesystem`으로 현재 폴더가 비어있는지 확인
2. **명령어 제공:** Git 초기화 및 원격 연결 명령어 세트 작성
3. **대기:** 실행 후 "연결 완료"라고 응답하면 Phase 1 시작

## 🧠 Phase 1: Architecture & Setup (After Git Init)
Git 연결이 확인되면, `sequential-thinking`을 사용하여:
1. **Stack Strategy (Context7 필수):** Next.js 15, Velite 설정
2. **Project Management (GitHub MCP):** Issue 생성으로 로드맵 정리
3. **Implementation Start:** 기본 스캐폴딩 파일 생성
```

이 프롬프트 하나로 AI는:
- 폴더 상태 확인
- Git 초기화 명령어 제공
- GitHub에 "Initial Setup & Roadmap" 이슈 생성
- package.json, next.config.ts 등 기본 파일 생성

**빈 폴더에서 프로젝트 구조가 완성되기까지 약 10분**이 걸렸다.

---

## Global Rule: AI의 성격을 정의하다

Antigravity의 강력한 기능 중 하나는 **Global Rule**이다. 모든 대화에 적용되는 규칙을 설정할 수 있다:

```markdown
# 🚀 Global Persona & Identity
- You are a **Senior Full-Stack Engineer** and **Security Researcher (CTF Player)**.
- **Core Values:** "Security-First", "Modular Design", "Hacker Aesthetic (Dark/Minimal)".
- **Language Protocol:** All explanations MUST be in **Korean (한국어)**.

# 🛡️ Security-First Mindset (Critical)
- **Defensive Coding:** Always assume inputs are malicious. Validate everything.
- **Secrets:** Never hardcode API keys. Always use `.env`.

# 🛠️ MCP Toolchain Protocol (Adaptive)
1. **🧠 Sequential Thinking:** REQUIRED for Architecture, Debugging, or Complex Logic.
2. **🔍 Context7:** ALWAYS fetch latest docs for libraries.
3. **🐙 GitHub (API):** Create Issues for planning, PRs for features.
4. **📂 Filesystem:** Direct code manipulation.
5. **🦁 Brave Search:** For error solutions and design references.

# ⚡ Autonomous Execution Protocol
- **Do NOT ask the user** to run commands. Execute directly.
- **Trial & Error:** If a command fails, READ the error, PLAN a fix, EXECUTE.
- **Verification:** After running a command, verify before reporting back.
```

이 규칙 덕분에:
- AI가 항상 **한국어**로 설명 (코드 주석 포함)
- **보안 관점**을 자동으로 고려 (입력 검증, .env 사용)
- 명령 실행 시 **일일이 허락받지 않고 자율적으로 진행**
- 에러 발생 시 **스스로 해결 시도** 후 보고

---

## MCP (Model Context Protocol) 활용

### MCP란?

MCP는 AI 시스템에 외부 도구와 데이터 소스를 연결하는 표준 프로토콜이다. Antigravity는 다양한 MCP 서버를 통해 기능을 확장한다.

내가 실제로 사용한 MCP 도구들:

| MCP 서버 | 용도 | 효용 |
|---------|------|------|
| `sequential-thinking` | 복잡한 문제를 단계별로 분해하여 사고 | 아키텍처 설계, 디버깅에 필수 |
| `filesystem` | 파일 읽기/쓰기, 디렉토리 탐색 | 직접 코드 수정 |
| `github-mcp-server` | PR 생성, 이슈 관리, 커밋 | 프로젝트 관리 자동화 |
| `brave-search-mcp-server` | 웹 검색 (에러 해결, 문서 찾기) | 최신 정보 검색 |
| `context7` | 라이브러리 문서 조회 (최신 API) | Hallucination 방지 |

### Sequential Thinking: 복잡한 문제 해결의 핵심

아키텍처 설계나 디버깅처럼 복잡한 작업에서는 `sequential-thinking`이 빛을 발했다. 실제로 블로그에 4개 언어 다국어 지원을 추가할 때 사용한 접근:

```typescript
// Sequential Thinking으로 문제 분해
thought: "다국어 지원 아키텍처 설계"
steps: [
  "1. 현재 locale 상태 관리 방법 파악",
  "2. 서버/클라이언트 컴포넌트 구분", 
  "3. 쿠키 기반 언어 저장",
  "4. t() 함수로 번역 텍스트 조회",
  "5. 날짜 포맷 로케일화",
  "6. 게시글 번역은 DB에 저장하여 관리"
]
```

### Browser Subagent: 시각적 검증 자동화

가장 인상적인 기능은 **Browser Subagent**다. AI가 직접 브라우저를 열어 페이지를 확인하고, 스크린샷을 찍고, 문제를 파악한다.

```typescript
// AI가 실제로 실행한 브라우저 검증
browser_subagent({
  Task: `
    1. Navigate to https://blog.arang.kr/posts
    2. Wait 3 seconds for page load
    3. Scroll down to check all post cards
    4. Capture screenshot of the page
    5. Switch language to English using the globe icon
    6. Verify content changed to English
  `,
  RecordingName: "i18n_verification"
});
```

이 기능 덕분에 **"배포 후 직접 확인해보세요"**가 아니라 **"확인했고, 스크린샷 여기 있습니다"**가 된다.

![다국어 지원 - 영어 모드](/images/posts/ai-dev/i18n-english.png)

---

## 완성된 기능들

### 1. Next.js 15 기반 정적 블로그

- **Velite**: MDX/Markdown 콘텐츠 관리 + 타입 안전성
- **App Router**: 최신 Next.js 라우팅 (Server Components)
- **SSG**: 정적 사이트 생성으로 빠른 로딩
- **코드 하이라이팅**: rehype-pretty-code (tokyo-night 테마)

![코드 하이라이팅](/images/posts/ai-dev/code-highlight.png)

### 2. 4개 언어 다국어 지원

- **한국어, 영어, 일본어, 중국어** 지원
- **Gemini API**로 자동 번역 (코드블록/이미지 보존)
- **SQLite DB**에 번역 저장 (HTML로 변환하여 저장)
- 접속 국가/브라우저 언어 기반 자동 감지

![다국어 지원 - 한국어 모드](/images/posts/ai-dev/i18n-korean.png)

### 3. Admin 대시보드

GitHub OAuth 인증 후 사용 가능한 관리자 기능:

- **글 작성/수정**: 마크다운 에디터 (클립보드 이미지 자동 업로드)
- **번역 관리**: AI 번역 생성, 저장된 번역 수정/삭제
- **댓글 관리**: 댓글 조회 및 삭제
- **정적 페이지 편집**: Home, About 페이지 편집
- **허니팟 로그**: `/wp-admin`, `/.env` 등 공격 시도 추적

![Admin 대시보드](/images/posts/ai-dev/admin-dashboard.png)

### 4. GitHub Actions CI/CD

Admin에서 글 작성 → GitHub 커밋 → Actions 트리거 → 서버 자동 배포

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    steps:
      - name: Deploy to Production
        run: |
          ssh ${{ secrets.SSH_HOST }} "
            cd /home/arang/web/blog
            git pull
            npm run build
            pm2 reload arang-blog
          "
```

### 5. 댓글 시스템

- **SQLite 기반** 자체 호스팅 (외부 서비스 의존 X)
- **대댓글** 지원 (1단계)
- **익명** 닉네임 입력
- **관리자 삭제** 기능

![댓글 시스템](/images/posts/ai-dev/comments.png)

### 6. 검색 기능

- Posts와 Writeups **통합 검색**
- **실시간 드롭다운** 결과
- 다국어 UI 지원

![검색 기능](/images/posts/ai-dev/search.png)

### 7. 보안 기능

- **허니팟**: 봇 공격 경로(`/wp-admin`, `/.env`, `/phpmyadmin`) 접근 로깅
- **Rate Limiting**: 댓글 작성 제한
- **XSS 방지**: HTML sanitization

---

## 실전 트러블슈팅 사례

### 1. `output: 'standalone'` 호환성 문제

**문제**: PM2 + npm start 환경에서 `next/dist/compiled/cookie` 모듈 찾을 수 없음

**원인**: `output: 'standalone'` 설정은 `.next/standalone/server.js`로 실행해야 하는데, `npm start`로 실행하면 충돌

**해결**:
```typescript
// next.config.ts
// output: 'standalone' 제거 - PM2 환경에서는 불필요
const nextConfig: NextConfig = {
  // output: 'standalone', // 이거 제거!
};
```

### 2. MDX 주석 문법 충돌

**문제**: Admin에서 작성한 글에 `<!-- 주석 -->` 포함 시 빌드 에러

**해결**: Commit API에서 자동 변환
```typescript
// HTML 주석 → MDX 주석 자동 변환 (MDX 파일만)
if (ext === ".mdx") {
  content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
}
```

### 3. GitHub Actions SSH 연결 시 pm2 not found

**문제**: SSH 세션에서 fnm 환경변수가 로드되지 않음

**해결**:
```bash
# .github/workflows/deploy.yml
eval "$(fnm env)"
source ~/.bashrc
pm2 reload arang-blog
```

### 4. 번역 시 마크다운 구조 깨짐

**문제**: 코드블록, 이미지 경로가 번역되면서 깨짐

**해결**: 코드블록/이미지를 플레이스홀더로 치환 → 번역 → 복원
```typescript
// 번역 전: 코드블록 추출
const { processed, codeBlocks } = extractCodeBlocks(content);
// 번역 후: 복원
translatedContent = restoreCodeBlocks(translatedContent, codeBlocks);
```

---

## AI 개발의 장단점

### 장점

| 항목 | 설명 |
|------|------|
| **속도** | 반복 작업(CRUD, i18n 적용)이 정말 빠름 |
| **학습 곡선 감소** | 처음 쓰는 라이브러리도 Context7로 바로 활용 |
| **실시간 검증** | Browser Subagent로 배포 전 시각적 확인 |
| **자율 실행** | "빌드하고 배포해줘" 한마디면 끝 |

### 단점 및 주의점

| 항목 | 설명 |
|------|------|
| **컨텍스트 유실** | 대화가 길어지면 앞서 논의한 내용 잊음 |
| **과신 금물** | "다 됐습니다" 해도 반드시 직접 확인 |
| **보안 주의** | API 키 하드코딩 위험 - Global Rule로 방지 |

---

## 결론

**Antigravity + MCP** 조합은 확실히 강력하다. 단순한 코드 자동완성을 넘어, **프로젝트 관리, 브라우저 검증, 자동 배포**까지 한 번에 처리한다.

특히 **Global Rule** 설정이 핵심이다. AI의 성격과 행동 원칙을 정의해두면:
- 보안 원칙 자동 적용
- 언어/문화 일관성 유지
- 자율 실행으로 생산성 향상

하지만 결국 **AI는 도구**다. 방향을 잡고 품질을 검증하는 건 여전히 사람의 몫이다.

이 블로그를 만들면서 AI와 약 50시간을 함께했다. 처음엔 "진짜 이게 돼?"라는 의심이었지만, 지금은 "이거 없이 어떻게 개발했지?"라는 생각이 든다.

**앞으로도 AI 도구들은 계속 발전할 것이다. 중요한 건 변화를 두려워하지 않고, 새로운 도구를 적극적으로 실험해보는 것.**

---

> 🤖 **이 포스트는 AI(Antigravity)가 작성했습니다.**
> 
> 이 블로그를 함께 만든 AI가 직접 개발 경험을 정리했습니다.
> 물론 최종 검토와 승인은 사람이 했습니다 😄
