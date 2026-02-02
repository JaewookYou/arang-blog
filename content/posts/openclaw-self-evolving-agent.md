---
title: "OpenClaw로 자가발전하는 AI 에이전트 만들기 - 알파헌터 개발기"
description: "OpenClaw AI 에이전트가 스스로 아이디어를 발전시키고, TODO.md로 태스크를 추적하며, 디스코드 이모지로 사용자 승인을 받는 시스템을 구축한 경험. AI와 협업하는 새로운 개발 패턴."
date: 2026-02-01
tags: ["OpenClaw", "AI Agent", "자동화", "Twitter Bot", "Discord"]
category: "Development"
published: true
---

## 들어가며

"AI한테 시키면 다 해주겠지"라는 생각으로 시작한 프로젝트가, AI와 **진짜 협업**하는 경험으로 바뀌었다.

크립토 시황을 자동으로 수집해서 트윗하는 "알파헌터" 봇을 만들면서 발견한 세 가지 패턴:

1. **아이디어 자가발전** - AI가 스스로 개선점을 제안
2. **태스크 상태관리** - TODO.md로 진행 상황 추적
3. **이모지 승인 워크플로우** - 디스코드로 사용자 의사결정

이 글에서 각각을 어떻게 구현했는지 공유한다.

---

## 배경: 알파헌터 프로젝트

### 목표

크립토 시장 정보를 수집해서 인사이트 있는 트윗을 자동으로 올리는 봇.

### 기능

- 📱 텔레그램 70+ 채널 실시간 수집
- 📰 뉴스/지표/공시 수집 (CoinDesk, 김프, Fear&Greed)
- 🧠 AI 분석 (감성, 트렌드)
- 📊 자동 차트 생성
- 🐦 트위터 자동 포스팅 (승인 후)

---

## 패턴 1: 아이디어 자가발전

### 문제

처음에 "텔레그램 수집해서 트윗해"라고만 시켰더니, AI가 기본 기능만 만들고 끝냈다.

### 해결책

**발전 아이디어**를 AI 스스로 생각하게 했다:

```markdown
## 발전 아이디어 (ROADMAP.md)

1. 감성 분석: 수집된 정보의 긍/부정 감성 분석
2. 트렌드 감지: 갑자기 언급량 증가하는 토픽 감지
3. 자동 차트 생성: 시황 트윗에 차트 이미지 첨부
4. 스레드 작성: 복잡한 분석은 스레드로 작성
5. 예약 포스팅: 최적의 시간대에 예약 게시
6. 성과 트래킹: 트윗별 조회수/좋아요 기록
7. A/B 테스트: 트윗 스타일별 반응 비교
8. 팔로워 분석: 팔로워 증감 추이 모니터링
```

### 결과

AI가 8개의 발전 아이디어를 제안했고, 세션이 끝나기 전에 **전부 구현**했다:

| 기능 | 파일 | 크기 |
|------|------|------|
| 감성 분석 | advanced_analysis.py | 17KB |
| 트렌드 감지 | advanced_analysis.py | (포함) |
| 차트 생성 | chart_generator.py | 14KB |
| 예약 포스팅 | scheduler.py | 17KB |
| 성과 트래킹 | performance_tracker.py | 21KB |
| 팔로워 분석 | follower_analytics.py | 15KB |

### 교훈

> **AI한테 "더 좋은 방법 없어?"라고 물어보면 진짜 있다.**

---

## 패턴 2: TODO.md로 태스크 상태관리

### 문제

AI가 아이디어를 잔뜩 써놓고... **구현하다 말았다**.

```
발전 아이디어:
- 감성 분석 ✅
- 트렌드 감지 ✅
- 자동 차트 생성 (미구현)  ← 여기서 멈춤
- 예약 포스팅 (미구현)
...
```

### 해결책

**TODO.md** 파일로 태스크 상태를 추적:

```markdown
# TODO.md - 태스크 추적

## 상태 범례
- ⬜ 아이디어 (미시작)
- 🔄 진행중
- ✅ 완료
- ❌ 취소/보류

## 분석 기능
| 상태 | 기능 | 우선순위 |
|------|------|----------|
| ✅ | 감성 분석 | P1 |
| ✅ | 트렌드 감지 | P1 |
| ⬜ | 자동 차트 생성 | P2 |

## 다음 작업 (우선순위순)
1. ⬜ 자동 차트 생성
2. ⬜ 예약 포스팅
3. ⬜ 성과 트래킹
```

### MEMORY.md에 교훈 기록

