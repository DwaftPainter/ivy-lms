import { CourseLevel } from "@/generated/prisma/enums";
import { getSkillLabel } from "@/lib/ielts-badges";
import type { Course } from "@/store/course.store";

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
    [CourseLevel.BEGINNER]: "Beginner",
    [CourseLevel.INTERMEDIATE]: "Intermediate",
    [CourseLevel.ADVANCED]: "Advanced"
};

export function formatTeacherDisplay(course: Course): { label: string; title?: string } {
    if (course.teacher?.firstName && course.teacher?.lastName) {
        return { label: `${course.teacher.firstName} ${course.teacher.lastName}` };
    }
    const id = course.teacher?.id || course.teacherId;
    if (!id) return { label: "Unassigned" };
    return id.length > 20
        ? { label: `Instructor ${id.slice(0, 8)}…`, title: id }
        : { label: `Instructor ${id}`, title: id };
}

export function filterAdminCourses(courses: Course[], searchQuery: string): Course[] {
    const normalizedQuery = searchQuery.trim().toLowerCase();
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
}
