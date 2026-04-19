"use client";

import { useTeacherGradingStore } from "@/store/teacher-grading.store";
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

    const skillLabels: Record<string, string> = {
        READING: "Reading",
        LISTENING: "Listening",
        WRITING: "Writing",
        SPEAKING: "Speaking"
    };

    const skillColors: Record<string, string> = {
        READING: "bg-blue-500/10 text-blue-600",
        LISTENING: "bg-purple-500/10 text-purple-600",
        WRITING: "bg-amber-500/10 text-amber-600",
        SPEAKING: "bg-emerald-500/10 text-emerald-600"
    };

    return (
        <div className={className}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="h-8 px-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{assignment.title}</h1>
                        <Badge className={skillColors[assignment.skill] || "bg-gray-500/10"}>
                            {skillLabels[assignment.skill] || assignment.skill}
                        </Badge>
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
