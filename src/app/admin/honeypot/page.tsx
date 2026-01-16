import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHoneypotLogs, getHoneypotStatsByIp, getHoneypotStatsByPath } from "@/lib/db";
import { Shield, Globe, Route } from "lucide-react";

/**
 * Honeypot Log Viewer
 * 악의적인 접근 시도 로그 확인
 */

export const metadata = {
    title: "Honeypot Logs",
    robots: { index: false, follow: false },
};

export default async function HoneypotPage() {
    const session = await auth();
    if (!session) {
        redirect("/admin/login");
    }

    const logs = getHoneypotLogs(100);
    const ipStats = getHoneypotStatsByIp();
    const pathStats = getHoneypotStatsByPath();

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Shield className="h-8 w-8 text-red-500" />
                    Honeypot Logs
                </h1>
                <p className="text-muted-foreground">
                    악의적인 경로 접근 시도 로그 ({logs.length}개)
                </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* IP Stats */}
                <div className="space-y-3">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Top IPs
                    </h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-2">IP</th>
                                    <th className="text-right p-2">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ipStats.slice(0, 10).map((stat) => (
                                    <tr key={stat.ip} className="border-t border-border">
                                        <td className="p-2 font-mono">{stat.ip}</td>
                                        <td className="p-2 text-right">{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Path Stats */}
                <div className="space-y-3">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Top Paths
                    </h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-2">Path</th>
                                    <th className="text-right p-2">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pathStats.map((stat) => (
                                    <tr key={stat.path} className="border-t border-border">
                                        <td className="p-2 font-mono text-red-400">{stat.path}</td>
                                        <td className="p-2 text-right">{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Logs */}
            <div className="space-y-3">
                <h2 className="font-semibold">Recent Logs</h2>
                <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-2">Timestamp</th>
                                <th className="text-left p-2">IP</th>
                                <th className="text-left p-2">Path</th>
                                <th className="text-left p-2">User-Agent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-t border-border">
                                    <td className="p-2 text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString("ko-KR")}
                                    </td>
                                    <td className="p-2 font-mono">{log.ip}</td>
                                    <td className="p-2 font-mono text-red-400">{log.path}</td>
                                    <td className="p-2 text-xs text-muted-foreground max-w-xs truncate">
                                        {log.user_agent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
