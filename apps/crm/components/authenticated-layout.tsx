'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarTrigger, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Navbar } from '@/components/navbar';
import { ProtectedRoute } from '@/components/protected-route';

export function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <div className="flex min-h-screen w-full max-w-full">
                    <AppSidebar />
                    <SidebarInset className="w-full max-w-full">
                        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]:h-12 bg-background/95 backdrop-blur-sm sticky top-0 z-20 w-full">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1" />
                            </div>
                            <Navbar />
                        </header>
                        <main className="p-[clamp(1rem,5vw,2rem)] w-full max-w-full">
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    );
}
