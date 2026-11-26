import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CourseLevel, IeltsSkill } from "../../generated/prisma/enums";
import type { Course } from "../../store/course.store";
import { filterAdminCourses, formatTeacherDisplay } from "../admin-courses";

function makeCourse(overrides: Partial<Course> = {}): Course {
    return {
        id: "c-1",
        title: "Academic Reading Core",
        description: null,
        teacherId: "t-1",
        thumbnailUrl: null,
        skill: IeltsSkill.READING,
        level: CourseLevel.INTERMEDIATE,
        targetBand: 7,
        isPublished: true,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        ...overrides
    };
}

describe("admin-courses helpers", () => {
    it("formats teacher full name, short id fallback, long id truncation, and unassigned", () => {
        assert.deepEqual(
            formatTeacherDisplay(
                makeCourse({ teacher: { id: "t-1", firstName: "Jane", lastName: "Doe" } })
            ),
            { label: "Jane Doe" }
        );
        assert.deepEqual(
            formatTeacherDisplay(makeCourse({ teacherId: "short-id" })),
            { label: "Instructor short-id", title: "short-id" }
        );
        assert.deepEqual(
            formatTeacherDisplay(makeCourse({ teacherId: "very-long-instructor-identifier-123" })),
            { label: "Instructor very-lon…", title: "very-long-instructor-identifier-123" }
        );
        assert.deepEqual(formatTeacherDisplay(makeCourse({ teacherId: "" })), {
            label: "Unassigned"
        });
    });

    it("filters courses by title, skill label, level label, and teacher id", () => {
        const courses = [
            makeCourse({
                id: "1",
                title: "Band 7 Reading",
                skill: IeltsSkill.READING,
                level: CourseLevel.INTERMEDIATE,
                teacherId: "teacher-alpha"
            }),
            makeCourse({
                id: "2",
                title: "Speaking Clinic",
                skill: IeltsSkill.SPEAKING,
                level: CourseLevel.ADVANCED,
                teacherId: "teacher-beta"
            })
        ];

        assert.equal(filterAdminCourses(courses, " ").length, 2);
        assert.equal(filterAdminCourses(courses, "clinic")[0]?.id, "2");
        assert.equal(filterAdminCourses(courses, "intermediate")[0]?.id, "1");
        assert.equal(filterAdminCourses(courses, "speaking")[0]?.id, "2");
        assert.equal(filterAdminCourses(courses, "teacher-alpha")[0]?.id, "1");
    });
});
