"use client";

import { Submission, Student } from "@/store/teacher-grading.store";
import { SubmissionStatus, IeltsSkill } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Headphones, Paperclip, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionViewerProps {
    submission: Submission;
    skill: IeltsSkill;
    className?: string;
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatusBadge(status: SubmissionStatus) {
    switch (status) {
        case SubmissionStatus.GRADED:
            return (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Graded
                </Badge>
            );
        case SubmissionStatus.RETURNED:
            return (
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Returned
                </Badge>
            );
        case SubmissionStatus.SUBMITTED:
            return (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Submitted
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Draft
                </Badge>
            );
    }
}

function StudentInfo({ student, submittedAt }: { student: Student; submittedAt?: string | null }) {
    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={student.avatarUrl || undefined} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium">
                    {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
                {submittedAt && (
                    <p className="text-xs text-muted-foreground">
                        Submitted: {formatDate(submittedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}

function WritingSubmission({ content }: { content: string }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Written Response</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {content || "No content submitted."}
            </div>
        </div>
    );
}

function SpeakingSubmission({ audioUrls, audioUrl }: { audioUrls?: unknown; audioUrl?: string | null }) {
    const recordings = (() => {
        if (audioUrls && Array.isArray(audioUrls)) {
            return audioUrls as Array<{ questionId?: string; url: string; duration?: number }>;
        }
        if (audioUrl) {
            return [{ url: audioUrl }];
        }
        return [];
    })();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Headphones className="w-4 h-4" />
                <span className="text-sm font-medium">Speaking Recordings</span>
            </div>

            {recordings.length > 0 ? (
                <div className="space-y-3">
                    {recordings.map((recording, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Recording {index + 1}</span>
                                {recording.duration && (
                                    <span className="text-xs text-muted-foreground">
                                        {Math.floor(recording.duration / 60)}:
                                        {(recording.duration % 60).toString().padStart(2, "0")}
                                    </span>
                                )}
                            </div>
                            <audio controls className="w-full h-10" src={recording.url}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No recordings available.</p>
            )}
        </div>
    );
}

function FileSubmission({ fileUrl }: { fileUrl?: string | null }) {
    if (!fileUrl) return null;

    const fileName = fileUrl.split("/").pop() || "Uploaded file";

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm font-medium">Attachment</span>
            </div>
            <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-accent transition-colors"
            >
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm truncate">{fileName}</span>
            </a>
        </div>
    );
}

export function SubmissionViewer({ submission, skill, className }: SubmissionViewerProps) {
    return (
        <Card className={cn("border shadow-sm", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Student Submission</CardTitle>
                    {getStatusBadge(submission.status)}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <StudentInfo student={submission.student} submittedAt={submission.submittedAt} />

                <hr className="border-border" />

                <ScrollArea className="max-h-[500px]">
                    <div className="space-y-6">
                        {/* Writing content */}
                        {skill === IeltsSkill.WRITING && submission.content && (
                            <WritingSubmission content={submission.content} />
                        )}

                        {/* Speaking content */}
                        {skill === IeltsSkill.SPEAKING && (
                            <SpeakingSubmission audioUrls={submission.audioUrls} audioUrl={submission.audioUrl} />
                        )}

                        {/* File attachment (any skill) */}
                        {submission.fileUrl && <FileSubmission fileUrl={submission.fileUrl} />}

                        {/* Reading/Listening - typically just show content or file */}
                        {(skill === IeltsSkill.READING || skill === IeltsSkill.LISTENING) &&
                            submission.content && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">Response</span>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                                    {submission.content}
                                </div>
                            </div>
                        )}

                        {/* AI Grading Info (if available) */}
                        {submission.aiScore !== null && submission.aiScore !== undefined && (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-blue-600 border-blue-500">
                                        AI Graded
                                    </Badge>
                                    <span className="text-sm font-medium">Band Score: {submission.aiScore}</span>
                                </div>
                                {submission.aiFeedback && (
                                    <p className="text-sm text-muted-foreground">{submission.aiFeedback}</p>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
