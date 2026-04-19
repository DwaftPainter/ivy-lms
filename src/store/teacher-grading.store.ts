import { create } from "zustand";
import { apiFetch } from "@/lib/api-fetch";
import { SubmissionStatus, IeltsSkill, AssignmentType } from "@/generated/prisma/enums";

export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
}

export interface CriterionScore {
    criterionId: string;
    criterionName: string;
    maxScore: number;
    score?: number;
}

export interface Submission {
    id: string;
    student: Student;
    status: SubmissionStatus;
    content?: string | null;
    fileUrl?: string | null;
    audioUrl?: string | null;
    audioUrls?: unknown;
    score?: number | null;
    bandScore?: number | null;
    feedback?: string | null;
    submittedAt?: string | null;
    gradedAt?: string | null;
    criteriaScores: CriterionScore[];
    commentCount: number;
    aiScore?: number | null;
    aiFeedback?: string | null;
    aiCorrections?: unknown;
    teacherRegradeRequested?: boolean;
}

export interface AssignmentInfo {
    id: string;
    title: string;
    description?: string | null;
    type: AssignmentType;
    skill: IeltsSkill;
    courseName: string;
    dueDate?: string | null;
    maxScore?: number | null;
    content?: unknown | null; // Assignment content with sections/questions
    rubric?: {
        id: string;
        name: string;
        criteria: {
            id: string;
            name: string;
            description?: string | null;
            maxScore: number;
            weight: number;
        }[];
    } | null;
}

export interface GradingSummary {
    totalSubmissions: number;
    pendingCount: number;
    gradedCount: number;
}

export interface DraftGrade {
    score?: number;
    bandScore?: number;
    feedback?: string;
    criteriaScores: Record<string, number>;
    isDraft: boolean;
}

interface TeacherGradingState {
    // Data
    assignment: AssignmentInfo | null;
    submissions: Submission[];
    currentSubmissionId: string | null;
    summary: GradingSummary | null;

    // Draft grades (stored locally)
    draftGrades: Map<string, DraftGrade>;

    // UI State
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // Computed
    currentSubmission: Submission | null;
    currentIndex: number;
    hasDraft: boolean;

    // Actions
    fetchSubmissions: (assignmentId: string) => Promise<void>;
    setCurrentSubmission: (submissionId: string) => void;
    navigateSubmission: (direction: "prev" | "next") => void;

    // Draft actions
    updateDraftScore: (criterionId: string, score: number) => void;
    updateBandScore: (bandScore: number) => void;
    updateFeedback: (feedback: string) => void;
    calculateBandScore: () => number | null;

    // Save actions
    saveDraft: () => Promise<void>;
    submitGrade: () => Promise<void>;
    clearDraft: () => void;

    // Comments
    addComment: (content: string) => Promise<void>;
}

