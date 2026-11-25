"use client";

import Image from "next/image";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
const TeamSwitcher = () => {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                    <Image src="/IVY_IELTS_Logo.svg" alt="" width={32} height={32} className="size-8 rounded-xs" />

                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">IVY LMS</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default TeamSwitcher;
