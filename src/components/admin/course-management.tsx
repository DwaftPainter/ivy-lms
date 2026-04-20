"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    BookOpen,
    Plus,
    Users,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { useCourseStore, Course } from "@/store/course.store";
import { CourseDialog } from "./course-dialog";
import { ClassSessionsDialog } from "./class-sessions-dialog";
import { toast } from "sonner";

export function CourseManagement() {
    const {
        courses,
        isLoading,
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

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const filteredCourses = courses.filter(
        (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.teacher?.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async (data: any) => {
        try {
            await createCourse(data);
            setDialogOpen(false);
            toast.success("Course created successfully");
        } catch (error) {
            toast.error("Failed to create course");
        }
    };

    const handleUpdate = async (data: any) => {
        if (!editingCourse) return;
        try {
            await updateCourse(editingCourse.id, data);
            setDialogOpen(false);
            setEditingCourse(null);
            toast.success("Course updated successfully");
        } catch (error) {
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
        } catch (error) {
            toast.error("Failed to delete course");
        }
    };

    const openEditDialog = (course: Course) => {
        setEditingCourse(course);
        setDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingCourse(null);
        setDialogOpen(true);
    };

    const confirmDelete = (course: Course) => {
        setDeletingCourse(course);
        setDeleteDialogOpen(true);
    };

    const openSessionsDialog = (course: Course) => {
        setSelectedCourse(course);
        setSessionsDialogOpen(true);
    };

    return (
        <>
            <Card className="p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        Course Management
                    </h2>
                    <Button
                        size="sm"
                        className="bg-primary text-white"
                        onClick={openCreateDialog}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                    </Button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading courses...
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No courses found
                        </div>
                    ) : (
                        filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-foreground">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Instructor:{" "}
                                                {course.teacher?.firstName && course.teacher?.lastName
                                                    ? `${course.teacher.firstName} ${course.teacher.lastName}`
                                                    : course.teacher?.id
                                                      ? `ID: ${course.teacher.id.slice(0, 8)}...`
                                                      : "Unknown"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                course.isPublished
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {course.isPublished
                                                ? "Published"
                                                : "Draft"}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openEditDialog(course)
                                                    }
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        openSessionsDialog(course)
                                                    }
                                                >
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Manage Lessons
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        confirmDelete(course)
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {course._count?.enrollments || 0}{" "}
                                        students
                                    </span>
                                    <span>
                                        {course._count?.lessons || 0} lessons
                                    </span>
                                    <span className="capitalize">
                                        {course.level.toLowerCase()}
                                    </span>
                                    <span className="capitalize">
                                        {course.skill.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                        View All Courses
                    </Button>
                </div>
            </Card>

            <CourseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                course={editingCourse}
                onSubmit={editingCourse ? handleUpdate : handleCreate}
                isLoading={isLoading}
            />

            <ClassSessionsDialog
                open={sessionsDialogOpen}
                onOpenChange={setSessionsDialogOpen}
                course={selectedCourse}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the course "
                            {deletingCourse?.title}". This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setDeleteDialogOpen(false)}
                        >
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
