import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { AssignmentType, IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";

export interface Submission {
    id: string;
    status: SubmissionStatus;
    submittedAt: Date | null;
    gradedAt: Date | null;
    score: number | null;
    bandScore: number | null;
    feedback: string | null;
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    course: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    };
    dueDate: Date | null;
    type: AssignmentType;
    skill: IeltsSkill;
    maxScore: number;
    instructions?: string;
    attachmentUrl?: string;
    isOverdue: boolean;
    submission: Submission | null;
    submissionStatus: SubmissionStatus;
}

export interface ProgressStats {
    courseId: string;
    totalAssignments: number;
    completedSubmissions: number;
    progressPercentage: number;
}

export interface AssignmentSummary {
    total: number;
    pending: number;
    submitted: number;
    graded: number;
}

interface AssignmentState {
    assignments: Assignment[];
    progressStats: ProgressStats[];
    summary: AssignmentSummary | null;
    isLoading: boolean;
    error: string | null;

    fetchAssignments: (courseId?: string, status?: string) => Promise<void>;
    submitAssignment: (assignmentId: string, data: { content?: string; fileUrl?: string; audioUrl?: string }) => Promise<any>;
    getAssignmentById: (id: string) => Assignment | undefined;
    getAssignmentsByCourse: (courseId: string) => Assignment[];
    getPendingAssignments: () => Assignment[];
    getOverdueAssignments: () => Assignment[];
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
    assignments: [],
    progressStats: [],
    summary: null,
    isLoading: false,
    error: null,

    fetchAssignments: async (courseId?: string, status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (courseId) params.append("courseId", courseId);
            if (status) params.append("status", status);

            const url = `/api/student/assignments${params.toString() ? `?${params.toString()}` : ""}`;
            const response = await apiFetch<{
                success: boolean;
                data: {
                    assignments: Assignment[];
                    progressStats: ProgressStats[];
                    summary: AssignmentSummary;
                }
            }>(url);

            set({
                assignments: response.data.assignments,
                progressStats: response.data.progressStats,
                summary: response.data.summary,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch assignments",
                isLoading: false
            });
        }
    },

    submitAssignment: async (assignmentId: string, data) => {
        try {
            const response = await apiFetch<{
                success: boolean;
                message: string;
                data: {
                    submission: Submission;
                    progress: {
                        completed: number;
                        total: number;
                        percentage: number;
                    }
                }
            }>(`/api/student/assignments/${assignmentId}`, {
                method: "POST",
                body: JSON.stringify(data)
            });

            // Refresh assignments after submission
            await get().fetchAssignments();

            return response.data;
        } catch (error: any) {
            throw new Error(error?.message || "Failed to submit assignment");
        }
    },

    getAssignmentById: (id: string) => {
        const { assignments } = get();
        return assignments.find((a) => a.id === id);
    },

    getAssignmentsByCourse: (courseId: string) => {
        const { assignments } = get();
        return assignments.filter((a) => a.course.id === courseId);
    },

    getPendingAssignments: () => {
        const { assignments } = get();
        return assignments.filter((a) => a.submissionStatus === SubmissionStatus.PENDING);
    },

    getOverdueAssignments: () => {
        const { assignments } = get();
        return assignments.filter((a) => a.isOverdue);
    }
}));
