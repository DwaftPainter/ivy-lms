"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IeltsSkill } from "@/generated/prisma/enums";
import {
    useAdminClassSessionStore,
    type ClassSession,
    type CreateClassSessionInput
} from "@/store/admin-class-session.store";
import type { Course } from "@/store/course.store";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SessionFormCard } from "./session-form-card";
import { SessionListItem } from "./session-list-item";

interface ClassSessionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course: Course | null;
    onCloseAutoFocus?: (event: Event) => void;
}

function buildEmptySessionForm(courseId: string): CreateClassSessionInput {
    return {
        courseId,
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
    };
}

export function ClassSessionsDialog({
    open,
    onOpenChange,
    course,
    onCloseAutoFocus
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
    const [formData, setFormData] = useState<CreateClassSessionInput>(() =>
        buildEmptySessionForm(course?.id || "")
    );

    useEffect(() => {
        if (open && course) {
            fetchSessionsByCourse(course.id);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData((prev) => ({ ...prev, courseId: course.id }));
        }
    }, [open, course, fetchSessionsByCourse]);

    const resetForm = () => {
        setFormData(buildEmptySessionForm(course?.id || ""));
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
        } catch {
            toast.error("Failed to create class session");
        }
    };

    const handleUpdate = async () => {
        if (!editingSession) return;
        try {
            await updateSession(editingSession.id, formData);
            toast.success("Class session updated successfully");
            resetForm();
        } catch {
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
        } catch {
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="max-w-4xl max-h-[90vh] p-0"
                    onCloseAutoFocus={onCloseAutoFocus}
                >
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl">
                            Manage Lessons - {course?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Create and manage class sessions for this course
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-4">
                        {showCreateForm ? (
                            <SessionFormCard
                                isEditing={Boolean(editingSession)}
                                isLoading={isLoading}
                                formData={formData}
                                onChange={setFormData}
                                onCancel={resetForm}
                                onSubmit={editingSession ? handleUpdate : handleCreate}
                            />
                        ) : (
                            <Button onClick={() => setShowCreateForm(true)} className="mb-4">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Class Session
                            </Button>
                        )}

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
                                        <SessionListItem
                                            key={session.id}
                                            session={session}
                                            onEdit={openEditForm}
                                            onDelete={openDeleteConfirm}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Class Session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the class session &quot;
                            {deletingSession?.title}&quot;. This action cannot be undone.
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
