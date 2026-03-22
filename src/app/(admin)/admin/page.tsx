import { UserManagement } from "@/components/admin/user-management";
import { CourseManagement } from "@/components/admin/course-management";
import { SystemStats } from "@/components/admin/system-stats";

export default function AdminPage() {
    return (
        <div className="sm:p-8 p-4 w-full">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text-primary">Admin Dashboard</h2>
                <p className="text-muted-foreground mt-2">Manage users, courses, and system settings</p>
            </div>

            {/* Content Grid */}
            <div className="space-y-6 w-full">
                <SystemStats />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <UserManagement />
                    <CourseManagement />
                </div>
            </div>
        </div>
    );
}
