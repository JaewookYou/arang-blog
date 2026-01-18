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

## 프로젝트 개요

### 만든 것

- **Next.js 15 기반 기술 블로그** (App Router, SSG)
- **4개 언어 지원** (한국어, 영어, 일본어, 중국어)
- **AI 자동 번역 시스템** (Gemini API)
- **댓글 시스템** (SQLite)
- **관리자 대시보드** (글 작성, 번역 관리)

### 기술 스택

```typescript
const techStack = {
  framework: "Next.js 15 (App Router)",
  styling: "Tailwind CSS + shadcn/ui",
  content: "Velite (MDX/Markdown)",
  database: "SQLite (better-sqlite3)",
  ai: {
    coding: "Antigravity (Gemini 기반)",
    translation: "Gemini 2 Pro",
    tools: "MCP (Model Context Protocol)"
  }
};
```

## MCP (Model Context Protocol) 활용

### MCP란?

MCP는 AI 시스템에 외부 도구와 데이터 소스를 연결하는 표준 프로토콜이다. Antigravity는 다양한 MCP 서버를 통해 기능을 확장한다.

내가 실제로 사용한 MCP 도구들:

| MCP 서버 | 용도 |
|---------|------|
| `filesystem` | 파일 읽기/쓰기, 디렉토리 탐색 |
| `github-mcp-server` | PR 생성, 이슈 관리, 커밋 |
| `brave-search-mcp-server` | 웹 검색 (에러 해결, 문서 찾기) |
| `context7` | 라이브러리 문서 조회 (최신 API) |

### 실제 활용 예시: 라이브러리 문서 조회

```typescript
// Context7 MCP를 통해 최신 Next.js 15 문서 조회
mcp_context7_query-docs({
  libraryId: "/vercel/next.js",
  query: "How to set up internationalization with App Router"
});
```

이게 왜 중요하냐면, AI가 **학습 데이터에 없는 최신 API**를 사용해야 할 때 hallucination 없이 정확한 코드를 작성할 수 있다.

## AI 페어 프로그래밍 실전 팁

### 1. 명확한 컨텍스트 제공

```markdown
# 좋은 예시
"검색 페이지(/search)의 제목이 영어로 안 바뀌고 한국어로 계속 나와. 
현재 언어는 쿠키에서 읽어오고, i18n.ts의 t() 함수를 사용 중이야.
스크린샷 첨부함."

# 안 좋은 예시  
"번역이 안 됨"
```

### 2. 스크린샷은 정말 강력하다

Antigravity는 이미지를 분석할 수 있다. 스크린샷을 첨부하면:

- 정확한 문제 위치 파악
- 레이아웃/스타일 이슈 즉시 발견
- 불필요한 설명 생략 가능

실제로 이번 프로젝트에서 "우측 네비게이션 바에 '댓글'이 다른 언어에서도 한국어로 표시돼" 라고 스크린샷과 함께 말했더니, AI가 TOC 컴포넌트가 DOM에서 h2 텍스트를 직접 읽어오기 때문임을 바로 파악했다.

### 3. 작은 단위로 요청하기

```markdown
# 좋은 접근
1. "먼저 useLocale 훅을 만들어줘"
2. "이제 Comments 컴포넌트에 적용해줘"
3. "빌드 테스트 해보고 배포해줘"

# 피해야 할 접근
"블로그 전체를 다국어 지원하게 해줘" (너무 모호함)
```

### 4. 트러블슈팅은 같이 하기

AI가 에러를 만나도 당황하지 말자. 실제 발생한 사례:

```typescript
// 문제: TOC에서 댓글 헤딩이 항상 한국어
// DOM에서 h2 텍스트를 직접 읽어오기 때문

// 해결: comments-heading id를 특별 처리
const text = id === "comments-heading" 
  ? t("comments.title", locale) 
  : (el.textContent || "");
```

## 실전 트러블슈팅 사례

### 1. 긴 URL 화면 넘침 문제

**문제**: gopher:// URL 같은 긴 텍스트가 prose 컨테이너를 넘어감

**해결**:

```css
/* globals.css */
.prose {
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.prose a,
.prose p,
.prose li {
  overflow-wrap: break-word;
  word-break: break-word;
}
```

### 2. 번역된 마크다운 렌더링 안 됨

**문제**: DB에 저장된 번역 컨텐츠가 raw 마크다운으로 표시됨

**원인**: 번역 저장 시 마크다운 → HTML 변환을 안 함

**해결**: 번역 스크립트 수정 + 마이그레이션 스크립트 작성

```javascript
// migrate-translations-to-html.js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

async function markdownToHtml(markdown) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}
```

### 3. 이전/다음 글 제목이 원본 언어로 표시

**문제**: 영어 모드에서도 이전/다음 글 제목이 한국어

**해결**: posts/[slug]/page.tsx에서 번역된 제목 조회

```typescript
// 이전/다음 글 제목 번역
if (currentLocale !== "ko") {
  if (nextPost) {
    const nextTranslation = getTranslation(nextPost.slug, "post", currentLocale);
    if (nextTranslation) {
      nextPostTitle = nextTranslation.title;
    }
  }
}
```

## AI 개발의 시사점과 고찰

### 장점

1. **속도**: 반복적인 작업(i18n 적용, CRUD 만들기)이 정말 빠르다
2. **학습 곡선 감소**: 처음 쓰는 라이브러리도 바로 활용 가능
3. **실수 감소**: 타입 에러, 문법 오류를 거의 안 만듦
4. **문서화 자동**: 커밋 메시지, 주석을 잘 작성함

### 단점 및 주의점

1. **컨텍스트 유실**: 대화가 길어지면 앞서 논의한 내용을 잊음
2. **과신 금물**: "다 됐습니다"라고 해도 직접 확인 필요
3. **보안 주의**: API 키 등 민감 정보 하드코딩 위험
4. **신제품 한계**: 매우 최신 라이브러리는 MCP 문서 조회로 보완 필요

### 현실적인 활용 팁

```markdown
✅ AI가 잘하는 것
- 보일러플레이트 코드 생성
- 반복 작업 자동화
- 에러 메시지 해석 및 해결책 제시
- 리팩토링 및 코드 정리

⚠️ 사람이 해야 할 것
- 아키텍처 결정
- 비즈니스 로직 설계
- 보안 검토
- 최종 품질 확인
```

## 결론

Antigravity + MCP 조합은 확실히 강력하다. 특히 **"Agentic"** 모드가 인상적인데, 단순히 코드를 제안하는 것을 넘어 실제로 파일을 수정하고, 빌드하고, 배포까지 해준다.

하지만 결국 **AI는 도구**다. 아무리 좋은 도구라도 방향을 잡아주고 품질을 검증하는 건 사람의 몫이다. 페어 프로그래밍 파트너로서 AI를 활용하되, 주도권은 내가 가지고 있어야 한다.


앞으로도 AI 도구들은 계속 발전할 것이고, 개발자의 역할도 점점 바뀔 것이다. 중요한 건 변화를 두려워하지 않고, 새로운 도구를 적극적으로 실험해보는 것 아닐까.

---

> 🤖 **이 포스트는 AI(Antigravity)가 작성했습니다.**
> 
> 실제로 이 블로그를 함께 만든 AI가 개발 경험을 정리한 글입니다. 
> 물론 최종 검토와 승인은 사람이 했습니다 😄
