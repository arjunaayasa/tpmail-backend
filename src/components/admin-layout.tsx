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
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
                {/* Footer */}
                <footer className="bg-white border-t border-slate-200 px-8 py-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">TPMail</span>
                            <span>•</span>
                            <span>Temporary Email System</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>© 2025 ArvoreCloud. All rights reserved.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
