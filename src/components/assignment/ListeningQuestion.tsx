"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Question } from "@/store/assignment-session.store";

interface ListeningQuestionProps {
    question: Question;
    answer: string;
    onAnswerChange: (value: string) => void;
    questionNumber: number;
}

export function ListeningQuestion({
    question,
    answer,
    onAnswerChange,
    questionNumber
}: ListeningQuestionProps) {

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
                                <RadioGroupItem value={option} id={`listen-opt-${index}`} />
                                <Label
                                    htmlFor={`listen-opt-${index}`}
                                    className="flex-1 cursor-pointer font-normal"
                                >
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case "fill_blank":
                return (
                    <Input
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here"
                        className="max-w-md"
                    />
                );

            default:
                return (
                    <Input
                        value={answer || ""}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here"
                        className="max-w-md"
                    />
                );
        }
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium leading-relaxed">
                    <span className="text-primary font-semibold mr-2">
                        {questionNumber}.
                    </span>
                    {question.prompt}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderQuestionInput()}
            </CardContent>
        </Card>
    );
}
