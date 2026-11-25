"use client";

import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { UpcomingClasses } from "@/components/dashboard/upcoming-classes";
import { useAuthStore } from "@/store/auth.store";
import { useClassStore } from "@/store/class.store";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { useEffect } from "react";

const Dashboard = () => {
    const { user } = useAuthStore();
    const { classes, isLoading: classesLoading, fetchClasses } = useClassStore();
    const { fetchEnrolledCourses } = useEnrollmentStore();

    useEffect(() => {
        fetchEnrolledCourses();
        fetchClasses()
    }, [fetchEnrolledCourses, fetchClasses]);

    // const studyingCount = enrolledCourses.filter(c => c.status === "STUDYING").length;
    // const upcomingCount = enrolledCourses.filter(c => c.status === "UPCOMING").length;
    // const doneCount = enrolledCourses.filter(c => c.status === "DONE").length;

    return (
        <div className="p-4 w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Welcome, {user?.firstName} {user?.lastName}
                    </h2>
                    {/* <p className="text-muted-foreground mt-1">
                        Here's an overview of your learning progress
                    </p> */}
                </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-6 w-full">
                <UpcomingClasses classes={classes} isLoading={classesLoading}/>
                <UpcomingAssignments />
            </div>
        </div>
    );
};

export default Dashboard;
