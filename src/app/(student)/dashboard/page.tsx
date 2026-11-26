"use client";

import {
    NextAssignment,
    UpcomingAssignments,
    type DashboardAssignment
} from "@/components/dashboard/upcoming-assignments";
import { NextClass, UpcomingClasses } from "@/components/dashboard/upcoming-classes";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { useAssignmentStore } from "@/store/assignment.store";
import { useAuthStore } from "@/store/auth.store";
import { useClassStore, type ClassItem } from "@/store/class.store";
import { useEffect, useState } from "react";

function getClassTiming(lesson: ClassItem) {
    const date = lesson.fullDate?.slice(0, 10);
    const [start, end] = lesson.time.split(" - ");
    return {
        lesson,
        startsAt: date && start ? Date.parse(`${date}T${start}`) : NaN,
        endsAt: date && end ? Date.parse(`${date}T${end}`) : NaN
    };
}

const Dashboard = () => {
    const [now] = useState(() => Date.now());
    const firstName = useAuthStore((state) => state.user?.firstName);
    const { classes, isLoading, error, fetchClasses } = useClassStore();
    const {
        assignments,
        isLoading: assignmentsLoading,
        error: assignmentsError,
        fetchAssignments
    } = useAssignmentStore();

    useEffect(() => {
        fetchClasses();
        fetchAssignments();
    }, [fetchClasses, fetchAssignments]);

    const [nextClass, ...moreClasses] = classes
        .map(getClassTiming)
        .filter(({ endsAt }) => !Number.isFinite(endsAt) || endsAt > now)
        .sort((a, b) =>
            (Number.isFinite(a.startsAt) ? a.startsAt : Number.MAX_SAFE_INTEGER) -
            (Number.isFinite(b.startsAt) ? b.startsAt : Number.MAX_SAFE_INTEGER)
        );

    const pendingAssignments = assignments
        .filter((assignment) => assignment.submissionStatus === SubmissionStatus.PENDING)
        .map((assignment): DashboardAssignment => {
            const date = assignment.dueDate ? new Date(assignment.dueDate) : null;
            const deadline = date && Number.isFinite(date.getTime()) ? date : null;
            return {
                assignment,
                deadline,
                overdue: Boolean(deadline && deadline.getTime() < now)
            };
        })
        .sort((a, b) =>
            (a.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER) -
            (b.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER)
        );

    const nextAssignment = pendingAssignments.find((item) => item.deadline && !item.overdue) ?? pendingAssignments[0];
    const moreAssignments = pendingAssignments.filter((item) => item !== nextAssignment).slice(0, 4);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-7 sm:pt-10 lg:px-9">
            <header className="mb-5 sm:mb-7">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Your study plan
                </h1>
                {firstName && (
                    <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                        Welcome back, {firstName}.
                    </p>
                )}
            </header>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-x-6">
                <NextClass
                    lesson={nextClass?.lesson}
                    inProgress={Boolean(nextClass && nextClass.startsAt <= now && nextClass.endsAt > now)}
                    isLoading={isLoading}
                    error={error}
                    onRetry={fetchClasses}
                />
                <NextAssignment
                    item={nextAssignment}
                    isLoading={assignmentsLoading}
                    error={assignmentsError}
                    onRetry={() => fetchAssignments()}
                />
                {!isLoading && !error && <UpcomingClasses classes={moreClasses.map(({ lesson }) => lesson)} />}
                {!assignmentsLoading && !assignmentsError && (
                    <UpcomingAssignments items={moreAssignments} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