export const useTeacherGradingStore = create<TeacherGradingState>((set, get) => ({
    assignment: null,
    submissions: [],
    currentSubmissionId: null,
    summary: null,
    draftGrades: new Map(),
    isLoading: false,
    isSaving: false,
    error: null,

    get currentSubmission() {
        const { submissions, currentSubmissionId } = get();
        if (!currentSubmissionId) return null;
        return submissions.find((s) => s.id === currentSubmissionId) || null;
    },

    get currentIndex() {
        const { submissions, currentSubmissionId } = get();
        if (!currentSubmissionId) return -1;
        return submissions.findIndex((s) => s.id === currentSubmissionId);
    },

    get hasDraft() {
        const { currentSubmissionId, draftGrades } = get();
        if (!currentSubmissionId) return false;
        const draft = draftGrades.get(currentSubmissionId);
        return draft?.isDraft === true;
    },

    fetchSubmissions: async (assignmentId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiFetch<{
                success: boolean;
                data: {
                    assignment: AssignmentInfo;
                    submissions: Submission[];
                    summary: GradingSummary;
                };
            }>(`/api/teacher/assignments/${assignmentId}/submissions`);

            set({
                assignment: response.data.assignment,
                submissions: response.data.submissions,
                summary: response.data.summary,
                currentSubmissionId: response.data.submissions[0]?.id || null,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to fetch submissions",
                isLoading: false
            });
        }
    },

    setCurrentSubmission: (submissionId: string) => {
        set({ currentSubmissionId: submissionId });
    },

    navigateSubmission: (direction: "prev" | "next") => {
        const { submissions, currentIndex } = get();
        if (submissions.length === 0) return;

        let newIndex: number;
        if (direction === "prev") {
            newIndex = currentIndex > 0 ? currentIndex - 1 : submissions.length - 1;
        } else {
            newIndex = currentIndex < submissions.length - 1 ? currentIndex + 1 : 0;
        }

        set({ currentSubmissionId: submissions[newIndex]?.id || null });
    },

    updateDraftScore: (criterionId: string, score: number) => {
        const { currentSubmissionId, draftGrades, currentSubmission, assignment } = get();
        if (!currentSubmissionId || !currentSubmission) return;

        const existingDraft = draftGrades.get(currentSubmissionId);
        const newCriteriaScores = {
            ...(existingDraft?.criteriaScores || {}),
            [criterionId]: score
        };

        // Auto-calculate band score if all criteria have scores
        const allCriteria = currentSubmission.criteriaScores.length > 0
            ? currentSubmission.criteriaScores
            : assignment?.rubric?.criteria || [];

        let bandScore: number | undefined;
        if (allCriteria.length > 0) {
            const scoredCount = Object.keys(newCriteriaScores).length;
            if (scoredCount === allCriteria.length) {
                const scores = Object.values(newCriteriaScores);
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                bandScore = Math.round(avg * 2) / 2;
            }
        }

        const newDraft: DraftGrade = {
            ...(existingDraft || { feedback: "", isDraft: true }),
            criteriaScores: newCriteriaScores,
            bandScore: bandScore ?? existingDraft?.bandScore,
            isDraft: true
        };

        set({
            draftGrades: new Map(draftGrades).set(currentSubmissionId, newDraft)
        });
    },

    updateBandScore: (bandScore: number) => {
        const { currentSubmissionId, draftGrades } = get();
        if (!currentSubmissionId) return;

        const existingDraft = draftGrades.get(currentSubmissionId);
        const newDraft: DraftGrade = {
            ...(existingDraft || { criteriaScores: {}, feedback: "", isDraft: true }),
            bandScore,
            isDraft: true
        };

        set({
            draftGrades: new Map(draftGrades).set(currentSubmissionId, newDraft)
        });
    },

    updateFeedback: (feedback: string) => {
        const { currentSubmissionId, draftGrades } = get();
        if (!currentSubmissionId) return;

        const existingDraft = draftGrades.get(currentSubmissionId);
        const newDraft: DraftGrade = {
            ...(existingDraft || { criteriaScores: {}, isDraft: true }),
            feedback,
            isDraft: true
        };

        set({
            draftGrades: new Map(draftGrades).set(currentSubmissionId, newDraft)
        });
    },

    calculateBandScore: () => {
        const { currentSubmission, draftGrades } = get();
        if (!currentSubmission) return null;

        const draft = draftGrades.get(currentSubmission.id);
        if (draft?.bandScore !== undefined) return draft.bandScore;

        // Calculate from criteria scores
        const criteriaScores = draft?.criteriaScores || {};
        const scores = Object.values(criteriaScores);
        if (scores.length === 0) return null;

        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return Math.round(avg * 2) / 2;
    },

    saveDraft: async () => {
        const { currentSubmissionId, draftGrades, currentSubmission } = get();
        if (!currentSubmissionId || !currentSubmission) return;

        const draft = draftGrades.get(currentSubmissionId);
        if (!draft) return;

        set({ isSaving: true, error: null });
        try {
            const criteriaScoresArray = Object.entries(draft.criteriaScores).map(
                ([criterionId, score]) => ({
                    criterionId,
                    score
                })
            );

            // Use dedicated draft endpoint
            await apiFetch(`/api/teacher/submissions/${currentSubmissionId}/draft`, {
                method: "POST",
                body: JSON.stringify({
                    score: draft.score,
                    bandScore: draft.bandScore ?? get().calculateBandScore(),
                    feedback: draft.feedback,
                    criteriaScores: criteriaScoresArray
                })
            });

            // Update local state - mark as saved draft
            const updatedDraft: DraftGrade = { ...draft, isDraft: true };
            set({
                draftGrades: new Map(draftGrades).set(currentSubmissionId, updatedDraft),
                isSaving: false
            });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to save draft",
                isSaving: false
            });
            throw error;
        }
    },

    submitGrade: async () => {
        const { currentSubmissionId, draftGrades, currentSubmission, submissions } = get();
        if (!currentSubmissionId || !currentSubmission) return;

        const draft = draftGrades.get(currentSubmissionId);

        set({ isSaving: true, error: null });
        try {
            // Prepare criteria scores - use draft values or existing ones
            const criteriaScoresArray = draft
                ? Object.entries(draft.criteriaScores).map(([criterionId, score]) => ({
                      criterionId,
                      score
                  }))
                : currentSubmission.criteriaScores.map((cs) => ({
                      criterionId: cs.criterionId,
                      score: cs.score ?? 0
                  }));

            // Calculate final band score
            const calculatedBandScore = get().calculateBandScore();
            const bandScore = draft?.bandScore ?? calculatedBandScore ?? currentSubmission.bandScore;

            // Call API to finalize grade (isDraft: false marks as GRADED)
            await apiFetch(`/api/teacher/submissions/${currentSubmissionId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    score: draft?.score ?? currentSubmission.score,
                    bandScore,
                    feedback: draft?.feedback ?? currentSubmission.feedback,
                    criteriaScores: criteriaScoresArray,
                    isDraft: false
                })
            });

            // Update submission in list with new status and scores
            const updatedSubmissions = submissions.map((s) =>
                s.id === currentSubmissionId
                    ? {
                          ...s,
                          status: SubmissionStatus.GRADED,
                          score: draft?.score ?? currentSubmission.score,
                          bandScore,
                          feedback: draft?.feedback ?? currentSubmission.feedback,
                          criteriaScores: criteriaScoresArray.map((cs) => {
                              const existingCriterion = currentSubmission.criteriaScores.find(
                                  (c) => c.criterionId === cs.criterionId
                              );
                              return {
                                  criterionId: cs.criterionId,
                                  criterionName: existingCriterion?.criterionName || "",
                                  maxScore: existingCriterion?.maxScore || 0,
                                  score: cs.score
                              };
                          })
                      }
                    : s
            );

            // Clear draft after successful submission
            const newDraftGrades = new Map(draftGrades);
            newDraftGrades.delete(currentSubmissionId);

            set({
                submissions: updatedSubmissions,
                draftGrades: newDraftGrades,
                isSaving: false
            });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to submit grade",
                isSaving: false
            });
            throw error;
        }
    },

    clearDraft: async () => {
        const { currentSubmissionId, draftGrades } = get();
        if (!currentSubmissionId) return;

        try {
            // Call API to clear draft scores
            await apiFetch(`/api/teacher/submissions/${currentSubmissionId}/draft`, {
                method: "DELETE"
            });

            // Clear local draft state
            const newDraftGrades = new Map(draftGrades);
            newDraftGrades.delete(currentSubmissionId);
            set({ draftGrades: newDraftGrades });
        } catch (error: any) {
            // Even if API fails, clear local state
            const newDraftGrades = new Map(draftGrades);
            newDraftGrades.delete(currentSubmissionId);
            set({ draftGrades: newDraftGrades });
        }
    },

    addComment: async (content: string) => {
        const { currentSubmissionId, currentSubmission } = get();
        if (!currentSubmissionId || !currentSubmission) return;

        set({ isSaving: true, error: null });
        try {
            await apiFetch(`/api/teacher/submissions/${currentSubmissionId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content })
            });

            // Update comment count locally
            const { submissions } = get();
            const updatedSubmissions = submissions.map((s) =>
                s.id === currentSubmissionId ? { ...s, commentCount: s.commentCount + 1 } : s
            );

            set({
                submissions: updatedSubmissions,
                isSaving: false
            });
        } catch (error: any) {
            set({
                error: error?.message || "Failed to add comment",
                isSaving: false
            });
        }
    }
}));
