"use client";

import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MainHeader from "@/components/layout/main-header";
import { sidebarNavConfig } from "@/config/student/side-bar-config";
import AuthGuard from "@/components/layout/auth-guard";
import { WorkInProgressWrapper } from "@/components/custom-ui/work-in-progress";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
    const isDashboard = usePathname() === "/dashboard";
    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar navMain={sidebarNavConfig} />
                <SidebarInset>
                    <MainHeader navMain={sidebarNavConfig} />
                    <WorkInProgressWrapper>
                        <div
                            className={cn(
                                "flex-1 min-w-0 overflow-auto bg-[rgb(241,241,241)]",
                                !isDashboard && "mt-16 sm:mt-12"
                            )}
                        >
                            {children}
                        </div>
                    </WorkInProgressWrapper>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
