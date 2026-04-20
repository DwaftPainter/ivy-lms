"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Edit,
    Users,
    FileText,
    Video,
    CheckCircle,
    XCircle
} from "lucide-react";
import { toast } from "sonner";
import { Course } from "@/store/course.store";
import {
    useAdminClassSessionStore,
    ClassSession,
    CreateClassSessionInput
} from "@/store/admin-class-session.store";
import { IeltsSkill } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

interface ClassSessionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course | null;
}

const sessionTypes = [
    { value: "LIVE", label: "Live Session" },
    { value: "RECORDED", label: "Recorded" },
    { value: "WORKSHOP", label: "Workshop" }
];

const skills = [
    { value: IeltsSkill.LISTENING, label: "Listening" },
    { value: IeltsSkill.READING, label: "Reading" },
    { value: IeltsSkill.WRITING, label: "Writing" },
    { value: IeltsSkill.SPEAKING, label: "Speaking" }
];

export function ClassSessionsDialog({
    open,
    onOpenChange,
    course
}: ClassSessionsDialogProps) {
    const {
        sessions,
        isLoading,
        fetchSessionsByCourse,
        createSession,
        updateSession,
        deleteSession
    } = useAdminClassSessionStore();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<ClassSession | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateClassSessionInput>({
        courseId: course?.id || "",
        title: "",
        description: "",
        skill: IeltsSkill.LISTENING,
        sessionType: "LIVE",
        scheduledDate: "",
        startTime: "",
        endTime: "",
        durationMins: 60,
        meetingUrl: "",
        isPublished: false
    });

    useEffect(() => {
        if (open && course) {
            fetchSessionsByCourse(course.id);
            setFormData((prev) => ({ ...prev, courseId: course.id }));
        }
    }, [open, course, fetchSessionsByCourse]);

    const resetForm = () => {
        setFormData({
            courseId: course?.id || "",
            title: "",
            description: "",
            skill: IeltsSkill.LISTENING,
            sessionType: "LIVE",
            scheduledDate: "",
            startTime: "",
            endTime: "",
            durationMins: 60,
            meetingUrl: "",
            isPublished: false
        });
        setEditingSession(null);
        setShowCreateForm(false);
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.scheduledDate || !formData.startTime || !formData.endTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await createSession(formData);
            toast.success("Class session created successfully");
            resetForm();
        } catch (error) {
            toast.error("Failed to create class session");
        }
    };

    const handleUpdate = async () => {
        if (!editingSession) return;

        try {
            await updateSession(editingSession.id, formData);
            toast.success("Class session updated successfully");
            resetForm();
        } catch (error) {
            toast.error("Failed to update class session");
        }
    };

    const handleDelete = async () => {
        if (!deletingSession) return;

        try {
            await deleteSession(deletingSession.id);
            toast.success("Class session deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingSession(null);
        } catch (error) {
            toast.error("Failed to delete class session");
        }
    };

    const openEditForm = (session: ClassSession) => {
        setEditingSession(session);
        setFormData({
            courseId: session.courseId,
            title: session.title,
            description: session.description || "",
            skill: session.skill,
            sessionType: session.sessionType,
            scheduledDate: session.scheduledDate.split("T")[0],
            startTime: session.startTime,
            endTime: session.endTime,
            durationMins: session.durationMins,
            meetingUrl: session.meetingUrl || "",
            isPublished: session.isPublished
        });
        setShowCreateForm(true);
    };

    const openDeleteConfirm = (session: ClassSession) => {
        setDeletingSession(session);
        setDeleteDialogOpen(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl">
                            Manage Lessons - {course?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Create and manage class sessions for this course
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-4">
                        {/* Create/Edit Form */}
                        {showCreateForm ? (
                            <Card className="p-4 mb-4">
                                <h3 className="font-semibold mb-4">
                                    {editingSession ? "Edit Class Session" : "Create New Class Session"}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="Enter session title"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            placeholder="Enter session description"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="skill">Skill</Label>
                                        <Select
                                            value={formData.skill}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, skill: value as IeltsSkill })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {skills.map((skill) => (
                                                    <SelectItem key={skill.value} value={skill.value}>
                                                        {skill.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="sessionType">Session Type</Label>
                                        <Select
                                            value={formData.sessionType}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, sessionType: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessionTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="scheduledDate">Date *</Label>
                                        <Input
                                            id="scheduledDate"
                                            type="date"
                                            value={formData.scheduledDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, scheduledDate: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="durationMins">Duration (minutes)</Label>
                                        <Input
                                            id="durationMins"
                                            type="number"
                                            value={formData.durationMins}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    durationMins: parseInt(e.target.value) || 60
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="startTime">Start Time *</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startTime: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endTime">End Time *</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) =>
                                                setFormData({ ...formData, endTime: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="meetingUrl">Meeting URL</Label>
                                        <Input
                                            id="meetingUrl"
                                            value={formData.meetingUrl}
                                            onChange={(e) =>
                                                setFormData({ ...formData, meetingUrl: e.target.value })
                                            }
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="col-span-2 flex items-center gap-2">
                                        <Switch
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onCheckedChange={(checked) =>
                                                setFormData({ ...formData, isPublished: checked })
                                            }
                                        />
                                        <Label htmlFor="isPublished" className="mb-0">
                                            Publish immediately
                                        </Label>
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-2">
                                        <Button variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={editingSession ? handleUpdate : handleCreate}
                                            disabled={isLoading}
                                        >
                                            {editingSession ? "Update Session" : "Create Session"}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="mb-4"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Class Session
                            </Button>
                        )}

                        {/* Sessions List */}
                        <ScrollArea className="h-[400px] pr-4">
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading sessions...
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No class sessions yet. Create one to get started.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session) => (
                                        <Card
                                            key={session.id}
                                            className={cn(
                                                "p-4 border-l-4",
                                                session.isPublished
                                                    ? "border-l-green-500"
                                                    : "border-l-yellow-500"
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{session.title}</h4>
                                                        <span
                                                            className={cn(
                                                                "px-2 py-0.5 rounded-full text-xs",
                                                                session.isPublished
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                            )}
                                                        >
                                                            {session.isPublished ? "Published" : "Draft"}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {session.description || "No description"}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(session.scheduledDate)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {session.startTime} - {session.endTime}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            {session.enrolledStudents || 0} students
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            {session.assignmentsCount || 0} assignments
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Video className="w-4 h-4" />
                                                            {session.materialsCount || 0} materials
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditForm(session)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => openDeleteConfirm(session)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Class Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the class session &quot;{deletingSession?.title}&quot;.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
