'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Server } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { ImapTestRequest, ImapTestResponse } from '@/lib/types';

async function testImapConnection(data: ImapTestRequest): Promise<ImapTestResponse> {
    const response = await api.post<ImapTestResponse>('/admin/imap/test', data);
    return response.data;
}

export default function SettingsPage() {
    const [formData, setFormData] = useState<ImapTestRequest>({
        host: '',
        port: 993,
        user: '',
        password: '',
    });

    const [testResult, setTestResult] = useState<ImapTestResponse | null>(null);

    const testMutation = useMutation({
        mutationFn: testImapConnection,
        onSuccess: (data) => {
            setTestResult(data);
            if (data.success) {
                toast.success('IMAP connection successful');
            } else {
                toast.error('IMAP connection failed');
            }
        },
        onError: () => {
            toast.error('Failed to test IMAP connection');
        },
    });

    const handleTest = () => {
        setTestResult(null);
        testMutation.mutate(formData);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-600 mt-1">System configuration and tools</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Server className="h-5 w-5" />
                            IMAP Connection Test
                        </CardTitle>
                        <CardDescription>
                            Test IMAP server connectivity before adding a domain
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="host">IMAP Host</Label>
                                <Input
                                    id="host"
                                    placeholder="mail.example.com"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="port">IMAP Port</Label>
                                <Input
                                    id="port"
                                    type="number"
                                    placeholder="993"
                                    value={formData.port}
                                    onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user">IMAP User</Label>
                                <Input
                                    id="user"
                                    placeholder="user@example.com"
                                    value={formData.user}
                                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">IMAP Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {testResult && (
                            <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                {testResult.success ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                <AlertTitle>
                                    {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                                </AlertTitle>
                                <AlertDescription>{testResult.message}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            onClick={handleTest}
                            disabled={testMutation.isPending || !formData.host || !formData.user || !formData.password}
                        >
                            {testMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test Connection'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
