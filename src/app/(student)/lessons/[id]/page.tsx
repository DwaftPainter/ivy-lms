"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLessonDetailStore } from "@/store/lesson-detail.store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    Video,
    Link as LinkIcon,
    Headphones,
    CheckCircle2,
    AlertCircle,
    PlayCircle,
    File,
    ExternalLink,
    BookOpen
} from "lucide-react";
import { IeltsSkill } from "@/generated/prisma/enums";

const skillLabels: Record<IeltsSkill, string> = {
    [IeltsSkill.LISTENING]: "Listening",
    [IeltsSkill.READING]: "Reading",
    [IeltsSkill.WRITING]: "Writing",
    [IeltsSkill.SPEAKING]: "Speaking"
};

const skillColors: Record<IeltsSkill, string> = {
    [IeltsSkill.LISTENING]: "bg-blue-100 text-blue-700 border-blue-200",
    [IeltsSkill.READING]: "bg-green-100 text-green-700 border-green-200",
    [IeltsSkill.WRITING]: "bg-amber-100 text-amber-700 border-amber-200",
    [IeltsSkill.SPEAKING]: "bg-purple-100 text-purple-700 border-purple-200"
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    UPCOMING: {
        label: "Upcoming",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <Calendar className="w-4 h-4" />
    },
    ONGOING: {
        label: "Ongoing",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: <PlayCircle className="w-4 h-4" />
    },
    COMPLETED: {
        label: "Completed",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <CheckCircle2 className="w-4 h-4" />
    }
};

const assignmentStatusConfig: Record<string, { label: string; color: string }> = {
    NOT_STARTED: { label: "Not Started", color: "bg-slate-100 text-slate-700" },
    PENDING: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
    SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
    GRADED: { label: "Graded", color: "bg-green-100 text-green-700" },
    RETURNED: { label: "Returned", color: "bg-purple-100 text-purple-700" }
};

const getFileIcon = (fileType: string) => {
    const type = fileType.toUpperCase();
    switch (type) {
        case "VIDEO":
            return <Video className="w-5 h-5 text-blue-500" />;
        case "AUDIO":
            return <Headphones className="w-5 h-5 text-purple-500" />;
        case "LINK":
            return <LinkIcon className="w-5 h-5 text-green-500" />;
        case "PDF":
        default:
            return <FileText className="w-5 h-5 text-red-500" />;
    }
};

const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

const formatDueDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const {
        lesson,
        isLoading,
        error,
        fetchLesson
    } = useLessonDetailStore();

    useEffect(() => {
        if (id) {
            fetchLesson(id as string);
        }
    }, [id, fetchLesson]);

    const handleBack = () => {
        router.back();
    };

    const handleViewAssignment = (assignmentId: string) => {
        router.push(`/assignments/${assignmentId}`);
    };

    const handleJoinMeeting = () => {
        if (lesson?.meetingUrl) {
            window.open(lesson.meetingUrl, "_blank");
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <div className="mb-6">
                    <Skeleton className="h-6 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-20" />
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Alert>
                    <AlertDescription>Lesson not found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const statusInfo = statusConfig[lesson.status] || statusConfig.UPCOMING;

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" onClick={handleBack} className="mb-4 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Header Section */}
            <Card className="mb-6 shadow-none border">
                <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-start gap-3 mb-3">
                        <Badge
                            variant="outline"
                            className={`${skillColors[lesson.skill]} font-medium border`}
                        >
                            {skillLabels[lesson.skill]}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`${statusInfo.color} font-medium border flex items-center gap-1`}
                        >
                            {statusInfo.icon}
                            {statusInfo.label}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
                    {lesson.course && (
                        <p className="text-muted-foreground mt-1">
                            {lesson.course.title}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="pt-0">
                    {/* Session Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">{lesson.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Time</p>
                                <p className="font-medium">{lesson.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                <BookOpen className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{lesson.duration} minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Join Button for Ongoing Sessions */}
                    {lesson.status === "ONGOING" && lesson.meetingUrl && (
                        <div className="mt-4">
                            <Button onClick={handleJoinMeeting} className="w-full sm:w-auto">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Join Session
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card className="mb-6 shadow-none border">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Instructor</h2>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                            <AvatarImage
                                src={lesson.teacher.avatarUrl || undefined}
                                alt={`${lesson.teacher.firstName} ${lesson.teacher.lastName}`}
                            />
                            <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                {lesson.teacher.firstName[0]}
                                {lesson.teacher.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">
                                {lesson.teacher.firstName} {lesson.teacher.lastName}
                            </p>
                            <p className="text-muted-foreground text-sm">Course Instructor</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Materials Section */}
            {/* <Card className="mb-6 shadow-none border">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Session Materials</h2>
                </CardHeader>
                <CardContent className="pt-0">
                    {lesson.materials.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                            <File className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No materials available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lesson.materials.map((material) => (
                                <a
                                    key={material.id}
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                        {getFileIcon(material.fileType)}
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
            </Card> */}

            {/* Assignments Section */}
            <Card className="mb-6 shadow-none border">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Linked Assignments</h2>
                </CardHeader>
                <CardContent className="pt-0">
                    {lesson.assignments.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No assignments linked to this lesson</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lesson.assignments.map((assignment) => {
                                const status = assignmentStatusConfig[assignment.status] || assignmentStatusConfig.NOT_STARTED;
                                return (
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
                                                    {assignment.type.replace("_", " ")}
                                                </Badge>
                                                {assignment.dueDate && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Due {formatDueDate(assignment.dueDate)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${status.color} border-0`}>
                                                {status.label}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewAssignment(assignment.id)}
                                            >
                                                View Assignment
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
