"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackTask } from "@/store/feedback.store";
import { MessageSquare, Clock, BookOpen } from "lucide-react";

interface FeedbackTasksProps {
    tasks?: FeedbackTask[];
    isLoading?: boolean;
}

export function FeedbackTasks({ tasks = [], isLoading = false }: FeedbackTasksProps) {
    const isEmpty = tasks.length === 0;

    if (isLoading) {
        return (
            <Card className="p-6 border rounded-[12px]">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-secondary rounded-lg p-6 flex items-center justify-between border border-border/50">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-7 w-24 rounded-md" />
                            </div>
                            <Skeleton className="w-10 h-10 rounded-full ml-6 shrink-0" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">
                Feedback Tasks
            </h2>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-6" />
                    <p className="text-sm font-medium text-foreground">
                        No feedback tasks
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        No pending student feedback or evaluations at the moment.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task, idx) => (
                        <div
                            key={idx}
                            className="bg-secondary rounded-lg p-6 flex items-center justify-between border border-border/50 hover:border-border transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-foreground">
                                        {task.studentName}
                                    </span>
                                    <span className="text-muted-foreground">-</span>
                                    <span className="text-sm text-muted-foreground">
                                        {task.course}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 bg-destructive text-white px-3 py-1.5 rounded-md font-medium text-xs">
                                        <Clock className="w-4 h-4" />
                                        Due {task.deadline}
                                    </div>
                                </div>
                            </div>

                            <div className="ml-6 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
