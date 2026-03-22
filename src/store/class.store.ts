import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";

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
            const response = await apiFetch<{ success: boolean; data: ClassItem[] }>(
                "/api/student/classes"
            );
            set({ classes: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch classes",
                isLoading: false
            });
        }
    }
}));
