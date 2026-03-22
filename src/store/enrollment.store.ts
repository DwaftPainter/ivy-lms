import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { CourseLevel, IeltsSkill } from "@/generated/prisma/enums";
import { EnrollmentStatus } from "@/enums/erollment.enum";

export interface EnrolledCourse {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    skill: IeltsSkill;
    level: CourseLevel;
    startDate?: string | null;
    teacher?: {
        firstName?: string;
        lastName?: string;
    };
    progress: {
        totalSessions: number;
        completedSessions: number;
        totalAssignments: number;
        completedAssignments: number;
        completionPercentage: number;
    };
    status: EnrollmentStatus;
}

interface EnrollmentState {
    enrolledCourses: EnrolledCourse[];
    isLoading: boolean;
    error: string | null;

    fetchEnrolledCourses: () => Promise<void>;
    getCoursesByStatus: (status: EnrollmentStatus) => EnrolledCourse[];
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
    enrolledCourses: [],
    isLoading: false,
    error: null,

    fetchEnrolledCourses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: EnrolledCourse[] }>(
                "/api/student/enrollments"
            );
            set({ enrolledCourses: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch enrolled courses",
                isLoading: false
            });
        }
    },

    getCoursesByStatus: (status: EnrollmentStatus) => {
        const { enrolledCourses } = get();
        return enrolledCourses.filter((course) => course.status === status);
    }
}));
