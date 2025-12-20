'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import api from '@/services/api';
import { DashboardStats } from '@/lib/types';

async function fetchStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/admin/stats');
    return response.data;
}

export default function DashboardPage() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });

    const cards = [
        {
            title: 'Total Domains',
            value: stats?.total_domains ?? 0,
            icon: Globe,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Active Domains',
            value: stats?.active_domains ?? 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100',
        },
        {
            title: 'Total Emails',
            value: stats?.total_emails ?? 0,
            icon: Mail,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Total Messages',
            value: stats?.total_messages ?? 0,
            icon: MessageSquare,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Overview of your temporary email system</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        Failed to load statistics. Please try again.
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {card.title}
                                </CardTitle>
                                <div className={`rounded-full p-2 ${card.bg}`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {isLoading ? (
                                        <div className="h-9 w-16 animate-pulse rounded bg-slate-200" />
                                    ) : (
                                        card.value.toLocaleString()
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
