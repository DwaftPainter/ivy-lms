"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
    AvailableAssignment,
    ClassSessionDetail
} from "@/store/teacher-lesson-detail.store";
import { BookOpen, Edit3, Link2, Plus, Unlink } from "lucide-react";
import { ASSIGNMENT_TYPE_LABELS, formatAssignmentDueDate } from "./lesson-display";

interface LessonAssignmentsPanelProps {
    sessionId: string;
    session: ClassSessionDetail;
    availableAssignments: AvailableAssignment[];
    isLinking: boolean;
    onLinkAssignment: (assignmentId: string) => void;
    onUnlinkAssignment: (assignmentId: string) => void;
}

export function LessonAssignmentsPanel({
    sessionId,
    session,
    availableAssignments,
    isLinking,
    onLinkAssignment,
    onUnlinkAssignment
}: LessonAssignmentsPanelProps) {
    const router = useRouter();

    return (
        <>
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
                            onClick={() =>
                                router.push(
                                    `/teacher/assignments/builder?classSessionId=${sessionId}&skill=${session.skill}&returnTo=/teacher/lessons/${sessionId}`
                                )
                            }
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Assignment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!session.assignments.length ? (
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
                                                {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                                            </Badge>
                                            {assignment.dueDate && (
                                                <span className="text-xs text-muted-foreground">
                                                    Due {formatAssignmentDueDate(assignment.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.push(
                                                    `/teacher/assignments/builder?assignmentId=${assignment.id}&classSessionId=${sessionId}&skill=${session.skill}&returnTo=/teacher/lessons/${sessionId}`
                                                )
                                            }
                                        >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onUnlinkAssignment(assignment.id)}
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
                                                {ASSIGNMENT_TYPE_LABELS[assignment.type]}
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
                                        onClick={() => onLinkAssignment(assignment.id)}
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
        </>
    );
}
