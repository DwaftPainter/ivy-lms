import { create } from "zustand";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
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

export function isPublishedGrade(status: SubmissionStatus): boolean {
    return status === SubmissionStatus.GRADED || status === SubmissionStatus.RETURNED;
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

    // Computed (kept for backwards compatibility; actions resolve from submissions + currentSubmissionId)
    getCurrentSubmission: () => Submission | null;
    getCurrentIndex: () => number;

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
    clearDraft: () => Promise<void>;

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

    getCurrentSubmission: () => {
        const { submissions, currentSubmissionId } = get();
        if (!currentSubmissionId) return null;
        return submissions.find((s) => s.id === currentSubmissionId) || null;
    },

    getCurrentIndex: () => {
        const { submissions, currentSubmissionId } = get();
        if (!currentSubmissionId) return -1;
        return submissions.findIndex((s) => s.id === currentSubmissionId);
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
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to fetch submissions",
                isLoading: false
            });
        }
    },

    setCurrentSubmission: (submissionId: string) => {
        set({ currentSubmissionId: submissionId });
    },

    navigateSubmission: (direction: "prev" | "next") => {
        const { submissions, getCurrentIndex } = get();
        if (submissions.length === 0) return;

        const currentIndex = getCurrentIndex();
        let newIndex: number;
        if (direction === "prev") {
            newIndex = currentIndex > 0 ? currentIndex - 1 : submissions.length - 1;
        } else {
            newIndex = currentIndex < submissions.length - 1 ? currentIndex + 1 : 0;
        }

        set({ currentSubmissionId: submissions[newIndex]?.id || null });
    },

    updateDraftScore: (criterionId: string, score: number) => {
        const { currentSubmissionId, draftGrades, getCurrentSubmission, assignment } = get();
        const currentSubmission = getCurrentSubmission();
        if (!currentSubmissionId || !currentSubmission) return;

        const existingDraft = draftGrades.get(currentSubmissionId);
        const newCriteriaScores = {
            ...(existingDraft?.criteriaScores || {}),
            [criterionId]: score
        };

        // Auto-calculate band score if all criteria have scores
        const allCriteria = assignment?.rubric?.criteria;

        let bandScore: number | undefined;
        if (allCriteria?.length) {
            const savedScores = new Map(
                currentSubmission.criteriaScores.map(({ criterionId, score }) => [criterionId, score])
            );
            const scores = allCriteria.map(({ id }) => newCriteriaScores[id] ?? savedScores.get(id));
            if (scores.every((value) => value !== undefined)) {
                const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
                bandScore = Math.round(avg * 2) / 2;
            }
        }

        const newDraft: DraftGrade = {
            ...existingDraft,
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
            criteriaScores: {},
            ...existingDraft,
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
        const { getCurrentSubmission, draftGrades } = get();
        const currentSubmission = getCurrentSubmission();
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
        const { currentSubmissionId, draftGrades, getCurrentSubmission, isSaving } = get();
        const currentSubmission = getCurrentSubmission();
        if (!currentSubmissionId || !currentSubmission || isSaving) return;

        const draft = draftGrades.get(currentSubmissionId);
        if (!draft?.isDraft) return;
        if (isPublishedGrade(currentSubmission.status)) {
            throw new Error("Submit changes to update a published grade.");
        }

        set({ isSaving: true });
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
                    bandScore: draft.bandScore,
                    feedback: draft.feedback,
                    criteriaScores: criteriaScoresArray
                })
            });

            set((state) => {
                if (state.draftGrades.get(currentSubmissionId) !== draft) return state;
                return {
                    draftGrades: new Map(state.draftGrades).set(currentSubmissionId, { ...draft, isDraft: false })
                };
            });
        } finally {
            set({ isSaving: false });
        }
    },

    submitGrade: async () => {
        const { currentSubmissionId, draftGrades, getCurrentSubmission, isSaving } = get();
        const currentSubmission = getCurrentSubmission();
        if (!currentSubmissionId || !currentSubmission || isSaving) return;

        const draft = draftGrades.get(currentSubmissionId);

        set({ isSaving: true });
        try {
            // Prepare criteria scores - use draft values or existing ones
            const criteriaScoresArray = draft
                ? Object.entries(draft.criteriaScores).map(([criterionId, score]) => ({
                      criterionId,
                      score
                  }))
                : undefined;

            // Calculate final band score
            const bandScore = draft?.bandScore ??
                (typeof currentSubmission.bandScore === "number" ? undefined : get().calculateBandScore() ?? undefined);

            // Call API to finalize grade (isDraft: false marks as GRADED)
            const { data } = await apiFetch<{
                data: {
                    submission: Pick<Submission, "status" | "score" | "bandScore" | "feedback" | "gradedAt">;
                    criteriaScores: CriterionScore[];
                };
            }>(`/api/teacher/submissions/${currentSubmissionId}`, {
                method: "PATCH",
                body: JSON.stringify({
                    score: draft?.score,
                    bandScore,
                    feedback: draft?.feedback,
                    criteriaScores: criteriaScoresArray,
                    isDraft: false
                })
            });

            set((state) => {
                const latestDrafts = new Map(state.draftGrades);
                if (latestDrafts.get(currentSubmissionId) === draft) latestDrafts.delete(currentSubmissionId);
                return {
                    submissions: state.submissions.map((submission) =>
                        submission.id === currentSubmissionId
                            ? { ...submission, ...data.submission, criteriaScores: data.criteriaScores }
                            : submission
                    ),
                    draftGrades: latestDrafts
                };
            });
        } finally {
            set({ isSaving: false });
        }
    },

    clearDraft: async () => {
        const { getCurrentSubmission, draftGrades, isSaving } = get();
        const submission = getCurrentSubmission();
        if (!submission || isSaving) return;

        const draft = draftGrades.get(submission.id);
        const published = isPublishedGrade(submission.status);
        set({ isSaving: true });
        try {
            if (!published) {
                await apiFetch(`/api/teacher/submissions/${submission.id}/draft`, { method: "DELETE" });
            }
            set((state) => {
                const latestDrafts = new Map(state.draftGrades);
                if (latestDrafts.get(submission.id) === draft) latestDrafts.delete(submission.id);
                return {
                    submissions: published ? state.submissions : state.submissions.map((item) =>
                        item.id === submission.id && !isPublishedGrade(item.status)
                            ? { ...item, score: null, bandScore: null, feedback: null, criteriaScores: [] }
                            : item
                    ),
                    draftGrades: latestDrafts
                };
            });
        } finally {
            set({ isSaving: false });
        }
    },

    addComment: async (content: string) => {
        const { currentSubmissionId, getCurrentSubmission } = get();
        const currentSubmission = getCurrentSubmission();
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
        } catch (error) {
            set({
                error: getErrorMessage(error) || "Failed to add comment",
                isSaving: false
            });
        }
    }
}));
