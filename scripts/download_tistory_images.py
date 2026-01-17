#!/usr/bin/env python3
"""
티스토리 블로그에서 HTML을 파싱하여 텍스트와 이미지 순서를 유지하면서 마크다운으로 변환
이미지는 원래 위치에 맞게 삽입
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib
import time
import html

# 티스토리 글 목록
POSTS = {
    "posts": [
        ("72", "selenium-v4-error-fix"),
        ("69", "fiddler-https-certificate-error"),
        ("56", "jsp-commons-fileupload-waf-bypass"),
        ("35", "csp-bypass-techniques"),
        ("34", "ecmascript-xss-bypass"),
        ("31", "xss-bypass-waf-filtering"),
        ("7", "sql-injection-bypass-tips"),
    ],
    "writeups": [
        ("71", "wacon-2022-kuncelan"),
        ("70", "codegate-2022-web-blockchain"),
        ("68", "fiesta-2021-chatservice"),
        ("67", "whitehat-2021-web"),
        ("66", "cyberwarfare-2020-vaccine-paper"),
        ("65", "cyberwarfare-2020-intranet"),
        ("64", "tsg-ctf-2020-slick-logger"),
        ("63", "defenit-ctf-2020-osint"),
        ("33", "hacklu-2019-rpdg"),
        ("6", "asis-ctf-2018-neighbour"),
    ]
}

# 프론트매터 정보
FRONTMATTER = {
    "posts": {
        "72": """---
title: "Selenium v4.10+ TypeError 에러 + webdriver-manager 에러 해결"
description: "Selenium 최신 버전에서 발생하는 TypeError와 webdriver-manager LATEST_RELEASE not found 에러 해결 방법"
date: 2023-06-15
tags: ["selenium", "python", "webdriver", "troubleshooting"]
category: "Development"
published: true
---

""",
        "69": """---
title: "Fiddler HTTPS 인증서 오류 해결"
description: "Fiddler에서 HTTPS 트래픽 캡처 시 발생하는 인증서 오류 해결 방법"
date: 2022-08-20
tags: ["fiddler", "https", "certificate", "troubleshooting"]
category: "Security Research"
published: true
---

""",
        "56": """---
title: "JSP commons-fileupload WAF Bypass"
description: "CCE2019 ENKI 문제를 통해 알아보는 JSP commons-fileupload WAF 필터링 우회 기법"
date: 2020-10-15
tags: ["web-security", "waf-bypass", "file-upload", "jsp"]
category: "Security Research"
published: true
---

""",
        "35": """---
title: "CSP Bypass 기법"
description: "Content Security Policy를 우회하는 다양한 기법 정리"
date: 2019-11-10
tags: ["web-security", "csp", "bypass", "xss"]
category: "Security Research"
published: true
---

""",
        "34": """---
title: "최신 ECMAScript 기능을 활용한 XSS Filtering Bypass"
description: "ECMAScript의 새로운 기능들을 활용한 XSS 필터링 우회 기법 및 원리 해설"
date: 2019-11-05
tags: ["web-security", "xss", "ecmascript", "bypass"]
category: "Security Research"
published: true
---

""",
        "31": """---
title: "XSS Bypass WAF & Filtering 기법"
description: "모의해킹 및 버그바운티 시 XSS 취약점 분석에서 얻은 WAF 우회 및 필터링 우회 기법"
date: 2019-10-15
tags: ["web-security", "xss", "bypass", "waf"]
category: "Security Research"
published: true
---

""",
        "7": """---
title: "SQL Injection 우회기법 정리"
description: "웹해킹 워게임을 풀면서 배운 SQL Injection 우회기법 모음"
date: 2018-05-10
tags: ["web-security", "sql-injection", "bypass", "waf"]
category: "Security Research"
published: true
---

""",
    },
    "writeups": {
        "71": """---
title: "2022 WACon CTF - kuncelan Writeup"
description: "WACon 2022 kuncelan(blackbox) 웹 문제 풀이 - LFI, SSRF, Gopher를 이용한 SQL Injection"
date: 2022-06-18
tags: ["wacon", "lfi", "ssrf", "gopher", "sqli"]
ctf: "WACon CTF 2022"
published: true
---

""",
        "70": """---
title: "Codegate 2022 Web/Blockchain Writeup"
description: "Codegate 2022 예선 Web 전체 문제 및 Blockchain(NFT) 문제 풀이"
date: 2022-02-27
tags: ["codegate", "ssrf", "xpath-injection", "aes", "blockchain"]
ctf: "Codegate CTF 2022"
published: true
---

""",
        "68": """---
title: "금융보안원 FIESTA 2021 - 출제자 Writeup"
description: "FSI cha tin gse rvi ce! 웹해킹 문제 출제자 풀이 - SSRF로 MySQL 임의 쿼리 실행"
date: 2021-11-15
tags: ["fiesta", "ssrf", "mysql", "web-security"]
ctf: "FIESTA 2021"
published: true
---

