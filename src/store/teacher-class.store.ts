import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { IeltsSkill } from "@/generated/prisma/enums";

export interface TeacherClassItem {
    id: string;
    title: string;
    course: string;
    date: string;
    day: string;
    startTime: string;
    endTime: string;
    classType: IeltsSkill;
    enrolledStudents: number;
    description: string | null;
}

interface TeacherClassState {
    classes: TeacherClassItem[];
    isLoading: boolean;
    error: string | null;

    fetchTeacherClasses: () => Promise<void>;
}

export const useTeacherClassStore = create<TeacherClassState>((set) => ({
    classes: [],
    isLoading: false,
    error: null,

    fetchTeacherClasses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: TeacherClassItem[] }>(
                "/api/teacher/classes"
            );
            set({ classes: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch teacher classes",
                isLoading: false
            });
        }
    }
}));
