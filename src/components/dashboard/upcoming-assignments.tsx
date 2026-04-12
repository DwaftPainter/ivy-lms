"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ClipboardList } from "lucide-react";
import { useAssignmentStore } from "@/store/assignment.store";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function UpcomingAssignments() {
    const { assignments, isLoading, fetchAssignments } = useAssignmentStore();
    const router = useRouter();

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Filter pending assignments that are not overdue
    const upcomingAssignments = assignments
        .filter((a) => a.submissionStatus === SubmissionStatus.PENDING && !a.isOverdue)
        .slice(0, 5); // Show top 5

    const isEmpty = upcomingAssignments.length === 0;

    const formatDueDate = (date: Date | null) => {
        if (!date) return "No due date";
        const d = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Due today";
        if (diffDays === 1) return "Due tomorrow";
        if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
        return `${diffDays} days left`;
    };

    const getDueDateColor = (date: Date | null, isOverdue: boolean) => {
        if (isOverdue) return "bg-red-500 text-white";
        if (!date) return "bg-muted text-muted-foreground";

        const d = new Date(date);
        const today = new Date();
        const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) return "bg-red-500 text-white";
        if (diffDays <= 3) return "bg-amber-500 text-white";
        return "bg-primary text-white";
    };

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Assignments</h2>
                {!isEmpty && (
                    <span className="text-sm text-muted-foreground">
                        {upcomingAssignments.length} pending
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-4 py-10">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mb-6" />
                    <p className="text-sm font-medium text-foreground">No assignments yet</p>
                    <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {upcomingAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="bg-secondary rounded-lg p-6 flex items-center justify-between border border-border/50 hover:border-border transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide truncate">
                                    {assignment.course.title}
                                </p>
                                <h3 className="font-semibold text-foreground mb-4 truncate">
                                    {assignment.title}
                                </h3>

                                <div className="flex items-center gap-2">
                                    <div
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-xs ${getDueDateColor(
                                            assignment.dueDate,
                                            assignment.isOverdue
                                        )}`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        {formatDueDate(assignment.dueDate)}
                                    </div>
                                    {/* <span className="text-xs bg-secondary-foreground/10 text-secondary-foreground px-2 py-1 rounded">
                                            {assignment.skill}
                                        </span> */}
                                </div>
                            </div>

                            <Button
                                className="bg-primary hover:bg-primary/90 text-white font-medium ml-6 shrink-0"
                                size="sm"
                                onClick={() => router.push(`/extension/?tab=assignments`)}
                            >
                                Finish Now
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
