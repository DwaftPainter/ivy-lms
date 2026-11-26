"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
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

const ROOT_PORTAL_PATHS = new Set(["/", "/teacher", "/dashboard"]);

function resolveTaskRouteTitle(pathname: string): string {
    if (pathname.startsWith("/teacher/assignments/builder")) {
        return "Assignment Builder";
    }
    if (pathname.startsWith("/teacher/assignments/") && pathname.includes("/grade")) {
        return "Grading";
    }
    if (pathname.startsWith("/teacher/lessons/") || pathname.startsWith("/lessons/")) {
        return "Lesson Details";
    }
    if (pathname.startsWith("/assignments")) {
        return "Assignments";
    }
    return "";
}

const MainHeader = ({ navMain = [] }: MainHeaderProps) => {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        // Find exact match first
        const exactMatch = navMain.find((item) => item.url === pathname);
        if (exactMatch) return exactMatch.title;

        // Find section parent route match (excluding root portal dashboards)
        const parentMatch = navMain.find(
            (item) =>
                item.url !== "#" &&
                !ROOT_PORTAL_PATHS.has(item.url) &&
                pathname.startsWith(`${item.url}/`)
        );
        if (parentMatch) return parentMatch.title;

        return resolveTaskRouteTitle(pathname);
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
            </div>
        </header>
    );
};

export default MainHeader;
