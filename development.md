# 🚀 Arang Tech Blog - Development Documentation

## Overview

**Arang Tech Blog**는 Next.js 15 기반의 개인 기술 블로그 + CTF Writeup 플랫폼입니다.
Git-CMS를 통한 콘텐츠 관리, Gemini AI 기반 다국어 자동 번역, Self-Hosted 배포 환경을 지원합니다.

---

## 📋 Development Phases

### Phase 1: Technical Foundations
- Next.js 15 App Router 프로젝트 설정
- TypeScript 설정 및 ESLint 구성
- shadcn/ui 컴포넌트 라이브러리 통합
- Tailwind CSS 다크 테마 설정

### Phase 2: Content Layer (Velite)
- Velite를 사용한 MDX/Markdown 콘텐츠 처리
- Posts 스키마 정의 (title, description, date, tags, category)
- Writeups 스키마 정의 (ctf, category, difficulty, points, solves)
- rehype-slug로 헤딩 자동 ID 생성
- 자동 슬러그 생성 및 타입 안전성

### Phase 3: UI/UX
- 반응형 헤더/푸터
- 포스트 목록 페이지 (태그 필터링)
- 포스트 상세 페이지 (TOC, 코드 하이라이팅)
- 다크/라이트 테마 토글
- Reading Progress Bar
- MutationObserver 기반 TOC 동기화

### Phase 4: Advanced Code Highlighting
- `rehype-pretty-code` + Shiki 통합
- 라인 넘버 표시
- 코드 블록 복사 버튼
- Line Wrap 토글 기능
- 언어별 아이콘
- ContentRenderer 클라이언트 컴포넌트

### Phase 5: SEO & Meta
- 동적 OG 이미지 생성 (Edge Runtime)
- Sitemap.xml 자동 생성
- RSS Feed 지원
- robots.txt

### Phase 6: Search
- 클라이언트 사이드 Fuzzy Search (Fuse.js)
- Posts + Writeups 통합 검색
- 실시간 드롭다운 검색 결과
- 키보드 단축키 (Cmd+K)

### Phase 7: Comments & Database
- SQLite 기반 댓글 시스템 (better-sqlite3)
- 대댓글 지원 (1단계)
- Soft Delete
- 관리자 삭제 기능

### Phase 8: Admin & Security Ops
- Auth.js v5 GitHub OAuth 인증
- Admin 대시보드 (`/admin`)
- Git-CMS (GitHub API를 통한 콘텐츠 CRUD)
- 글 작성/수정 기능 (클립보드 이미지 업로드)
- 댓글 관리
- Honeypot 보안 로깅
- GitHub Actions CI/CD

### Phase 9: Internationalization (i18n)
- 4개 언어 지원 (ko, en, ja, zh)
- 쿠키 기반 언어 설정 (locale)
- 접속 국가/브라우저 언어 자동 감지
- UI 텍스트 다국어화 (t() 함수)
- 날짜 포맷 로케일라이제이션

### Phase 10: AI Translation
- Gemini API 기반 자동 번역 (모델 대체 목록·재시도·JSON 모드)
- 원문 해시로 변경 감지, 서버 시작 시/6시간마다 누락·오래된 번역 자동 생성
- 블록 단위 분할 번역 + 검증(한국어 잔존, 누락, 플레이스홀더, HTML 태그) — 실패 시 저장하지 않음
- 코드블록/이미지 보존 (플레이스홀더 패턴)
- Markdown → HTML 변환 후 DB 저장
- 번역 관리 Admin 페이지
- 정적 페이지 (Home, About) 다국어 지원
- 개별 언어 수정 기능

---

## 🏗️ Project Structure

```
arang-blog/
├── content/                 # MDX/Markdown 콘텐츠
│   ├── posts/              # 블로그 포스트
│   └── writeups/           # CTF Writeups
├── data/
│   └── blog.db             # SQLite (댓글, 번역, 로그)
├── public/
│   ├── images/             # 이미지 파일
│   └── uploads/            # 업로드된 파일
├── scripts/
│   ├── deploy.sh           # 배포 스크립트
│   └── sync-translations.sh    # 누락/오래된 번역 생성 요청
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin 페이지들
│   │   │   ├── edit/       # 글 편집
│   │   │   ├── posts/      # 글 관리
│   │   │   ├── translations/  # 번역 관리
│   │   │   └── static-pages/  # 정적 페이지 편집
│   │   ├── api/            # API Routes
│   │   │   ├── admin/      # Admin API
│   │   │   ├── comments/   # 댓글 API
│   │   │   └── og/         # OG 이미지 생성
│   │   ├── posts/[slug]/   # 포스트 상세
│   │   └── writeups/[slug]/ # Writeup 상세
│   ├── components/         # React 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   ├── code-block.tsx  # 코드 블록
│   │   ├── content-renderer.tsx  # HTML 렌더러
│   │   ├── table-of-contents.tsx # TOC
│   │   ├── comments.tsx    # 댓글
│   │   └── locale-switcher.tsx   # 언어 전환
│   ├── hooks/
│   │   └── use-locale.ts   # 로케일 훅
│   └── lib/
│       ├── auth.ts         # Auth.js 설정
│       ├── db.ts           # SQLite 래퍼
│       ├── i18n.ts         # 다국어 유틸리티
│       ├── translations.ts # 정적 페이지 번역
│       └── markdown.ts     # Markdown → HTML
├── .github/workflows/       # GitHub Actions
├── Dockerfile              # Docker 이미지 빌드
├── docker-compose.yml      # Docker Compose 설정
├── ecosystem.config.cjs     # PM2 설정 (legacy)
├── velite.config.ts        # Velite 설정
└── next.config.ts          # Next.js 설정 (standalone)
```

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router, SSG) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui + Radix UI |
| Content | Markdown/MDX + Velite |
| Database | SQLite (better-sqlite3) |
| Auth | Auth.js v5 (NextAuth) |
| AI | Gemini API (gemini-2.0-flash) |
| Code Highlighting | Shiki + rehype-pretty-code |
| Deployment | Docker + Nginx Reverse Proxy |
| CI/CD | GitHub Actions (SSH Deploy) |

