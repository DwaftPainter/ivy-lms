"use client";

import { useTeacherGradingStore } from "@/store/teacher-grading.store";
import { getSkillLabel } from "@/lib/ielts-badges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface GradingHeaderProps {
    className?: string;
}

export function GradingHeader({ className }: GradingHeaderProps) {
    const router = useRouter();
    const assignment = useTeacherGradingStore((state) => state.assignment);
    const summary = useTeacherGradingStore((state) => state.summary);

    if (!assignment) return null;

    return (
        <div className={className}>
            <div className="flex items-start justify-between gap-4 min-w-0">
                <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="h-8 px-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                            Back
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold break-words">
                            {assignment.title}
                        </h1>
                        <Badge variant="secondary">{getSkillLabel(assignment.skill)}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            <span>{assignment.courseName}</span>
                        </div>

                        {assignment.dueDate && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    Due {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                                </span>
                            </div>
                        )}

                        {summary && (
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>
                                    {summary.pendingCount} pending, {summary.gradedCount} graded
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
