---
title: "JSP commons-fileupload WAF Bypass"
description: "CCE2019 ENKI 문제를 통해 알아보는 JSP commons-fileupload WAF 필터링 우회 기법"
date: 2020-10-15
tags: ["web-security", "waf-bypass", "file-upload", "jsp"]
category: "Security Research"
published: true
---

JSP & Spring Framework로 구현된 웹 서비스에서 파일업로드 기능을 구현할 시 가장 흔히 사용되는 모듈이`commons-fileupload`모듈입니다.


악의적인 파일업로드 취약점을 트리거하여 공격하기 위해선 서버단에서 웹서비스가 해석하여 실행 가능한 확장자(ex. jsp, jspx, jspl, jsw ...etc..)로 업로드하여 서버내에서 임의 코드를 실행시킬 수 있어야 합니다.


하지만 많은 수의 서비스들은 확장자(ext)검사를 시행하고 있고, 이를 WAF(Web Application Firewall)에서 하는 경우가 많습니다.


또한, 확장자 검사를 시행한 후엔 파일 명을 randomizing 하여 보안성을 갖추는것이 일반적인 파일업로드 취약점 대응 방법입니다.


---


하지만 만약 확장자 검사를 코드 단이 아닌 WAF단에서만 수행을 하고, random으로 생성된 파일명이 공격자에게 노출된다면(꽤나 많은 케이스에서 이런 상황이 발견되는것 같습니다)`commons-fileupload`모듈의 코드 구현 특징을 이용하여 이를 우회할 수 있습니다.


```
@Override
 protected void doPost(HttpServletRequest request, HttpServletResponse response)
 throws ServletException, IOException {

 response.setContentType("text/html; charset=UTF-8");
 request.setCharacterEncoding(CHARSET);
 PrintWriter out = response.getWriter();

 File attachesDir = new File(ATTACHES_DIR);

 DiskFileItemFactory fileItemFactory = new DiskFileItemFactory();
 fileItemFactory.setRepository(attachesDir);
 fileItemFactory.setSizeThreshold(LIMIT_SIZE_BYTES);
 ServletFileUpload fileUpload = new ServletFileUpload(fileItemFactory);

 try {
 List<FileItem> items = fileUpload.parseRequest(request);
 for (FileItem item : items) {
 if (item.isFormField()) {
 System.out.printf("파라미터 명 : %s, 파라미터 값 : %s \n", item.getFieldName(), item.getString(CHARSET));
 } else {
 System.out.printf("파라미터 명 : %s, 파일 명 : %s, 파일 크기 : %s bytes \n", item.getFieldName(),
 item.getName(), item.getSize());
 if (item.getSize() > 0) {
 Object fileName = new File(item.getName()).getName();
 fileName = this.makeFn((String)fileName) + "." + this.getExt((String)fileName); // makeFn -> make random filename
 String filePath = uploadPath + File.separator + (String)fileName;
 File storeFile = new File(filePath);
 item.write(storeFile);
 }
 }
 }
 out.println("<h1>파일 업로드 완료</h1>");
 } catch (Exception e) {
 // 파일 업로드 처리 중 오류가 발생하는 경우
 e.printStackTrace();
 out.println("<h1>파일 업로드 중 오류가 발생하였습니다.</h1>");
 }
 }

출처: https://dololak.tistory.com/720 [코끼리를 냉장고에 넣는 방법]
```


```
private String getExt(String fileName) {
 if (fileName.lastIndexOf(".") == -1)
 return "noext"; 
 fileName = fileName.substring(fileName.lastIndexOf(".") + 1).trim();
 if ("".equals(fileName))
 return "noext"; 
 return fileName.substring(fileName.lastIndexOf(".") + 1);
 }
```


위의 코드는`구글`에`commons-fileupload`라고 검색하였을때 나오는 '기본 예제 코드'에 파일 확장자 검사 코드를 추가한 코드입니다.


실제 코드상으로는 WAF에서 확장자 검사를 하여 .jpg.png 등 허용 확장자만 whitelist로 관리하고 있다면 보안 취약점이 발생하지 않는 것으로 보입니다. 또 실제로 저도 이 기법을 접하기 전까진 해당 상황에선 취약점 익스플로잇이 불가능하다고 생각을 해왔었습니다.


