"use client";

import * as React from "react";
import {
    AudioWaveform,
    BookIcon,
    Calendar,
    Command,
    GalleryVerticalEnd,
    Grid3X3Icon,
    LayoutGridIcon,
    Settings
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import TeamSwitcher from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/store/auth.store";

// This is sample data.
const data = {
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise"
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup"
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free"
        }
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "#",
            icon: LayoutGridIcon,
            isActive: true
        },
        {
            title: "Courses",
            url: "#",
            icon: BookIcon
        },
        {
            title: "Extension",
            url: "#",
            icon: Grid3X3Icon
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings
        }
    ]
};

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { user } = useAuthStore();
    console.log('🚀 ~ AppSidebar ~ user:', user)
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;
