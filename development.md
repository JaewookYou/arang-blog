# 🚀 Arang Tech Blog - Development Documentation

## Overview

**Arang Tech Blog**는 Next.js 15 기반의 개인 기술 블로그 + CTF Writeup 플랫폼입니다.
Git-CMS를 통한 콘텐츠 관리와 Self-Hosted 배포 환경을 지원합니다.

---

## 📋 Development Phases

### Phase 1: Technical Foundations
- Next.js 15 App Router 프로젝트 설정
- TypeScript 설정 및 ESLint 구성
- shadcn/ui 컴포넌트 라이브러리 통합
- Tailwind CSS 다크 테마 설정

### Phase 2: Content Layer (Velite)
- Velite를 사용한 MDX 콘텐츠 처리
- Posts 스키마 정의 (title, description, date, tags)
- Writeups 스키마 정의 (ctf, category, difficulty, points)
- 자동 슬러그 생성 및 타입 안전성

### Phase 3: UI/UX
- 반응형 헤더/푸터
- 포스트 목록 페이지 (태그 필터링)
- 포스트 상세 페이지 (TOC, 코드 하이라이팅)
- 다크/라이트 테마 토글
- Reading Progress Bar

### Phase 4: Advanced Code Highlighting
- `rehype-pretty-code` + Shiki 통합
- 라인 넘버 표시
- 코드 블록 복사 버튼
- Line Wrap 토글 기능
- 언어별 아이콘

### Phase 5: SEO & Meta
- 동적 OG 이미지 생성 (Edge Runtime)
- Sitemap.xml 자동 생성
- RSS Feed 지원
- robots.txt

### Phase 6: Search
- 클라이언트 사이드 Fuzzy Search (Fuse.js)
- 실시간 검색 결과
- 키보드 단축키 (Cmd+K)

### Phase 7: Comments & Database
- SQLite 기반 댓글 시스템 (better-sqlite3)
- 대댓글 지원
- Soft Delete

### Phase 8: Admin & Security Ops
- Auth.js v5 GitHub OAuth 인증
- Admin 대시보드 (`/admin`)
- Git-CMS (GitHub API를 통한 콘텐츠 CRUD)
- 글 작성/수정 기능
- 댓글 관리
- Honeypot 보안 로깅
- GitHub Actions CI/CD

---

## 🏗️ Project Structure

```
arang-blog/
├── content/                 # MDX 콘텐츠
│   ├── posts/              # 블로그 포스트
│   └── writeups/           # CTF Writeups
├── data/                    # SQLite DB, 업로드 파일
├── public/                  # 정적 파일
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin 페이지들
│   │   ├── api/            # API Routes
│   │   ├── posts/          # 포스트 페이지
│   │   └── writeups/       # Writeup 페이지
│   ├── components/         # React 컴포넌트
│   │   └── ui/             # shadcn/ui 컴포넌트
│   └── lib/                # 유틸리티
│       ├── auth.ts         # Auth.js 설정
│       ├── db.ts           # SQLite 연결
│       └── utils.ts        # 헬퍼 함수
├── .github/workflows/       # GitHub Actions
├── ecosystem.config.cjs     # PM2 설정
├── velite.config.ts        # Velite 설정
└── next.config.ts          # Next.js 설정
```

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui + Radix UI |
| Content | MDX + Velite |
| Database | SQLite (better-sqlite3) |
| Auth | Auth.js v5 (NextAuth) |
| Code Highlighting | Shiki + rehype-pretty-code |
| Deployment | PM2 + Apache2 Reverse Proxy |
| CI/CD | GitHub Actions (SSH Deploy) |

---

## ✅ Implemented Features

### Blog Core
- [x] MDX 기반 포스트/Writeup
- [x] 태그/카테고리 필터링
- [x] 클라이언트 검색 (Fuse.js)
- [x] 코드 하이라이팅 + 라인 넘버
- [x] 복사 버튼 + Line Wrap 토글
- [x] Table of Contents
- [x] Reading Progress Bar
- [x] 다크/라이트 테마

### SEO
- [x] 동적 OG 이미지
- [x] Sitemap.xml
- [x] RSS Feed
- [x] robots.txt
- [x] 시맨틱 HTML

### Admin
- [x] GitHub OAuth 로그인
- [x] 대시보드 (통계)
- [x] 글 작성 (Git-CMS)
- [x] 글 수정
- [x] 댓글 관리

### Security
- [x] Middleware 경로 보호
- [x] Honeypot 로깅
- [x] Admin Whitelist
- [x] Security Headers

### Deployment
- [x] PM2 프로세스 매니저
- [x] GitHub Actions CI/CD
- [x] SSH 배포 자동화

---

## 🔜 Future Improvements

- [ ] 이미지 업로드 (클립보드 → 서버)
- [ ] 미디어 라이브러리 관리
- [ ] 예약 발행
- [ ] 방문자 통계 대시보드
- [ ] 댓글 알림

---

## 📖 Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# PM2 Deployment
pm2 start ecosystem.config.cjs
pm2 restart arang-blog --update-env
```

---

## 🔐 Environment Variables

`.env.local` 파일에 다음 설정 필요:

```env
NEXT_PUBLIC_SITE_URL=https://blog.arang.kr
AUTH_URL=https://blog.arang.kr
AUTH_SECRET=<openssl rand -base64 32>
AUTH_GITHUB_ID=<GitHub OAuth Client ID>
AUTH_GITHUB_SECRET=<GitHub OAuth Client Secret>
GITHUB_TOKEN=<GitHub Personal Access Token>
GITHUB_REPO_OWNER=JaewookYou
GITHUB_REPO_NAME=arang-blog
ADMIN_WHITELIST=JaewookYou
```

---

*Last Updated: 2026-01-17*
