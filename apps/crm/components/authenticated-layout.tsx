'use client';

import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { SidebarTrigger, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import logoUrl from '@repo/assets/logo.webp';

export function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            {/* Desktop layout — sidebar + content */}
            <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
                    {/* Sidebar: hidden on mobile, shown on lg+ */}
                    <AppSidebar />

                    <SidebarInset className="w-full min-w-0 flex-1">
                        {/* Top header — only shows trigger on desktop */}
                        <header className="hidden lg:flex h-14 shrink-0 items-center justify-between border-b px-4 gap-2 bg-background/95 backdrop-blur-sm sticky top-0 z-20 w-full transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]:h-12">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1" />
                            </div>
                        </header>

                        {/* Mobile top bar */}
                        <header className="lg:hidden flex h-14 shrink-0 items-center justify-between border-b px-4 gap-2 bg-background/95 backdrop-blur-sm sticky top-0 z-20 w-full">
                            <Link
                                href="/dashboard"
                                title="PalauSport CRM"
                                aria-label="PalauSport CRM — Dashboard"
                                className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 -m-1 outline-none ring-ring/40 focus-visible:ring-2"
                            >
                                <img
                                    src={logoUrl.src}
                                    alt=""
                                    width={144}
                                    height={40}
                                    className="h-9 w-auto shrink-0 object-contain object-left"
                                />
                                <div className="min-w-0 leading-tight">
                                    <div className="truncate font-semibold text-base tracking-tight text-foreground">
                                        PalauSport
                                    </div>
                                    <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        CRM
                                    </div>
                                </div>
                            </Link>
                        </header>

                        {/* Page content — extra bottom padding on mobile for bottom nav */}
                        <main className="p-4 sm:p-6 lg:p-8 w-full min-w-0 pb-24 lg:pb-8">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>

            {/* Mobile bottom navigation — only shown below lg */}
            <MobileBottomNav />
        </ProtectedRoute>
    );
}
