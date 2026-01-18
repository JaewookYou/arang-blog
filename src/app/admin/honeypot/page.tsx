import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    getHoneypotLogs,
    getHoneypotStatsByIp,
    getHoneypotStatsByPath,
    getHoneypotStatsByCategory,
    getHoneypotStatsBySeverity,
} from "@/lib/db";
import { Shield, Globe, Route, AlertTriangle, Tag } from "lucide-react";

/**
 * Honeypot Log Viewer
 * WAF 기반 공격 탐지 로그 확인
 */

export const metadata = {
    title: "Honeypot Logs",
    robots: { index: false, follow: false },
};

// 심각도별 색상
const severityColors: Record<string, string> = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/50",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    LOW: "bg-green-500/20 text-green-400 border-green-500/50",
};

// 카테고리 아이콘/라벨
const categoryLabels: Record<string, string> = {
    admin: "🔐 Admin",
    config: "⚙️ Config",
    scanner: "🔍 Scanner",
    backup: "📦 Backup",
    api: "🔗 API",
    sqli: "💉 SQLi",
    xss: "🎭 XSS",
    lfi: "📁 LFI",
    rce: "💀 RCE",
    unknown: "❓ Unknown",
};

export default async function HoneypotPage() {
    const session = await auth();
    if (!session) {
        redirect("/admin/login");
    }

    const logs = getHoneypotLogs(100);
    const ipStats = getHoneypotStatsByIp();
    const pathStats = getHoneypotStatsByPath();
    const categoryStats = getHoneypotStatsByCategory();
    const severityStats = getHoneypotStatsBySeverity();

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Shield className="h-8 w-8 text-red-500" />
                    Honeypot Logs (WAF)
                </h1>
                <p className="text-muted-foreground">
                    OWASP CRS 기반 공격 탐지 로그 ({logs.length}개)
                </p>
            </div>

            {/* Severity Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {severityStats.map((stat) => (
                    <div
                        key={stat.severity}
                        className={`p-4 rounded-lg border ${severityColors[stat.severity] || severityColors.LOW}`}
                    >
                        <div className="text-2xl font-bold">{stat.count}</div>
                        <div className="text-sm">{stat.severity}</div>
                    </div>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Category Stats */}
                <div className="space-y-3">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Categories
                    </h2>
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-2">Category</th>
                                    <th className="text-left p-2">Severity</th>
                                    <th className="text-right p-2">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryStats.slice(0, 10).map((stat, i) => (
                                    <tr key={i} className="border-t border-border">
                                        <td className="p-2">
                                            {categoryLabels[stat.category] || stat.category}
                                        </td>
                                        <td className="p-2">
                                            <span className={`text-xs px-2 py-0.5 rounded ${severityColors[stat.severity] || ""}`}>
                                                {stat.severity}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right font-mono">{stat.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                                        <td className="p-2 font-mono text-xs">{stat.ip}</td>
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
                                {pathStats.slice(0, 10).map((stat) => (
                                    <tr key={stat.path} className="border-t border-border">
                                        <td className="p-2 font-mono text-red-400 text-xs truncate max-w-[200px]">
                                            {stat.path}
                                        </td>
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
                <h2 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Logs
                </h2>
                <div className="rounded-lg border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-2">Timestamp</th>
                                <th className="text-left p-2">Severity</th>
                                <th className="text-left p-2">Category</th>
                                <th className="text-left p-2">Method</th>
                                <th className="text-left p-2">IP</th>
                                <th className="text-left p-2">Path</th>
                                <th className="text-left p-2">Payload</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-t border-border hover:bg-muted/50">
                                    <td className="p-2 text-muted-foreground whitespace-nowrap text-xs">
                                        {new Date(log.timestamp).toLocaleString("ko-KR")}
                                    </td>
                                    <td className="p-2">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${severityColors[log.severity] || severityColors.LOW}`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="p-2 text-xs">
                                        {categoryLabels[log.category] || log.category}
                                    </td>
                                    <td className="p-2 font-mono text-xs">{log.method}</td>
                                    <td className="p-2 font-mono text-xs">{log.ip}</td>
                                    <td className="p-2 font-mono text-red-400 text-xs max-w-[200px] truncate">
                                        {log.path}
                                    </td>
                                    <td className="p-2 text-xs text-muted-foreground max-w-[150px] truncate">
                                        {log.payload || "-"}
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
