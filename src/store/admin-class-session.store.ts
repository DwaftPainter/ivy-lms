"use client";

import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import { IeltsSkill } from "@/generated/prisma/enums";

export interface ClassSession {
    id: string;
    title: string;
    description: string | null;
    skill: IeltsSkill;
    sessionType: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMins: number;
    meetingUrl: string | null;
    isPublished: boolean;
    courseId: string;
    createdAt: string;
    updatedAt: string;
    course?: {
        id: string;
        title: string;
        skill: IeltsSkill;
    };
    enrolledStudents?: number;
    assignmentsCount?: number;
    materialsCount?: number;
    materials?: SessionMaterial[];
    assignments?: SessionAssignment[];
}

export interface SessionMaterial {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
}

export interface SessionAssignment {
    id: string;
    title: string;
    description: string;
    type: string;
    skill: IeltsSkill;
    dueDate: string | null;
    maxScore: number;
    isPublished: boolean;
    createdAt: string;
}

export interface CreateClassSessionInput {
    courseId: string;
    title: string;
    description?: string;
    skill: IeltsSkill;
    sessionType?: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    durationMins?: number;
    meetingUrl?: string;
    isPublished?: boolean;
}

export interface UpdateClassSessionInput {
    title?: string;
    description?: string;
    skill?: IeltsSkill;
    sessionType?: string;
    scheduledDate?: string;
    startTime?: string;
    endTime?: string;
    durationMins?: number;
    meetingUrl?: string;
    isPublished?: boolean;
}

interface AdminClassSessionState {
    sessions: ClassSession[];
    currentSession: ClassSession | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSessionsByCourse: (courseId: string) => Promise<void>;
    fetchSession: (id: string) => Promise<void>;
    createSession: (data: CreateClassSessionInput) => Promise<ClassSession>;
    updateSession: (id: string, data: UpdateClassSessionInput) => Promise<ClassSession>;
    deleteSession: (id: string) => Promise<void>;
    setCurrentSession: (session: ClassSession | null) => void;
    clearError: () => void;
}

export const useAdminClassSessionStore = create<AdminClassSessionState>((set) => ({
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,

    fetchSessionsByCourse: async (courseId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: { classSessions: ClassSession[] };
            }>(`/api/admin/courses/${courseId}/sessions`);

            set({
                sessions: response.data.classSessions,
                isLoading: false
            });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch class sessions",
                isLoading: false
            });
        }
    },

    fetchSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: { classSession: ClassSession };
            }>(`/api/admin/sessions/${id}`);

            set({ currentSession: response.data.classSession, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch class session",
                isLoading: false
            });
        }
    },

    createSession: async (data: CreateClassSessionInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: { classSession: ClassSession };
                message: string;
            }>("/api/admin/sessions", {
                method: "POST",
                body: JSON.stringify(data)
            });

            set((state) => ({
                sessions: [...state.sessions, response.data.classSession],
                isLoading: false
            }));
            return response.data.classSession;
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to create class session",
                isLoading: false
            });
            throw error;
        }
    },

    updateSession: async (id: string, data: UpdateClassSessionInput) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: { classSession: ClassSession };
                message: string;
            }>(`/api/admin/sessions/${id}`, {
                method: "PATCH",
                body: JSON.stringify(data)
            });

            set((state) => ({
                sessions: state.sessions.map((s) => (s.id === id ? response.data.classSession : s)),
                currentSession: state.currentSession?.id === id ? response.data.classSession : state.currentSession,
                isLoading: false
            }));
            return response.data.classSession;
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to update class session",
                isLoading: false
            });
            throw error;
        }
    },

    deleteSession: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await apiFetch(`/api/admin/sessions/${id}`, {
                method: "DELETE"
            });

            set((state) => ({
                sessions: state.sessions.filter((s) => s.id !== id),
                currentSession: state.currentSession?.id === id ? null : state.currentSession,
                isLoading: false
            }));
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to delete class session",
                isLoading: false
            });
            throw error;
        }
    },

    setCurrentSession: (session: ClassSession | null) => {
        set({ currentSession: session });
    },

    clearError: () => {
        set({ error: null });
    }
}));
