"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getQuestionConfig } from "@/lib/assignment-builder/question-config";
import { QuestionType, type Question } from "@/types/assignment-builder";
import { Type } from "lucide-react";

interface QuestionInspectorProps {
    question: Question;
    onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionInspector({ question, onUpdate }: QuestionInspectorProps) {
    const config = getQuestionConfig(question.type);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Type className="h-4 w-4" />
                <span className="text-sm font-medium">{config?.label || question.type}</span>
            </div>

            <div className="space-y-2">
                <Label htmlFor="question-instructions">Instructions</Label>
                <Textarea
                    id="question-instructions"
                    value={question.instructions || ""}
                    onChange={(e) => onUpdate({ instructions: e.target.value })}
                    placeholder="Enter instructions for this question"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="question-text">Question Text</Label>
                <Textarea
                    id="question-text"
                    value={question.questionText || ""}
                    onChange={(e) => onUpdate({ questionText: e.target.value })}
                    placeholder="Enter the question text"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="question-number">Question #</Label>
                    <Input
                        id="question-number"
                        type="number"
                        value={question.questionNumber}
                        onChange={(e) =>
                            onUpdate({ questionNumber: parseInt(e.target.value, 10) || 1 })
                        }
                        min={1}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                        id="points"
                        type="number"
                        value={question.points}
                        onChange={(e) => onUpdate({ points: parseInt(e.target.value, 10) || 1 })}
                        min={1}
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <h4 className="font-medium text-sm">Configuration</h4>
                <QuestionConfigEditor
                    type={question.type}
                    config={question.config as Record<string, unknown>}
                    onUpdate={(nextConfig) =>
                        onUpdate({ config: nextConfig } as Partial<Question>)
                    }
                />
            </div>
        </div>
    );
}

function QuestionConfigEditor({
    type,
    config,
    onUpdate
}: {
    type: QuestionType;
    config: Record<string, unknown>;
    onUpdate: (config: Record<string, unknown>) => void;
}) {
    const updateField = (field: string, value: unknown) => {
        onUpdate({ ...config, [field]: value });
    };

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE_SINGLE:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            return (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Options</Label>
                        {((config.options as string[]) || ["A", "B", "C", "D"]).map(
                            (option, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Input
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [
                                                ...((config.options as string[]) || [])
                                            ];
                                            newOptions[idx] = e.target.value;
                                            updateField("options", newOptions);
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                </div>
                            )
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <Input
                            value={(config.correctAnswer as string) || ""}
                            onChange={(e) => updateField("correctAnswer", e.target.value)}
                            placeholder="Enter correct answer"
                        />
                    </div>
                </div>
            );

        case QuestionType.TRUE_FALSE_NOT_GIVEN: {
            const statements =
                (config.statements as { id: string; text: string; correctAnswer: string }[]) || [];
            return (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Statements</Label>
                        {statements.map((stmt, idx) => (
                            <div key={stmt.id} className="space-y-2 p-2 bg-muted rounded">
                                <Input
                                    value={stmt.text}
                                    onChange={(e) => {
                                        const next = statements.map((item, i) =>
                                            i === idx ? { ...item, text: e.target.value } : item
                                        );
                                        updateField("statements", next);
                                    }}
                                    placeholder="Enter statement"
                                />
                                <Select
                                    value={stmt.correctAnswer}
                                    onValueChange={(value) => {
                                        const next = statements.map((item, i) =>
                                            i === idx ? { ...item, correctAnswer: value } : item
                                        );
                                        updateField("statements", next);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">True</SelectItem>
                                        <SelectItem value="false">False</SelectItem>
                                        <SelectItem value="not_given">Not Given</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        case QuestionType.SENTENCE_COMPLETION:
        case QuestionType.SUMMARY_COMPLETION:
            return (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Completion Text</Label>
                        <Textarea
                            value={(config.text as string) || ""}
                            onChange={(e) => updateField("text", e.target.value)}
                            placeholder="Enter text with blanks (use _____________ for blanks)"
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Word Limit</Label>
                        <Input
                            type="number"
                            value={(config.wordLimit as number) || 3}
                            onChange={(e) =>
                                updateField("wordLimit", parseInt(e.target.value, 10) || 3)
                            }
                            min={1}
                        />
                    </div>
                </div>
            );

        case QuestionType.SHORT_ANSWER:
            return (
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>Word Limit</Label>
                        <Input
                            type="number"
                            value={(config.wordLimit as number) || 3}
                            onChange={(e) =>
                                updateField("wordLimit", parseInt(e.target.value, 10) || 3)
                            }
                            min={1}
                        />
                    </div>
                </div>
            );

        default:
            return (
                <div className="text-sm text-muted-foreground">
                    Configuration for this question type is managed in the canvas.
                </div>
            );
    }
}
