import UpcomingAssignments from "@/components/dashboard/upcoming-assignments";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import AppSidebar from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { mockUser } from "@/mock";
import MainHeader from "@/components/layout/main-header";

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <MainHeader />
                <main className="flex-1 overflow-auto bg-[rgb(241,241,241)] mt-16">
                    <div className="p-8 w-full">
                        {/* Greeting */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-text-primary">
                                <span className="animate-wave inline-block">👋</span> Welcome,{" "}
                                {mockUser.firstName + " " + mockUser.lastName}
                            </h2>
                        </div>

                        {/* Content Grid */}
                        <div className="space-y-6 w-full">
                            <UpcomingClasses />
                            <UpcomingAssignments />
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
