"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/store/assignment-session.store";
import { cn } from "@/lib/utils";

interface WritingQuestionProps {
    question: Question;
    answer: string;
    onAnswerChange: (value: string) => void;
    teacherFeedback?: string;
}

export function WritingQuestion({ question, answer, onAnswerChange, teacherFeedback }: WritingQuestionProps) {
    const [wordCount, setWordCount] = useState(0);

    const countWords = useCallback((text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        onAnswerChange(value);
        setWordCount(countWords(value));
    };

    const isUnderMinWords = question.minWords && wordCount < question.minWords;
    const isOverMaxWords = question.maxWords && wordCount > question.maxWords;

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
                    <p className="text-muted-foreground leading-relaxed">
                        {question.prompt}
                    </p>
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
                    className={cn(
                        "min-h-[250px] resize-none text-base leading-relaxed",
                        "focus-visible:ring-primary/50 focus-visible:border-primary",
                        "placeholder:text-muted-foreground/50"
                    )}
                />

                {/* Word Count */}
                <div className="flex items-center justify-between text-sm">
                    <span className={cn(
                        "font-medium",
                        isUnderMinWords && "text-destructive",
                        isOverMaxWords && "text-destructive"
                    )}>
                        Count: {wordCount}
                    </span>
                    {question.minWords && (
                        <span className="text-muted-foreground">
                            Min: {question.minWords}
                        </span>
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
                            <p className="text-foreground whitespace-pre-wrap">
                                {teacherFeedback}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
