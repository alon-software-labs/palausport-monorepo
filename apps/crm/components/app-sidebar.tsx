'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    CalendarDays,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    ChevronUp,
    User2,
    Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logoUrl from '@repo/assets/logo.webp';

const items = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Reservations', url: '/reservations', icon: CalendarDays },
    { title: 'Clients', url: '/clients', icon: Users },
    { title: 'Chat', url: '/chat', icon: MessageSquare },
    // { title: 'Invoice History', url: '/invoices', icon: FileText },
];

export function AppSidebar() {
    const router = useRouter();
    const { currentUser, logout } = useAppContext();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        /* hidden on mobile — bottom nav is used instead */
        <div className="hidden lg:contents">
            <Sidebar collapsible="icon">
                <SidebarHeader className="border-sidebar-border border-b p-4 group-data-[collapsible=icon]:border-b-0 group-data-[collapsible=icon]:p-2">
                    <Link
                        href="/dashboard"
                        title="PalauSport CRM"
                        aria-label="PalauSport CRM — Dashboard"
                        className="flex min-w-0 items-center gap-3 rounded-lg p-1 outline-none ring-sidebar-ring focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1.5"
                    >
                        <img
                            src={logoUrl.src}
                            alt=""
                            width={160}
                            height={48}
                            className="h-12 w-auto shrink-0 object-contain object-left group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:max-w-9"
                        />
                        <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                            <div className="truncate font-semibold text-lg tracking-tight text-sidebar-foreground">
                                PalauSport
                            </div>
                            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                CRM
                            </div>
                        </div>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                            <User2 className="size-4" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-semibold">
                                                {currentUser?.email?.split('@')[0] || 'Admin User'}
                                            </span>
                                            <span className="truncate text-xs text-slate-500">
                                                {currentUser?.email || 'admin@example.com'}
                                            </span>
                                        </div>
                                        <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-dropdown-menu-trigger-width]"
                                >
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </div>
    );
}
