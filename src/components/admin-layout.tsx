'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}
