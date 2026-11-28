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

const ROOT_PORTAL_PATHS = new Set(["/", "/teacher", "/dashboard", "/admin"]);

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
    if (pathname.startsWith("/teacher/messages")) {
        return "Messages";
    }
    if (pathname.startsWith("/assignments")) {
        return "Assignments";
    }
    if (pathname.startsWith("/admin")) {
        return "Admin";
    }
    return "";
}

const MainHeader = ({ navMain = [] }: MainHeaderProps) => {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        const exactMatch = navMain.find((item) => item.url === pathname);
        if (exactMatch) return exactMatch.title;

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
        <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/95 px-3 backdrop-blur-xs sm:px-6 md:static md:bg-background md:backdrop-blur-none">
            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                <SidebarTrigger />
                <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-4 shrink-0"
                />
                {pageTitle && (
                    <span className="truncate text-sm font-medium text-foreground">
                        {pageTitle}
                    </span>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
                <NotificationBell />
            </div>
        </header>
    );
};

export default MainHeader;