```markdown
## ⚠️ 중요 교훈

### 태스크/아이디어 상태 관리 (2026-02-01)
**문제**: 발전 아이디어를 기록해놓고 구현하다 말았음
**해결책**:
- 모든 프로젝트에 TODO.md 생성
- 아이디어 → 계획 → 진행중 → 완료 상태 관리
- 세션 시작 시 미완료 태스크 확인
- **절대 아이디어만 쓰고 방치하지 말 것**
```

### 결과

TODO.md 도입 후 AI가 남은 태스크를 **끝까지 완료**했다.

---

## 패턴 3: 디스코드 이모지 승인 워크플로우

### 문제

AI가 트윗 후보를 만들었는데... **내 승인 없이 바로 올려버렸다**.

### 해결책

디스코드 이모지로 승인 시스템 구현:

```
1. AI가 트윗 후보 3개 생성
2. 디스코드로 전송
3. 이모지 5개 달기 (1️⃣ 2️⃣ 3️⃣ 🔥 ❌)
4. 내가 이모지 클릭
5. 선택한 것만 포스팅
```

### 실제 예시

```markdown
## 🦅 알파헌터 트윗 후보 (03:07 KST)

### 1️⃣ 바이낸스 SAFU → BTC 전환
> 바이낸스, SAFU 펀드 $10억을 30일 내 전량 BTC로 전환 발표.
> 리스크 헷지인가, 확신인가?

### 2️⃣ OKX 창업자 발언
> "1/29 역대급 청산일 원인은 매크로 리스크"
> 근데 결국 구조적 문제 아닌가?

### 3️⃣ 메타플래닛 $137M BTC 매수
> 기관들이 공포장에서 매수하는 건 좋은 징조?

**아래 이모지 중 하나 선택:**
1️⃣ 2️⃣ 3️⃣ 🔥 ❌
```

### 다중 선택 & 큐잉

1️⃣ + 2️⃣ 두 개를 누르면? → **순차적으로 큐잉해서 포스팅**

```python
def process_reactions(reactions: list):
    queue = []
    for emoji in reactions:
        if emoji == '1️⃣':
            queue.append(candidates[0])
        elif emoji == '2️⃣':
            queue.append(candidates[1])
        # ...
    
    for tweet in queue:
        post_tweet(tweet)
        time.sleep(60)  # rate limit 방지
```

---

## 전체 아키텍처

![알파헌터 아키텍처](/images/posts/openclaw-agent/alphahunter-arch.png)
---

## 결론

AI 에이전트와 일하면서 배운 것:

### 1. AI는 질문을 잘 해야 답을 잘 한다
"더 좋은 방법 없어?"라고 물으면 진짜 발전 아이디어를 낸다.

### 2. 메모리는 파일로
AI의 기억력을 믿지 마라. TODO.md, MEMORY.md, ROADMAP.md에 다 써둬야 한다.

### 3. 승인 게이트는 필수
되돌릴 수 없는 작업은 반드시 사람이 확인해야 한다. 이모지가 가장 빠르다.

### 4. 자가발전은 진짜 된다
AI한테 "발전시킬 부분 있으면 알아서 해"라고 하면 **진짜 한다**.

---

## 파일 구조

최종적으로 만들어진 알파헌터 스킬:

```
skills/alphahunter/
├── SKILL.md                  # 스킬 문서
├── ROADMAP.md               # 로드맵 & 발전 아이디어
├── TODO.md                  # 태스크 추적
├── config.json              # 설정
├── scripts/
│   ├── telegram_daemon.py   # 텔레그램 상시 수집
│   ├── twitter_direct.py    # 트위터 세션 API
│   ├── news_collector.py    # 뉴스/지표/공시
│   ├── chart_generator.py   # 차트 생성
│   ├── advanced_analysis.py # 감성/트렌드 분석
│   ├── approval_workflow.py # 승인 워크플로우
│   ├── scheduler.py         # 예약 포스팅
│   ├── performance_tracker.py # 성과 트래킹
│   └── follower_analytics.py  # 팔로워 분석
└── state/
    ├── telegram_messages.json
    ├── posted.json
    └── charts/
```

---

**이 글이 도움이 됐다면:**
- 🐦 [@AlphaHunterKR](https://x.com/AlphaHunterKR) 팔로우
- ⭐ [OpenClaw GitHub](https://github.com/openclaw/openclaw) 스타

---

**관련 글:**
- [OpenClaw 디스코드 이모지 스킬 개발기](/posts/openclaw-emoji-skill-development)
- [AI 페어 프로그래밍으로 테크 블로그 만들기](/posts/ai-driven-development-with-antigravity)
