/**
 * 정적 페이지 번역 데이터
 * home, about 등 정적 페이지의 다국어 텍스트
 */

export type Locale = "ko" | "en" | "ja" | "zh";

export const homeTranslations: Record<Locale, {
    heroTitle1: string;
    heroTitle2: string;
    heroDescription1: string;
    heroDescription2: string;
    blogPosts: string;
    ctfWriteups: string;
    about: string;
    whoami: string;
    role: string;
}> = {
    ko: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription1: "웹 보안, 모의해킹, AI 등 다양한 보안 연구와",
        heroDescription2: "CTF 대회 문제 풀이를 공유합니다.",
        blogPosts: "📝 블로그 포스트",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    en: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription1: "Sharing security research on web security,",
        heroDescription2: " Penetration Testing, AI, and CTF challenge writeups.",
        blogPosts: "📝 Blog Posts",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    ja: {
        heroTitle1: "セキュリティリサーチ",
        heroTitle2: "CTF Writeups",
        heroDescription1: "Webセキュリティ、モックハッキング、AIなど様々な",
        heroDescription2: "セキュリティ研究とCTF問題の解説を共有します。",
        blogPosts: "📝 ブログ投稿",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Penetration Tester",
    },
    zh: {
        heroTitle1: "安全研究",
        heroTitle2: "CTF Writeups",
        heroDescription1: "分享网络安全、渗透测试、AI等",
        heroDescription2: "安全研究以及CTF比赛解题思路。",
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
    bugBounty: string;
    bugBountyItems: string[];
    ctf: string;
    ctfItems: string[];
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
        bugBounty: "🐛 Bug Bounty & CVE",
        bugBountyItems: [
            "<strong>CVE-2025-11221</strong> - GTONE ChangeFlow RCE (Path Traversal + File Upload) <span class='text-red-500'>CVSS 9.4</span>",
            "<strong>CVE-2025-11182</strong> - GTONE ChangeFlow Path Traversal <span class='text-orange-500'>CVSS 7.1</span>",
            "<strong>CVE-2025-11020</strong> - MarkAny SafePC SQL Injection + File Upload <span class='text-red-500'>CVSS 8.8</span>",
            "한국인터넷진흥원(KISA) S/W 취약점 제보 다수",
            "네이버(NHN) 버그바운티 웹 취약점 제보 다수",
        ],
        ctf: "🚩 CTF Records",
        ctfItems: [
            "2025 DEF CON CTF 예선 <strong>2위</strong>",
            "2024 DEF CON CTF 예선 <strong>2위</strong>, 본선 <strong>3위</strong>",
            "2024 HITCON CTF 예선 <strong>6위</strong>, 본선 <strong>6위</strong>",
            "2024 국가정보원 APEX 훈련 한국대표팀 참가",
            "2024 NATO CCDCOE Locked Shields 훈련 한국대표팀 참가",
            "2023 HITCON CTF 예선 <strong>6위</strong>, 본선 <strong>4위</strong>",
            "2023 WACON CTF 예선 <strong>1위</strong>",
            "2021 SECCON CTF <strong>4위</strong> (Team. KOREAN)",
            "2021 Pwn2Win CTF <strong>2위</strong> (Team. uuunderflow)",
            "2020 TokyoWesterns CTF <strong>1위 우승</strong> (Team. D0G$)",
            "2020 HITCON CTF <strong>8위</strong> (Team. G0D)",
            "2020 DEF CON CTF 본선 <strong>12위</strong> (Team. koreanbadass)",
            "2020 금융보안원 FIESTA 금보원부 <strong>1위 우승</strong> (Team. pgb5)",
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
        bugBounty: "🐛 Bug Bounty & CVE",
        bugBountyItems: [
            "<strong>CVE-2025-11221</strong> - GTONE ChangeFlow RCE (Path Traversal + File Upload) <span class='text-red-500'>CVSS 9.4</span>",
            "<strong>CVE-2025-11182</strong> - GTONE ChangeFlow Path Traversal <span class='text-orange-500'>CVSS 7.1</span>",
            "<strong>CVE-2025-11020</strong> - MarkAny SafePC SQL Injection + File Upload <span class='text-red-500'>CVSS 8.8</span>",
            "Multiple KISA S/W Vulnerability Reports",
            "Multiple Naver Bug Bounty Web Vulnerability Reports",
        ],
        ctf: "🚩 CTF Records",
        ctfItems: [
            "2025 DEF CON CTF Quals <strong>2nd</strong>",
            "2024 DEF CON CTF Quals <strong>2nd</strong>, Finals <strong>3rd</strong>",
            "2024 HITCON CTF Quals <strong>6th</strong>, Finals <strong>6th</strong>",
            "2024 NIS APEX Training Korean National Team",
            "2024 NATO CCDCOE Locked Shields Training Korean National Team",
            "2023 HITCON CTF Quals <strong>6th</strong>, Finals <strong>4th</strong>",
            "2023 WACON CTF Quals <strong>1st</strong>",
            "2021 SECCON CTF <strong>4th</strong> (Team. KOREAN)",
            "2021 Pwn2Win CTF <strong>2nd</strong> (Team. uuunderflow)",
            "2020 TokyoWesterns CTF <strong>1st Winner</strong> (Team. D0G$)",
            "2020 HITCON CTF <strong>8th</strong> (Team. G0D)",
            "2020 DEF CON CTF Finals <strong>12th</strong> (Team. koreanbadass)",
            "2020 FSI FIESTA <strong>1st Winner</strong> (Team. pgb5)",
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
        bugBounty: "🐛 Bug Bounty & CVE",
        bugBountyItems: [
            "<strong>CVE-2025-11221</strong> - GTONE ChangeFlow RCE（Path Traversal + File Upload）<span class='text-red-500'>CVSS 9.4</span>",
            "<strong>CVE-2025-11182</strong> - GTONE ChangeFlow Path Traversal <span class='text-orange-500'>CVSS 7.1</span>",
            "<strong>CVE-2025-11020</strong> - MarkAny SafePC SQL Injection + File Upload <span class='text-red-500'>CVSS 8.8</span>",
            "KISA S/W脆弱性報告 多数",
            "Naver バグバウンティ Web脆弱性報告 多数",
        ],
        ctf: "🚩 CTF 戦績",
        ctfItems: [
            "2025 DEF CON CTF 予選 <strong>2位</strong>",
            "2024 DEF CON CTF 予選 <strong>2位</strong>、本選 <strong>3位</strong>",
            "2024 HITCON CTF 予選 <strong>6位</strong>、本選 <strong>6位</strong>",
            "2024 国家情報院 APEX 訓練 韓国代表チーム参加",
            "2024 NATO CCDCOE Locked Shields 訓練 韓国代表チーム参加",
            "2023 HITCON CTF 予選 <strong>6位</strong>、本選 <strong>4位</strong>",
            "2023 WACON CTF 予選 <strong>1位</strong>",
            "2021 SECCON CTF <strong>4位</strong>（Team. KOREAN）",
            "2021 Pwn2Win CTF <strong>2位</strong>（Team. uuunderflow）",
            "2020 TokyoWesterns CTF <strong>優勝</strong>（Team. D0G$）",
            "2020 HITCON CTF <strong>8位</strong>（Team. G0D）",
            "2020 DEF CON CTF 本選 <strong>12位</strong>（Team. koreanbadass）",
            "2020 FSI FIESTA <strong>優勝</strong>（Team. pgb5）",
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
        bugBounty: "🐛 Bug Bounty & CVE",
        bugBountyItems: [
            "<strong>CVE-2025-11221</strong> - GTONE ChangeFlow RCE（Path Traversal + File Upload）<span class='text-red-500'>CVSS 9.4</span>",
            "<strong>CVE-2025-11182</strong> - GTONE ChangeFlow Path Traversal <span class='text-orange-500'>CVSS 7.1</span>",
            "<strong>CVE-2025-11020</strong> - MarkAny SafePC SQL Injection + File Upload <span class='text-red-500'>CVSS 8.8</span>",
            "KISA S/W漏洞报告 多项",
            "Naver 漏洞赏金 Web漏洞报告 多项",
        ],
        ctf: "🚩 CTF 战绩",
        ctfItems: [
            "2025 DEF CON CTF 预选 <strong>第2名</strong>",
            "2024 DEF CON CTF 预选 <strong>第2名</strong>、决赛 <strong>第3名</strong>",
            "2024 HITCON CTF 预选 <strong>第6名</strong>、决赛 <strong>第6名</strong>",
            "2024 国家情报院 APEX 训练 韩国代表队参加",
            "2024 NATO CCDCOE Locked Shields 训练 韩国代表队参加",
            "2023 HITCON CTF 预选 <strong>第6名</strong>、决赛 <strong>第4名</strong>",
            "2023 WACON CTF 预选 <strong>第1名</strong>",
            "2021 SECCON CTF <strong>第4名</strong>（Team. KOREAN）",
            "2021 Pwn2Win CTF <strong>第2名</strong>（Team. uuunderflow）",
            "2020 TokyoWesterns CTF <strong>冠军</strong>（Team. D0G$）",
            "2020 HITCON CTF <strong>第8名</strong>（Team. G0D）",
            "2020 DEF CON CTF 决赛 <strong>第12名</strong>（Team. koreanbadass）",
            "2020 FSI FIESTA <strong>冠军</strong>（Team. pgb5）",
        ],
        interests: "🔐 兴趣领域",
        interestItems: ["Web Security", "CTF(Capture the Flag)", "Penetration Testing", "Financial Security", "Bug Bounty", "AI Security"],
        contact: "📬 联系方式",
    },
};

// ============ DB에서 정적 페이지 콘텐츠 가져오기 ============
import { getStaticPageContent } from "./db";

/** DB에 저장된 JSON을 기본값과 합친다. 키가 빠지거나 타입이 다르면 기본값을 쓴다. */
function mergeWithFallback<T extends Record<string, unknown>>(fallback: T, raw: string): T {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result = { ...fallback };
    for (const key of Object.keys(fallback) as (keyof T)[]) {
        const value = parsed[key as string];
        const expected = fallback[key];
        if (Array.isArray(expected) ? Array.isArray(value) : typeof value === typeof expected) {
            result[key] = value as T[keyof T];
        }
    }
    return result;
}

/**
 * 정적 페이지 번역 데이터 조회 (DB 우선, fallback은 하드코딩)
 * 해당 언어가 DB에 없으면 하드코딩된 같은 언어 데이터를 쓴다.
 */
export function getHomeTranslation(locale: Locale): typeof homeTranslations.ko {
    const fallback = homeTranslations[locale] || homeTranslations.ko;
    try {
        const dbContent = getStaticPageContent("home", locale);
        if (dbContent) return mergeWithFallback(fallback, dbContent.content);
    } catch (error) {
        console.warn("Failed to get home translation from DB:", error);
    }
    return fallback;
}

export function getProfileTranslation(locale: Locale): typeof profileTranslations.ko {
    const fallback = profileTranslations[locale] || profileTranslations.ko;
    try {
        const dbContent = getStaticPageContent("about", locale);
        if (dbContent) return mergeWithFallback(fallback, dbContent.content);
    } catch (error) {
        console.warn("Failed to get about translation from DB:", error);
    }
    return fallback;
}
