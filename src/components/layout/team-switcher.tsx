"use client";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
const TeamSwitcher = () => {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                    <img className="size-8 rounded-xs" src="/IVY_IELTS_Logo.svg" />

                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">IVY LMS</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default TeamSwitcher;
