"use client";

import { useEffect } from "react";
import { TeacherUpcomingClasses } from "@/components/dashboard/teacher-upcoming-classes";
import { PendingGrading } from "@/components/dashboard/pending-grading";
import { FeedbackTasks } from "@/components/dashboard/feedback-tasks";
import { useAuthStore } from "@/store/auth.store";
import { useTeacherClassStore } from "@/store/teacher-class.store";
import { useGradingStore } from "@/store/grading.store";
import { useFeedbackStore } from "@/store/feedback.store";
import { getGreeting } from "@/lib/greeting";

const Dashboard = () => {
    const { user } = useAuthStore();
    const { classes, fetchTeacherClasses } = useTeacherClassStore();
    const { pendingGrading, fetchPendingGrading } = useGradingStore();
    const { feedbackTasks, fetchFeedbackTasks } = useFeedbackStore();

    useEffect(() => {
        fetchTeacherClasses();
        fetchPendingGrading();
        fetchFeedbackTasks();
    }, [fetchTeacherClasses, fetchPendingGrading, fetchFeedbackTasks]);

    const fullName = user ? `${user.firstName} ${user.lastName}` : "";

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
                <TeacherUpcomingClasses classes={classes} />
                <PendingGrading items={pendingGrading} />
                <FeedbackTasks tasks={feedbackTasks} />
            </div>
        </div>
    );
};

export default Dashboard;
