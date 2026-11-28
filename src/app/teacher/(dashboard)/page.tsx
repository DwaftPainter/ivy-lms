"use client";

import { useCallback, useEffect, useState } from "react";
import {
    TeacherNextClass,
    TeacherUpcomingClasses,
    type TeacherDashboardClass
} from "@/components/dashboard/teacher-upcoming-classes";
import {
    PendingGrading,
    TeacherNeedsGrading,
    type TeacherGradingTask
} from "@/components/dashboard/pending-grading";
import { IeltsSkill } from "@/generated/prisma/enums";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { getGreeting } from "@/lib/greeting";
import { useAuthStore } from "@/store/auth.store";

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
        sessionTitle?: string;
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

interface ClassSessionSummary {
    id: string;
    title: string;
}

async function loadTeacherOverview() {
    return Promise.allSettled([
        apiFetch<{ success: boolean; data: DashboardData }>("/api/teacher/dashboard"),
        apiFetch<{ success: boolean; data: { classSessions: ClassSessionSummary[] } }>(
            "/api/teacher/class-sessions?upcoming=true"
        )
    ]);
}

function buildSessionTitleMap(sessions: ClassSessionSummary[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const session of sessions) {
        if (session.id && session.title) {
            map.set(session.id, session.title);
        }
    }
    return map;
}

const TeacherDashboardPage = () => {
    const [nowMs] = useState(() => Date.now());
    const user = useAuthStore((state) => state.user);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [sessionTitles, setSessionTitles] = useState<Map<string, string>>(() => new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const applyOverviewResults = useCallback(
        (results: Awaited<ReturnType<typeof loadTeacherOverview>>) => {
            const [dashboardResult, sessionsResult] = results;

            if (
                sessionsResult.status === "fulfilled" &&
                Array.isArray(sessionsResult.value.data?.classSessions)
            ) {
                setSessionTitles(buildSessionTitleMap(sessionsResult.value.data.classSessions));
            }

            if (dashboardResult.status === "fulfilled") {
                setDashboardData(dashboardResult.value.data);
                setError(null);
            } else {
                setError(
                    getErrorMessage(dashboardResult.reason) || "Could not load teacher dashboard"
                );
            }

            setIsLoading(false);
        },
        []
    );

    const handleRetry = useCallback(() => {
        setIsLoading(true);
        setError(null);
        void loadTeacherOverview().then(applyOverviewResults);
    }, [applyOverviewResults]);

    useEffect(() => {
        let cancelled = false;
        void loadTeacherOverview().then((results) => {
            if (!cancelled) {
                applyOverviewResults(results);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [applyOverviewResults]);

    const sortedUpcomingClasses: TeacherDashboardClass[] = (dashboardData?.upcomingClasses ?? [])
        .map((cls): TeacherDashboardClass => {
            const dateKey = cls.date.slice(0, 10);
            const startsAt =
                dateKey && cls.startTime ? Date.parse(`${dateKey}T${cls.startTime}`) : NaN;
            const endsAt = dateKey && cls.endTime ? Date.parse(`${dateKey}T${cls.endTime}`) : NaN;

            return {
                id: cls.id,
                title: sessionTitles.get(cls.id) || cls.courseName,
                courseName: cls.courseName,
                dateKey,
                startTime: cls.startTime,
                endTime: cls.endTime,
                skill: cls.classType,
                startsAt,
                endsAt
            };
        })
        .filter(({ endsAt }) => !Number.isFinite(endsAt) || endsAt > nowMs)
        .sort(
            (a, b) =>
                (Number.isFinite(a.startsAt) ? a.startsAt : Number.MAX_SAFE_INTEGER) -
                (Number.isFinite(b.startsAt) ? b.startsAt : Number.MAX_SAFE_INTEGER)
        );

    const [nextClass, ...remainingClasses] = sortedUpcomingClasses;

    const pendingGradingList: TeacherGradingTask[] = dashboardData?.pendingGrading ?? [];
    const [nextGrading, ...remainingGrading] = pendingGradingList;
    const moreGrading = remainingGrading.slice(0, 4);

    const totalAwaitingSubmissions =
        dashboardData?.summary.totalSubmissionsToGrade ??
        pendingGradingList.reduce((sum, item) => sum + item.pendingCount, 0);

    const teacherName = dashboardData?.teacher
        ? `${dashboardData.teacher.firstName} ${dashboardData.teacher.lastName}`.trim()
        : user
          ? `${user.firstName} ${user.lastName}`.trim()
          : "";

    const subtitle = (() => {
        if (isLoading || error) {
            return teacherName
                ? `${getGreeting()}, ${teacherName}.`
                : "Your upcoming classes and grading.";
        }
        const classSummary =
            sortedUpcomingClasses.length === 1
                ? "1 upcoming class"
                : `${sortedUpcomingClasses.length} upcoming classes`;
        const gradingSummary =
            totalAwaitingSubmissions === 1
                ? "1 submission awaiting review"
                : `${totalAwaitingSubmissions} submissions awaiting review`;

        return teacherName
            ? `${getGreeting()}, ${teacherName} — ${classSummary}, ${gradingSummary}.`
            : `${classSummary}, ${gradingSummary}.`;
    })();

    const isClassInProgress = Boolean(
        nextClass &&
            Number.isFinite(nextClass.startsAt) &&
            Number.isFinite(nextClass.endsAt) &&
            nextClass.startsAt <= nowMs &&
            nextClass.endsAt > nowMs
    );

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            <header className="mb-5 sm:mb-7">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Teaching overview
                </h1>
                <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                    {subtitle}
                </p>
            </header>

            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-x-6">
                <TeacherNextClass
                    lesson={nextClass}
                    inProgress={isClassInProgress}
                    isLoading={isLoading}
                    error={error}
                    onRetry={handleRetry}
                />
                <TeacherNeedsGrading
                    item={nextGrading}
                    totalAwaitingCount={totalAwaitingSubmissions}
                    isLoading={isLoading}
                    error={error}
                    onRetry={handleRetry}
                />
                {!isLoading && !error && <TeacherUpcomingClasses classes={remainingClasses} />}
                {!isLoading && !error && <PendingGrading items={moreGrading} />}
            </div>
        </div>
    );
};

export default TeacherDashboardPage;
