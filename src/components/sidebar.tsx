'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Globe, Key, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Domains', href: '/domains', icon: Globe },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-slate-700">
                <h1 className="text-xl font-bold">Mail Admin</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-700 p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={logout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
