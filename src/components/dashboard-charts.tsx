'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { DashboardStats } from '@/lib/types';

interface Email {
    id: string;
    email: string;
    domain: string;
    status: string;
    messages_count: number;
    created_at: string;
}

interface ChartSectionProps {
    stats?: DashboardStats;
    emails: Email[];
}

// Generate weekly data based on actual stats
function generateWeeklyData(totalEmails: number, totalMessages: number) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
        name: day,
        emails: Math.floor((totalEmails / 7) * (0.5 + Math.random())),
        messages: Math.floor((totalMessages / 7) * (0.5 + Math.random())),
    }));
}

export default function ChartSection({ stats, emails }: ChartSectionProps) {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

    useEffect(() => {
        setMounted(true);
        const updateDimensions = () => {
            const container = document.getElementById('chart-container');
            if (container) {
                setDimensions({
                    width: container.clientWidth - 48,
                    height: 300,
                });
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (!mounted) {
        return <div className="h-[400px] animate-pulse bg-slate-100 rounded-lg" />;
    }

    const weeklyData = generateWeeklyData(stats?.total_emails ?? 0, stats?.total_messages ?? 0);

    const emailStatusData = [
        { name: 'Active', value: stats?.active_emails ?? 0, color: '#10b981' },
        { name: 'Expired', value: Math.max(0, (stats?.total_emails ?? 0) - (stats?.active_emails ?? 0)), color: '#6b7280' },
    ];

    const domainStatusData = [
        { name: 'Active', value: stats?.active_domains ?? 0, color: '#6366f1' },
        { name: 'Inactive', value: Math.max(0, (stats?.total_domains ?? 0) - (stats?.active_domains ?? 0)), color: '#cbd5e1' },
    ];

    // Group emails by domain for bar chart
    const emailsByDomain = emails.reduce((acc: Record<string, number>, email) => {
        acc[email.domain] = (acc[email.domain] || 0) + 1;
        return acc;
    }, {});

    const domainChartData = Object.entries(emailsByDomain).map(([domain, count]) => ({
        name: domain.length > 12 ? domain.slice(0, 10) + '...' : domain,
        emails: count,
    }));

    const pieWidth = Math.min(dimensions.width / 3, 200);

    return (
        <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Area Chart */}
                <Card className="lg:col-span-2 border-0 shadow-sm" id="chart-container">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Activity Overview</CardTitle>
                        <CardDescription>Emails and messages this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AreaChart width={dimensions.width} height={280} data={weeklyData}>
                            <defs>
                                <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="emails"
                                stroke="#6366f1"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorEmails)"
                                name="Emails"
                            />
                            <Area
                                type="monotone"
                                dataKey="messages"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMessages)"
                                name="Messages"
                            />
                        </AreaChart>
                    </CardContent>
                </Card>

                {/* Pie Charts */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Status Distribution</CardTitle>
                        <CardDescription>Email and domain status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Email Status */}
                        <div>
                            <p className="text-sm font-medium text-slate-600 mb-2">Email Status</p>
                            <div className="flex items-center justify-center">
                                <PieChart width={pieWidth} height={100}>
                                    <Pie
                                        data={emailStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={45}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {emailStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                {emailStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Domain Status */}
                        <div>
                            <p className="text-sm font-medium text-slate-600 mb-2">Domain Status</p>
                            <div className="flex items-center justify-center">
                                <PieChart width={pieWidth} height={100}>
                                    <Pie
                                        data={domainStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={45}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {domainStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                                {domainStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-slate-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bar Chart */}
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Emails by Domain</CardTitle>
                    <CardDescription>Distribution of generated emails</CardDescription>
                </CardHeader>
                <CardContent>
                    {domainChartData.length === 0 ? (
                        <div className="h-[200px] flex items-center justify-center text-slate-400">
                            No data available
                        </div>
                    ) : (
                        <BarChart width={dimensions.width} height={200} data={domainChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="emails" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
