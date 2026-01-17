#!/usr/bin/env python3
"""
티스토리 블로그에서 이미지를 추출하고 다운로드하는 스크립트
"""

import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import hashlib
import time

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

BASE_URL = "https://ar9ang3.tistory.com/"
CONTENT_DIR = "/home/arang/web/blog/content"
PUBLIC_DIR = "/home/arang/web/blog/public/images"

def get_images_from_tistory(post_id):
    """티스토리 글에서 이미지 URL 추출"""
    url = f"{BASE_URL}{post_id}"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 본문 영역 찾기
        content_area = soup.find('div', class_='entry-content') or \
                       soup.find('div', class_='tt_article_useless_p_margin') or \
                       soup.find('article') or \
                       soup.find('div', class_='area_view')
        
        if not content_area:
            # 전체 페이지에서 이미지 찾기
            content_area = soup
        
        images = []
        for img in content_area.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                # 상대 URL을 절대 URL로 변환
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = urljoin(BASE_URL, src)
                
                # 티스토리 CDN 이미지만 추출
                if 'tistory' in src or 'daumcdn' in src or 'kakaocdn' in src:
                    images.append(src)
        
        return images
    except Exception as e:
        print(f"[!] Error fetching {url}: {e}")
        return []

def download_image(url, save_dir, prefix):
    """이미지 다운로드"""
    try:
        # 파일명 생성 (URL 해시 + 원본 확장자)
        parsed = urlparse(url)
        ext = os.path.splitext(parsed.path)[1] or '.png'
        if '?' in ext:
            ext = ext.split('?')[0]
        if not ext or len(ext) > 5:
            ext = '.png'
        
        filename = f"{prefix}_{hashlib.md5(url.encode()).hexdigest()[:8]}{ext}"
        filepath = os.path.join(save_dir, filename)
        
        if os.path.exists(filepath):
            print(f"  [=] Already exists: {filename}")
            return filename
        
        response = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': BASE_URL
        })
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"  [+] Downloaded: {filename}")
        return filename
    except Exception as e:
        print(f"  [!] Error downloading {url}: {e}")
        return None

def update_markdown_with_images(mdx_path, category, slug, images_info):
    """마크다운 파일에 이미지 추가"""
    if not images_info:
        return
    
    try:
        with open(mdx_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 이미지 섹션 추가 (본문 시작 직후, 첫 번째 ## 전에)
        image_md = "\n\n## 📸 원본 이미지\n\n"
        for idx, (url, filename) in enumerate(images_info, 1):
            image_path = f"/images/{category}/{filename}"
            image_md += f"![Image {idx}]({image_path})\n\n"
        
        # 첫 번째 ## 찾아서 그 앞에 삽입
        match = re.search(r'\n## ', content)
        if match:
            insert_pos = match.start()
            new_content = content[:insert_pos] + image_md + content[insert_pos:]
        else:
            # ## 없으면 맨 끝에 추가
            new_content = content + image_md
        
        with open(mdx_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  [*] Updated: {mdx_path}")
    except Exception as e:
        print(f"  [!] Error updating {mdx_path}: {e}")

def main():
    total_images = 0
    
    for category, posts in POSTS.items():
        print(f"\n{'='*50}")
        print(f"Processing {category.upper()}")
        print('='*50)
        
        save_dir = os.path.join(PUBLIC_DIR, category)
        os.makedirs(save_dir, exist_ok=True)
        
        for post_id, slug in posts:
            print(f"\n[{post_id}] {slug}")
            
            # 이미지 URL 추출
            images = get_images_from_tistory(post_id)
            print(f"  Found {len(images)} images")
            
            if not images:
                continue
            
            # 이미지 다운로드
            downloaded = []
            for img_url in images:
                filename = download_image(img_url, save_dir, slug)
                if filename:
                    downloaded.append((img_url, filename))
                time.sleep(0.3)  # Rate limiting
            
            # 마크다운 업데이트
            mdx_path = os.path.join(CONTENT_DIR, category, f"{slug}.mdx")
            if os.path.exists(mdx_path):
                update_markdown_with_images(mdx_path, category, slug, downloaded)
            
            total_images += len(downloaded)
    
    print(f"\n{'='*50}")
    print(f"Total images downloaded: {total_images}")
    print('='*50)

if __name__ == "__main__":
    main()
