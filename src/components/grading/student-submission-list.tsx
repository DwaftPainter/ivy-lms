"use client";

import { useTeacherGradingStore, Submission } from "@/store/teacher-grading.store";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { getTeacherSubmissionStatusBadge } from "@/lib/ielts-badges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentSubmissionListProps {
    submissions: Submission[];
    currentSubmissionId: string | null;
    onSelect: (submissionId: string) => void;
    className?: string;
}

function getStatusIcon(status: SubmissionStatus) {
    switch (status) {
        case SubmissionStatus.GRADED:
        case SubmissionStatus.RETURNED:
            return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case SubmissionStatus.SUBMITTED:
            return <Clock className="w-4 h-4 text-amber-500" />;
        default:
            return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
}

function getStatusBadge(status: SubmissionStatus) {
    const { label, variant } = getTeacherSubmissionStatusBadge(status);
    return <Badge variant={variant}>{label}</Badge>;
}

function StudentItem({
    submission,
    isSelected,
    hasDraft,
    onClick
}: {
    submission: Submission;
    isSelected: boolean;
    hasDraft: boolean;
    onClick: () => void;
}) {
    const student = submission.student;
    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={isSelected ? "true" : undefined}
            className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-accent border border-transparent"
            )}
        >
            <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={student.avatarUrl || undefined} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                        {student.firstName} {student.lastName}
                    </p>
                    {getStatusIcon(submission.status)}
                </div>

                <p className="text-xs text-muted-foreground truncate">{student.email}</p>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {getStatusBadge(submission.status)}

                    {submission.commentCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="w-3 h-3" aria-hidden="true" />
                            {submission.commentCount}
                        </div>
                    )}

                    {hasDraft && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            Unsaved draft
                        </Badge>
                    )}
                </div>
            </div>
        </button>
    );
}

export function StudentSubmissionList({
    submissions,
    currentSubmissionId,
    onSelect,
    className
}: StudentSubmissionListProps) {
    const draftGrades = useTeacherGradingStore((state) => state.draftGrades);

    const submittedCount = submissions.filter(
        (s) => s.status === SubmissionStatus.SUBMITTED
    ).length;
    const gradedCount = submissions.filter(
        (s) => s.status === SubmissionStatus.GRADED || s.status === SubmissionStatus.RETURNED
    ).length;

    return (
        <div className={cn("flex flex-col h-full bg-card border-r", className)}>
            <div className="p-4 border-b space-y-3">
                <h2 className="font-semibold text-sm">Submissions</h2>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-muted-foreground">{submittedCount} pending</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">{gradedCount} graded</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    {submissions.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            No submissions yet
                        </div>
                    ) : (
                        submissions.map((submission) => {
                            const draft = draftGrades.get(submission.id);
                            const hasDraft = draft?.isDraft === true;

                            return (
                                <StudentItem
                                    key={submission.id}
                                    submission={submission}
                                    isSelected={currentSubmissionId === submission.id}
                                    hasDraft={hasDraft}
                                    onClick={() => onSelect(submission.id)}
                                />
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            <div className="p-3 border-t bg-muted/50">
                <p className="text-xs text-muted-foreground text-center">
                    {submissions.length} total submission{submissions.length !== 1 ? "s" : ""}
                </p>
            </div>
        </div>
    );
}
