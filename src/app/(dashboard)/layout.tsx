import UpcomingAssignments from "@/components/dashboard/upcoming-assignments";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import AppSidebar from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BellIcon, MessageSquareIcon } from "lucide-react";

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="px-4 bg-primary flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 text-text-secondary" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <p className="text-text-secondary font-semibold">Dashboard</p>
                    </div>
                    <div className="flex gap-2">
                        <BellIcon className="text-text-secondary size-4" />
                        <MessageSquareIcon className="text-text-secondary size-4" />
                    </div>
                </header>
                <main className="flex-1 overflow-auto bg-[rgb(241,241,241)]">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
