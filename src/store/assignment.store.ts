import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { AssignmentType, IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";

export interface Assignment {
    id: string;
    title: string;
    course: string;
    dueDate: Date | null;
    type: AssignmentType;
    skill: IeltsSkill;
    status: SubmissionStatus;
    submittedAt: Date | null;
}

interface AssignmentState {
    assignments: Assignment[];
    isLoading: boolean;
    error: string | null;

    fetchAssignments: () => Promise<void>;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
    assignments: [],
    isLoading: false,
    error: null,

    fetchAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: Assignment[] }>(
                "/api/student/assignments"
            );
            set({ assignments: response.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch assignments",
                isLoading: false
            });
        }
    }
}));
