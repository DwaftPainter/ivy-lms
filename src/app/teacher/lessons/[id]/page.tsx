"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTeacherLessonDetailStore } from "@/store/teacher-lesson-detail.store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonAccessPanel } from "@/components/teacher-lessons/lesson-access-panel";
import { LessonAssignmentsPanel } from "@/components/teacher-lessons/lesson-assignments-panel";
import { LessonDetailsForm } from "@/components/teacher-lessons/lesson-details-form";
import {
    LESSON_SKILL_COLORS,
    LESSON_SKILL_LABELS
} from "@/components/teacher-lessons/lesson-display";
import { LessonStudentPreview } from "@/components/teacher-lessons/lesson-student-preview";
import { getSessionStatusColor, getSessionStatusLabel } from "@/lib/session-status";
import { toast } from "sonner";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Edit3,
    Eye,
    PlayCircle,
    Save,
    Settings,
    Shield
} from "lucide-react";

export default function TeacherLessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const {
        session,
        availableAssignments,
        isLoading,
        isSaving,
        isLinking,
        error,
        saveError,
        viewMode,
        activeTab,
        sessionStatus,
        fetchSession,
        fetchAvailableAssignments,
        setViewMode,
        setActiveTab,
        updateSession,
        updateSessionField,
        linkAssignment,
        unlinkAssignment,
        updatePublishStatus,
        clearSession
    } = useTeacherLessonDetailStore();

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSession(id as string);
            fetchAvailableAssignments(id as string);
        }
        return () => clearSession();
    }, [id, fetchSession, fetchAvailableAssignments, clearSession]);

    useEffect(() => {
        if (saveError) {
            toast.error(saveError);
        }
    }, [saveError]);

    const handleBack = () => {
        router.back();
    };

    const handleSaveSession = async () => {
        if (!session) return;
        try {
            const scheduledDate = session.scheduledDate.includes("T")
                ? session.scheduledDate
                : `${session.scheduledDate}T00:00:00.000Z`;

            await updateSession(session.id, {
                title: session.title,
                skill: session.skill,
                sessionType: session.sessionType,
                scheduledDate,
                startTime: session.startTime,
                endTime: session.endTime,
                durationMins: session.durationMins,
                meetingUrl: session.meetingUrl
            });
            setHasUnsavedChanges(false);
            toast.success("Session updated successfully");
        } catch (err) {
            toast.error("Failed to update session");
            console.error("Save session error:", err);
        }
    };

    const handleLinkAssignment = async (assignmentId: string) => {
        if (!session) return;
        try {
            await linkAssignment(session.id, assignmentId);
            toast.success("Assignment linked successfully");
        } catch {
            toast.error("Failed to link assignment");
        }
    };

    const handleUnlinkAssignment = async (assignmentId: string) => {
        if (!session) return;
        try {
            await unlinkAssignment(session.id, assignmentId);
            toast.success("Assignment unlinked successfully");
        } catch {
            toast.error("Failed to unlink assignment");
        }
    };

    const handlePublishToggle = async () => {
        if (!session) return;
        try {
            await updatePublishStatus(session.id, !session.isPublished);
            toast.success(session.isPublished ? "Session unpublished" : "Session published");
        } catch {
            toast.error("Failed to update publish status");
        }
    };

    const handleFieldChange = <K extends keyof NonNullable<typeof session>>(
        field: K,
        value: NonNullable<typeof session>[K]
    ) => {
        updateSessionField(field, value);
        setHasUnsavedChanges(true);
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 max-w-6xl mx-auto">
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
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 max-w-6xl mx-auto">
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

    if (!session) {
        return (
            <div className="p-4 sm:p-6 max-w-6xl mx-auto">
                <Button variant="ghost" onClick={handleBack} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Alert>
                    <AlertDescription>Session not found.</AlertDescription>
                </Alert>
            </div>
        );
    }

    const statusInfo = sessionStatus
        ? {
              label: getSessionStatusLabel(sessionStatus),
              color: getSessionStatusColor(sessionStatus)
          }
        : { label: "Unknown", color: "bg-gray-100 text-gray-700" };

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack} className="-ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
                        <Button
                            variant={viewMode === "edit" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("edit")}
                            className="gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </Button>
                        <Button
                            variant={viewMode === "preview" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("preview")}
                            className="gap-2"
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </Button>
                    </div>
                    {viewMode === "edit" && (
                        <Button
                            onClick={handleSaveSession}
                            disabled={isSaving || !hasUnsavedChanges}
                            className="gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
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
                    {session.isPublished ? (
                        <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-200"
                        >
                            Published
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                            Draft
                        </Badge>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
                <p className="text-muted-foreground mt-1">{session.course.title}</p>
            </div>

            {viewMode === "edit" ? (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="details" className="gap-2">
                            <Settings className="w-4 h-4" />
                            Session Details
                        </TabsTrigger>
                        <TabsTrigger value="assignments" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger value="access" className="gap-2">
                            <Shield className="w-4 h-4" />
                            Access Control
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                        <LessonDetailsForm session={session} onFieldChange={handleFieldChange} />
                    </TabsContent>

                    <TabsContent value="assignments" className="space-y-6">
                        <LessonAssignmentsPanel
                            sessionId={id as string}
                            session={session}
                            availableAssignments={availableAssignments}
                            isLinking={isLinking}
                            onLinkAssignment={handleLinkAssignment}
                            onUnlinkAssignment={handleUnlinkAssignment}
                        />
                    </TabsContent>

                    <TabsContent value="access" className="space-y-6">
                        <LessonAccessPanel
                            isPublished={session.isPublished}
                            sessionStatus={sessionStatus}
                            isSaving={isSaving}
                            onPublishToggle={handlePublishToggle}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                <LessonStudentPreview
                    session={session}
                    sessionStatus={sessionStatus}
                    statusInfo={statusInfo}
                />
            )}
        </div>
    );
}
