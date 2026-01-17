/**
 * 정적 페이지 번역 데이터
 * home, about 등 정적 페이지의 다국어 텍스트
 */

export type Locale = "ko" | "en" | "ja" | "zh";

export const homeTranslations: Record<Locale, {
    heroTitle1: string;
    heroTitle2: string;
    heroDescription: string;
    blogPosts: string;
    ctfWriteups: string;
    about: string;
    whoami: string;
    role: string;
}> = {
    ko: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription: "웹 보안, 모의침투, AI 등 다양한 보안 연구와 CTF 대회 문제 풀이를 공유합니다.",
        blogPosts: "📝 블로그 포스트",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    en: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription: "Sharing security research on web security, Penetration Testing, AI, and CTF challenge writeups.",
        blogPosts: "📝 Blog Posts",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    ja: {
        heroTitle1: "セキュリティリサーチ",
        heroTitle2: "CTF Writeups",
        heroDescription: "Webセキュリティ、モックハッキング、AIなど様々なセキュリティ研究とCTF問題の解説を共有します。",
        blogPosts: "📝 ブログ投稿",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    zh: {
        heroTitle1: "安全研究",
        heroTitle2: "CTF Writeups",
        heroDescription: "分享网络安全、渗透测试、AI等安全研究以及CTF比赛解题思路。",
        blogPosts: "📝 博客文章",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 关于",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
};

export const postsPageTranslations: Record<Locale, {
    title: string;
    description: string;
    tagFiltering: string;
    noPostsWithTag: string;
    noPosts: string;
}> = {
    ko: {
        title: "📝 Posts",
        description: "기술 블로그 포스트 모음",
        tagFiltering: "태그 필터링 중",
        noPostsWithTag: "태그를 가진 포스트가 없습니다.",
        noPosts: "아직 작성된 포스트가 없습니다.",
    },
    en: {
        title: "📝 Posts",
        description: "Tech blog post collection",
        tagFiltering: "filtering by tag",
        noPostsWithTag: "No posts with this tag.",
        noPosts: "No posts yet.",
    },
    ja: {
        title: "📝 Posts",
        description: "技術ブログ記事一覧",
        tagFiltering: "タグでフィルタリング中",
        noPostsWithTag: "このタグの記事はありません。",
        noPosts: "まだ記事がありません。",
    },
    zh: {
        title: "📝 Posts",
        description: "技术博客文章集",
        tagFiltering: "按标签筛选",
        noPostsWithTag: "没有该标签的文章。",
        noPosts: "暂无文章。",
    },
};

export const writeupsPageTranslations: Record<Locale, {
    title: string;
    description: string;
    tagFiltering: string;
    categoryFiltering: string;
    noWriteups: string;
    noWriteupsFiltered: string;
}> = {
    ko: {
        title: "🚩 CTF Writeups",
        description: "CTF 대회 문제 풀이 모음",
        tagFiltering: "필터링 중",
        categoryFiltering: "필터링 중",
        noWriteups: "아직 작성된 Writeup이 없습니다.",
        noWriteupsFiltered: "해당 조건의 Writeup이 없습니다.",
    },
    en: {
        title: "🚩 CTF Writeups",
        description: "CTF challenge writeup collection",
        tagFiltering: "filtering",
        categoryFiltering: "filtering",
        noWriteups: "No writeups yet.",
        noWriteupsFiltered: "No writeups match the filter.",
    },
    ja: {
        title: "🚩 CTF Writeups",
        description: "CTF大会問題解説集",
        tagFiltering: "フィルタリング中",
        categoryFiltering: "フィルタリング中",
        noWriteups: "まだWriteupがありません。",
        noWriteupsFiltered: "条件に合うWriteupがありません。",
    },
    zh: {
        title: "🚩 CTF Writeups",
        description: "CTF比赛题解集",
        tagFiltering: "筛选中",
        categoryFiltering: "筛选中",
        noWriteups: "暂无Writeup。",
        noWriteupsFiltered: "没有符合条件的Writeup。",
    },
};

export const profileTranslations: Record<Locale, {
    name: string;
    subtitle: string;
    career: string;
    careerItems: string[];
    awards: string;
    awardItems: string[];
    interests: string;
    interestItems: string[];
    contact: string;
}> = {
    ko: {
        name: "유재욱",
        subtitle: "Security Researcher & CTF Player",
        career: "💼 Career",
        careerItems: [
            "<strong>금융보안원</strong> 보안평가부 RED IRIS팀 (모의해킹팀) (2019 ~ )",
            "공격자 관점의 인증 우회 취약점 프로파일링 : 인사이트 리포트(Campaign Poltergeist) 발간 (2025)",
            "<strong>KITRI Best of the Best & Whitehat School</strong> 멘토 (2023 ~ )",
            "구름톤 트레이닝 정보보호과정 멘토 (2023 ~ 2024)",
            "금융보안원 전문강사 & 내부강사 (2023 ~ )",
            "가천대학교 스마트보안학과 자문위원 (2022 ~ )",
            "<strong>CTF Team Defenit</strong> (2019 ~ )",
            "라온화이트햇 프로젝트팀 전임연구원 (2018.04. ~ 2019.08.)",
            "가천대학교 정보보호 동아리 <strong>Pay1oad</strong> 설립",
        ],
        awards: "🏆 Awards & Publications",
        awardItems: [
            "2019.09. 특허 등록 - \"이중 패킹을 이용한 코드 난독화\" (특허 제 10-2018960호)",
            "2018.12. 한국정보보호학회 동계학술대회 <strong>우수논문상</strong>",
            "2018.08. [KCI 등재] 한국정보보호학회 논문지 투고",
            "2018.04. <strong>KITRI BoB 6기 Best 10</strong> (과학기술정보통신부 장관상)",
            "2018.04. KITRI BoB 6기 Grand Prix 팀 선정 (Team. JGG)",
            "2017.12. 금융보안원 보안 취약점 제보 인증서",
            "2017.12. 스틸리언 보안 취약점 탐지 인증서",
            "2017.12. LG유플러스 보안 취약점 탐지 특별상",
            "2017.04. Codegate 2017 해킹시연영상 공모전 특별상",
        ],
        interests: "🔐 Interests",
        interestItems: ["Web Security", "CTF(Capture the Flag)", "Penetration Testing", "Financial Security", "Bug Bounty", "AI Security"],
        contact: "📬 Contact",
    },
    en: {
        name: "Jaewook You",
        subtitle: "Security Researcher & CTF Player",
        career: "💼 Career",
        careerItems: [
            "<strong>Financial Security Institute</strong> RED IRIS Team (Pentest Team) (2019 ~ )",
            "Published Insight Report on Auth Bypass Vulnerabilities (Campaign Poltergeist) (2025)",
            "<strong>KITRI Best of the Best & Whitehat School</strong> Mentor (2023 ~ )",
            "Goorm Training Cybersecurity Program Mentor (2023 ~ 2024)",
            "FSI Professional & Internal Instructor (2023 ~ )",
            "Gachon University Smart Security Advisory Committee (2022 ~ )",
            "<strong>CTF Team Defenit</strong> (2019 ~ )",
            "Raon Whitehat Project Team Researcher (2018.04. ~ 2019.08.)",
            "Founded Gachon University Security Club <strong>Pay1oad</strong>",
        ],
        awards: "🏆 Awards & Publications",
        awardItems: [
            "2019.09. Patent - \"Code Obfuscation Using Double Packing\" (Patent No. 10-2018960)",
            "2018.12. KIISC Winter Conference <strong>Best Paper Award</strong>",
            "2018.08. [KCI] Published in KIISC Journal",
            "2018.04. <strong>KITRI BoB 6th Best 10</strong> (Minister of Science and ICT Award)",
            "2018.04. KITRI BoB 6th Grand Prix Team (Team. JGG)",
            "2017.12. FSI Security Vulnerability Report Certificate",
            "2017.12. Stealien Security Vulnerability Detection Certificate",
            "2017.12. LG U+ Security Vulnerability Special Award",
            "2017.04. Codegate 2017 Hacking Demo Video Contest Special Award",
        ],
        interests: "🔐 Interests",
        interestItems: ["Web Security", "CTF(Capture the Flag)", "Penetration Testing", "Financial Security", "Bug Bounty", "AI Security"],
        contact: "📬 Contact",
    },
    ja: {
        name: "ユ・ジェウク",
        subtitle: "セキュリティリサーチャー & CTFプレイヤー",
        career: "💼 経歴",
        careerItems: [
            "<strong>金融セキュリティ院</strong> RED IRISチーム（ペンテストチーム）（2019 ~ ）",
            "攻撃者視点の認証バイパス脆弱性プロファイリングレポート発刊（2025）",
            "<strong>KITRI Best of the Best & Whitehat School</strong> メンター（2023 ~ ）",
            "Goormトレーニング情報セキュリティ課程メンター（2023 ~ 2024）",
            "金融セキュリティ院 専門講師 & 内部講師（2023 ~ ）",
            "嘉泉大学スマートセキュリティ学科諮問委員（2022 ~ ）",
            "<strong>CTF Team Defenit</strong>（2019 ~ ）",
            "ラオンホワイトハット プロジェクトチーム研究員（2018.04. ~ 2019.08.）",
            "嘉泉大学情報セキュリティサークル <strong>Pay1oad</strong> 設立",
        ],
        awards: "🏆 受賞 & 論文",
        awardItems: [
            "2019.09. 特許登録 - 「二重パッキングによるコード難読化」（特許第10-2018960号）",
            "2018.12. KIISC冬季学術大会 <strong>優秀論文賞</strong>",
            "2018.08. [KCI登載] KIISC論文誌投稿",
            "2018.04. <strong>KITRI BoB 6期 Best 10</strong>（科学技術情報通信部長官賞）",
            "2018.04. KITRI BoB 6期 Grand Prix チーム選定（Team. JGG）",
            "2017.12. 金融セキュリティ院 脆弱性報告認証書",
            "2017.12. Stealien セキュリティ脆弱性検出認証書",
            "2017.12. LG U+ セキュリティ脆弱性検出特別賞",
            "2017.04. Codegate 2017 ハッキングデモ動画コンテスト特別賞",
        ],
        interests: "🔐 興味分野",
        interestItems: ["Web Security", "CTF(Capture the Flag)", "Penetration Testing", "Financial Security", "Bug Bounty", "AI Security"],
        contact: "📬 Contact",
    },
    zh: {
        name: "刘在旭",
        subtitle: "安全研究员 & CTF选手",
        career: "💼 工作经历",
        careerItems: [
            "<strong>金融安全院</strong> RED IRIS团队（渗透测试团队）（2019 ~ ）",
            "发布攻击者视角的认证绕过漏洞分析报告（2025）",
            "<strong>KITRI Best of the Best & Whitehat School</strong> 导师（2023 ~ ）",
            "Goorm培训信息安全课程导师（2023 ~ 2024）",
            "金融安全院专业讲师 & 内部讲师（2023 ~ ）",
            "嘉泉大学智能安全学科顾问委员（2022 ~ ）",
            "<strong>CTF Team Defenit</strong>（2019 ~ ）",
            "Raon Whitehat项目团队研究员（2018.04. ~ 2019.08.）",
            "创立嘉泉大学信息安全社团 <strong>Pay1oad</strong>",
        ],
        awards: "🏆 奖项 & 论文",
        awardItems: [
            "2019.09. 专利注册 - \"双重打包代码混淆\"（专利号10-2018960）",
            "2018.12. KIISC冬季学术大会 <strong>优秀论文奖</strong>",
            "2018.08. [KCI收录] KIISC论文投稿",
            "2018.04. <strong>KITRI BoB 6期 Best 10</strong>（科学技术信息通信部长官奖）",
            "2018.04. KITRI BoB 6期 Grand Prix团队（Team. JGG）",
            "2017.12. 金融安全院安全漏洞报告证书",
            "2017.12. Stealien安全漏洞检测证书",
            "2017.12. LG U+安全漏洞检测特别奖",
            "2017.04. Codegate 2017黑客演示视频竞赛特别奖",
        ],
        interests: "🔐 兴趣领域",
        interestItems: ["Web Security", "CTF(Capture the Flag)", "Penetration Testing", "Financial Security", "Bug Bounty", "AI Security"],
        contact: "📬 联系方式",
    },
};
