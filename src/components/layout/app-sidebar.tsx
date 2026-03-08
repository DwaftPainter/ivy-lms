"use client";

import * as React from "react";
import {
    AudioWaveform,
    BookIcon,
    BookOpen,
    Bot,
    Calendar,
    Command,
    Frame,
    GalleryVerticalEnd,
    LayoutGridIcon,
    Map,
    PieChart,
    Settings2,
    SquareTerminal
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import TeamSwitcher from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { NavProjects } from "./nav-project";
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
            title: "Schedule",
            url: "#",
            icon: Calendar
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2
        }
    ]
    // projects: [
    //     {
    //         name: "Design Engineering",
    //         url: "#",
    //         icon: Frame
    //     },
    //     {
    //         name: "Sales & Marketing",
    //         url: "#",
    //         icon: PieChart
    //     },
    //     {
    //         name: "Travel",
    //         url: "#",
    //         icon: Map
    //     }
    // ]
};

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { user } = useAuthStore();
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
