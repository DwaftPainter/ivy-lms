"use client";

import { useTeacherGradingStore } from "@/store/teacher-grading.store";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Send, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GradingActionBarProps {
    className?: string;
}

export function GradingActionBar({ className }: GradingActionBarProps) {
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

    const hasDraft = currentSubmissionId
        ? draftGrades.get(currentSubmissionId)?.isDraft === true
        : false;

    const handleSaveDraft = async () => {
        try {
            await saveDraft();
            toast.success("Draft saved successfully");
        } catch {
            toast.error("Failed to save draft");
        }
    };

    const handleSubmitGrade = async () => {
        try {
            await submitGrade();
            toast.success("Grade submitted successfully");
        } catch {
            toast.error("Failed to submit grade");
        }
    };

    const handleClearDraft = () => {
        clearDraft();
        toast.info("Draft cleared");
    };

    if (!currentSubmission) return null;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === submissions.length - 1;

    return (
        <div className={className}>
            <div className="flex items-center justify-between gap-4">
                {/* Navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSubmission("prev")}
                        disabled={isFirst || isSaving}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground px-2">
                        {currentIndex + 1} / {submissions.length}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSubmission("next")}
                        disabled={isLast || isSaving}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
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

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-1" />
                        )}
                        Save Draft
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSubmitGrade}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-1" />
                        )}
                        Submit Grade
                    </Button>
                </div>
            </div>
        </div>
    );
}
