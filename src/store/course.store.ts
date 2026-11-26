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

interface FetchCoursesParams {
    page?: number;
    limit?: number;
    search?: string;
    level?: CourseLevel;
    skill?: IeltsSkill;
    isPublished?: boolean;
}

interface CourseState {
    courses: Course[];
    currentCourse: Course | null;
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
    lastFetchParams: FetchCoursesParams;

    // Actions
    fetchCourses: (params?: FetchCoursesParams) => Promise<void>;
    fetchCourse: (id: string) => Promise<void>;
    createCourse: (data: CreateCourseInput) => Promise<Course>;
    updateCourse: (id: string, data: UpdateCourseInput) => Promise<Course>;
    deleteCourse: (id: string) => Promise<void>;
    setCurrentCourse: (course: Course | null) => void;
    clearError: () => void;
}

function adjustPagination(pagination: Pagination, delta: number, fallbackLength: number): Pagination {
    const limit = pagination.limit || 10;
    const baseTotal = pagination.total > 0 || delta < 0 ? pagination.total : fallbackLength;
    const total = Math.max(0, baseTotal + delta);
    const totalPages = total > 0 ? Math.max(1, Math.ceil(total / limit)) : 0;
    return {
        ...pagination,
        total,
        totalPages,
        page: totalPages > 0 ? Math.min(pagination.page || 1, totalPages) : 1
    };
}

export const useCourseStore = create<CourseState>((set, get) => ({
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
    lastFetchParams: {},

    fetchCourses: async (params = {}) => {
        set({ isLoading: true, error: null, lastFetchParams: params });
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
                pagination: adjustPagination(state.pagination, 1, state.courses.length),
                isLoading: false
            }));
            await get().fetchCourses(get().lastFetchParams);
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
            await get().fetchCourses(get().lastFetchParams);
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
                pagination: adjustPagination(state.pagination, -1, state.courses.length),
                currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
                isLoading: false
            }));
            const { fetchCourses, lastFetchParams, pagination } = get();
            await fetchCourses({ ...lastFetchParams, page: pagination.page });
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
