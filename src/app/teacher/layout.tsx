"use client";

import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MainHeader from "@/components/layout/main-header";
import { teacherSidebarNavConfig } from "@/config/teacher/side-bar-config";
import AuthGuard from "@/components/layout/auth-guard";
import { WorkInProgressWrapper } from "@/components/custom-ui/work-in-progress";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Full-width or hero-padded pages that manage their own top spacing
    const isFullWidthPage =
        pathname === "/teacher" ||
        pathname === "/teacher/grading" ||
        pathname?.includes("/teacher/grading/") ||
        pathname?.includes("/teacher/assignments/builder") ||
        (pathname?.includes("/teacher/assignments/") && pathname?.includes("/grade"));

    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar navMain={teacherSidebarNavConfig} />
                <SidebarInset className="min-w-0">
                    <MainHeader navMain={teacherSidebarNavConfig} />
                    <WorkInProgressWrapper>
                        <main
                            className={cn(
                                "flex-1 min-w-0 overflow-auto bg-[rgb(241,241,241)]",
                                !isFullWidthPage && "sm:mt-12 mt-16"
                            )}
                        >
                            {children}
                        </main>
                    </WorkInProgressWrapper>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
