"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassItem } from "@/store/class.store";
import { AttendanceStatus } from "@/generated/prisma/enums";
import type { BadgeVariant } from "@/lib/ielts-badges";

interface ClassesTabProps {
    classes: ClassItem[];
}

const ATTENDANCE_CONFIG: Record<AttendanceStatus, { label: string; variant: BadgeVariant }> = {
    ATTENDED: {
        label: "Attended",
        variant: "secondary"
    },
    ABSENT: {
        label: "Absent",
        variant: "destructive"
    },
    EXCUSED: {
        label: "Excused",
        variant: "secondary"
    },
    SCHEDULED: {
        label: "Upcoming",
        variant: "outline"
    }
};

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
    const config = ATTENDANCE_CONFIG[status] ?? ATTENDANCE_CONFIG.SCHEDULED;

    return (
        <Badge variant={config.variant}>
            Attendance: {config.label}
        </Badge>
    );
}

function AssignmentBadge({ label }: { label?: string | null }) {
    if (!label) return null;

    const isCompleted = label.includes("completed");

    return (
        <Badge variant={isCompleted ? "secondary" : "outline"}>
            Assignment: {label}
        </Badge>
    );
}

export function ClassesTab({ classes }: ClassesTabProps) {
    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">All Classes</h2>

            {classes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No classes available</div>
            ) : (
                <div className="space-y-4">
                    {classes.map((cls) => (
                        <div key={cls.id} className="p-4 bg-secondary rounded-lg border border-border/50">
                            {/* Header row: title + attendance badge */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{cls.title}</h3>
                                    <p className="text-sm text-muted-foreground">{cls.course}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <AttendanceBadge status={cls.attendanceStatus as AttendanceStatus} />
                                    <AssignmentBadge label={cls.assignmentStatus} />
                                </div>
                            </div>

                            {/* Meta row */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span>
                                    {cls.date} ({cls.day})
                                </span>
                                <span>{cls.time}</span>
                                <span>{cls.instructor}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
