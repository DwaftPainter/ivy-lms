"use client";

import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { UpcomingClasses } from "@/components/dashboard/upcoming-classes";
import { useAuthStore } from "@/store/auth.store";
import { useClassStore } from "@/store/class.store";

const Dashboard = () => {
    const { user } = useAuthStore();
    const { classes, isLoading, error } = useClassStore()

    return (
        <div className="p-8 w-full">
            {/* Greeting */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text-primary">
                    Welcome, {user?.firstName + " " + user?.lastName}
                </h2>
            </div>

            {/* Content Grid */}
            <div className="space-y-6 w-full">
                <UpcomingClasses classes={classes}/>
                <UpcomingAssignments />
            </div>
        </div>
    );
};

export default Dashboard;
