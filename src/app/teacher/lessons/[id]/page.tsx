"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTeacherLessonDetailStore } from "@/store/teacher-lesson-detail.store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
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
    BookOpen,
    Edit3,
    Eye,
    Save,
    Plus,
    Link2,
    Unlink,
    Settings,
    Shield,
    Check
} from "lucide-react";
import { IeltsSkill } from "@/generated/prisma/enums";
import { getSessionStatusLabel, getSessionStatusColor } from "@/lib/session-status";

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

const assignmentTypeLabels: Record<string, string> = {
    WRITING_TASK1: "Writing Task 1",
    WRITING_TASK2: "Writing Task 2",
    SPEAKING: "Speaking",
    LISTENING: "Listening",
    READING: "Reading",
    MOCK_TEST: "Mock Test"
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

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatDueDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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
            await updateSession(session.id, {
                title: session.title,
                description: session.description,
                skill: session.skill,
                sessionType: session.sessionType,
                scheduledDate: session.scheduledDate,
                startTime: session.startTime,
                endTime: session.endTime,
                durationMins: session.durationMins,
                meetingUrl: session.meetingUrl
            });
            setHasUnsavedChanges(false);
            toast.success("Session updated successfully");
        } catch {
            toast.error("Failed to update session");
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack} className="-ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button
                            variant={viewMode === "edit" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("edit")}
                            className="gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            Edit
                        </Button>
                        <Button
                            variant={viewMode === "preview" ? "secondary" : "ghost"}
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

            {/* Page Title */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge variant="outline" className={`${skillColors[session.skill]} font-medium border`}>
                        {skillLabels[session.skill]}
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
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Published
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                            Draft
                        </Badge>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
                <p className="text-muted-foreground mt-1">{session.course.title}</p>
            </div>

            {viewMode === "edit" ? (
                /* Edit Mode with Tabs */
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
                        {/* <TabsTrigger value="materials" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Materials
                        </TabsTrigger> */}
                        <TabsTrigger value="access" className="gap-2">
                            <Shield className="w-4 h-4" />
                            Access Control
                        </TabsTrigger>
                    </TabsList>

                    {/* Session Details Tab */}
                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Session Information</h2>
                                <p className="text-sm text-muted-foreground">
                                    Edit the basic details for this class session
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Lesson Title</Label>
                                    <Input
                                        id="title"
                                        value={session.title}
                                        onChange={(e) => handleFieldChange("title", e.target.value)}
                                        placeholder="Enter lesson title"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={session.description || ""}
                                        onChange={(e) => handleFieldChange("description", e.target.value)}
                                        placeholder="Enter lesson description"
                                        rows={4}
                                    />
                                </div>

                                {/* Skill Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="skill">Skill Type</Label>
                                    <Select
                                        value={session.skill}
                                        onValueChange={(value) =>
                                            handleFieldChange("skill", value as IeltsSkill)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select skill type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(IeltsSkill).map((skill) => (
                                                <SelectItem key={skill} value={skill}>
                                                    {skillLabels[skill]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Session Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="sessionType">Session Type</Label>
                                    <Select
                                        value={session.sessionType}
                                        onValueChange={(value) => handleFieldChange("sessionType", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select session type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LIVE">Live Session</SelectItem>
                                            <SelectItem value="RECORDED">Recorded</SelectItem>
                                            <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Date and Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                                        <Input
                                            id="scheduledDate"
                                            type="date"
                                            value={session.scheduledDate.split("T")[0]}
                                            onChange={(e) =>
                                                handleFieldChange("scheduledDate", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="durationMins">Duration (minutes)</Label>
                                        <Input
                                            id="durationMins"
                                            type="number"
                                            value={session.durationMins}
                                            onChange={(e) =>
                                                handleFieldChange("durationMins", parseInt(e.target.value))
                                            }
                                            min={15}
                                            max={480}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={session.startTime}
                                            onChange={(e) => handleFieldChange("startTime", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime">End Time</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={session.endTime}
                                            onChange={(e) => handleFieldChange("endTime", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Meeting URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="meetingUrl">Meeting URL (optional)</Label>
                                    <Input
                                        id="meetingUrl"
                                        type="url"
                                        value={session.meetingUrl || ""}
                                        onChange={(e) => handleFieldChange("meetingUrl", e.target.value)}
                                        placeholder="https://meet.example.com/..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Linked Assignments</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Manage assignments linked to this session
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/teacher/assignments/builder?classSessionId=${id}&skill=${session.skill}&returnTo=/teacher/lessons/${id}`)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Assignment
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {session.assignments.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                                        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground mb-4">
                                            No assignments linked to this session
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {session.assignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="flex items-center justify-between p-4 rounded-lg border"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium">{assignment.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {assignment.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {assignmentTypeLabels[assignment.type]}
                                                        </Badge>
                                                        {assignment.dueDate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Due {formatDueDate(assignment.dueDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.push(`/teacher/assignments/builder?assignmentId=${assignment.id}&classSessionId=${id}&skill=${session.skill}&returnTo=/teacher/lessons/${id}`)}
                                                    >
                                                        <Edit3 className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUnlinkAssignment(assignment.id)}
                                                        disabled={isLinking}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Unlink className="w-4 h-4 mr-2" />
                                                        Unlink
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Available Assignments */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Available Assignments</h2>
                                <p className="text-sm text-muted-foreground">
                                    Select assignments to link to this session
                                </p>
                            </CardHeader>
                            <CardContent>
                                {availableAssignments.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                                        <p className="text-muted-foreground">
                                            No available assignments to link
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {availableAssignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="flex items-center justify-between p-4 rounded-lg border"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium">{assignment.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {assignment.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {assignmentTypeLabels[assignment.type]}
                                                        </Badge>
                                                        {assignment.isPublished ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-green-100 text-green-700"
                                                            >
                                                                Published
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-amber-100 text-amber-700"
                                                            >
                                                                Draft
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleLinkAssignment(assignment.id)}
                                                    disabled={isLinking}
                                                >
                                                    <Link2 className="w-4 h-4 mr-2" />
                                                    Link
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Materials Tab */}
                    {/* <TabsContent value="materials" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold">Session Materials</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Materials attached to this session
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" disabled>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Material
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {session.materials.length === 0 ? (
                                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                                        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No materials available</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Materials are managed separately
                                        </p>
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
                        </Card>
                    </TabsContent> */}

                    {/* Access Control Tab */}
                    <TabsContent value="access" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">Access Control</h2>
                                <p className="text-sm text-muted-foreground">
                                    Configure when students can access this session
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Eye className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Publish Session</p>
                                            <p className="text-sm text-muted-foreground">
                                                Make this session visible to enrolled students
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={session.isPublished}
                                        onCheckedChange={handlePublishToggle}
                                        disabled={isSaving}
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="font-medium">Session Status</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div
                                            className={`p-4 border rounded-lg ${sessionStatus === "UPCOMING" ? "border-primary bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">Upcoming</span>
                                                {sessionStatus === "UPCOMING" && (
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Session has not started yet
                                            </p>
                                        </div>
                                        <div
                                            className={`p-4 border rounded-lg ${sessionStatus === "ONGOING" ? "border-primary bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <PlayCircle className="w-4 h-4 text-emerald-500" />
                                                <span className="font-medium">Ongoing</span>
                                                {sessionStatus === "ONGOING" && (
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Session is currently in progress
                                            </p>
                                        </div>
                                        <div
                                            className={`p-4 border rounded-lg ${sessionStatus === "COMPLETED" ? "border-primary bg-primary/5" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">Completed</span>
                                                {sessionStatus === "COMPLETED" && (
                                                    <Badge variant="outline" className="ml-auto text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Session has ended</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium mb-2">Access Rules</h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 mt-0.5 text-green-500" />
                                            <span>Teachers can access and edit sessions at any time</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 mt-0.5 text-green-500" />
                                            <span>Students can see upcoming sessions in their schedule</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-4 h-4 mt-0.5 text-green-500" />
                                            <span>
                                                Linked assignments are accessible based on their individual
                                                settings
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                /* Preview Mode - Student View Simulation */
                <div className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <AlertDescription className="text-blue-700">
                            This is how students will see this session. All editing controls are hidden.
                        </AlertDescription>
                    </Alert>

                    {/* Session Info Card */}
                    <Card className="shadow-none border">
                        <CardHeader className="pb-4">
                            <div className="flex flex-wrap items-start gap-3 mb-3">
                                <Badge
                                    variant="outline"
                                    className={`${skillColors[session.skill]} font-medium border`}
                                >
                                    {skillLabels[session.skill]}
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
                                        <p className="font-medium">{formatDate(session.scheduledDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Time</p>
                                        <p className="font-medium">
                                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
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

                    {/* Materials Section */}
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
                    </Card>

                    {/* Assignments Section */}
                    <Card className="shadow-none border">
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Linked Assignments</h2>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {session.assignments.length === 0 ? (
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
                                                        {assignmentTypeLabels[assignment.type]}
                                                    </Badge>
                                                    {assignment.dueDate && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            Due {formatDueDate(assignment.dueDate)}
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
            )}
        </div>
    );
}
