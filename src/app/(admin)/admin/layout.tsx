"use client";

import AppSidebar from "@/components/layout/app-sidebar";
import MainHeader from "@/components/layout/main-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminGuard } from "@/components/admin/admin-guard";
import { adminSidebarNavConfig } from "@/config/admin/side-bar-config";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <SidebarProvider>
                <AppSidebar navMain={adminSidebarNavConfig} />
                <SidebarInset>
                    <MainHeader navMain={adminSidebarNavConfig} />
                    <main className="flex-1 overflow-auto bg-[rgb(241,241,241)] mt-16">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </AdminGuard>
    );
}
