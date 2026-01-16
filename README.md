# Arang Tech Blog 🔐

> Security Research & CTF Writeups by Arang

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green)

**[🌐 Live Demo: blog.arang.kr](https://blog.arang.kr)**

---

## ✨ Features

### Core
- 🌙 **Dark Mode First** - Zinc + Emerald 테마 기반 다크 우선 디자인
- 📝 **MDX Support** - Velite를 활용한 콘텐츠 관리
- 🎨 **Code Highlighting** - Tokyo Night 테마 + 라인 넘버 + 하이라이팅
- 🔄 **Code Wrap Toggle** - 코드 블록 줄바꿈/스크롤 토글

### Content
- 📰 **Blog Posts** - 기술 블로그 포스트
- 🚩 **CTF Writeups** - 카테고리/난이도/포인트 메타데이터 지원
- 🔍 **Search** - 실시간 클라이언트 사이드 검색

### SEO & Performance
- 🖼️ **Dynamic OG Images** - Edge Runtime 기반 동적 소셜 이미지 생성
- 📊 **Sitemap & RSS** - 자동 생성 사이트맵 및 RSS 피드
- ⚡ **Turbopack** - 빠른 개발 환경

### Mobile
- 📱 **Responsive Design** - 모바일 햄버거 메뉴
- 🎯 **Touch Friendly** - 모바일 최적화 UI

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Content** | Velite, MDX |
| **Fonts** | Inter, JetBrains Mono |
| **Code Highlighting** | Shiki (rehype-pretty-code) |
| **Deployment** | PM2 + Apache2 Reverse Proxy |

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
# Edit .env.local with your site URL

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
arang-blog/
├── content/               # MDX 콘텐츠
│   ├── posts/            # 블로그 포스트
│   └── writeups/         # CTF Writeups
├── src/
│   ├── app/              # Next.js App Router 페이지
│   │   ├── api/og/       # OG 이미지 생성 API
│   │   ├── posts/        # 포스트 페이지
│   │   ├── writeups/     # Writeup 페이지
│   │   └── search/       # 검색 페이지
│   ├── components/       # React 컴포넌트
│   │   ├── ui/           # shadcn/ui 컴포넌트
│   │   └── ...           # 커스텀 컴포넌트
│   └── lib/              # 유틸리티 함수
├── velite.config.ts      # Velite 콘텐츠 설정
├── tailwind.config.ts    # Tailwind CSS 설정
└── next.config.ts        # Next.js 설정
```

---

## 📝 Writing Content

### Blog Post

```mdx
---
title: "포스트 제목"
description: "포스트 설명"
date: 2026-01-17
published: true
tags: ["security", "web"]
---

# 내용 작성
```

### CTF Writeup

```mdx
---
title: "Challenge Name"
description: "Challenge description"
date: 2026-01-17
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

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL | `https://blog.arang.kr` |

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Arang** - Security Researcher & CTF Player

- GitHub: [@JaewookYou](https://github.com/JaewookYou)
- Blog: [blog.arang.kr](https://blog.arang.kr)
