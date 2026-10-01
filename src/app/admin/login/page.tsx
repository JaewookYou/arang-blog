import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

/**
 * Admin Login Page
 * GitHub OAuth 로그인
 */

export const metadata = {
    title: "Admin Login",
    robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
    AccessDenied: "허가되지 않은 GitHub 계정입니다. 관리자 화이트리스트를 확인하세요.",
    Configuration: "인증 설정 오류입니다. AUTH_SECRET / GitHub OAuth 설정을 확인하세요.",
    Verification: "로그인 링크가 만료되었습니다. 다시 시도하세요.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    const errorMessage = error ? ERROR_MESSAGES[error] || "로그인에 실패했습니다. 다시 시도하세요." : null;

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-sm w-full space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">🔐 Admin Login</h1>
                    <p className="text-muted-foreground">
                        관리자 전용 페이지입니다.
                    </p>
                </div>

                {errorMessage && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
                        {errorMessage}
                    </div>
                )}

                <form
                    action={async () => {
                        "use server";
                        await signIn("github", { redirectTo: "/admin" });
                    }}
                >
                    <Button type="submit" className="w-full" size="lg">
                        <Github className="mr-2 h-5 w-5" />
                        GitHub로 로그인
                    </Button>
                </form>

                <p className="text-xs text-muted-foreground">
                    허가된 GitHub 계정만 접근할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
