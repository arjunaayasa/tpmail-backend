'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Globe,
    Mail,
    MessageSquare,
    TrendingUp,
    ArrowRight,
    RefreshCw,
    Activity,
    Clock,
    Zap
} from 'lucide-react';
import api from '@/services/api';
import { DashboardStats } from '@/lib/types';

interface Email {
    id: string;
    email: string;
    domain: string;
    status: string;
    messages_count: number;
    created_at: string;
}

async function fetchStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/stats');
    return response.data;
}

async function fetchRecentEmails(): Promise<Email[]> {
    const response = await api.get<Email[]>('/admin/emails');
    return response.data;
}

export default function DashboardPage() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = useState<string>('--:--:--');

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString());
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
        refetchInterval: 30000,
    });

    const { data: allEmails = [] } = useQuery({
        queryKey: ['all-emails'],
        queryFn: fetchRecentEmails,
        refetchInterval: 30000,
    });

    const recentEmails = allEmails.slice(0, 6);

    // Calculate percentages
    const emailActiveRate = stats?.total_emails ? Math.round((stats.active_emails / stats.total_emails) * 100) : 0;
    const domainActiveRate = stats?.total_domains ? Math.round((stats.active_domains / stats.total_domains) * 100) : 0;

    // Group emails by domain
    const emailsByDomain = allEmails.reduce((acc: Record<string, number>, email) => {
        acc[email.domain] = (acc[email.domain] || 0) + 1;
        return acc;
    }, {});
    const maxDomainCount = Math.max(...Object.values(emailsByDomain), 1);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-600 mt-1">Overview of your temporary email system</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                        Failed to load statistics. Please try again.
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Domains */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/domains')}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Domains</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        {isLoading ? <span className="inline-block h-8 w-12 animate-pulse bg-slate-200 rounded" /> : stats?.total_domains ?? 0}
                                    </p>
                                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {stats?.active_domains ?? 0} active
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                                    <Globe className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Emails */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/emails')}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Total Emails</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        {isLoading ? <span className="inline-block h-8 w-12 animate-pulse bg-slate-200 rounded" /> : stats?.total_emails ?? 0}
                                    </p>
                                    <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        {stats?.active_emails ?? 0} active
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                                    <Mail className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Messages */}
                    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/emails')}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Messages</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        {isLoading ? <span className="inline-block h-8 w-12 animate-pulse bg-slate-200 rounded" /> : stats?.total_messages ?? 0}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Total received
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Rate */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Active Rate</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">
                                        {isLoading ? <span className="inline-block h-8 w-12 animate-pulse bg-slate-200 rounded" /> : `${emailActiveRate}%`}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        Email activity
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
                                    <Activity className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Email Status Chart */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Email Status</CardTitle>
                            <CardDescription>Active vs expired emails</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {/* Circular Progress */}
                                <div className="relative w-32 h-32">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="#e2e8f0"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="url(#emailGradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${emailActiveRate * 3.52} 352`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="emailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#34d399" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-slate-900">{emailActiveRate}%</span>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-sm text-slate-600">Active: {stats?.active_emails ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                                        <span className="text-sm text-slate-600">Expired: {(stats?.total_emails ?? 0) - (stats?.active_emails ?? 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Domain Status Chart */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Domain Health</CardTitle>
                            <CardDescription>Active vs inactive domains</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                {/* Circular Progress */}
                                <div className="relative w-32 h-32">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="#e2e8f0"
                                            strokeWidth="12"
                                            fill="none"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="url(#domainGradient)"
                                            strokeWidth="12"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={`${domainActiveRate * 3.52} 352`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="domainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#818cf8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-slate-900">{domainActiveRate}%</span>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <span className="text-sm text-slate-600">Active: {stats?.active_domains ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                                        <span className="text-sm text-slate-600">Inactive: {(stats?.total_domains ?? 0) - (stats?.active_domains ?? 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">System Status</CardTitle>
                            <CardDescription>Real-time system health</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-emerald-700">API Status</span>
                                </div>
                                <Badge className="bg-emerald-500">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-600">Auto Refresh</span>
                                </div>
                                <span className="text-sm font-medium">30s</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm text-slate-600">Last Updated</span>
                                </div>
                                <span className="text-sm font-medium">{currentTime}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Emails by Domain */}
                {Object.keys(emailsByDomain).length > 0 && (
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Emails by Domain</CardTitle>
                            <CardDescription>Distribution of generated emails across domains</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(emailsByDomain).map(([domain, count]) => (
                                    <div key={domain} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">{domain}</span>
                                            <span className="text-sm text-slate-500">{count} emails</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(count / maxDomainCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Emails */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Emails</CardTitle>
                            <CardDescription>Latest generated temporary addresses</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/emails')}>
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentEmails.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Mail className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p>No emails generated yet</p>
                                <p className="text-sm text-slate-400 mt-1">Generate your first email using the API</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {recentEmails.map((email) => (
                                    <div
                                        key={email.id}
                                        className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/emails/${encodeURIComponent(email.email)}`)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                                                <Mail className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <Badge
                                                variant={email.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                className={email.status === 'ACTIVE' ? 'bg-emerald-500' : ''}
                                            >
                                                {email.status}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-slate-900 truncate text-sm">{email.email}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-slate-500">{new Date(email.created_at).toLocaleDateString()}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {email.messages_count} msg
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
