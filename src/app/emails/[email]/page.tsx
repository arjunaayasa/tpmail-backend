'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Mail, RefreshCw, Loader2, Clock } from 'lucide-react';
import api from '@/services/api';

interface Message {
    id: string;
    from: string;
    subject: string | null;
    body: string | null;
    received_at: string;
}

async function fetchMessages(email: string): Promise<Message[]> {
    const response = await api.get<Message[]>(`/admin/emails/${encodeURIComponent(email)}/messages`);
    return response.data;
}

export default function EmailMessagesPage() {
    const params = useParams();
    const router = useRouter();
    const email = decodeURIComponent(params.email as string);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const { data: messages = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['messages', email],
        queryFn: () => fetchMessages(email),
        refetchInterval: 10000, // Auto refresh every 10 seconds
    });

    // Update last refresh time
    useEffect(() => {
        if (!isFetching) {
            setLastRefresh(new Date());
        }
    }, [isFetching]);

    const handleManualRefresh = () => {
        refetch();
    };


    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/emails')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Mail className="h-6 w-6" />
                                {email}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {messages.length} message(s) received
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Auto-refresh indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Auto-refreshing every 30 seconds
                </div>

                {/* Messages List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" />
                            <p className="mt-2 text-slate-500">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border">
                            <Mail className="h-12 w-12 mx-auto text-slate-300" />
                            <p className="mt-4 text-slate-500">No messages received yet</p>
                            <p className="text-sm text-slate-400">Messages will appear here when someone sends an email to this address</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-slate-900 truncate">
                                                {msg.subject || '(No subject)'}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                Click to view
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">From: {msg.from}</p>
                                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                                            {msg.body?.replace(/<[^>]*>/g, '').slice(0, 150) || 'No content'}...
                                        </p>
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                        {new Date(msg.received_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Message Detail Dialog */}
            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {selectedMessage?.subject || '(No subject)'}
                        </DialogTitle>
                        <div className="flex flex-col gap-1 text-sm text-slate-500 pt-2">
                            <p><strong>From:</strong> {selectedMessage?.from}</p>
                            <p><strong>Received:</strong> {selectedMessage?.received_at ? new Date(selectedMessage.received_at).toLocaleString() : ''}</p>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-4 border rounded-lg bg-white">
                        <div
                            className="p-4"
                            dangerouslySetInnerHTML={{ __html: selectedMessage?.body || '' }}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setSelectedMessage(null)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
