import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { IeltsSkill } from "@/generated/prisma/enums";

export interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    teacherProfile?: {
        bio: string | null;
        expertise: IeltsSkill[];
    } | null;
}

export interface CreateTeacherInput {
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
    expertise: IeltsSkill[];
}

interface CreateTeacherResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    temporaryPassword: string;
}

interface TeacherState {
    teachers: Teacher[];
    isLoading: boolean;
    isCreating: boolean;
    error: string | null;

    fetchTeachers: () => Promise<void>;
    createTeacher: (data: CreateTeacherInput) => Promise<CreateTeacherResponse>;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
    teachers: [],
    isLoading: false,
    isCreating: false,
    error: null,

    fetchTeachers: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: Teacher[] }>(
                "/api/teachers"
            );
            set({ teachers: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch teachers",
                isLoading: false
            });
        }
    },

    createTeacher: async (data: CreateTeacherInput) => {
        set({ isCreating: true });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: CreateTeacherResponse;
                message: string;
            }>("/api/teachers", {
                method: "POST",
                body: JSON.stringify(data)
            });

            // Refresh the teacher list
            await get().fetchTeachers();
            set({ isCreating: false });

            return response.data;
        } catch (error) {
            set({ isCreating: false });
            throw error;
        }
    }
}));
