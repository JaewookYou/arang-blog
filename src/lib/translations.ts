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
        heroDescription: "웹 보안, 리버스 엔지니어링, 포렌식 등 다양한 보안 연구와 CTF 대회 문제 풀이를 공유합니다.",
        blogPosts: "📝 블로그 포스트",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Developer",
    },
    en: {
        heroTitle1: "Security Research",
        heroTitle2: "CTF Writeups",
        heroDescription: "Sharing security research on web security, reverse engineering, forensics, and CTF challenge writeups.",
        blogPosts: "📝 Blog Posts",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Developer",
    },
    ja: {
        heroTitle1: "セキュリティリサーチ",
        heroTitle2: "CTF Writeups",
        heroDescription: "Webセキュリティ、リバースエンジニアリング、フォレンジックなどのセキュリティ研究とCTF問題の解説を共有します。",
        blogPosts: "📝 ブログ投稿",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 About",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Developer",
    },
    zh: {
        heroTitle1: "安全研究",
        heroTitle2: "CTF Writeups",
        heroDescription: "分享网络安全、逆向工程、取证等安全研究以及CTF比赛解题思路。",
        blogPosts: "📝 博客文章",
        ctfWriteups: "🚩 CTF Writeups",
        about: "🔐 关于",
        whoami: "whoami",
        role: "Security Researcher | CTF Player | Developer",
    },
};

export const aboutTranslations: Record<Locale, {
    title: string;
    subtitle: string;
    bio: string;
    interests: string;
    interestsList: string[];
    ctfSection: string;
    ctfDescription: string;
    techStack: string;
    techStackList: string[];
    contact: string;
    terminalQuote: string;
}> = {
    ko: {
        title: "About",
        subtitle: "Security Researcher & CTF Player",
        bio: "안녕하세요! 보안 연구와 CTF에 열정을 가진 개발자입니다.",
        interests: "🔐 관심 분야",
        interestsList: [
            "**Web Security** - XSS, CSRF, SQL Injection, SSRF 등",
            "**Reverse Engineering** - Binary 분석, 악성코드 분석",
            "**Cryptography** - 암호 알고리즘, 프로토콜 분석",
            "**Forensics** - 메모리 포렌식, 네트워크 포렌식",
        ],
        ctfSection: "🏆 CTF 참여",
        ctfDescription: "다양한 CTF 대회에 참여하며 실력을 키우고 있습니다. 이 블로그에서 문제 풀이 과정과 배운 점을 공유합니다.",
        techStack: "🛠️ 기술 스택",
        techStackList: [
            "**Languages** - Python, TypeScript, Go, C/C++",
            "**Web** - Next.js, React, Node.js",
            "**Tools** - Burp Suite, IDA Pro, Ghidra, Wireshark",
        ],
        contact: "📬 Contact",
        terminalQuote: "Happy Hacking! 🏴‍☠️",
    },
    en: {
        title: "About",
        subtitle: "Security Researcher & CTF Player",
        bio: "Hello! I'm a developer passionate about security research and CTF.",
        interests: "🔐 Interests",
        interestsList: [
            "**Web Security** - XSS, CSRF, SQL Injection, SSRF, etc.",
            "**Reverse Engineering** - Binary analysis, malware analysis",
            "**Cryptography** - Cryptographic algorithms, protocol analysis",
            "**Forensics** - Memory forensics, network forensics",
        ],
        ctfSection: "🏆 CTF Participation",
        ctfDescription: "I participate in various CTF competitions to improve my skills. I share my problem-solving process and lessons learned on this blog.",
        techStack: "🛠️ Tech Stack",
        techStackList: [
            "**Languages** - Python, TypeScript, Go, C/C++",
            "**Web** - Next.js, React, Node.js",
            "**Tools** - Burp Suite, IDA Pro, Ghidra, Wireshark",
        ],
        contact: "📬 Contact",
        terminalQuote: "Happy Hacking! 🏴‍☠️",
    },
    ja: {
        title: "About",
        subtitle: "Security Researcher & CTF Player",
        bio: "こんにちは！セキュリティ研究とCTFに情熱を持つ開発者です。",
        interests: "🔐 興味分野",
        interestsList: [
            "**Webセキュリティ** - XSS, CSRF, SQL Injection, SSRF など",
            "**リバースエンジニアリング** - バイナリ解析、マルウェア解析",
            "**暗号** - 暗号アルゴリズム、プロトコル分析",
            "**フォレンジック** - メモリフォレンジック、ネットワークフォレンジック",
        ],
        ctfSection: "🏆 CTF参加",
        ctfDescription: "様々なCTF大会に参加してスキルを磨いています。このブログで問題解決の過程と学んだことを共有します。",
        techStack: "🛠️ 技術スタック",
        techStackList: [
            "**Languages** - Python, TypeScript, Go, C/C++",
            "**Web** - Next.js, React, Node.js",
            "**Tools** - Burp Suite, IDA Pro, Ghidra, Wireshark",
        ],
        contact: "📬 Contact",
        terminalQuote: "Happy Hacking! 🏴‍☠️",
    },
    zh: {
        title: "关于",
        subtitle: "安全研究员 & CTF 选手",
        bio: "你好！我是一名对安全研究和CTF充满热情的开发者。",
        interests: "🔐 兴趣领域",
        interestsList: [
            "**Web安全** - XSS, CSRF, SQL注入, SSRF 等",
            "**逆向工程** - 二进制分析、恶意软件分析",
            "**密码学** - 加密算法、协议分析",
            "**取证** - 内存取证、网络取证",
        ],
        ctfSection: "🏆 CTF 参与",
        ctfDescription: "我参加各种CTF比赛来提高技能。在这个博客上分享解题过程和学到的经验。",
        techStack: "🛠️ 技术栈",
        techStackList: [
            "**Languages** - Python, TypeScript, Go, C/C++",
            "**Web** - Next.js, React, Node.js",
            "**Tools** - Burp Suite, IDA Pro, Ghidra, Wireshark",
        ],
        contact: "📬 联系方式",
        terminalQuote: "Happy Hacking! 🏴‍☠️",
    },
};
