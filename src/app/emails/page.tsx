'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

interface Email {
    id: string;
    email: string;
    domain: string;
    status: 'ACTIVE' | 'EXPIRED';
    messages_count: number;
    created_at: string;
    expires_at: string;
}

async function fetchEmails(): Promise<Email[]> {
    const response = await api.get<Email[]>('/admin/emails');
    return response.data;
}

async function deleteEmail(id: string): Promise<void> {
    await api.delete(`/admin/emails/${id}`);
}

export default function EmailsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [deletingEmail, setDeletingEmail] = useState<Email | null>(null);

    const { data: emails = [], isLoading } = useQuery({
        queryKey: ['emails'],
        queryFn: fetchEmails,
        refetchInterval: 10000, // Auto-refresh every 10 seconds
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEmail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            setDeletingEmail(null);
            toast.success('Email deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete email');
        },
    });

    const handleDelete = () => {
        if (!deletingEmail) return;
        deleteMutation.mutate(deletingEmail.id);
    };

    const handleViewMessages = (email: Email) => {
        router.push(`/emails/${encodeURIComponent(email.email)}`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Emails</h1>
                        <p className="text-slate-600 mt-1">View all generated temporary emails</p>
                    </div>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email Address</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Messages</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : emails.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                        No emails generated yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                emails.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                {email.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>{email.domain}</TableCell>
                                        <TableCell>
                                            <Badge variant={email.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {email.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{email.messages_count}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(email.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(email.expires_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewMessages(email)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingEmail(email)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingEmail} onOpenChange={(open) => !open && setDeletingEmail(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Email</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingEmail?.email}</strong>?
                            All messages will be deleted too.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingEmail(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
