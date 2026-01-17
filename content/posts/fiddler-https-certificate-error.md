---
title: "Fiddler HTTPS 인증서 오류 해결"
description: "Fiddler에서 HTTPS 트래픽 캡처 시 발생하는 인증서 오류 해결 방법"
date: 2022-08-20
tags: ["fiddler", "https", "certificate", "troubleshooting"]
category: "Security Research"
published: true
---

* Fiddler Classic(Not Everywhere)


가끔 피들러를 사용하다보면 https 인증서때문에 말썽일 경우가 많다


보통 인증서 기간 만료, 인증서 기간이 너무 김, 인증서를 신뢰할 수 없음 등등의 에러인데


이럴 때 구글에 나오는 해결책(certenroll engine reset)으로도 안되는 경우에 빠져 잠시 헤매다 해결책을 찾아 공유한다.


(일반적인 해결책, 피들러 최신버전)


Tools - Options - HTTPS - Actions - Reset All Certificate


보통 위의 해결책으로 해결이 되어야하지만 이번에 내가 봉착한 케이스는 Reset All Certificate를 하면 피들러가 멈춰버리는 현상이 발생했다.


해결한 이후 그 이유를 유추해보면, Reset하는 과정에서, 피들러가 생성한 와일드카드 인증서들을 삭제해야하는데, 이러한 와일드카드 인증서 중 삭제가 안되어 피들러가 Exception에 빠져 멈춰버리는것 같다.


어쨌든 각설하여 이를 해결하기위해선 피들러가 설치한 와일드카드 인증서 및 피들러의 인증서(DO_NOT_TURST_FiddlerRoot)들을 모두 직접 삭제해주면 된다.


실행 - certmgr.msc


ㄴ [개인용-인증서]에 존재하는 모든 와일드카드 인증서 삭제


ㄴ [신뢰할 수 있는 루트 인증 기관]에 존재하는 모든 DO_NOT_TRUST_FiddlerRoot 인증서 삭제


ㄴ .. 기타 경로에 존재하는 모든 피들러 인증서 삭제


이후 (일반적인 해결책)으로 돌아가 Reset All Certificate를 해주면 정상적으로 https 인증서를 발급해주는것을 확인할 수 있다.


(부들부들..)