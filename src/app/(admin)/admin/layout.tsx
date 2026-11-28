"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AppShell } from "@/components/layout/app-shell";
import { adminSidebarNavConfig } from "@/config/admin/side-bar-config";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <AppShell navMain={adminSidebarNavConfig} homeUrl="/admin" useWipWrapper={false}>
                {children}
            </AppShell>
        </AdminGuard>
    );
}
