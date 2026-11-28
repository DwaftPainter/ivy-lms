"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassifiedAssignment, TodoGroup } from "@/lib/student-assignments";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, ClipboardList, RotateCcw } from "lucide-react";
import { AssignmentRow } from "./assignment-row";

export function AssignmentsLoadingSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true">
            <p role="status" className="sr-only">
                Loading assignments
            </p>
            <div className="space-y-2">
                <Skeleton className="h-9 w-56 motion-reduce:animate-none" />
                <Skeleton className="h-5 w-72 max-w-full motion-reduce:animate-none" />
            </div>
            <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Skeleton className="h-9 flex-1 motion-reduce:animate-none" />
                    <Skeleton className="h-9 w-full sm:w-40 motion-reduce:animate-none" />
                    <Skeleton className="h-9 w-full sm:w-40 motion-reduce:animate-none" />
                </div>
            </Card>
            <Card className="gap-0 py-0">
                <div className="border-b px-4 py-4 sm:px-6">
                    <Skeleton className="h-6 w-32 motion-reduce:animate-none" />
                </div>
                <div className="divide-y">
                    {[1, 2, 3].map((row) => (
                        <div key={row} className="space-y-2 px-4 py-4 sm:px-6">
                            <Skeleton className="h-5 w-2/3 motion-reduce:animate-none" />
                            <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export function AssignmentsErrorState({
    error,
    onRetry
}: {
    error: string;
    onRetry: () => void;
}) {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Assignments
                </h1>
            </header>
            <Card className="p-6">
                <div role="alert" className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Could not load assignments
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                        </div>
                        <Button type="button" variant="outline" onClick={onRetry}>
                            <RotateCcw className="size-4" aria-hidden="true" />
                            Try again
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export function AssignmentsEmptyState() {
    return (
        <Card className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4">
                <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold text-foreground">No assignments yet</h2>
                    <p className="text-sm text-muted-foreground">
                        When your instructors publish coursework for your enrolled courses, it will
                        show up here in one place.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/courses">Browse courses</Link>
                </Button>
            </div>
        </Card>
    );
}

export function AssignmentsNoMatchState({ onReset }: { onReset: () => void }) {
    return (
        <Card className="p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4">
                <div className="space-y-1.5">
                    <h2 className="text-lg font-semibold text-foreground">
                        No matching assignments
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        No assignments match your current search or filters.
                    </p>
                </div>
                <Button type="button" variant="outline" onClick={onReset}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Reset filters
                </Button>
            </div>
        </Card>
    );
}

export function TodoAssignmentsSection({
    todoGroups,
    totalCount
}: {
    todoGroups: TodoGroup[];
    totalCount: number;
}) {
    return (
        <section aria-labelledby="todo-section-heading" className="min-w-0">
            <Card className="gap-0 border-primary/15 py-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="size-4 shrink-0 text-primary" aria-hidden="true" />
                        <h2 id="todo-section-heading" className="text-base font-semibold text-foreground">
                            To do
                        </h2>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {totalCount} {totalCount === 1 ? "assignment" : "assignments"}
                    </span>
                </div>

                {totalCount === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <p className="text-sm text-muted-foreground">
                            All caught up — nothing pending here.
                        </p>
                    </CardContent>
                ) : (
                    <div>
                        {todoGroups.map((group) => (
                            <div
                                key={group.key}
                                className={cn(
                                    group.key === "overdue" && "border-l-2 border-l-destructive"
                                )}
                            >
                                {(todoGroups.length > 1 ||
                                    group.key === "overdue" ||
                                    group.key === "in_progress") && (
                                    <div
                                        className={cn(
                                            "border-b px-4 py-2 text-xs font-medium sm:px-6",
                                            group.key === "overdue"
                                                ? "bg-destructive/5 text-destructive"
                                                : "bg-muted/40 text-muted-foreground"
                                        )}
                                    >
                                        {group.label} ({group.items.length})
                                    </div>
                                )}
                                <ul className="divide-y">
                                    {group.items.map((item) => (
                                        <AssignmentRow key={item.assignment.id} item={item} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </section>
    );
}

export function CompletedAssignmentsSection({ items }: { items: ClassifiedAssignment[] }) {
    if (items.length === 0) return null;

    return (
        <section aria-labelledby="completed-section-heading" className="min-w-0">
            <Card className="gap-0 py-0">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <h2
                            id="completed-section-heading"
                            className="text-base font-semibold text-foreground"
                        >
                            Submitted and graded
                        </h2>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {items.length} {items.length === 1 ? "assignment" : "assignments"}
                    </span>
                </div>
                <ul className="divide-y">
                    {items.map((item) => (
                        <AssignmentRow key={item.assignment.id} item={item} />
                    ))}
                </ul>
            </Card>
        </section>
    );
}
