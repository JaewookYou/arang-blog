import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { posts, writeups } from "@/.velite";
import {
    getTotalCommentCount,
    getHoneypotLogCount,
    getHoneypotStatsByPath
} from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Flag,
    MessageSquare,
    Shield,
    LogOut,
    PenSquare,
    AlertTriangle
} from "lucide-react";

/**
 * Admin Dashboard
 * 관리자 대시보드
 */

export const metadata = {
    title: "Admin Dashboard",
    robots: { index: false, follow: false },
};

export default async function AdminPage() {
    const session = await auth();

    if (!session) {
        redirect("/admin/login");
    }

    // 통계 데이터
    const publishedPosts = posts.filter((p) => p.published).length;
    const publishedWriteups = writeups.filter((w) => w.published).length;
    const totalComments = getTotalCommentCount();
    const honeypotCount = getHoneypotLogCount();
    const honeypotStats = getHoneypotStatsByPath();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">🎛️ Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        환영합니다, {session.user?.name || session.user?.email}
                    </p>
                </div>
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                    }}
                >
                    <Button variant="outline" type="submit">
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                    </Button>
                </form>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Posts"
                    value={publishedPosts}
                    icon={<FileText className="h-5 w-5" />}
                    color="text-blue-500"
                />
                <StatCard
                    title="Writeups"
                    value={publishedWriteups}
                    icon={<Flag className="h-5 w-5" />}
                    color="text-amber-500"
                />
                <StatCard
                    title="Comments"
                    value={totalComments}
                    icon={<MessageSquare className="h-5 w-5" />}
                    color="text-green-500"
                />
                <StatCard
                    title="Honeypot"
                    value={honeypotCount}
                    icon={<Shield className="h-5 w-5" />}
                    color="text-red-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/write"
                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                        <PenSquare className="h-6 w-6 text-primary" />
                        <div>
                            <div className="font-medium">새 글 작성</div>
                            <div className="text-sm text-muted-foreground">
                                Post 또는 Writeup 작성
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/admin/manage"
                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                        <FileText className="h-6 w-6 text-blue-500" />
                        <div>
                            <div className="font-medium">글 관리</div>
                            <div className="text-sm text-muted-foreground">
                                기존 글 수정
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/admin/comments"
                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                        <MessageSquare className="h-6 w-6 text-green-500" />
                        <div>
                            <div className="font-medium">댓글 관리</div>
                            <div className="text-sm text-muted-foreground">
                                댓글 조회 및 삭제
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/admin/honeypot"
                        className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div>
                            <div className="font-medium">Honeypot 로그</div>
                            <div className="text-sm text-muted-foreground">
                                악의적인 접근 시도 확인
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Honeypot Recent Stats */}
            {honeypotStats.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">🍯 Recent Attack Paths</h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3">Path</th>
                                    <th className="text-right p-3">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {honeypotStats.slice(0, 5).map((stat) => (
                                    <tr key={stat.path} className="border-t border-border">
                                        <td className="p-3 font-mono text-red-400">{stat.path}</td>
                                        <td className="p-3 text-right">{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <div className="rounded-lg border border-border p-4 space-y-2">
            <div className={`${color}`}>{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
        </div>
    );
}
