---
title: "Selenium v4.10+ TypeError 에러 + webdriver-manager 에러 해결"
description: "Selenium 최신 버전에서 발생하는 TypeError와 webdriver-manager LATEST_RELEASE not found 에러 해결 방법"
date: 2023-06-15
tags: ["selenium", "python", "webdriver", "troubleshooting"]
category: "Development"
published: true
---

셀레니움 봇 만드려는데 그냥 pip3 install selenium 하고 기존 쓰던 코드 적용하니 온갖 에러가 난다


![image](/images/posts/selenium-v4-error-fix_3cdd0691.png)


1. webdriver-manager 적용시 최신 크롬 드라이버를 못찾아서 에러가남


**> pip3 install git+**[https://github.com/SergeyPirogov/webdriver_manager](https://github.com/SergeyPirogov/webdriver_manager)


**# 최신 webdriver_manager를 설치함으로써 해결**


---


![image](/images/posts/selenium-v4-error-fix_13805046.png)


2. webdriver-manager 최신버전은 python 3.7 이상버전이 필요


**# python 3.7 이상 버전 설치**


---


![image](/images/posts/selenium-v4-error-fix_f8fd4945.png)


3. 드래그한 부분이 에러인데,**TypeError: __init__() got multiple values for argument 'options'**라고 뜬다.


실제론 options땜에 에러나는건 아니고 selenium 4.10이상(맞나?)부터 webdriver path 지정을 Service라는 애를 통해서 해야하는거로 변했다고한다(ㅡㅡ..)


>**from selenium.webdriver.chrome.service import Service**


> ...


>**self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)**


**# Selinum Service를 이용해서 ChromeDriverManager().install() 사용**


4. 추가로 desired_capabilities도 deprecated됐는데 난 그냥 짜증나서 쓰고있던 desired_capabilities 기능을 빼고 썼다.


어떻게 options로 이관? 혹은 다른 방법을 통해 사용하는 지 아시는 분은 댓글 주시면 감사드리겠습니다..