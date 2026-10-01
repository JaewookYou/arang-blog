import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Auth.js v5 Configuration
 * GitHub OAuth + Whitelist 기반 접근 제어
 */

// 허용된 GitHub 사용자 목록
export const ADMIN_WHITELIST = (process.env.ADMIN_WHITELIST || "JaewookYou")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

export function isWhitelisted(login: unknown): boolean {
    return typeof login === "string" && ADMIN_WHITELIST.includes(login.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, profile }) {
            // GitHub 사용자명이 화이트리스트에 있는지 확인
            const githubUsername = (profile as { login?: string })?.login;
            if (isWhitelisted(githubUsername)) {
                return true;
            }
            // 화이트리스트에 없으면 로그인 거부
            return false;
        },
        async session({ session, token }) {
            // 세션에 GitHub 사용자명 추가
            if (token.sub) {
                session.user.id = token.sub;
            }
            (session.user as { login?: string }).login = token.githubUsername as string | undefined;
            return session;
        },
        async jwt({ token, profile }) {
            if (profile) {
                token.githubUsername = (profile as { login?: string })?.login;
            }
            return token;
        },
    },
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    trustHost: true,
});
