"use client";

import AppSidebar, { type NavItem } from "@/components/layout/app-sidebar";
import { AppBottom } from "@/components/layout/app-bottom";
import MainHeader from "@/components/layout/main-header";
import { WorkInProgressWrapper } from "@/components/custom-ui/work-in-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
    navMain: NavItem[];
    homeUrl?: string;
    useWipWrapper?: boolean;
    mainClassName?: string;
    children: React.ReactNode;
}

export function AppShell({
    navMain,
    homeUrl,
    useWipWrapper = true,
    mainClassName,
    children
}: AppShellProps) {
    const content = (
        <main className={cn("flex-1 min-w-0 md:overflow-y-auto", mainClassName)}>
            {children}
        </main>
    );

    return (
        <SidebarProvider className="grid grid-cols-[minmax(0,1fr)] grid-rows-[1fr] md:grid-cols-[auto_minmax(0,1fr)] md:grid-rows-[1fr_auto] md:[&>[data-slot=sidebar]]:row-span-2">
            <AppSidebar navMain={navMain} homeUrl={homeUrl} />
            <SidebarInset className="min-h-0 md:col-start-2 md:row-start-1 md:h-[calc(100svh-2.5rem-env(safe-area-inset-bottom))]">
                <MainHeader navMain={navMain} />
                {useWipWrapper ? (
                    <WorkInProgressWrapper>{content}</WorkInProgressWrapper>
                ) : (
                    content
                )}
            </SidebarInset>
            <AppBottom />
        </SidebarProvider>
    );
}
