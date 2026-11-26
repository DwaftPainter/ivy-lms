"use client";

import { useState } from "react";
import { isPublishedGrade, useTeacherGradingStore } from "@/store/teacher-grading.store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, ChevronRight, Save, Send, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GradingActionBarProps {
    className?: string;
}

export function GradingActionBar({ className }: GradingActionBarProps) {
    const [actionError, setActionError] = useState<{
        submissionId: string | null;
        message: string;
    } | null>(null);
    const {
        submissions,
        isSaving,
        saveDraft,
        submitGrade,
        navigateSubmission,
        clearDraft,
        draftGrades,
        currentSubmissionId
    } = useTeacherGradingStore();

    // Use selectors for computed values
    const currentSubmission = useTeacherGradingStore((state) =>
        state.currentSubmissionId
            ? state.submissions.find((s) => s.id === state.currentSubmissionId) || null
            : null
    );

    const currentIndex = useTeacherGradingStore((state) => {
        if (!state.currentSubmissionId) return -1;
        return state.submissions.findIndex((s) => s.id === state.currentSubmissionId);
    });

    const draft = currentSubmissionId ? draftGrades.get(currentSubmissionId) : undefined;

    const handleSaveDraft = async () => {
        setActionError(null);
        try {
            await saveDraft();
            toast.success("Draft saved successfully");
        } catch {
            setActionError({
                submissionId: currentSubmissionId,
                message: "Could not save the draft. Check your connection and try again."
            });
        }
    };

    const handleSubmitGrade = async () => {
        setActionError(null);
        try {
            await submitGrade();
            toast.success("Grade submitted successfully");
        } catch {
            setActionError({
                submissionId: currentSubmissionId,
                message: "Could not submit the grade. Your unsaved edits are still preserved."
            });
        }
    };

    const handleClearDraft = async () => {
        setActionError(null);
        try {
            await clearDraft();
            toast.info("Draft cleared");
        } catch {
            setActionError({
                submissionId: currentSubmissionId,
                message: "Could not reset the draft. Your edits are still available. Try again."
            });
        }
    };

    if (!currentSubmission) return null;

    const published = isPublishedGrade(currentSubmission.status);
    const hasDraft = Boolean(draft) || (!published && (
        currentSubmission.criteriaScores.length > 0 ||
        typeof currentSubmission.score === "number" ||
        typeof currentSubmission.bandScore === "number" ||
        typeof currentSubmission.feedback === "string"
    ));
    const visibleError =
        actionError?.submissionId === currentSubmissionId ? actionError.message : null;
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === submissions.length - 1;

    return (
        <div className={className}>
            {visibleError && (
                <Alert variant="destructive" className="mb-3">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <AlertDescription>{visibleError}</AlertDescription>
                </Alert>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Navigation */}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSubmission("prev")}
                        disabled={isFirst || isSaving}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground px-2 tabular-nums">
                        {currentIndex + 1} / {submissions.length}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSubmission("next")}
                        disabled={isLast || isSaving}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    {hasDraft && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearDraft}
                            disabled={isSaving}
                        >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    )}

                    {!published && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveDraft}
                            disabled={isSaving || !draft?.isDraft}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin motion-reduce:animate-none" />
                            ) : (
                                <Save className="w-4 h-4 mr-1" />
                            )}
                            Save Draft
                        </Button>
                    )}

                    <Button
                        size="sm"
                        onClick={handleSubmitGrade}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin motion-reduce:animate-none" />
                        ) : (
                            <Send className="w-4 h-4 mr-1" />
                        )}
                        Submit Grade
                    </Button>
                </div>
            </div>
            {published && draft?.isDraft && (
                <p className="mt-2 text-sm text-muted-foreground">
                    Regrade edits are kept in this workspace until you submit the updated grade.
                </p>
            )}
        </div>
    );
}
