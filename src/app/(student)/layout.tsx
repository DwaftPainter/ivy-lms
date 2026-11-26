"use client";

import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MainHeader from "@/components/layout/main-header";
import { sidebarNavConfig } from "@/config/student/side-bar-config";
import AuthGuard from "@/components/layout/auth-guard";
import { WorkInProgressWrapper } from "@/components/custom-ui/work-in-progress";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar navMain={sidebarNavConfig} />
                <SidebarInset>
                    <MainHeader navMain={sidebarNavConfig} />
                    <WorkInProgressWrapper>
                        <main className="flex-1 min-w-0 overflow-auto bg-[rgb(241,241,241)] sm:mt-12 mt-16">
                            {children}
                        </main>
                    </WorkInProgressWrapper>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
