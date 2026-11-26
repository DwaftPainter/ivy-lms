"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function BottomNavigation() {
    const {
        parts,
        currentPartIndex,
        currentQuestionIndex,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        answers
    } = useAssignmentSessionStore();

    const currentPart = parts[currentPartIndex];
    const totalQuestions = currentPart?.questions.length || 0;
    const isFirstQuestion = currentQuestionIndex === 0 && currentPartIndex === 0;
    const isLastQuestion =
        currentQuestionIndex === totalQuestions - 1 &&
        currentPartIndex === parts.length - 1;

    const getQuestionStatus = (partIdx: number, qIdx: number) => {
        const question = parts[partIdx]?.questions[qIdx];
        if (!question) return "unanswered";
        const answer = answers[question.id];
        return answer && answer.trim().length > 0 ? "answered" : "unanswered";
    };

    return (
        <nav
            aria-label="Question navigation"
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 sm:p-4 z-40"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={isFirstQuestion}
                    aria-label="Previous question"
                    className="gap-1 shrink-0"
                >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Part Navigation */}
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 overflow-x-auto">
                    {parts.map((part, partIdx) => {
                        const isActive = currentPartIndex === partIdx;

                        return (
                            <div key={part.id} className="flex items-center">
                                {/* Part Indicator */}
                                <button
                                    type="button"
                                    onClick={() => goToQuestion(partIdx, 0)}
                                    aria-label={`${part.title} (${part.questions.length} ${part.questions.length === 1 ? "question" : "questions"})`}
                                    aria-current={isActive ? "step" : undefined}
                                    className={cn(
                                        "flex flex-col items-center gap-1 px-2 sm:px-3 py-1 rounded-lg transition-colors shrink-0",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <span className="text-xs font-medium hidden sm:block">
                                        {part.title}
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold min-w-[24px] h-6 flex items-center justify-center rounded-full",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted-foreground/20 text-muted-foreground"
                                    )}>
                                        {partIdx + 1}
                                    </span>
                                    {/* Progress dots for questions in this part */}
                                    <div className="flex gap-0.5 mt-1">
                                        {part.questions.map((_, qIdx) => {
                                            const status = getQuestionStatus(partIdx, qIdx);
                                            const isCurrent =
                                                currentPartIndex === partIdx &&
                                                currentQuestionIndex === qIdx;

                                            return (
                                                <div
                                                    key={qIdx}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        isCurrent && "ring-1 ring-primary ring-offset-1",
                                                        status === "answered"
                                                            ? "bg-green-500"
                                                            : "bg-muted-foreground/30",
                                                        isActive && status !== "answered" && "bg-primary/30"
                                                    )}
                                                />
                                            );
                                        })}
                                    </div>
                                </button>

                                {/* Separator between parts */}
                                {partIdx < parts.length - 1 && (
                                    <div className="w-px h-8 bg-border mx-1 sm:mx-2" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Next Button */}
                <Button
                    variant={isLastQuestion ? "default" : "outline"}
                    onClick={nextQuestion}
                    disabled={isLastQuestion}
                    aria-label="Next question"
                    className="gap-1 shrink-0"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
            </div>
        </nav>
    );
}
