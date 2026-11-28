"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    GradingQueueCard,
    GradingStatsGrid,
    type GradingOverviewStats
} from "@/components/grading/grading-overview-cards";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import {
    filterGradingAssignments,
    type GradingAssignmentSummary
} from "@/lib/grading-submission";
import { AlertCircle, RefreshCw, RotateCcw } from "lucide-react";

interface DashboardData {
    greeting: string;
    pendingGrading: GradingAssignmentSummary[];
    summary: GradingOverviewStats;
}

export default function TeacherGradingOverviewPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    const fetchGradingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ success: boolean; data: DashboardData }>(
                "/api/teacher/dashboard"
            );
            setData(response.data);
        } catch (err) {
            setError(getErrorMessage(err) || "Failed to fetch grading data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGradingData();
    }, []);

    const filteredAssignments = filterGradingAssignments(
        data?.pendingGrading ?? [],
        searchQuery,
        selectedSkill
    );

    const pendingTotal = data?.summary?.totalSubmissionsToGrade || 0;

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8" aria-busy="true">
                <p role="status" className="sr-only">
                    Loading grading queue
                </p>
                <div className="space-y-2">
                    <Skeleton className="h-9 w-56 motion-reduce:animate-none" />
                    <Skeleton className="h-5 w-72 max-w-full motion-reduce:animate-none" />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 motion-reduce:animate-none" />
                    ))}
                </div>
                <Skeleton className="h-16 motion-reduce:animate-none" />
                <Skeleton className="h-72 motion-reduce:animate-none" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Grading queue
                    </h1>
                </header>
                <Card className="p-6 shadow-none">
                    <Alert variant="destructive" className="border-none p-0">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        <AlertTitle>Could not load grading queue</AlertTitle>
                        <AlertDescription className="mt-1 space-y-3">
                            <p>{error}</p>
                            <Button type="button" variant="outline" size="sm" onClick={fetchGradingData}>
                                <RotateCcw className="size-4" aria-hidden="true" />
                                Try again
                            </Button>
                        </AlertDescription>
                    </Alert>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        Grading queue
                    </h1>
                    <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                        {data?.greeting ? `${data.greeting} — ` : ""}
                        {pendingTotal === 1
                            ? "1 submission awaiting review."
                            : `${pendingTotal} submissions awaiting review.`}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchGradingData}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Refresh
                </Button>
            </header>

            <GradingStatsGrid stats={data?.summary} />

            <GradingQueueCard
                assignments={filteredAssignments}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedSkill={selectedSkill}
                onSkillChange={setSelectedSkill}
                onGradeClick={(assignmentId) =>
                    router.push(`/teacher/assignments/${assignmentId}/grade`)
                }
            />
        </div>
    );
}
