"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ClassSession } from "@/store/admin-class-session.store";
import { Calendar, Clock, Edit, FileText, Trash2, Users, Video } from "lucide-react";

function formatSessionDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

interface SessionListItemProps {
    session: ClassSession;
    onEdit: (session: ClassSession) => void;
    onDelete: (session: ClassSession) => void;
}

export function SessionListItem({ session, onEdit, onDelete }: SessionListItemProps) {
    return (
        <Card
            className={cn(
                "p-4 border-l-4",
                session.isPublished ? "border-l-green-500" : "border-l-yellow-500"
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
                            {formatSessionDate(session.scheduledDate)}
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
                        aria-label={`Edit ${session.title}`}
                        onClick={() => onEdit(session)}
                    >
                        <Edit className="w-4 h-4" aria-hidden="true" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${session.title}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(session)}
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
