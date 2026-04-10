'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { SidebarTrigger, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProtectedRoute } from '@/components/protected-route';

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
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
                                    </svg>
                                </div>
                                <span className="font-bold text-base tracking-tight text-foreground">PalauSport</span>
                            </div>
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
