import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";

export interface FeedbackTask {
    id: string;
    studentName: string;
    course: string;
    deadline: string;
}

interface FeedbackState {
    feedbackTasks: FeedbackTask[];
    isLoading: boolean;
    error: string | null;

    fetchFeedbackTasks: () => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
    feedbackTasks: [],
    isLoading: false,
    error: null,

    fetchFeedbackTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: FeedbackTask[] }>(
                "/api/teacher/feedback/tasks"
            );
            set({ feedbackTasks: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch feedback tasks",
                isLoading: false
            });
        }
    }
}));
