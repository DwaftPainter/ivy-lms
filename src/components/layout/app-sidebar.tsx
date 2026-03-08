"use client";

import * as React from "react";
import {
    AudioWaveform,
    BookIcon,
    Calendar,
    Command,
    GalleryVerticalEnd,
    LayoutGridIcon,
    Settings2
} from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import TeamSwitcher from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { mockUser } from "@/mock";
import { mergeName } from "@/utils";

// This is sample data.
const data = {
    user: {
        name: mergeName(mockUser.firstName, mockUser.lastName),
        email: mockUser.email,
        avatar: mockUser.avatar
    },
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
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;
