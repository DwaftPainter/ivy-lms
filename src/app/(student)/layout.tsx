"use client";

import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import MainHeader from "@/components/layout/main-header";
import { sidebarNavConfig } from "@/config/student/side-bar-config";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar navMain={sidebarNavConfig} />
            <SidebarInset>
                <MainHeader />
                <main className="flex-1 overflow-auto bg-[rgb(241,241,241)] mt-16">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