""",
        "67": """---
title: "2021 화이트햇콘테스트 웹 분야 Writeup"
description: "2021 화이트햇콘테스트 예선 웹 문제 풀이 - Imageflare, mudbox, mini-realworld"
date: 2021-10-20
tags: ["whitehat", "file-upload", "path-traversal", "php"]
ctf: "Whitehat Contest 2021"
published: true
---

""",
        "66": """---
title: "2020 사이버작전 경연대회 - Vaccine Paper Writeup"
description: "CSP를 이용한 XS-Leak 공격으로 관리자 키 탈취"
date: 2020-11-20
tags: ["cyber-warfare", "xs-leak", "csp", "font-face"]
ctf: "사이버작전 경연대회 2020"
published: true
---

""",
        "65": """---
title: "2020 사이버작전 경연대회 - Intranet Writeup"
description: "Nginx route 설정 오류와 NoSQL Injection, Race Condition을 이용한 권한 상승"
date: 2020-11-20
tags: ["cyber-warfare", "nosql-injection", "race-condition", "nginx"]
ctf: "사이버작전 경연대회 2020"
published: true
---

""",
        "64": """---
title: "2020 TSG CTF - Slick Logger Writeup"
description: "Time-based Blind Regex Injection으로 플래그 탈취"
date: 2020-07-12
tags: ["tsg-ctf", "regex-injection", "blind", "golang"]
ctf: "TSG CTF 2020"
published: true
---

""",
        "63": """---
title: "Defenit CTF 2020 OSINT 출제자 Writeup"
description: "암호화폐와 악성코드 C2 서버를 주제로 한 OSINT 문제 출제자 풀이"
date: 2020-06-06
tags: ["defenit-ctf", "osint", "cryptocurrency", "malware"]
ctf: "Defenit CTF 2020"
published: true
---

""",
        "33": """---
title: "2019 hack.lu CTF - RPDG Writeup"
description: "SQL Injection과 빈도수 분석을 통한 admin password 유추"
date: 2019-10-25
tags: ["hacklu", "sql-injection", "misc", "frequency-analysis"]
ctf: "hack.lu CTF 2019"
published: true
---

""",
        "6": """---
title: "ASIS CTF 2018 - Neighbour Writeup"
description: "효율적인 수학 계산으로 x^y 형태의 숫자 중 n에 가장 가까운 값 찾기"
date: 2018-05-01
tags: ["asis-ctf", "ppc", "math", "algorithm"]
ctf: "ASIS CTF 2018"
published: true
---