하지만 문제는`commons-fileupload`모듈이 버전 1.3부터**RFC2047**을[지원](https://commons.apache.org/proper/commons-fileupload/)한다는 데에서 시작됩니다.


`RFC2047`은`MIME (Multipurpose Internet Mail Extensions) Part Three: Message Header Extensions for Non-ASCII Text`에 대한 명세인데, Non ascii text에 대해서 인코딩 방식을 요청자가 지정하여 인코딩하여 전송하고, 응답자는 이를 디코딩하여 해석한다는 내용이 주를 이룹니다.


이를`commons-fileupload`모듈에서 적용하게된 내용을 간략한 코드흐름으로 살펴보면,


- 상기 코드 상`List<FileItem> items = fileUpload.parseRequest(request);`부문
- `public List<FileItem> parseRequest(HttpServletRequest req)`에서 내부적으로**private String getFileName(String pContentDisposition)**호출
- `private String getFileName(String pContentDisposition)`에서**public Map<String, String> parse**호출
- `public Map<String, String> parse`에서**public static String decodeText(String text)**호출
- `public static String decodeText(String text)`에서**private static String decodeWord(String word)**호출 및`RFC 2047`명세 중 인코딩 된 파라미터의 디코딩 진행


와 같이 진행됩니다.


RFC2047에서 명세된 인코딩 형식은`=?" charset "?" encoding "?" encoded-text "?=`입니다.


이 중 encoding 방식에 대한 설명은 아래와 같습니다


```
4. Encodings

 Initially, the legal values for "encoding" are "Q" and "B". These
 encodings are described below. The "Q" encoding is recommended for
 use when most of the characters to be encoded are in the ASCII
 character set; otherwise, the "B" encoding should be used.

 ...중략...

 4.1. The "B" encoding

 The "B" encoding is identical to the "BASE64" encoding defined by RFC
```


인코딩은 평문(Q)와 Base64(B)를 지원하고 있습니다. 이를통해`some_webshell.jsp`에서`.jsp`와 같은 문구를 잡아내는 WAF를 우회할 수 있습니다.


하지만 여전히 WAF에서 맨 마지막 확장자를 검사하는 로직은 우회하지 못하였습니다.


이는 commons-fileupload에서 RFC2047을 구현한 특징으로 우회할 수 있습니다.


[decodeText() 메서드 중 인코딩 형식의 문자열 파싱 부분](https://github.com/apache/commons-fileupload/blob/ed6c3a405de8959db6dc3a35118ead31df07bfb2/src/main/java/org/apache/commons/fileupload2/util/mime/MimeUtility.java#L226)을 살펴보면`int encodedTextPos = word.indexOf(ENCODED_TOKEN_FINISHER, encodingPos + 1);`로 encodedTextPos를 설정하고, 이후 진행되는 코드에서 인코딩 된 영역만 가져와 디코딩 후 파일 이름으로 가져오기 때문에


`=?UTF8?B?c29tZV93ZWJzaGVsbC5qc3A=?=.jpg`와 같은 형식으로 인코딩 영역이 끝난 부분에 .jpg를 삽입하게 되면 실제 jsp에서 파일명을 파싱할 시 이 부분이 무시됩니다.


---


여기까지 진행됐다면, WAF에서 수행하는`1. '.jsp'와 같은 문자열 포함 검사`,`2. lastIndexOf('.')`등을 통한 업로드 취약점 검사를 모두 우회할 수 있습니다.


이후에 jsp 코드에선 정상적으로`some_webshell.jsp`로 파일이 생성되기 때문에 웹쉘을 업로드하는데 성공할 수 있게 됩니다.


---


개인적으로도 파일 업로드 취약점 진단 시 commons-fileupload 모듈이 많이 사용되고있는걸 느꼈는데 이런 기법이 있었다는걸 몰랐어서, 내용을 보고 많이 놀랐기도 하여 해당 내용을 접하자마자 급히 글을 작성하여 업로드 하게 되었습니다.


해당 글은`2019년 CCE(사이버 공격방어대회)`에 출제한`ENKI`의**공식 라이트업**을 참조하여 작성되었습니다.


참고문헌 :[https://enki.co.kr/blog/2020/02/27/cce_writeup.html?fbclid=IwAR0ztC_wshd_DHvIA-HBMh_F99TdqkPiqyGyBu_WfP6Id-2TPTPPp_uPkZY](https://enki.co.kr/blog/2020/02/27/cce_writeup.html?fbclid=IwAR0ztC_wshd_DHvIA-HBMh_F99TdqkPiqyGyBu_WfP6Id-2TPTPPp_uPkZY)