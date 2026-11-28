"use client";

import AppSidebar, { type NavItem } from "@/components/layout/app-sidebar";
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
        <SidebarProvider>
            <AppSidebar navMain={navMain} homeUrl={homeUrl} />
            <SidebarInset>
                <MainHeader navMain={navMain} />
                {useWipWrapper ? (
                    <WorkInProgressWrapper>{content}</WorkInProgressWrapper>
                ) : (
                    content
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
