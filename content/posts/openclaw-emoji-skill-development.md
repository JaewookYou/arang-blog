---
title: "OpenClaw 디스코드 이모지 스킬 개발기 - 사용자 승인 워크플로우 구현"
description: "OpenClaw AI 에이전트에서 디스코드 이모지 반응을 감지하여 사용자 의사결정을 받는 스킬을 개발하고 GitHub에 업로드한 경험기. ClawdHub 배포 과정에서 겪은 문제와 해결책도 공유."
date: 2026-02-01
tags: ["OpenClaw", "Discord", "AI Agent", "Skill Development", "ClawdHub"]
category: "Development"
published: true
---

## 들어가며

AI 에이전트를 사용하다 보면 "이거 진짜 실행해도 될까?"라는 순간이 온다. 특히 트윗 포스팅, 이메일 발송, 파일 삭제 같은 **되돌릴 수 없는 작업**에서 더욱 그렇다.

그래서 만들었다. **디스코드 이모지 반응으로 사용자 승인을 받는 스킬**.

> 📸 *디스코드에서 1️⃣ 2️⃣ 3️⃣ 🔥 ❌ 이모지가 달린 메시지 예시*

---

## 문제 정의

OpenClaw로 "알파헌터"라는 크립토 시황 자동 트위터 봇을 만들고 있었다. AI가 뉴스를 수집하고 트윗 후보를 생성하는 것까지는 좋은데, 문제는 **승인 없이 바로 포스팅하면 안 된다**는 것.

기존 방식의 한계:
- ✅/❌ 이모지를 쓰면 디스코드에서 잘려서 안 보임
- 여러 후보 중 선택이 어려움
- 승인 없이 포스팅되는 경우 발생

---

## 해결책: 숫자 이모지 승인 시스템

### 설계 원칙

![이모지 승인 워크플로우](/images/posts/openclaw-emoji/emoji-approval-flow.png)

### 구현 코드 (approval_workflow.py)

```python
class ApprovalManager:
    """승인 워크플로우 관리자"""
    
    EMOJI_MAP = {
        '1️⃣': 0,
        '2️⃣': 1,
        '3️⃣': 2,
        '🔥': 'all',
        '❌': 'reject'
    }
    
    def __init__(self):
        self.pending = {}  # message_id -> candidates
        self.approved = []  # 승인된 후보 큐
        
    def submit_candidates(self, candidates: list, message_id: str):
        """후보 제출 및 이모지 달기"""
        self.pending[message_id] = {
            'candidates': candidates,
            'submitted_at': datetime.now(),
            'expires_at': datetime.now() + timedelta(hours=24)
        }
        return self.EMOJI_MAP.keys()  # 달아야 할 이모지 목록
    
    def process_reaction(self, message_id: str, emoji: str):
        """이모지 반응 처리"""
        if message_id not in self.pending:
            return None
            
        action = self.EMOJI_MAP.get(emoji)
        candidates = self.pending[message_id]['candidates']
        
        if action == 'all':
            self.approved.extend(candidates)
        elif action == 'reject':
            del self.pending[message_id]
        elif isinstance(action, int) and action < len(candidates):
            self.approved.append(candidates[action])
            
        return self.approved
```

### 디스코드 연동

OpenClaw의 `message` 도구로 이모지를 달아준다:

```python
# 후보 전송 후 이모지 달기
message_id = send_candidates_to_discord(candidates)

for emoji in ['1️⃣', '2️⃣', '3️⃣', '🔥', '❌']:
    message(
        action='react',
        channel='discord',
        messageId=message_id,
        emoji=emoji
    )
```

---

## GitHub 업로드

스킬 개발이 완료되면 GitHub에 올려야 한다. OpenClaw 스킬은 다음 구조를 따른다:

```
skills/
└── discord-emoji-approval/
    ├── SKILL.md           # 스킬 문서
    ├── scripts/
    │   └── approval_workflow.py
    └── config.json        # 설정
```

### SKILL.md 작성

```markdown
# Discord Emoji Approval Skill

디스코드 이모지 반응으로 사용자 승인을 받는 스킬.

## 사용법

1. 후보를 디스코드로 전송
2. 이모지 5개 달기 (1️⃣ 2️⃣ 3️⃣ 🔥 ❌)
3. 사용자가 이모지 클릭
4. 승인된 후보만 실행

## 의존성
- OpenClaw message 도구 (react 액션)
```

### Git 커밋 & 푸시

```bash
cd ~/.openclaw/workspace/skills/discord-emoji-approval
git add .
git commit -m "feat: 디스코드 이모지 승인 스킬 추가"
git push origin main
```

---

## ClawdHub 배포 시도 (실패)

[ClawdHub](https://clawdhub.com)는 OpenClaw 스킬 마켓플레이스다. 만든 스킬을 공유할 수 있다.

### 배포 시도

```bash
clawdhub publish ./skills/discord-emoji-approval
```

### 발생한 오류

```
Error: Unable to connect to clawdhub.com
Status: 503 Service Unavailable
```

서비스가 일시적으로 불안정한 상태였다. 나중에 다시 시도하기로.

### 대안: GitHub에서 직접 설치

ClawdHub가 안 되면 GitHub URL로 직접 설치할 수 있다:

```bash
# 다른 사람이 설치할 때
git clone https://github.com/arang/openclaw-skills.git
cp -r openclaw-skills/discord-emoji-approval ~/.openclaw/workspace/skills/
```

---

## 교훈

### 1. 사용자 승인은 필수

AI가 아무리 똑똑해도 **되돌릴 수 없는 작업**은 사람이 확인해야 한다.

### 2. 이모지는 직관적

텍스트로 "1번을 선택하세요"보다 1️⃣ 이모지가 훨씬 빠르다.

### 3. 큐잉 시스템 필요

여러 개 선택 시 동시에 실행하면 rate limit에 걸린다. 순차 실행이 안전.

### 4. 오프라인 폴백

ClawdHub 같은 외부 서비스가 안 될 때를 대비해 GitHub 직접 설치 방법도 문서화해두자.

---

## 마무리

이 스킬 덕분에 알파헌터 봇이 "AI가 알아서 트윗 올리는 위험한 봇"에서 "사람이 승인하면 트윗하는 안전한 봇"으로 변했다.

다음에는 실제로 이 승인 시스템을 활용해 **자가발전하는 AI 에이전트**를 만든 경험을 공유하겠다.

---

**관련 링크:**
- [OpenClaw 공식 문서](https://docs.openclaw.ai)
- [ClawdHub 스킬 마켓](https://clawdhub.com)
- [GitHub 저장소](https://github.com/arang/openclaw-skills)
