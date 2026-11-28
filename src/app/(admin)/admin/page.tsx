"use client";

import { UserManagement } from "@/components/admin/user-management";
import { CourseManagement } from "@/components/admin/course-management";
import { useCourseStore } from "@/store/course.store";
import { useTeacherStore } from "@/store/teacher.store";

export default function AdminPage() {
    const teachers = useTeacherStore((state) => state.teachers);
    const teachersLoading = useTeacherStore((state) => state.isLoading);
    const teachersError = useTeacherStore((state) => state.error);
    const courses = useCourseStore((state) => state.courses);
    const totalCourses = useCourseStore((state) => state.pagination.total);
    const coursesLoading = useCourseStore((state) => state.isLoading);
    const coursesError = useCourseStore((state) => state.error);

    const courseCount = totalCourses || courses.length;
    const publishedCount = courses.filter((course) => course.isPublished).length;
    const draftCount = courses.filter((course) => !course.isPublished).length;

    const summaryText = (() => {
        if (teachersLoading || coursesLoading || teachersError || coursesError) {
            return "Manage teachers, courses, and class sessions.";
        }
        const teacherLabel = teachers.length === 1 ? "1 teacher" : `${teachers.length} teachers`;
        const courseLabel = courseCount === 1 ? "1 course" : `${courseCount} courses`;
        if (courseCount > 0 && courses.length === courseCount) {
            return `${teacherLabel}, ${courseLabel} (${publishedCount} published, ${draftCount} draft).`;
        }
        return `${teacherLabel}, ${courseLabel}.`;
    })();

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            <header className="mb-5 sm:mb-7">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Admin overview
                </h1>
                <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                    {summaryText}
                </p>
            </header>

            <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
                <UserManagement />
                <CourseManagement />
            </div>
        </div>
    );
}
