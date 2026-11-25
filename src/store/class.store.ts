import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { AttendanceStatus } from "@/generated/prisma/enums";

export interface LessonResource {
    id: string;
    name: string;
    fileUrl: string;
}

export interface ClassItem {
    id: string;
    title: string;
    course: string;
    date: string;
    day: string;
    time: string;
    instructor: string;
    description: string | null;
    materials: LessonResource[];
    attendanceId: string;
    attendanceStatus: AttendanceStatus;
    assignmentStatus: string;
}

interface ClassState {
    classes: ClassItem[];
    isLoading: boolean;
    error: string | null;

    fetchClasses: () => Promise<void>;
}

export const useClassStore = create<ClassState>((set) => ({
    classes: [],
    isLoading: false,
    error: null,

    fetchClasses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: ClassItem[] }>("/api/student/classes");
            set({ classes: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch classes",
                isLoading: false
            });
        }
    }
}));