""",
    }
}

BASE_URL = "https://ar9ang3.tistory.com/"
CONTENT_DIR = "/home/arang/web/blog/content"
PUBLIC_DIR = "/home/arang/web/blog/public/images"

def get_image_filename(url, slug):
    """이미지 URL에서 고유 파일명 생성"""
    parsed = urlparse(url)
    ext = os.path.splitext(parsed.path)[1] or '.png'
    if '?' in ext:
        ext = ext.split('?')[0]
    if not ext or len(ext) > 5:
        ext = '.png'
    return f"{slug}_{hashlib.md5(url.encode()).hexdigest()[:8]}{ext}"

def download_image(url, save_dir, filename):
    """이미지 다운로드"""
    filepath = os.path.join(save_dir, filename)
    
    if os.path.exists(filepath):
        return True
    
    try:
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': BASE_URL
        })
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"    Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"    [!] Error downloading {url}: {e}")
        return False

def html_to_markdown(element, category, slug, save_dir):
    """HTML 요소를 마크다운으로 변환, 이미지는 원래 위치에 삽입"""
    markdown_lines = []
    
    def process_element(el, depth=0):
        if el.name is None:  # Text node
            text = str(el).strip()
            if text:
                return text
            return ""
        
        result = ""
        
        # 이미지 처리
        if el.name == 'img':
            src = el.get('src') or el.get('data-src') or el.get('data-lazy-src')
            if src:
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = urljoin(BASE_URL, src)
                
                if 'tistory' in src or 'daumcdn' in src or 'kakaocdn' in src:
                    filename = get_image_filename(src, slug)
                    if download_image(src, save_dir, filename):
                        alt = el.get('alt', 'image')
                        return f"\n\n![{alt}](/images/{category}/{filename})\n\n"
            return ""
        
        # 헤더 처리
        if el.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(el.name[1])
            text = el.get_text(strip=True)
            if text:
                return f"\n\n{'#' * level} {text}\n\n"
            return ""
        
        # 코드 블록 처리
        if el.name == 'pre' or (el.name == 'div' and 'code' in el.get('class', [])):
            code = el.get_text()
            if code.strip():
                return f"\n\n```\n{code.strip()}\n```\n\n"
            return ""
        
        # 인라인 코드 처리
        if el.name == 'code':
            text = el.get_text()
            parent = el.parent
            if parent and parent.name not in ['pre']:
                return f"`{text}`"
            return text
        
        # 링크 처리
        if el.name == 'a':
            href = el.get('href', '')
            text = el.get_text(strip=True)
            if text and href:
                return f"[{text}]({href})"
            return text
        
        # 굵은 글씨
        if el.name in ['strong', 'b']:
            text = el.get_text(strip=True)
            if text:
                return f"**{text}**"
            return ""
        
        # 기울임
        if el.name in ['em', 'i']:
            text = el.get_text(strip=True)
            if text:
                return f"*{text}*"
            return ""
        
        # 리스트 처리
        if el.name == 'ul':
            items = []
            for li in el.find_all('li', recursive=False):
                item_text = ""
                for child in li.children:
                    item_text += process_element(child, depth + 1)
                if item_text.strip():
                    items.append(f"- {item_text.strip()}")
            if items:
                return "\n" + "\n".join(items) + "\n"
            return ""
        
        if el.name == 'ol':
            items = []
            for idx, li in enumerate(el.find_all('li', recursive=False), 1):
                item_text = ""
                for child in li.children:
                    item_text += process_element(child, depth + 1)
                if item_text.strip():
                    items.append(f"{idx}. {item_text.strip()}")
            if items:
                return "\n" + "\n".join(items) + "\n"
            return ""
        
        # 단락 처리
        if el.name == 'p':
            content = ""
            for child in el.children:
                content += process_element(child, depth)
            if content.strip():
                return f"\n\n{content.strip()}\n\n"
            return ""
        
        # div, span 등은 자식 요소만 처리
        if el.name in ['div', 'span', 'section', 'article', 'figure', 'figcaption']:
            content = ""
            for child in el.children:
                content += process_element(child, depth)
            return content
        
        # br
        if el.name == 'br':
            return "\n"
        
        # hr
        if el.name == 'hr':
            return "\n\n---\n\n"
        
        # blockquote
        if el.name == 'blockquote':
            text = el.get_text(strip=True)
            if text:
                lines = text.split('\n')
                quoted = '\n'.join([f"> {line}" for line in lines])
                return f"\n\n{quoted}\n\n"
            return ""
        
        # table
        if el.name == 'table':
            return f"\n\n{str(el)}\n\n"  # HTML 테이블 그대로 유지
        
        # 기타: 텍스트 추출
        text = el.get_text()
        if text.strip():
            return text
        return ""
    
    return process_element(element)

def convert_tistory_to_markdown(post_id, category, slug):
    """티스토리 글을 마크다운으로 변환 (이미지 원래 위치에 삽입)"""
    url = f"{BASE_URL}{post_id}"
    save_dir = os.path.join(PUBLIC_DIR, category)
    os.makedirs(save_dir, exist_ok=True)
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 본문 영역 찾기 (티스토리 다양한 스킨 지원)
        content_area = None
        selectors = [
            ('div', {'class': 'tt_article_useless_p_margin'}),
            ('div', {'class': 'entry-content'}),
            ('div', {'class': 'area_view'}),
            ('article', {}),
            ('div', {'class': 'article'}),
            ('div', {'class': 'post-content'}),
        ]
        
        for tag, attrs in selectors:
            content_area = soup.find(tag, attrs)
            if content_area:
                break
        
        if not content_area:
            print(f"  [!] Could not find content area for {post_id}")
            return None
        
        # HTML을 마크다운으로 변환
        markdown_content = html_to_markdown(content_area, category, slug, save_dir)
        
        # 중복 공백 정리
        markdown_content = re.sub(r'\n{4,}', '\n\n\n', markdown_content)
        markdown_content = re.sub(r' {2,}', ' ', markdown_content)
        
        # frontmatter 추가
        frontmatter = FRONTMATTER[category].get(post_id, "")
        if not frontmatter:
            print(f"  [!] No frontmatter for {post_id}")
            return None
        
        full_content = frontmatter + markdown_content.strip()
        
        return full_content
        
    except Exception as e:
        print(f"  [!] Error converting {url}: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    total_images = 0
    success_count = 0
    
    for category, posts in POSTS.items():
        print(f"\n{'='*60}")
        print(f"Processing {category.upper()}")
        print('='*60)
        
        for post_id, slug in posts:
            print(f"\n[{post_id}] {slug}")
            
            # 마크다운 변환
            markdown = convert_tistory_to_markdown(post_id, category, slug)
            
            if markdown:
                # 파일 저장
                mdx_path = os.path.join(CONTENT_DIR, category, f"{slug}.mdx")
                with open(mdx_path, 'w', encoding='utf-8') as f:
                    f.write(markdown)
                print(f"  ✓ Saved: {mdx_path}")
                success_count += 1
            else:
                print(f"  ✗ Failed to convert")
            
            time.sleep(0.5)  # Rate limiting
    
    print(f"\n{'='*60}")
    print(f"Converted {success_count}/{len(POSTS['posts']) + len(POSTS['writeups'])} posts")
    print('='*60)

if __name__ == "__main__":
    main()
