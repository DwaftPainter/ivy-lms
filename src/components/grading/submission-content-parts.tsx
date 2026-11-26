"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { extractSpeakingRecordings } from "@/lib/grading-submission";
import type { Student } from "@/store/teacher-grading.store";
import { FileText, Headphones, Paperclip } from "lucide-react";

function formatSubmissionDate(dateString: string | null | undefined): string {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function SubmissionStudentInfo({
    student,
    submittedAt
}: {
    student: Student;
    submittedAt?: string | null;
}) {
    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage
                    src={student.avatarUrl || undefined}
                    alt={`${student.firstName} ${student.lastName}`}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium">
                    {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
                {submittedAt && (
                    <p className="text-xs text-muted-foreground">
                        Submitted: {formatSubmissionDate(submittedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}

export function WritingSubmissionContent({ content }: { content: string }) {
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

export function SpeakingSubmissionContent({
    audioUrls,
    audioUrl
}: {
    audioUrls?: unknown;
    audioUrl?: string | null;
}) {
    const recordings = extractSpeakingRecordings(audioUrls, audioUrl);

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

export function SubmissionFileAttachment({ fileUrl }: { fileUrl?: string | null }) {
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

export function SubmissionAiGradingSummary({
    aiScore,
    aiFeedback
}: {
    aiScore: number;
    aiFeedback?: string | null;
}) {
    return (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-500">
                    AI Graded
                </Badge>
                <span className="text-sm font-medium">Band Score: {aiScore}</span>
            </div>
            {aiFeedback && <p className="text-sm text-muted-foreground">{aiFeedback}</p>}
        </div>
    );
}
