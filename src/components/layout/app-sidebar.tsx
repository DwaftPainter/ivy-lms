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
    homeUrl?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ navMain, homeUrl, ...props }) => {
    const { user } = useAuthStore();

    // Filter nav items based on user role
    const filteredNav = navMain.filter((item) => {
        if (item.title === "Admin") {
            return user?.role === "admin";
        }
        return true;
    });

    const resolvedHomeUrl =
        homeUrl ?? filteredNav.find((item) => item.url && item.url !== "#")?.url ?? "/";

    return (
        <Sidebar variant="inset" collapsible="icon" {...props}>
            <SidebarHeader className="pr-10 md:pr-2">
                <TeamSwitcher homeUrl={resolvedHomeUrl} />
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
