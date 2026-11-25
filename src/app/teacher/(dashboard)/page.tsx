"use client";

import { useEffect, useState } from "react";
import { TeacherUpcomingClasses } from "@/components/dashboard/teacher-upcoming-classes";
import { PendingGrading } from "@/components/dashboard/pending-grading";
import { FeedbackTasks } from "@/components/dashboard/feedback-tasks";
import { useAuthStore } from "@/store/auth.store";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { getGreeting } from "@/lib/greeting";
import { IeltsSkill } from "@/generated/prisma/enums";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
    greeting: string;
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    };
    upcomingClasses: Array<{
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        courseName: string;
        classType: IeltsSkill;
        enrolledStudents: number;
    }>;
    pendingGrading: Array<{
        assignmentId: string;
        title: string;
        courseName: string;
        courseId: string;
        pendingCount: number;
        deadline: string | null;
        skill: IeltsSkill;
    }>;
    summary: {
        totalCourses: number;
        totalStudents: number;
        totalSubmissionsToGrade: number;
        upcomingClassesCount: number;
    };
}

const Dashboard = () => {
    const { user } = useAuthStore();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiFetch<{ success: boolean; data: DashboardData }>(
                    "/api/teacher/dashboard"
                );
                setDashboardData(response.data);
            } catch (err) {
                setError(getErrorMessage(err) || "Failed to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const fullName = user ? `${user.firstName} ${user.lastName}` : "";

    // Map upcomingClasses to the format expected by TeacherUpcomingClasses component
    const mappedClasses =
        dashboardData?.upcomingClasses.map((cls) => {
            const dateObj = new Date(cls.date);
            return {
                id: cls.id,
                title: cls.courseName,
                course: cls.courseName,
                date: dateObj.getDate().toString(),
                day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
                startTime: cls.startTime,
                endTime: cls.endTime,
                classType: cls.classType,
                enrolledStudents: cls.enrolledStudents,
                description: null
            };
        }) || [];

    // Map pendingGrading to the format expected by PendingGrading component
    const mappedPendingGrading =
        dashboardData?.pendingGrading.map((item) => ({
            assignmentId: item.assignmentId,
            title: item.title,
            course: item.courseName,
            submissionsAwaiting: item.pendingCount,
            deadline: item.deadline || ""
        })) || [];

    if (isLoading) {
        return (
            <div className="p-4 w-full">
                <div className="mb-6">
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="space-y-6 w-full">
                    <TeacherUpcomingClasses classes={[]} isLoading={true} />
                    <PendingGrading items={[]} isLoading={true} />
                    <FeedbackTasks tasks={[]} isLoading={true} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 w-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {getGreeting()}, {fullName}
                    </h2>
                </div>
                <div className="p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 w-full">
            {/* Greeting */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                    {getGreeting()}, {fullName}
                </h2>
            </div>

            {/* Content Grid */}
            <div className="space-y-6 w-full">
                <TeacherUpcomingClasses classes={mappedClasses} />
                <PendingGrading items={mappedPendingGrading} />
                {/* <FeedbackTasks tasks={feedbackTasks} /> */}
            </div>
        </div>
    );
};

export default Dashboard;
