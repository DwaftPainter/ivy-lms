"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";
import { getTeacherSubmissionStatusBadge } from "@/lib/ielts-badges";
import { cn } from "@/lib/utils";
import type { AssignmentInfo, Submission } from "@/store/teacher-grading.store";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { ReadingListeningResponses } from "./reading-listening-responses";
import {
    SpeakingSubmissionContent,
    SubmissionAiGradingSummary,
    SubmissionFileAttachment,
    SubmissionStudentInfo,
    WritingSubmissionContent
} from "./submission-content-parts";

interface SubmissionViewerProps {
    submission: Submission;
    skill: IeltsSkill;
    className?: string;
    assignment?: AssignmentInfo;
}

function getStatusBadge(status: SubmissionStatus) {
    const { label, variant } = getTeacherSubmissionStatusBadge(status);
    switch (status) {
        case SubmissionStatus.GRADED:
        case SubmissionStatus.RETURNED:
            return (
                <Badge variant={variant}>
                    <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                    {label}
                </Badge>
            );
        case SubmissionStatus.SUBMITTED:
            return (
                <Badge variant={variant}>
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    {label}
                </Badge>
            );
        default:
            return (
                <Badge variant={variant}>
                    <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                    {label}
                </Badge>
            );
    }
}

export function SubmissionViewer({
    submission,
    skill,
    className,
    assignment
}: SubmissionViewerProps) {
    return (
        <Card className={cn("border shadow-sm", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Student Submission</CardTitle>
                    {getStatusBadge(submission.status)}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <SubmissionStudentInfo
                    student={submission.student}
                    submittedAt={submission.submittedAt}
                />

                <hr className="border-border" />

                <ScrollArea className="max-h-[500px]">
                    <div className="space-y-6">
                        {skill === IeltsSkill.WRITING && submission.content && (
                            <WritingSubmissionContent content={submission.content} />
                        )}

                        {skill === IeltsSkill.SPEAKING && (
                            <SpeakingSubmissionContent
                                audioUrls={submission.audioUrls}
                                audioUrl={submission.audioUrl}
                            />
                        )}

                        {submission.fileUrl && (
                            <SubmissionFileAttachment fileUrl={submission.fileUrl} />
                        )}

                        {(skill === IeltsSkill.READING || skill === IeltsSkill.LISTENING) &&
                            submission.content &&
                            assignment && (
                                <ReadingListeningResponses
                                    content={submission.content}
                                    assignment={assignment}
                                />
                            )}

                        {submission.aiScore !== null && submission.aiScore !== undefined && (
                            <SubmissionAiGradingSummary
                                aiScore={submission.aiScore}
                                aiFeedback={submission.aiFeedback}
                            />
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
