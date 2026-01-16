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

export default function AdminLoginPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-sm w-full space-y-6 text-center">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">🔐 Admin Login</h1>
                    <p className="text-muted-foreground">
                        관리자 전용 페이지입니다.
                    </p>
                </div>

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
