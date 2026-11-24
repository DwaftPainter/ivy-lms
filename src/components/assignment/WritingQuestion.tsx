"use client";

import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Question, useAssignmentSessionStore } from "@/store/assignment-session.store";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CheckCircle2, User } from "lucide-react";
import { AICorrectionsModal } from "./AICorrectionsModal";
import Image from "next/image";

interface WritingQuestionProps {
    question: Question;
    answer: string;
    onAnswerChange: (value: string) => void;
    teacherFeedback?: string;
    assignmentId?: string;
    isSubmitted?: boolean;
}

export function WritingQuestion({
    question,
    answer,
    onAnswerChange,
    teacherFeedback,
    assignmentId,
    isSubmitted
}: WritingQuestionProps) {
    const [wordCount, setWordCount] = useState(0);
    const [showAICorrections, setShowAICorrections] = useState(false);

    const { aiGrading, isAIGrading, teacherRegradeRequested, requestTeacherRegrade, isSubmitting } =
        useAssignmentSessionStore();

    const countWords = useCallback((text: string) => {
        return text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    }, []);

    useEffect(() => {
        setWordCount(countWords(answer));
    }, [answer, countWords]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        onAnswerChange(value);
        setWordCount(countWords(value));
    };

    const handleRequestRegrade = async () => {
        if (!assignmentId) return;
        await requestTeacherRegrade(assignmentId);
    };

    const isUnderMinWords = question.minWords && wordCount < question.minWords;
    const isOverMaxWords = question.maxWords && wordCount > question.maxWords;

    // Check if AI is still grading (submitted but no results yet)
    const isAIGradingInProgress = isSubmitted && !aiGrading && isAIGrading;
    const hasAIGrading = isSubmitted && aiGrading;

    return (
        <div className="space-y-6">
            {/* Question Prompt */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-foreground">
                        Complete the essay
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-3">{question.prompt}</p>
                    {question.imageUrl && (
                        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={question.imageUrl}
                                alt="Writing analytics chart"
                                fill
                                className="object-contain"
                                unoptimized={!question?.imageUrl?.startsWith("/")}
                            />
                        </div>
                    )}
                    {question.minWords && question.maxWords && (
                        <p className="text-sm text-muted-foreground mt-4">
                            Write at least {question.minWords} and at most {question.maxWords} words.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Answer Area */}
            <div className="space-y-3">
                <Textarea
                    value={answer || ""}
                    onChange={handleChange}
                    placeholder="Fill in this field"
                    disabled={isSubmitted}
                    className={cn(
                        "min-h-[250px] max-h-[500px] resize-y text-base leading-relaxed",
                        "focus-visible:ring-primary/50 focus-visible:border-primary",
                        "placeholder:text-muted-foreground/50",
                        isSubmitted && "bg-muted/50"
                    )}
                />

                {/* Word Count */}
                <div className="flex items-center justify-between text-sm">
                    <span
                        className={cn(
                            "font-medium",
                            isUnderMinWords && "text-destructive",
                            isOverMaxWords && "text-destructive"
                        )}
                    >
                        Count: {wordCount}
                    </span>
                    {question.minWords && (
                        <span className="text-muted-foreground">Min: {question.minWords}</span>
                    )}
                </div>

                {/* Validation Messages */}
                {(isUnderMinWords || isOverMaxWords) && (
                    <p className="text-sm text-destructive">
                        {isUnderMinWords
                            ? `Your essay is below the minimum word count (${question.minWords} words)`
                            : `Your essay exceeds the maximum word count (${question.maxWords} words)`}
                    </p>
                )}
            </div>

            {/* AI Grading Section - Show after submission */}
            {isSubmitted && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary" />
                                <CardTitle className="text-lg font-semibold">AI Grading</CardTitle>
                            </div>
                            {hasAIGrading && (
                                <Badge variant="default" className="text-lg px-3 py-1">
                                    {aiGrading.score.toFixed(1)} / 9.0
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isAIGradingInProgress ? (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Loader2 className="size-5 animate-spin" />
                                <span>AI is grading your submission...</span>
                            </div>
                        ) : hasAIGrading ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="size-5" />
                                    <span>Grading completed</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAICorrections(true)}
                                        className="gap-2"
                                    >
                                        <Sparkles className="size-4" />
                                        View details
                                    </Button>

                                    {!teacherRegradeRequested ? (
                                        <Button
                                            variant="secondary"
                                            onClick={handleRequestRegrade}
                                            disabled={isSubmitting}
                                            className="gap-2"
                                        >
                                            <User className="size-4" />
                                            Request teacher review
                                        </Button>
                                    ) : (
                                        <Badge variant="outline" className="gap-1 px-3 py-1">
                                            <User className="size-3" />
                                            Review requested
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                AI grading failed. Please try again later.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Teacher Comments Section */}
            {teacherFeedback && (
                <Card className="bg-muted/30 border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Teacher&apos;s Comments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-background rounded-lg p-4 min-h-[120px]">
                            <p className="text-foreground whitespace-pre-wrap">{teacherFeedback}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* AI Corrections Modal */}
            <AICorrectionsModal
                isOpen={showAICorrections}
                onClose={() => setShowAICorrections(false)}
                essay={answer || ""}
                aiGrading={aiGrading}
                onRequestRegrade={handleRequestRegrade}
                teacherRegradeRequested={teacherRegradeRequested}
                isLoadingRegrade={isSubmitting}
            />
        </div>
    );
}
