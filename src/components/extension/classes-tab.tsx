"use client";

import { Card } from "@/components/ui/card";
import { ClassItem } from "@/store/class.store";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@/generated/prisma/enums";

interface ClassesTabProps {
    classes: ClassItem[];
}

const ATTENDANCE_CONFIG: Record<AttendanceStatus, { label: string; dotClass: string; badgeClass: string }> = {
    ATTENDED: {
        label: "Attended",
        dotClass: "bg-emerald-500",
        badgeClass:
            "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
    },
    ABSENT: {
        label: "Absent",
        dotClass: "bg-rose-500",
        badgeClass:
            "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
    },
    EXCUSED: {
        label: "Excused",
        dotClass: "bg-amber-500",
        badgeClass:
            "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20"
    },
    SCHEDULED: {
        label: "Upcoming",
        dotClass: "bg-slate-400",
        badgeClass:
            "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20"
    }
};

const ASSIGNMENT_CONFIG = {
    completed: {
        className:
            "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
    },
    pending: {
        className: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400"
    }
};

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
    const config = ATTENDANCE_CONFIG[status] ?? ATTENDANCE_CONFIG.SCHEDULED;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                config.badgeClass
            )}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    config.dotClass,
                    // Pulse animation for pending status
                    status === AttendanceStatus.SCHEDULED && "animate-pulse"
                )}
                aria-hidden="true"
            />
            Attendance: {config.label}
        </span>
    );
}

function AssignmentBadge({ label }: { label?: string | null }) {
    if (!label) return null;

    const isCompleted = label.includes("completed");

    const config = isCompleted ? ASSIGNMENT_CONFIG.completed : ASSIGNMENT_CONFIG.pending;

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                config.className
            )}
        >
            Assignment: {label}
        </span>
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
