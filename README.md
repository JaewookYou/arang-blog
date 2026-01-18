# Arang Tech Blog 🔐

> Security Research & CTF Writeups by Arang

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-green)

**[🌐 Live Demo: blog.arang.kr](https://blog.arang.kr)**

---

## ✨ Features

### Core
- 🌙 **Dark Mode First** - Zinc + Emerald 테마 기반 다크 우선 디자인
- 📝 **MDX/Markdown Support** - Velite를 활용한 타입 안전 콘텐츠 관리
- 🎨 **Code Highlighting** - Tokyo Night 테마 + 라인 넘버 + 복사 버튼
- 🔄 **Code Wrap Toggle** - 코드 블록 줄바꿈/스크롤 토글

### Internationalization (i18n)
- 🌍 **4개 언어 지원** - 한국어, 영어, 일본어, 중국어
- 🤖 **AI 자동 번역** - Gemini API 기반 콘텐츠 자동 번역
- 🌐 **접속 국가/브라우저 언어 감지** - 자동 언어 설정
- 📄 **정적 페이지 번역** - Home, About 페이지 다국어 지원

### Content Management
- 📰 **Blog Posts** - 기술 블로그 포스트
- 🚩 **CTF Writeups** - 카테고리/난이도/포인트 메타데이터 지원
- 🔍 **Search** - 실시간 클라이언트 사이드 통합 검색
- 💬 **Comments** - SQLite 기반 자체 댓글 시스템 (대댓글 지원)
- 📑 **Table of Contents** - 자동 생성 목차 (스크롤 동기화)

### Admin Dashboard
- 🔐 **GitHub OAuth 인증** - 화이트리스트 기반 관리자 접근
- ✏️ **글 작성/편집** - 마크다운 에디터 + 이미지 업로드
- 🌐 **번역 관리** - AI 번역 생성/편집/삭제
- 📊 **댓글 관리** - 댓글 조회 및 삭제
- 🍯 **허니팟 로그** - 봇 공격 경로 모니터링

### SEO & Performance
- 🖼️ **Dynamic OG Images** - Edge Runtime 기반 동적 소셜 이미지 생성
- 📊 **Sitemap & RSS** - 자동 생성 사이트맵 및 RSS 피드
- ⚡ **Turbopack** - 빠른 개발 환경

### Security
- 🍯 **Honeypot** - `/wp-admin`, `/.env` 등 공격 경로 로깅
- 🛡️ **Rate Limiting** - 댓글 작성 제한
- 🔒 **XSS Prevention** - HTML sanitization

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router, SSG) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Content** | Velite, MDX/Markdown |
| **Database** | SQLite (better-sqlite3) |
| **Auth** | Auth.js (NextAuth v5) |
| **AI** | Gemini API (번역) |
| **Code Highlighting** | Shiki (rehype-pretty-code) |
| **Deployment** | Docker + Nginx Reverse Proxy |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/JaewookYou/arang-blog.git
cd arang-blog

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### 🐳 Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
sudo docker compose up -d --build

# View logs
sudo docker compose logs -f blog

# Stop
sudo docker compose down

# Rebuild after code changes
git pull && sudo docker compose up -d --build
```

Docker 이미지는 멀티 스테이지 빌드로 최적화되어 **~250MB** 크기입니다.

---

## 📁 Project Structure

```
arang-blog/
├── content/                # 콘텐츠 (Velite)
│   ├── posts/             # 블로그 포스트 (.md)
│   └── writeups/          # CTF Writeups (.md)
├── data/
│   └── blog.db            # SQLite (댓글, 번역, 로그)
├── public/
│   ├── images/            # 이미지 파일
│   └── uploads/           # 업로드된 파일
├── scripts/
│   ├── deploy.sh          # 배포 스크립트
│   └── translate-all-posts.js  # 일괄 번역 스크립트
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── admin/         # 관리자 페이지
│   │   ├── api/           # API 라우트
│   │   ├── posts/         # 블로그 글 페이지
│   │   └── writeups/      # Writeup 페이지
│   ├── components/        # React 컴포넌트
│   │   └── ui/            # shadcn/ui 컴포넌트
│   ├── hooks/             # Custom Hooks
│   └── lib/               # 유틸리티
│       ├── db.ts          # SQLite 래퍼
│       ├── auth.ts        # Auth.js 설정
│       ├── i18n.ts        # 다국어 유틸리티
│       └── translations.ts # 정적 페이지 번역
├── velite.config.ts       # Velite 설정
└── next.config.ts         # Next.js 설정
```

---

## 📝 Writing Content

### Blog Post

```markdown
---
title: "포스트 제목"
description: "포스트 설명"
date: 2026-01-18
published: true
tags: ["security", "web"]
category: "Development"
---

# 내용 작성
```

### CTF Writeup

```markdown
---
title: "Challenge Name"
description: "Challenge description"
date: 2026-01-18
published: true
ctf: "CTF Name 2026"
category: "web"
difficulty: "medium"
points: 500
solves: 42
tags: ["xss", "sqli"]
---

# Writeup 내용
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL | ✅ |
| `AUTH_SECRET` | Auth.js 시크릿 (openssl rand -base64 32) | ✅ |
| `AUTH_GITHUB_ID` | GitHub OAuth Client ID | ✅ |
| `AUTH_GITHUB_SECRET` | GitHub OAuth Client Secret | ✅ |
| `ADMIN_WHITELIST` | 관리자 GitHub 유저네임 (쉼표 구분) | ✅ |
| `GITHUB_TOKEN` | GitHub Personal Access Token (repo 권한) | ✅ |
| `GITHUB_REPO_OWNER` | 저장소 소유자 | ✅ |
| `GITHUB_REPO_NAME` | 저장소 이름 | ✅ |
| `GEMINI_API_KEY` | Gemini API 키 (AI 번역용) | ⭕ |
| `DB_PATH` | SQLite DB 경로 | ⭕ |

---

## 🚀 Deployment

### GitHub Actions (자동 배포)

`.github/workflows/deploy.yml` 설정으로 `main` 브랜치 푸시 시 자동 배포:

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    steps:
      - name: Deploy to Production
        run: |
          ssh ${{ secrets.SSH_HOST }} "
            cd /path/to/blog
            git pull
            npm run build
            pm2 reload arang-blog
          "
```

### Manual Deployment

```bash
# 서버에서 실행
git pull
npm run build
pm2 restart arang-blog
```

---

## 🛡️ Admin Dashboard

`/admin` 경로로 접근 (GitHub OAuth 인증 필요)

- **글 관리**: 작성, 편집, 삭제 (GitHub 커밋)
- **번역 관리**: AI 번역 생성, 편집, 삭제
- **댓글 관리**: 댓글 조회 및 삭제
- **정적 페이지 편집**: Home, About 페이지 편집
- **허니팟 로그**: 봇 공격 시도 모니터링

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Arang (Jaewook You)** - Security Researcher & CTF Player

- GitHub: [@JaewookYou](https://github.com/JaewookYou)
- Blog: [blog.arang.kr](https://blog.arang.kr)
