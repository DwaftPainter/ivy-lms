import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { IeltsSkill } from "@/generated/prisma/enums";
import { getSessionStatus, SessionStatus } from "@/lib/session-status";

export interface SessionMaterial {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
}

export interface LinkedAssignment {
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

export interface AvailableAssignment {
    id: string;
    title: string;
    description: string;
    type: string;
    skill: IeltsSkill;
    dueDate: string | null;
    maxScore: number;
    isPublished: boolean;
}

export interface ClassSessionDetail {
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
    course: {
        id: string;
        title: string;
        skill: IeltsSkill;
        level: string;
    };
    materials: SessionMaterial[];
    assignments: LinkedAssignment[];
    createdAt: string;
    updatedAt: string;
}

export type ViewMode = "edit" | "preview";

export type EditTab = "details" | "assignments" | "materials" | "access";

interface TeacherLessonDetailState {
    // Data
    session: ClassSessionDetail | null;
    availableAssignments: AvailableAssignment[];
    isLoading: boolean;
    isSaving: boolean;
    isLinking: boolean;
    error: string | null;
    saveError: string | null;

    // UI State
    viewMode: ViewMode;
    activeTab: EditTab;

    // Computed
    sessionStatus: SessionStatus | null;

    // Actions - Data Fetching
    fetchSession: (id: string) => Promise<void>;
    fetchAvailableAssignments: (sessionId: string) => Promise<void>;
    clearSession: () => void;

    // Actions - UI State
    setViewMode: (mode: ViewMode) => void;
    setActiveTab: (tab: EditTab) => void;

    // Actions - Session Updates
    updateSession: (id: string, data: Partial<ClassSessionDetail>) => Promise<void>;
    updateSessionField: <K extends keyof ClassSessionDetail>(
        field: K,
        value: ClassSessionDetail[K]
    ) => void;

    // Actions - Assignments
    linkAssignment: (sessionId: string, assignmentId: string) => Promise<void>;
    unlinkAssignment: (sessionId: string, assignmentId: string) => Promise<void>;

    // Actions - Access Control
    updatePublishStatus: (id: string, isPublished: boolean) => Promise<void>;
}

export const useTeacherLessonDetailStore = create<TeacherLessonDetailState>(
    (set, get) => ({
        // Initial State
        session: null,
        availableAssignments: [],
        isLoading: false,
        isSaving: false,
        isLinking: false,
        error: null,
        saveError: null,
        viewMode: "edit",
        activeTab: "details",
        sessionStatus: null,

        // Fetch Session
        fetchSession: async (id: string) => {
            set({ isLoading: true, error: null });
            try {
                const response = await apiFetch<{
                    success: boolean;
                    data: { classSession: ClassSessionDetail };
                }>(`/api/teacher/class-sessions/${id}`);

                const session = response.data.classSession;
                const status = getSessionStatus(
                    session.scheduledDate,
                    session.startTime,
                    session.endTime
                );

                set({
                    session,
                    sessionStatus: status,
                    isLoading: false
                });
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to fetch session details";
                set({
                    error: errorMessage,
                    isLoading: false
                });
            }
        },

        // Fetch Available Assignments
        fetchAvailableAssignments: async (sessionId: string) => {
            try {
                const response = await apiFetch<{
                    success: boolean;
                    data: { assignments: AvailableAssignment[] };
                }>(`/api/teacher/class-sessions/${sessionId}/assignments`);

                set({ availableAssignments: response.data.assignments });
            } catch (error: unknown) {
                // eslint-disable-next-line no-console
                console.error("Failed to fetch available assignments:", error);
            }
        },

        // Clear Session
        clearSession: () => {
            set({
                session: null,
                availableAssignments: [],
                error: null,
                saveError: null,
                sessionStatus: null
            });
        },

        // Set View Mode
        setViewMode: (mode: ViewMode) => {
            set({ viewMode: mode });
        },

        // Set Active Tab
        setActiveTab: (tab: EditTab) => {
            set({ activeTab: tab });
        },

        // Update Session (API call)
        updateSession: async (id: string, data: Partial<ClassSessionDetail>) => {
            set({ isSaving: true, saveError: null });
            try {
                const response = await apiFetch<{
                    success: boolean;
                    data: { classSession: ClassSessionDetail };
                }>(`/api/teacher/class-sessions/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(data)
                });

                const session = response.data.classSession;
                const status = getSessionStatus(
                    session.scheduledDate,
                    session.startTime,
                    session.endTime
                );

                set({
                    session,
                    sessionStatus: status,
                    isSaving: false
                });
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to update session";
                set({
                    saveError: errorMessage,
                    isSaving: false
                });
                throw error;
            }
        },

        // Update Session Field (local state only, for form handling)
        updateSessionField: <K extends keyof ClassSessionDetail>(
            field: K,
            value: ClassSessionDetail[K]
        ) => {
            const { session } = get();
            if (session) {
                const updatedSession = { ...session, [field]: value };

                // Recalculate status if time-related fields change
                let status = get().sessionStatus;
                if (
                    field === "scheduledDate" ||
                    field === "startTime" ||
                    field === "endTime"
                ) {
                    status = getSessionStatus(
                        updatedSession.scheduledDate,
                        updatedSession.startTime,
                        updatedSession.endTime
                    );
                }

                set({
                    session: updatedSession,
                    sessionStatus: status
                });
            }
        },

        // Link Assignment
        linkAssignment: async (sessionId: string, assignmentId: string) => {
            set({ isLinking: true });
            try {
                await apiFetch(`/api/teacher/class-sessions/${sessionId}/assignments`, {
                    method: "POST",
                    body: JSON.stringify({ assignmentId })
                });

                // Refresh session to get updated assignments
                await get().fetchSession(sessionId);
                // Refresh available assignments
                await get().fetchAvailableAssignments(sessionId);
            } catch (error: unknown) {
                // eslint-disable-next-line no-console
                console.error("Failed to link assignment:", error);
                throw error;
            } finally {
                set({ isLinking: false });
            }
        },

        // Unlink Assignment
        unlinkAssignment: async (sessionId: string, assignmentId: string) => {
            set({ isLinking: true });
            try {
                await apiFetch(`/api/teacher/class-sessions/${sessionId}/assignments`, {
                    method: "DELETE",
                    body: JSON.stringify({ assignmentId })
                });

                // Refresh session to get updated assignments
                await get().fetchSession(sessionId);
                // Refresh available assignments
                await get().fetchAvailableAssignments(sessionId);
            } catch (error: unknown) {
                // eslint-disable-next-line no-console
                console.error("Failed to unlink assignment:", error);
                throw error;
            } finally {
                set({ isLinking: false });
            }
        },

        // Update Publish Status
        updatePublishStatus: async (id: string, isPublished: boolean) => {
            set({ isSaving: true, saveError: null });
            try {
                const response = await apiFetch<{
                    success: boolean;
                    data: { classSession: ClassSessionDetail };
                }>(`/api/teacher/class-sessions/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ isPublished })
                });

                const session = response.data.classSession;
                set({
                    session,
                    isSaving: false
                });
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to update publish status";
                set({
                    saveError: errorMessage,
                    isSaving: false
                });
                throw error;
            }
        }
    })
);
