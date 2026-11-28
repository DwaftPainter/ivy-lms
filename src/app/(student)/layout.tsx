"use client";

import AuthGuard from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { sidebarNavConfig } from "@/config/student/side-bar-config";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <AppShell navMain={sidebarNavConfig} homeUrl="/dashboard">
                {children}
            </AppShell>
        </AuthGuard>
    );
}
