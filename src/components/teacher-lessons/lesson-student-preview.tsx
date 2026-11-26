"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SessionStatus } from "@/lib/session-status";
import type { ClassSessionDetail } from "@/store/teacher-lesson-detail.store";
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    File,
    PlayCircle
} from "lucide-react";
import {
    ASSIGNMENT_TYPE_LABELS,
    LESSON_SKILL_COLORS,
    LESSON_SKILL_LABELS,
    formatAssignmentDueDate,
    formatLessonDate,
    formatLessonTime,
    getMaterialFileIcon
} from "./lesson-display";

interface LessonStudentPreviewProps {
    session: ClassSessionDetail;
    sessionStatus: SessionStatus | null;
    statusInfo: { label: string; color: string };
}

export function LessonStudentPreview({
    session,
    sessionStatus,
    statusInfo
}: LessonStudentPreviewProps) {
    return (
        <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
                <Eye className="w-4 h-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                    This is how students will see this session. All editing controls are hidden.
                </AlertDescription>
            </Alert>

            <Card className="shadow-none border">
                <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                        <Badge
                            variant="outline"
                            className={`${LESSON_SKILL_COLORS[session.skill]} font-medium border`}
                        >
                            {LESSON_SKILL_LABELS[session.skill]}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`${statusInfo.color} font-medium border flex items-center gap-1`}
                        >
                            {sessionStatus === "ONGOING" ? (
                                <PlayCircle className="w-4 h-4" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            {statusInfo.label}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
                    {session.description && (
                        <p className="text-muted-foreground mt-2">{session.description}</p>
                    )}
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">
                                    {formatLessonDate(session.scheduledDate)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">
                                    {formatLessonTime(session.startTime)} -{" "}
                                    {formatLessonTime(session.endTime)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{session.durationMins} minutes</p>
                            </div>
                        </div>
                    </div>

                    {sessionStatus === "ONGOING" && session.meetingUrl && (
                        <div className="mt-4">
                            <Button
                                className="w-full sm:w-auto"
                                onClick={() => window.open(session.meetingUrl!, "_blank")}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join Session
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-none border">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Session Materials</h2>
                </CardHeader>
                <CardContent className="pt-0">
                    {session.materials.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                            <File className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No materials available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {session.materials.map((material) => (
                                <a
                                    key={material.id}
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                        {getMaterialFileIcon(material.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{material.name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {material.fileType.toLowerCase()}
                                        </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-none border">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Linked Assignments</h2>
                </CardHeader>
                <CardContent className="pt-0">
                    {!session.assignments.length ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                No assignments linked to this lesson
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {session.assignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{assignment.title}</h3>
                                        {assignment.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                {assignment.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                                            </Badge>
                                            {assignment.dueDate && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Due {formatAssignmentDueDate(assignment.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" disabled>
                                        View Assignment
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
