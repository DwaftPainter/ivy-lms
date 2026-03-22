"use client";

import * as React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import TeamSwitcher from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/store/auth.store";
import { LucideIcon } from "lucide-react";
export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    navMain: NavItem[];
}

const AppSidebar: React.FC<AppSidebarProps> = ({ navMain, ...props }) => {
    const { user } = useAuthStore();

    // Filter nav items based on user role
    const filteredNav = navMain.filter((item) => {
        if (item.title === "Admin") {
            return user?.role === "admin";
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredNav} />
            </SidebarContent>
            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;
