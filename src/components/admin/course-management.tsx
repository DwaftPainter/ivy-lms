"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    useCourseStore,
    type Course,
    type CreateCourseInput,
    type UpdateCourseInput
} from "@/store/course.store";
import { CourseLevel } from "@/generated/prisma/enums";
import { getSkillLabel } from "@/lib/ielts-badges";
import { CourseDialog } from "./course-dialog";
import { ClassSessionsDialog } from "./class-sessions-dialog";
import { toast } from "sonner";
import {
    AlertCircle,
    BookOpen,
    Calendar,
    Edit,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    X
} from "lucide-react";

const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: "Beginner",
    [CourseLevel.INTERMEDIATE]: "Intermediate",
    [CourseLevel.ADVANCED]: "Advanced"
};

function formatTeacherDisplay(course: Course): { label: string; title?: string } {
    if (course.teacher?.firstName && course.teacher?.lastName) {
        return { label: `${course.teacher.firstName} ${course.teacher.lastName}` };
    }
    const id = course.teacher?.id || course.teacherId;
    if (!id) return { label: "Unassigned" };
    return id.length > 20
        ? { label: `Instructor ${id.slice(0, 8)}…`, title: id }
        : { label: `Instructor ${id}`, title: id };
}

export function CourseManagement() {
    const {
        courses,
        pagination,
        isLoading,
        error,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse
    } = useCourseStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const createCourseBtnRef = useRef<HTMLButtonElement>(null);
    const dialogReturnFocusRef = useRef<HTMLElement | null>(null);

    const handleDialogCloseAutoFocus = useCallback((event: Event) => {
        const target = dialogReturnFocusRef.current;
        dialogReturnFocusRef.current = null;
        event.preventDefault();
        requestAnimationFrame(() => {
            if (target?.isConnected) {
                target.focus();
            } else {
                createCourseBtnRef.current?.focus();
            }
        });
    }, []);

    const loadCourses = useCallback(() => {
        return fetchCourses({ limit: 50 });
    }, [fetchCourses]);

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredCourses = useMemo(() => {
        if (!normalizedQuery) return courses;
        return courses.filter((course) => {
            const titleMatch = course.title.toLowerCase().includes(normalizedQuery);
            const teacherMatch = (course.teacher?.id || course.teacherId || "")
                .toLowerCase()
                .includes(normalizedQuery);
            const skillMatch = getSkillLabel(course.skill).toLowerCase().includes(normalizedQuery);
            const levelMatch = COURSE_LEVEL_LABELS[course.level]
                .toLowerCase()
                .includes(normalizedQuery);
            return titleMatch || teacherMatch || skillMatch || levelMatch;
        });
    }, [courses, normalizedQuery]);

    const handleCreate = async (data: CreateCourseInput) => {
        try {
            await createCourse(data);
            setDialogOpen(false);
            toast.success("Course created successfully");
        } catch {
            toast.error("Failed to create course");
        }
    };

    const handleUpdate = async (data: UpdateCourseInput) => {
        if (!editingCourse) return;
        try {
            await updateCourse(editingCourse.id, data);
            setDialogOpen(false);
            setEditingCourse(null);
            toast.success("Course updated successfully");
        } catch {
            toast.error("Failed to update course");
        }
    };

    const handleDelete = async () => {
        if (!deletingCourse) return;
        try {
            await deleteCourse(deletingCourse.id);
            setDeleteDialogOpen(false);
            setDeletingCourse(null);
            toast.success("Course deleted successfully");
        } catch {
            toast.error("Failed to delete course");
        }
    };

    const openEditDialog = (course: Course, trigger?: HTMLElement | null) => {
        dialogReturnFocusRef.current = trigger ?? null;
        setEditingCourse(course);
        setDialogOpen(true);
    };

    const openCreateDialog = (trigger?: HTMLElement | null) => {
        dialogReturnFocusRef.current = trigger ?? createCourseBtnRef.current;
        setEditingCourse(null);
        setDialogOpen(true);
    };

    const confirmDelete = (course: Course, trigger?: HTMLElement | null) => {
        dialogReturnFocusRef.current = trigger ?? null;
        setDeletingCourse(course);
        setDeleteDialogOpen(true);
    };

    const openSessionsDialog = (course: Course, trigger?: HTMLElement | null) => {
        dialogReturnFocusRef.current = trigger ?? null;
        setSelectedCourse(course);
        setSessionsDialogOpen(true);
    };

    const totalCount = pagination.total || courses.length;

    return (
        <section aria-labelledby="admin-courses-heading" className="min-w-0">
            <Card className="gap-0 py-0 shadow-none">
                {/* Header & search */}
                <div className="space-y-4 border-b px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
                            <h2
                                id="admin-courses-heading"
                                className="text-base font-semibold text-foreground"
                            >
                                Courses
                            </h2>
                            {!isLoading && !error && (
                                <span className="text-sm text-muted-foreground tabular-nums">
                                    ({totalCount})
                                </span>
                            )}
                        </div>
                        <Button
                            ref={createCourseBtnRef}
                            type="button"
                            size="sm"
                            onClick={(e) => openCreateDialog(e.currentTarget)}
                            className="shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            <span>Create course</span>
                        </Button>
                    </div>

                    {(!isLoading || courses.length > 0) && !error && courses.length > 0 && (
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                type="search"
                                placeholder="Search by course, skill, level, or instructor ID..."
                                aria-label="Search courses"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={searchQuery ? "pl-9 pr-9" : "pl-9"}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear course search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                                >
                                    <X className="size-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Body states */}
                {isLoading && courses.length === 0 ? (
                    <div className="divide-y" aria-busy="true">
                        <p role="status" className="sr-only">
                            Loading courses
                        </p>
                        {[1, 2, 3].map((row) => (
                            <div key={row} className="space-y-2.5 px-4 py-4 sm:px-6">
                                <Skeleton className="h-5 w-60 max-w-full motion-reduce:animate-none" />
                                <Skeleton className="h-4 w-44 max-w-full motion-reduce:animate-none" />
                            </div>
                        ))}
                    </div>
                ) : error && courses.length === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <div role="alert" className="flex items-start gap-3">
                            <AlertCircle
                                className="mt-0.5 size-5 shrink-0 text-destructive"
                                aria-hidden="true"
                            />
                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Could not load courses
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={loadCourses}
                                >
                                    <RotateCcw className="size-4" aria-hidden="true" />
                                    Retry courses
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                ) : courses.length === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    No courses yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first course to organize class sessions and
                                    enrollments.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => openCreateDialog(e.currentTarget)}
                            >
                                <Plus className="size-4" aria-hidden="true" />
                                Create course
                            </Button>
                        </div>
                    </CardContent>
                ) : filteredCourses.length === 0 ? (
                    <CardContent className="px-4 py-6 sm:px-6">
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    No matching courses
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    No courses match &ldquo;{searchQuery.trim()}&rdquo;.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                            >
                                <RotateCcw className="size-4" aria-hidden="true" />
                                Reset search
                            </Button>
                        </div>
                    </CardContent>
                ) : (
                    <ul className="divide-y">
                        {filteredCourses.map((course) => {
                            const enrollmentCount = course._count?.enrollments ?? 0;
                            const lessonCount = course._count?.lessons ?? 0;
                            const teacherInfo = formatTeacherDisplay(course);

                            return (
                                <li
                                    key={course.id}
                                    className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                                >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                                        {/* Record summary */}
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
                                                <Badge
                                                    variant={
                                                        course.isPublished ? "secondary" : "outline"
                                                    }
                                                >
                                                    {course.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                                <Badge variant="secondary" className="font-medium">
                                                    {getSkillLabel(course.skill)}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {COURSE_LEVEL_LABELS[course.level]}
                                                </Badge>
                                                <span className="tabular-nums">
                                                    {enrollmentCount}{" "}
                                                    {enrollmentCount === 1 ? "student" : "students"}
                                                </span>
                                                <span aria-hidden="true">/</span>
                                                <span className="tabular-nums">
                                                    {lessonCount}{" "}
                                                    {lessonCount === 1 ? "lesson" : "lessons"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Direct record actions */}
                                        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) =>
                                                    openSessionsDialog(course, e.currentTarget)
                                                }
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
                                                onClick={(e) =>
                                                    openEditDialog(course, e.currentTarget)
                                                }
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
                                                onClick={(e) =>
                                                    confirmDelete(course, e.currentTarget)
                                                }
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
                        })}
                    </ul>
                )}
            </Card>

            <CourseDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingCourse(null);
                }}
                course={editingCourse}
                onSubmit={editingCourse ? handleUpdate : handleCreate}
                onCloseAutoFocus={handleDialogCloseAutoFocus}
                isLoading={isLoading}
            />

            <ClassSessionsDialog
                open={sessionsDialogOpen}
                onOpenChange={setSessionsDialogOpen}
                course={selectedCourse}
                onCloseAutoFocus={handleDialogCloseAutoFocus}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent onCloseAutoFocus={handleDialogCloseAutoFocus}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete course?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course &ldquo;{deletingCourse?.title}
                            &rdquo;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
