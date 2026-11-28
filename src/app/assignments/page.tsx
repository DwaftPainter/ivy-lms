"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { sidebarNavConfig } from "@/config/student/side-bar-config";
import { AssignmentFiltersBar } from "@/components/assignments/assignment-filters";
import {
    AssignmentsEmptyState,
    AssignmentsErrorState,
    AssignmentsLoadingSkeleton,
    AssignmentsNoMatchState,
    CompletedAssignmentsSection,
    TodoAssignmentsSection
} from "@/components/assignments/assignment-sections";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import {
    classifyAssignment,
    filterAssignments,
    formatAssignmentsSummaryLine,
    getCompletedAssignments,
    getOverviewCounts,
    groupTodoAssignments,
    type AssignmentsData,
    type StatusFilterValue
} from "@/lib/student-assignments";

export default function StudentAssignmentsPage() {
    const [nowMs] = useState(() => Date.now());
    const [data, setData] = useState<AssignmentsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
    const [skillFilter, setSkillFilter] = useState<string>("all");

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{
                success: boolean;
                data: AssignmentsData;
            }>("/api/student/assignments");
            setData(response.data);
        } catch (err) {
            setError(getErrorMessage(err) || "Could not load your assignments.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSkillFilter("all");
    };

    const hasActiveFilters =
        searchQuery.trim().length > 0 || statusFilter !== "all" || skillFilter !== "all";

    const classified = useMemo(
        () => (data?.assignments ?? []).map((assignment) => classifyAssignment(assignment, nowMs)),
        [data?.assignments, nowMs]
    );

    const overviewCounts = useMemo(() => getOverviewCounts(classified), [classified]);

    const filteredItems = useMemo(
        () => filterAssignments(classified, { searchQuery, statusFilter, skillFilter }),
        [classified, searchQuery, skillFilter, statusFilter]
    );

    const todoGroups = useMemo(() => groupTodoAssignments(filteredItems), [filteredItems]);

    const todoFilteredCount = useMemo(
        () => todoGroups.reduce((total, group) => total + group.items.length, 0),
        [todoGroups]
    );

    const completedItems = useMemo(() => getCompletedAssignments(filteredItems), [filteredItems]);

    const isCompletedOnlyFilter =
        statusFilter === "submitted" ||
        statusFilter === "graded" ||
        statusFilter === "returned";

    return (
        <AuthGuard>
            <AppShell navMain={sidebarNavConfig} homeUrl="/dashboard">
                <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                    {isLoading ? (
                        <AssignmentsLoadingSkeleton />
                    ) : error ? (
                        <AssignmentsErrorState error={error} onRetry={fetchAssignments} />
                    ) : (
                        <div className="space-y-6">
                            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                        Assignments
                                    </h1>
                                    <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                                        {classified.length === 0
                                            ? "Assignments from your courses will appear here."
                                            : formatAssignmentsSummaryLine(overviewCounts)}
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex min-h-8 shrink-0 items-center self-start rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
                                >
                                    Back to study plan
                                </Link>
                            </header>

                            {classified.length === 0 ? (
                                <AssignmentsEmptyState />
                            ) : (
                                <>
                                    <AssignmentFiltersBar
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        statusFilter={statusFilter}
                                        onStatusChange={setStatusFilter}
                                        skillFilter={skillFilter}
                                        onSkillChange={setSkillFilter}
                                        hasActiveFilters={hasActiveFilters}
                                        onReset={resetFilters}
                                    />

                                    {filteredItems.length === 0 ? (
                                        <AssignmentsNoMatchState onReset={resetFilters} />
                                    ) : (
                                        <div className="space-y-6">
                                            {!isCompletedOnlyFilter && (
                                                <TodoAssignmentsSection
                                                    todoGroups={todoGroups}
                                                    totalCount={todoFilteredCount}
                                                />
                                            )}

                                            <CompletedAssignmentsSection items={completedItems} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </AppShell>
        </AuthGuard>
    );
}
