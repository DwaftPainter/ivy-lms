"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { Assignment } from "@/store/assignment.store";
import { EnrolledCourse } from "@/store/enrollment.store";

interface AssignmentsTabProps {
    assignments: Assignment[];
    enrolledCourses: EnrolledCourse[];
}

function getStatusIcon(status: SubmissionStatus) {
    switch (status) {
        case SubmissionStatus.SUBMITTED:
            return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        case SubmissionStatus.GRADED:
        case SubmissionStatus.RETURNED:
            return <CheckCircle className="w-4 h-4 text-blue-500" />;
        default:
            return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
}

function getStatusText(status: SubmissionStatus) {
    switch (status) {
        case SubmissionStatus.SUBMITTED:
            return { text: "Submitted", class: "bg-emerald-100 text-emerald-700" };
        case SubmissionStatus.GRADED:
            return { text: "Graded", class: "bg-blue-100 text-blue-700" };
        case SubmissionStatus.RETURNED:
            return { text: "Returned", class: "bg-purple-100 text-purple-700" };
        default:
            return { text: "Pending", class: "bg-amber-100 text-amber-700" };
    }
}

function formatDueDate(date: Date | null) {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

export function AssignmentsTab({ assignments, enrolledCourses }: AssignmentsTabProps) {
    const assignmentsByCourse = enrolledCourses.map((course) => ({
        ...course,
        assignments: assignments.filter((a) => a.course.id === course.courseId)
    }));

    const pendingCount = assignments.filter((a) => a.submissionStatus === SubmissionStatus.PENDING).length;

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">All Assignments</h2>
                <div className="text-sm text-muted-foreground">
                    Total: {assignments.length} | Pending: {pendingCount}
                </div>
            </div>

            {assignmentsByCourse.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No assignments available</div>
            ) : (
                <div className="space-y-6">
                    {assignmentsByCourse.map((course) => (
                        <div key={course.id} className="border border-border/50 rounded-lg overflow-hidden">
                            <div className="bg-muted/50 px-4 py-3 border-b border-border/50">
                                <h3 className="font-semibold text-foreground">{course.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    <span>Status: {course.status}</span>
                                    <span>Progress: {course.progress?.completionPercentage || 0}%</span>
                                </div>
                            </div>

                            <div className="divide-y divide-border/50">
                                {course.assignments.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">
                                        No assignments for this course
                                    </div>
                                ) : (
                                    course.assignments.map((assignment) => {
                                        const statusStyle = getStatusText(assignment.submissionStatus);
                                        return (
                                            <div
                                                key={assignment.id}
                                                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-foreground">
                                                            {assignment.title}
                                                        </h4>
                                                        {assignment.isOverdue &&
                                                            assignment.submissionStatus ===
                                                                SubmissionStatus.PENDING && (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                                    Overdue
                                                                </span>
                                                            )}
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                            {assignment.skill}
                                                        </span>
                                                        <span className="text-xs bg-secondary text-muted-foreground px-2 py-1 rounded">
                                                            {assignment.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Due: {formatDueDate(assignment.dueDate)}
                                                    </p>
                                                </div>

                                                <div className="text-right flex items-center justify-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusStyle.class}`}
                                                    >
                                                        {getStatusIcon(assignment.submissionStatus)}
                                                        {statusStyle.text}
                                                    </span>

                                                    {assignment.submission?.score && (
                                                        <p className="text-sm font-medium">
                                                            Score: {assignment.submission.score}/
                                                            {assignment.maxScore}
                                                        </p>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            (window.location.href = `/assignments/${assignment.id}`)
                                                        }
                                                    >
                                                        {assignment.submission?.score ? "View" : "Start"}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
