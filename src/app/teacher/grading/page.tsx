"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { AlertCircle, Clock } from "lucide-react";

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

    if (isLoading) {
        return (
            <div className="h-full p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="shrink-0 p-6 border-b bg-card">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Grading Center</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data?.greeting} - You have{" "}
                            {data?.summary?.totalSubmissionsToGrade || 0} submissions awaiting review
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchGradingData}>
                        <Clock className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-6 max-w-7xl mx-auto">
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
            </ScrollArea>
        </div>
    );
}
