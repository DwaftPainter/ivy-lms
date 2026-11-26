"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURSE_LEVEL_LABELS, formatTeacherDisplay } from "@/lib/admin-courses";
import { getSkillLabel } from "@/lib/ielts-badges";
import type { Course } from "@/store/course.store";
import { Calendar, Edit, Trash2 } from "lucide-react";

interface CourseRowItemProps {
    course: Course;
    onManageSessions: (course: Course, trigger: HTMLElement) => void;
    onEdit: (course: Course, trigger: HTMLElement) => void;
    onDelete: (course: Course, trigger: HTMLElement) => void;
}

export function CourseRowItem({
    course,
    onManageSessions,
    onEdit,
    onDelete
}: CourseRowItemProps) {
    const enrollmentCount = course._count?.enrollments ?? 0;
    const lessonCount = course._count?.lessons ?? 0;
    const teacherInfo = formatTeacherDisplay(course);

    return (
        <li className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground [overflow-wrap:anywhere]">
                        {course.title}
                    </h3>

                    <p
                        title={teacherInfo.title}
                        className="mt-0.5 text-xs text-muted-foreground [overflow-wrap:anywhere]"
                    >
                        {teacherInfo.label}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
                        <Badge variant={course.isPublished ? "secondary" : "outline"}>
                            {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="secondary" className="font-medium">
                            {getSkillLabel(course.skill)}
                        </Badge>
                        <Badge variant="outline">{COURSE_LEVEL_LABELS[course.level]}</Badge>
                        <span className="tabular-nums">
                            {enrollmentCount} {enrollmentCount === 1 ? "student" : "students"}
                        </span>
                        <span aria-hidden="true">/</span>
                        <span className="tabular-nums">
                            {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => onManageSessions(course, e.currentTarget)}
                        aria-label={`Manage sessions: ${course.title}`}
                        className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <Calendar className="size-3.5" aria-hidden="true" />
                        <span>Manage sessions</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => onEdit(course, e.currentTarget)}
                        aria-label={`Edit course: ${course.title}`}
                        className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <Edit className="size-3.5" aria-hidden="true" />
                        <span>Edit course</span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onDelete(course, e.currentTarget)}
                        aria-label={`Delete course: ${course.title}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        <span>Delete</span>
                    </Button>
                </div>
            </div>
        </li>
    );
}
