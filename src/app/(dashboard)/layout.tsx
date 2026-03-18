import UpcomingAssignments from "@/components/dashboard/upcoming-assignments";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import AppSidebar from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BellIcon, MessageSquareIcon } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <AppSidebar />

            {/* 1. SidebarInset is the wrapper for everything that ISN'T the sidebar */}
            <SidebarInset className="flex flex-col">
                {/* 2. Header: Use 'sticky' instead of 'fixed' to stay within the Inset's flow */}
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-primary px-4 transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1 text-text-secondary" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <p className="text-text-secondary font-semibold">Dashboard</p>
                    </div>
                    <div className="flex gap-2">
                        <BellIcon className="text-text-secondary size-4 cursor-pointer" />
                        <MessageSquareIcon className="text-text-secondary size-4 cursor-pointer" />
                    </div>
                </header>

                {/* 3. Main content */}
                <main className="flex-1 bg-[rgb(241,241,241)] p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;
