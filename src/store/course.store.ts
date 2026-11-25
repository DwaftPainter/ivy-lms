import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { CourseLevel, IeltsSkill } from "@/generated/prisma/enums";

export interface Course {
    id: string;
    title: string;
    description: string | null;
    teacherId: string;
    thumbnailUrl: string | null;
    skill: IeltsSkill;
    level: CourseLevel;
    targetBand: number | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    teacher?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    _count?: {
        enrollments: number;
        lessons: number;
    };
}

export interface CreateCourseInput {
    title: string;
    description?: string;
    teacherId: string;
    thumbnailUrl?: string;
    skill: IeltsSkill;
    level: CourseLevel;
    targetBand?: number;
    isPublished?: boolean;
}

export interface UpdateCourseInput {
    title?: string;
    description?: string;
    teacherId?: string;
    thumbnailUrl?: string;
    skill?: IeltsSkill;
    level?: CourseLevel;
    targetBand?: number;
    isPublished?: boolean;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface CourseState {
    courses: Course[];
    currentCourse: Course | null;
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;

    // Actions
    fetchCourses: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        level?: CourseLevel;
        skill?: IeltsSkill;
        isPublished?: boolean;
    }) => Promise<void>;
    fetchCourse: (id: string) => Promise<void>;
    createCourse: (data: CreateCourseInput) => Promise<Course>;
    updateCourse: (id: string, data: UpdateCourseInput) => Promise<Course>;
    deleteCourse: (id: string) => Promise<void>;
    setCurrentCourse: (course: Course | null) => void;
    clearError: () => void;
}

export const useCourseStore = create<CourseState>((set) => ({
    courses: [],
    currentCourse: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },

    fetchCourses: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.set("page", params.page.toString());
            if (params.limit) queryParams.set("limit", params.limit.toString());
            if (params.search) queryParams.set("search", params.search);
            if (params.level) queryParams.set("level", params.level);
            if (params.skill) queryParams.set("skill", params.skill);
            if (params.isPublished !== undefined)
                queryParams.set("isPublished", params.isPublished.toString());

            const response = await apiFetch<{
                success: boolean;
                data: Course[];
                pagination: Pagination;
            }>(`/api/courses?${queryParams.toString()}`);

            set({
                courses: response.data,
                pagination: response.pagination,
                isLoading: false
            });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch courses",
                isLoading: false
            });
        }
    },

    fetchCourse: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: Course }>(`/api/courses/${id}`);
            set({ currentCourse: response.data, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch course",
                isLoading: false
            });
        }
    },

    createCourse: async (data: CreateCourseInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: Course }>("/api/courses", {
                method: "POST",
                body: JSON.stringify(data)
            });
            set((state) => ({
                courses: [response.data, ...state.courses],
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to create course",
                isLoading: false
            });
            throw error;
        }
    },

    updateCourse: async (id: string, data: UpdateCourseInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{ success: boolean; data: Course }>(`/api/courses/${id}`, {
                method: "PUT",
                body: JSON.stringify(data)
            });
            set((state) => ({
                courses: state.courses.map((c) => (c.id === id ? response.data : c)),
                currentCourse: state.currentCourse?.id === id ? response.data : state.currentCourse,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to update course",
                isLoading: false
            });
            throw error;
        }
    },

    deleteCourse: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await apiFetch(`/api/courses/${id}`, {
                method: "DELETE"
            });
            set((state) => ({
                courses: state.courses.filter((c) => c.id !== id),
                currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to delete course",
                isLoading: false
            });
            throw error;
        }
    },

    setCurrentCourse: (course: Course | null) => {
        set({ currentCourse: course });
    },

    clearError: () => {
        set({ error: null });
    }
}));
