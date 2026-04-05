"use client";

import { useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { QuestionSidebar } from "@/components/assignment/QuestionSidebar";
import { BottomNavigation } from "@/components/assignment/BottomNavigation";
import { WritingQuestion } from "@/components/assignment/WritingQuestion";
import { ReadingQuestion } from "@/components/assignment/ReadingQuestion";
import { ListeningQuestion } from "@/components/assignment/ListeningQuestion";
import { SpeakingQuestion } from "@/components/assignment/SpeakingQuestion";
import { Timer } from "@/components/assignment/Timer";
import { WritingTimer } from "@/components/assignment/WritingTimer";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IeltsSkill } from "@/generated/prisma/enums";

export default function AssignmentPage() {
    const params = useParams();
    const { id } = params;

    const {
        currentAssignment,
        parts,
        currentPartIndex,
        currentQuestionIndex,
        answers,
        isLoading,
        error,
        fetchAssignment,
        setAnswer,
    } = useAssignmentSessionStore();

    useEffect(() => {
        if (id) {
            fetchAssignment(id as string);
        }
    }, [id, fetchAssignment]);

    const handleBeforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            const hasAnswers = Object.values(answers).some(
                (a) => a && a.trim().length > 0
            );
            if (hasAnswers) {
                e.preventDefault();
                e.returnValue = "You have unsaved answers. Are you sure you want to leave?";
                return e.returnValue;
            }
        },
        [answers]
    );

    useEffect(() => {
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [handleBeforeUnload]);

    const currentPart = parts[currentPartIndex];
    const currentQuestion = currentPart?.questions[currentQuestionIndex];

    const renderQuestion = () => {
        if (!currentQuestion) return null;

        const skill = currentAssignment?.skill;
        const questionNumber =
            parts
                .slice(0, currentPartIndex)
                .reduce((acc, part) => acc + part.questions.length, 0) +
            currentQuestionIndex +
            1;

        switch (skill) {
            case IeltsSkill.WRITING:
                return (
                    <WritingQuestion
                        question={currentQuestion}
                        answer={answers[currentQuestion.id] || ""}
                        onAnswerChange={(value) => setAnswer(currentQuestion.id, value)}
                        teacherFeedback={currentAssignment?.submission?.feedback || undefined}
                        assignmentId={id as string}
                        isSubmitted={!!currentAssignment?.submission?.submittedAt}
                    />
                );

            case IeltsSkill.READING:
                return (
                    <ReadingQuestion
                        question={currentQuestion}
                        answer={answers[currentQuestion.id] || ""}
                        onAnswerChange={(value) => setAnswer(currentQuestion.id, value)}
                        questionNumber={questionNumber}
                    />
                );

            case IeltsSkill.LISTENING:
                return (
                    <ListeningQuestion
                        question={currentQuestion}
                        answer={answers[currentQuestion.id] || ""}
                        onAnswerChange={(value) => setAnswer(currentQuestion.id, value)}
                        questionNumber={questionNumber}
                        audioUrl={currentQuestion.audioUrl}
                    />
                );

            case IeltsSkill.SPEAKING:
                // For speaking, show all questions in the current part
                return (
                    <div className="space-y-6">
                        {currentPart.questions.map((q, idx) => {
                            const qNumber =
                                parts
                                    .slice(0, currentPartIndex)
                                    .reduce((acc, part) => acc + part.questions.length, 0) +
                                idx +
                                1;
                            return (
                                <SpeakingQuestion
                                    key={q.id}
                                    question={q}
                                    answer={answers[q.id] || ""}
                                    onAnswerChange={(value) => setAnswer(q.id, value)}
                                    questionNumber={qNumber}
                                    partTimeLimit={currentPart?.timeLimit}
                                    isSubmitted={!!currentAssignment?.submission?.submittedAt}
                                />
                            );
                        })}
                    </div>
                );

            default:
                return (
                    <WritingQuestion
                        question={currentQuestion}
                        answer={answers[currentQuestion.id] || ""}
                        onAnswerChange={(value) => setAnswer(currentQuestion.id, value)}
                    />
                );
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
                        <Skeleton className="h-[calc(100vh-200px)]" />
                        <div className="space-y-4">
                            <Skeleton className="h-32" />
                            <Skeleton className="h-64" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Part Title Bar */}
                {currentPart && (
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {currentPart.title}
                            </h2>
                            {currentPart.description && (
                                <p className="text-muted-foreground mt-1">
                                    {currentPart.description}
                                </p>
                            )}
                        </div>
                        {currentAssignment?.skill === IeltsSkill.SPEAKING && (
                            <Timer />
                        )}
                        {currentAssignment?.skill === IeltsSkill.WRITING && (
                            <WritingTimer isSubmitted={!!currentAssignment?.submission?.submittedAt} />
                        )}
                    </div>
                )}

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                    {/* Left Sidebar - Question List */}
                    <div className="hidden lg:block">
                        <QuestionSidebar />
                    </div>

                    {/* Right Content - Question */}
                    <div className="min-h-[calc(100vh-300px)]">
                        {renderQuestion()}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}
