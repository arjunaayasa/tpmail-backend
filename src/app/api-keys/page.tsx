'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Trash2, Loader2, Key, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    active: boolean;
    created_at: string;
    last_used: string | null;
}

interface NewApiKey extends ApiKey {
    key: string; // Full key shown only on creation
}

async function fetchApiKeys(): Promise<ApiKey[]> {
    const response = await api.get<ApiKey[]>('/admin/api-keys');
    return response.data;
}

async function createApiKey(name: string): Promise<NewApiKey> {
    const response = await api.post<NewApiKey>('/admin/api-keys', { name });
    return response.data;
}

async function deleteApiKey(id: string): Promise<void> {
    await api.delete(`/admin/api-keys/${id}`);
}

export default function ApiKeysPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { data: apiKeys = [], isLoading } = useQuery({
        queryKey: ['api-keys'],
        queryFn: fetchApiKeys,
    });

    const createMutation = useMutation({
        mutationFn: createApiKey,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            setCreatedKey(data.key);
            setNewKeyName('');
            toast.success('API key created successfully');
        },
        onError: () => {
            toast.error('Failed to create API key');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteApiKey,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            setDeletingKey(null);
            toast.success('API key deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete API key');
        },
    });

    const handleCreate = () => {
        if (!newKeyName.trim()) return;
        createMutation.mutate(newKeyName);
    };

    const handleDelete = () => {
        if (!deletingKey) return;
        deleteMutation.mutate(deletingKey.id);
    };

    const handleCopy = () => {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const closeCreateDialog = () => {
        setIsCreateOpen(false);
        setCreatedKey(null);
        setNewKeyName('');
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">API Keys</h1>
                        <p className="text-slate-600 mt-1">Manage API keys for accessing the email API</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Generate Key
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : apiKeys.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No API keys found. Generate your first key to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                apiKeys.map((apiKey) => (
                                    <TableRow key={apiKey.id}>
                                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                                        <TableCell>
                                            <code className="px-2 py-1 bg-slate-100 rounded text-sm">
                                                {apiKey.key}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={apiKey.active ? 'default' : 'secondary'}>
                                                {apiKey.active ? 'Active' : 'Revoked'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(apiKey.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {apiKey.last_used
                                                ? new Date(apiKey.last_used).toLocaleDateString()
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingKey(apiKey)}
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

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeCreateDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            {createdKey ? 'API Key Created' : 'Generate New API Key'}
                        </DialogTitle>
                        <DialogDescription>
                            {createdKey
                                ? 'Copy this key now. You won\'t be able to see it again!'
                                : 'Create a new API key for accessing the email API'}
                        </DialogDescription>
                    </DialogHeader>

                    {createdKey ? (
                        <div className="space-y-4 py-4">
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Success!</AlertTitle>
                                <AlertDescription>
                                    Your API key has been generated. Make sure to copy it now.
                                </AlertDescription>
                            </Alert>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-3 bg-slate-100 rounded text-sm break-all">
                                    {createdKey}
                                </code>
                                <Button variant="outline" size="sm" onClick={handleCopy}>
                                    {copied ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Key Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Production API Key"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {createdKey ? (
                            <Button onClick={closeCreateDialog}>Done</Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={closeCreateDialog}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending || !newKeyName.trim()}
                                >
                                    {createMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Generate
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingKey} onOpenChange={(open) => !open && setDeletingKey(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke API Key</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke <strong>{deletingKey?.name}</strong>?
                            Any applications using this key will lose access.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingKey(null)}>
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
                            Revoke
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
