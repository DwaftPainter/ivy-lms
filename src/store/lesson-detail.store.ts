import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { IeltsSkill } from "@/generated/prisma/enums";
import { AttendanceStatus } from "@/generated/prisma/enums";

export interface Material {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string | null;
    type: string;
    skill: IeltsSkill;
    dueDate: string | null;
    maxScore: number;
    status: string;
    hasSubmission: boolean;
}

export interface LessonDetail {
    id: string;
    title: string;
    description: string | null;
    skill: IeltsSkill;
    sessionType: string;
    date: string;
    rawDate: string;
    time: string;
    duration: number;
    status: string;
    meetingUrl: string | null;
    course: {
        id: string;
        title: string;
    };
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    };
    materials: Material[];
    assignments: Assignment[];
    attendance: {
        id: string | null;
        status: AttendanceStatus;
    };
}

interface LessonDetailState {
    lesson: LessonDetail | null;
    isLoading: boolean;
    error: string | null;

    fetchLesson: (id: string) => Promise<void>;
    clearLesson: () => void;
}

export const useLessonDetailStore = create<LessonDetailState>((set) => ({
    lesson: null,
    isLoading: false,
    error: null,

    fetchLesson: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: LessonDetail }>(
                `/api/student/lessons/${id}`
            );
            set({ lesson: response.data, isLoading: false });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch lesson details";
            set({
                error: errorMessage,
                isLoading: false
            });
        }
    },

    clearLesson: () => {
        set({ lesson: null, error: null });
    }
}));
