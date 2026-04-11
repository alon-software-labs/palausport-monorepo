'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    CalendarDays,
    FileText,
    MessageSquare,
    Users,
    LogOut,
    User2,
    Settings,
    ChevronUp,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Reservations', url: '/reservations', icon: CalendarDays },
    { title: 'Clients', url: '/clients', icon: Users },
    { title: 'Chat', url: '/chat', icon: MessageSquare },
    { title: 'Invoices', url: '/invoices', icon: FileText },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout } = useAppContext();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-sidebar-border"
            style={{ background: 'var(--sidebar)' }}
        >
            {/* Safe area for iOS home indicator */}
            <div className="flex items-stretch h-16 pb-safe">
                {navItems.map((item) => {
                    const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={cn(
                                'flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200 relative',
                                isActive
                                    ? 'text-sidebar-primary'
                                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground/80'
                            )}
                        >
                            {isActive && (
                                <span
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                                    style={{ background: 'var(--sidebar-primary)' }}
                                />
                            )}
                            <item.icon
                                className={cn(
                                    'transition-all duration-200',
                                    isActive ? 'size-5' : 'size-5'
                                )}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            <span
                                className={cn(
                                    'text-[10px] font-medium tracking-tight transition-all',
                                    isActive ? 'opacity-100' : 'opacity-60'
                                )}
                            >
                                {item.title}
                            </span>
                        </Link>
                    );
                })}

                {/* User / Logout button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex flex-1 flex-col items-center justify-center gap-1 text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-all duration-200"
                        >
                            <div className="size-5 flex items-center justify-center rounded-full bg-sidebar-primary/30">
                                <User2 className="size-3 text-sidebar-primary" />
                            </div>
                            <span className="text-[10px] font-medium tracking-tight opacity-60">
                                {currentUser?.email?.split('@')[0]?.slice(0, 6) || 'Me'}
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="end"
                        className="mb-2 mr-2 min-w-[160px]"
                    >
                        <div className="px-2 py-1.5 border-b mb-1">
                            <p className="text-xs font-semibold truncate">{currentUser?.email?.split('@')[0] || 'Admin'}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{currentUser?.email}</p>
                        </div>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Account</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
