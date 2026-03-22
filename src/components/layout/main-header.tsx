"use client";

import { Separator } from "@/components/ui/separator";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { BellIcon, MessageSquareIcon } from "lucide-react";

const MainHeader = () => {
    const { open } = useSidebar();

    return (
        <header
            style={{
                left: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON
            }}
            className="z-9999 fixed top-0 transition-all duration-75 right-0 px-4 bg-primary flex h-16 shrink-0 items-center justify-between gap-2  ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-text-secondary" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <p className="text-text-secondary font-semibold">Dashboard</p>
            </div>
            <div className="flex gap-2">
                <div className="border-gradient">
                    <button className="p-1.5 flex items-center min-h-6 min-w-6 cursor-pointer">
                        <BellIcon className="text-text-secondary size-4" />
                    </button>
                </div>
                <div className="border-gradient">
                    <button className="p-1.5 flex items-center min-h-6 min-w-6 cursor-pointer">
                        <MessageSquareIcon className="text-text-secondary size-3" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;
