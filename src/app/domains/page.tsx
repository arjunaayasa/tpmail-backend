'use client';

export const dynamic = 'force-dynamic';

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
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { Domain, CreateDomainRequest, UpdateDomainRequest } from '@/lib/types';

async function fetchDomains(): Promise<Domain[]> {
    const response = await api.get<Domain[]>('/admin/domains');
    return response.data;
}

async function createDomain(data: CreateDomainRequest): Promise<Domain> {
    const response = await api.post<Domain>('/admin/domains', data);
    return response.data;
}

async function updateDomain({ id, data }: { id: string; data: UpdateDomainRequest }): Promise<Domain> {
    const response = await api.patch<Domain>(`/admin/domains/${id}`, data);
    return response.data;
}

async function deleteDomain(id: string): Promise<void> {
    await api.delete(`/admin/domains/${id}`);
}

export default function DomainsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateDomainRequest>({
        domain: '',
        imap_host: '',
        imap_port: 993,
        imap_user: '',
        imap_password: '',
    });

    const { data: domains = [], isLoading } = useQuery({
        queryKey: ['domains'],
        queryFn: fetchDomains,
    });

    const createMutation = useMutation({
        mutationFn: createDomain,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['domains'] });
            setIsCreateOpen(false);
            resetForm();
            toast.success('Domain created successfully');
        },
        onError: () => {
            toast.error('Failed to create domain');
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateDomain,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['domains'] });
            setEditingDomain(null);
            resetForm();
            toast.success('Domain updated successfully');
        },
        onError: () => {
            toast.error('Failed to update domain');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDomain,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['domains'] });
            setDeletingDomain(null);
            toast.success('Domain deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete domain');
        },
    });

    const resetForm = () => {
        setFormData({
            domain: '',
            imap_host: '',
            imap_port: 993,
            imap_user: '',
            imap_password: '',
        });
    };

    const handleCreate = () => {
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!editingDomain) return;
        updateMutation.mutate({
            id: editingDomain.id,
            data: formData,
        });
    };

    const handleDelete = () => {
        if (!deletingDomain) return;
        deleteMutation.mutate(deletingDomain.id);
    };

    const openEdit = (domain: Domain) => {
        setFormData({
            domain: domain.domain,
            imap_host: domain.imap_host,
            imap_port: domain.imap_port,
            imap_user: domain.imap_user,
            imap_password: '',
        });
        setEditingDomain(domain);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Domains</h1>
                        <p className="text-slate-600 mt-1">Manage your email domains</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Domain
                    </Button>
                </div>

                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead>IMAP Host</TableHead>
                                <TableHead>IMAP Port</TableHead>
                                <TableHead>IMAP User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
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
                            ) : domains.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                        No domains found. Add your first domain to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                domains.map((domain) => (
                                    <TableRow key={domain.id}>
                                        <TableCell className="font-medium">{domain.domain}</TableCell>
                                        <TableCell>{domain.imap_host}</TableCell>
                                        <TableCell>{domain.imap_port}</TableCell>
                                        <TableCell>{domain.imap_user}</TableCell>
                                        <TableCell>
                                            <Badge variant={domain.active ? 'default' : 'secondary'}>
                                                {domain.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(domain.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEdit(domain)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeletingDomain(domain)}
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

            {/* Create/Edit Dialog */}
            <Dialog open={isCreateOpen || !!editingDomain} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateOpen(false);
                    setEditingDomain(null);
                    resetForm();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingDomain ? 'Edit Domain' : 'Add Domain'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDomain
                                ? 'Update the domain configuration'
                                : 'Add a new domain with IMAP settings'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                placeholder="example.com"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_host">IMAP Host</Label>
                            <Input
                                id="imap_host"
                                placeholder="mail.example.com"
                                value={formData.imap_host}
                                onChange={(e) => setFormData({ ...formData, imap_host: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_port">IMAP Port</Label>
                            <Input
                                id="imap_port"
                                type="number"
                                placeholder="993"
                                value={formData.imap_port}
                                onChange={(e) => setFormData({ ...formData, imap_port: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_user">IMAP User</Label>
                            <Input
                                id="imap_user"
                                placeholder="user@example.com"
                                value={formData.imap_user}
                                onChange={(e) => setFormData({ ...formData, imap_user: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imap_password">IMAP Password</Label>
                            <Input
                                id="imap_password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.imap_password}
                                onChange={(e) => setFormData({ ...formData, imap_password: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsCreateOpen(false);
                            setEditingDomain(null);
                            resetForm();
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={editingDomain ? handleUpdate : handleCreate}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editingDomain ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingDomain} onOpenChange={(open) => !open && setDeletingDomain(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Domain</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deletingDomain?.domain}</strong>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingDomain(null)}>
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
