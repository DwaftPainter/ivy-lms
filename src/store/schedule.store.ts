import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";

export interface ScheduleLesson {
    id: string;
    title: string;
    course: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    instructor: string;
}

interface ScheduleState {
    lessons: ScheduleLesson[];
    isLoading: boolean;
    error: string | null;

    fetchSchedule: () => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
    lessons: [],
    isLoading: false,
    error: null,

    fetchSchedule: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: ScheduleLesson[] }>(
                "/api/student/schedule"
            );
            set({ lessons: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch schedule",
                isLoading: false
            });
        }
    }
}));
