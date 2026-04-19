"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTeacherGradingStore } from "@/store/teacher-grading.store";
import { StudentSubmissionList } from "@/components/grading/student-submission-list";
import { SubmissionViewer } from "@/components/grading/submission-viewer";
import { RubricScoring } from "@/components/grading/rubric-scoring";
import { GradingHeader } from "@/components/grading/grading-header";
import { GradingActionBar } from "@/components/grading/grading-action-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TeacherGradingPage() {
    const params = useParams();
    const assignmentId = params.id as string;

    const {
        assignment,
        submissions,
        currentSubmissionId,
        isLoading,
        error,
        draftGrades,
        fetchSubmissions,
        setCurrentSubmission,
        updateDraftScore,
        updateBandScore,
        updateFeedback
    } = useTeacherGradingStore();

    // Use selectors for computed values to ensure reactivity
    const currentSubmission = useTeacherGradingStore((state) =>
        state.currentSubmissionId
            ? state.submissions.find((s) => s.id === state.currentSubmissionId) || null
            : null
    );

    useEffect(() => {
        if (assignmentId) {
            fetchSubmissions(assignmentId);
        }
    }, [assignmentId, fetchSubmissions]);

    if (isLoading) {
        return (
            <div className="h-full p-6 space-y-6">
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-6 h-[calc(100vh-200px)]">
                    <Skeleton className="w-72 h-full" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!assignment || submissions.length === 0) {
        return (
            <div className="h-full p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Submissions</AlertTitle>
                    <AlertDescription>
                        There are no submissions available for this assignment yet.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const draft = currentSubmissionId ? draftGrades.get(currentSubmissionId) : undefined;

    const criteria =
        currentSubmission?.criteriaScores && currentSubmission.criteriaScores.length > 0
            ? currentSubmission.criteriaScores
            : assignment.rubric?.criteria.map((c) => ({
                  criterionId: c.id,
                  criterionName: c.name,
                  maxScore: c.maxScore,
                  score: undefined
              })) || [];

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 p-6 border-b bg-card">
                <GradingHeader />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Student List */}
                <div className="w-72 shrink-0">
                    <StudentSubmissionList
                        submissions={submissions}
                        currentSubmissionId={currentSubmissionId}
                        onSelect={setCurrentSubmission}
                        className="h-full"
                    />
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-auto p-6">
                        {currentSubmission ? (
                            <div className="max-w-5xl mx-auto space-y-6">
                                {/* Submission Viewer */}
                                <SubmissionViewer
                                    submission={currentSubmission}
                                    skill={assignment.skill}
                                />

                                {/* Rubric Scoring */}
                                <RubricScoring
                                    criteria={criteria}
                                    bandScore={currentSubmission.bandScore}
                                    feedback={currentSubmission.feedback}
                                    maxScore={assignment.maxScore}
                                    draftScores={draft?.criteriaScores || {}}
                                    draftBandScore={draft?.bandScore}
                                    draftFeedback={draft?.feedback}
                                    onScoreChange={updateDraftScore}
                                    onBandScoreChange={updateBandScore}
                                    onFeedbackChange={updateFeedback}
                                />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Select a student to begin grading
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="shrink-0 p-4 border-t bg-card">
                        <GradingActionBar />
                    </div>
                </div>
            </div>
        </div>
    );
}
