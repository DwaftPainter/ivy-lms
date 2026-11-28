"use client";

import AuthGuard from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { teacherSidebarNavConfig } from "@/config/teacher/side-bar-config";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isBuilderPage = pathname?.includes("/teacher/assignments/builder");
    const isGraderPage =
        pathname?.includes("/teacher/assignments/") && pathname?.includes("/grade");

    const mainClassName = isBuilderPage
        ? "flex flex-col overflow-hidden"
        : isGraderPage
          ? "flex flex-col xl:overflow-hidden"
          : undefined;

    return (
        <AuthGuard>
            <AppShell
                navMain={teacherSidebarNavConfig}
                homeUrl="/teacher"
                mainClassName={mainClassName}
            >
                {children}
            </AppShell>
        </AuthGuard>
    );
}
