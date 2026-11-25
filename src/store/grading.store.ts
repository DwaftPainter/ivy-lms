import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";

export interface PendingGradingItem {
    assignmentId: string;
    title: string;
    course: string;
    submissionsAwaiting: number;
    deadline: string;
}

interface GradingState {
    pendingGrading: PendingGradingItem[];
    isLoading: boolean;
    error: string | null;

    fetchPendingGrading: () => Promise<void>;
}

export const useGradingStore = create<GradingState>((set) => ({
    pendingGrading: [],
    isLoading: false,
    error: null,

    fetchPendingGrading: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: PendingGradingItem[] }>(
                "/api/teacher/grading/pending"
            );
            set({ pendingGrading: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch pending grading",
                isLoading: false
            });
        }
    }
}));