---

## ✅ Implemented Features

### Blog Core
- [x] MDX/Markdown 기반 포스트/Writeup
- [x] 태그/카테고리 필터링
- [x] 클라이언트 검색 (Fuse.js)
- [x] 코드 하이라이팅 + 라인 넘버
- [x] 복사 버튼 + Line Wrap 토글
- [x] Table of Contents (MutationObserver)
- [x] Reading Progress Bar
- [x] 다크/라이트 테마

### Internationalization
- [x] 4개 언어 지원 (ko, en, ja, zh)
- [x] Gemini AI 자동 번역
- [x] 코드블록/이미지 보존 번역
- [x] 정적 페이지 다국어 지원
- [x] UI 텍스트 다국어화
- [x] 날짜 로케일라이제이션

### SEO
- [x] 동적 OG 이미지
- [x] Sitemap.xml
- [x] RSS Feed
- [x] robots.txt
- [x] 시맨틱 HTML

### Admin Dashboard
- [x] GitHub OAuth 로그인
- [x] 대시보드 (통계)
- [x] 글 작성 (Git-CMS)
- [x] 글 수정 (확장자 유지)
- [x] 이미지 업로드 (클립보드)
- [x] 번역 관리 (생성/편집/삭제)
- [x] 정적 페이지 편집
- [x] 댓글 관리

### Security
- [x] Middleware 경로 보호
- [x] Honeypot 로깅 (/wp-admin, /.env 등)
- [x] Admin Whitelist
- [x] Security Headers
- [x] Rate Limiting (댓글)
- [x] XSS Prevention

### Deployment
- [x] Docker 컨테이너 (standalone 모드)
- [x] 멀티 스테이지 빌드 (~250MB)
- [x] GitHub Actions CI/CD
- [x] SSH 배포 자동화

---

## 🔜 Future Improvements

- [ ] 예약 발행
- [ ] 방문자 통계 대시보드
- [ ] 댓글 알림
- [ ] 미디어 라이브러리 관리
- [ ] 글 삭제 기능

---

## 📖 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production (Native)
npm start

# Docker Deployment (Recommended)
sudo docker compose up -d --build
sudo docker compose logs -f blog
sudo docker compose down

# Rebuild after code changes
git pull && sudo docker compose up -d --build

# 누락/오래된 번역 생성 요청 (서버가 자동으로도 수행)
./scripts/sync-translations.sh
```

---

## 🔐 Environment Variables

`.env.local` 파일에 다음 설정 필요:

```env
# Site
NEXT_PUBLIC_SITE_URL=https://blog.arang.kr

# Auth.js
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GITHUB_ID=<GitHub OAuth Client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth Client Secret>
ADMIN_WHITELIST=JaewookYou

# Git-CMS
GITHUB_TOKEN=<GitHub Personal Access Token>
GITHUB_REPO_OWNER=JaewookYou
GITHUB_REPO_NAME=arang-blog

# AI Translation
GEMINI_API_KEY=<Gemini API Key>
# GEMINI_MODEL=gemini-3.8-flash          # 선택: 모델 목록 (쉼표 구분)
# AUTO_TRANSLATE=true                    # 선택: false면 자동 번역 끔
INTERNAL_API_TOKEN=<openssl rand -hex 32> # 내부 API용

# Optional
# DB_PATH=/custom/path/to/blog.db
```

---

## 🗄️ Database Schema

```sql
-- 댓글
CREATE TABLE comments (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL,           -- 글 슬러그
    type TEXT DEFAULT 'post',     -- 'post' | 'writeup'
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER,            -- 대댓글용
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME           -- Soft delete
);

-- 번역
CREATE TABLE translations (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL,
    type TEXT NOT NULL,           -- 'post' | 'writeup'
    locale TEXT NOT NULL,         -- 'en' | 'ja' | 'zh'
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,        -- 렌더링된 HTML
    content_md TEXT,              -- 번역 마크다운 원본 (관리자 편집용)
    source_hash TEXT,             -- 번역 당시 원문 해시 (원문 변경 감지)
    model TEXT,                   -- 번역 모델 ('manual' = 사람이 수정)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    UNIQUE(slug, type, locale)
);

-- 번역 작업 상태 (대기/진행/실패)
CREATE TABLE translation_jobs (
    slug TEXT, type TEXT, locale TEXT,
    status TEXT NOT NULL,         -- 'queued' | 'running' | 'failed'
    error TEXT,
    attempts INTEGER DEFAULT 0,
    source_hash TEXT,
    updated_at TEXT,
    PRIMARY KEY (slug, type, locale)
);

-- 정적 페이지 번역
CREATE TABLE static_pages (
    id INTEGER PRIMARY KEY,
    page_key TEXT NOT NULL,       -- 'home' | 'about'
    locale TEXT NOT NULL,
    content TEXT NOT NULL,        -- JSON
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_key, locale)
);

-- 허니팟 로그
CREATE TABLE honeypot_logs (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

*Last Updated: 2026-10-01*
