"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Question } from "@/store/assignment-session.store";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadingQuestionProps {
    question: Question;
    answer: string;
    onAnswerChange: (value: string) => void;
    questionNumber: number;
}

export function ReadingQuestion({ question, answer, onAnswerChange, questionNumber }: ReadingQuestionProps) {
    const [showHint, setShowHint] = useState(false);

    const renderQuestionInput = () => {
        switch (question.type) {
            case "multiple_choice":
                return (
                    <RadioGroup
                        value={answer || ""}
                        onValueChange={onAnswerChange}
                        className="space-y-2"
                    >
                        {question.options?.map((option, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                                    "hover:bg-muted/50 cursor-pointer",
                                    answer === option && "border-primary bg-primary/5"
                                )}
                            >
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label
                                    htmlFor={`option-${index}`}
                                    className="flex-1 cursor-pointer font-normal"
                                >
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "true_false":
                return (
                    <RadioGroup
                        value={answer || ""}
                        onValueChange={onAnswerChange}
                        className="flex gap-4"
                    >
                        {["True", "False", "Not Given"].map((option) => (
                            <div
                                key={option}
                                className={cn(
                                    "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
                                    "hover:bg-muted/50 cursor-pointer",
                                    answer === option && "border-primary bg-primary/5"
                                )}
                            >
                                <RadioGroupItem value={option} id={`tf-${option}`} />
                                <Label htmlFor={`tf-${option}`} className="cursor-pointer font-normal">
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "fill_blank":
                return (
                    <div className="space-y-4">
                        <Input
                            value={answer || ""}
                            onChange={(e) => onAnswerChange(e.target.value)}
                            aria-label={`Answer for question ${questionNumber}`}
                            placeholder="Type your answer here"
                            className="max-w-md"
                        />
                    </div>
                );

            case "matching":
                return (
                    <select
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        aria-label={`Answer for question ${questionNumber}`}
                        className="w-full max-w-md p-2 rounded-md border border-input bg-background"
                    >
                        <option value="">Select an answer</option>
                        {question.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <Textarea
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        aria-label={`Answer for question ${questionNumber}`}
                        placeholder="Type your answer here"
                        className="min-h-[120px]"
                    />
                );
        }
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-medium leading-relaxed">
                            <span className="text-primary font-semibold mr-2">
                                {questionNumber}.
                            </span>
                            {question.prompt}
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowHint(!showHint)}
                        aria-label={showHint ? "Hide passage hint" : "Show passage hint"}
                        aria-expanded={showHint}
                        className={cn(
                            "shrink-0",
                            showHint && "text-primary"
                        )}
                    >
                        <Eye className="size-4" aria-hidden="true" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderQuestionInput()}

                {showHint && question.passage && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Relevant passage:</p>
                        {question.passage}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Need to import Textarea for default case
import { Textarea } from "@/components/ui/textarea";
