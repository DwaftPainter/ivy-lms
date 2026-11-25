import type { SubmissionStatus } from "@/generated/prisma/enums";
import type { AICorrection } from "@/lib/ai-grading";

export interface AssignmentSubmissionResult {
    submission: {
        id: string;
        status: SubmissionStatus;
        submittedAt: string;
        content: string | null;
        fileUrl: string | null;
        audioUrl: string | null;
        aiScore?: number;
        aiFeedback?: string;
        aiCorrections?: AICorrection[];
        aiGradedAt: string | null;
    };
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
}
