"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageSquareIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface NavItem {
    title: string;
    url: string;
}

interface MainHeaderProps {
    navMain?: NavItem[];
}

const MainHeader = ({ navMain = [] }: MainHeaderProps) => {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        // Find exact match first
        const exactMatch = navMain.find((item) => item.url === pathname);
        if (exactMatch) return exactMatch.title;

        // Find parent route match (e.g., /courses/123 matches /courses)
        const parentMatch = navMain.find((item) =>
            pathname.startsWith(item.url) && item.url !== "#"
        );
        if (parentMatch) return parentMatch.title;

        return "";
    }, [pathname, navMain]);

    return (
        <header
            className="sticky top-0 z-50 w-full px-4 bg-primary flex h-12 shrink-0 items-center justify-between gap-2"
        >
            <div className="flex items-center gap-2 overflow-hidden">
                <SidebarTrigger className="text-text-secondary shrink-0" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4 shrink-0" />
                {pageTitle && (
                    <p className="text-text-secondary font-semibold truncate">
                        {pageTitle}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <NotificationBell />
                <div className="border-gradient size-9 flex items-center justify-center cursor-pointer">
                    <button
                        type="button"
                        aria-label="Messages"
                        className="p-1.5 flex items-center h-9 w-9 cursor-pointer"
                    >
                        <span className="flex items-center justify-center size-full">
                            <MessageSquareIcon className="text-text-secondary size-4" aria-hidden="true" />
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;
