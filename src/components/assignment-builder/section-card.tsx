"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getQuestionConfig, questionTypeConfig } from "@/lib/assignment-builder/question-config";
import { cn } from "@/lib/utils";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import {
    QuestionType,
    type Passage,
    type Question,
    type Section
} from "@/types/assignment-builder";
import {
    ChevronDown,
    ChevronRight,
    FileText,
    GripVertical,
    Headphones,
    HelpCircle,
    MoreHorizontal,
    Plus,
    Trash2
} from "lucide-react";

interface SectionCardProps {
    section: Section;
    isExpanded: boolean;
    isSelected: boolean;
    isPreview?: boolean;
    onToggleExpand: () => void;
    onSelect: () => void;
    onDelete: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onAddQuestion: (type: QuestionType) => void;
    onAddPassage: () => void;
}

export function SectionCard({
    section,
    isExpanded,
    isSelected,
    isPreview,
    onToggleExpand,
    onSelect,
    onDelete,
    onDrop,
    onDragOver,
    onAddQuestion,
    onAddPassage
}: SectionCardProps) {
    const insertedFromMenuRef = useRef(false);

    return (
        <Card
            className={cn(
                "transition-all duration-200",
                isSelected && "ring-2 ring-primary ring-offset-2"
            )}
        >
            <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        aria-expanded={isExpanded}
                        className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-left rounded-md py-1 px-1 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <GripVertical
                            className="h-4 w-4 text-muted-foreground shrink-0"
                            aria-hidden="true"
                        />
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                        ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        <CardTitle className="text-base font-medium truncate">
                            {section.title}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0">
                            {section.questions.length} questions
                        </Badge>
                    </button>
                    {!isPreview && (
                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Edit ${section.title} properties`}
                                onClick={onSelect}
                            >
                                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                aria-label={`Delete ${section.title}`}
                                onClick={onDelete}
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0 pb-4">
                    {section.passage ? (
                        <PassageCard passage={section.passage} />
                    ) : !isPreview ? (
                        <button
                            type="button"
                            className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 mb-4 text-center cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={onAddPassage}
                        >
                            <FileText
                                className="h-5 w-5 mx-auto mb-2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="text-sm text-muted-foreground">Add passage</span>
                        </button>
                    ) : null}

                    <div className="space-y-2">
                        {section.questions.map((question) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                isPreview={isPreview}
                            />
                        ))}

                        {!isPreview && (
                            <div
                                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors space-y-2"
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                            >
                                <HelpCircle
                                    className="h-5 w-5 mx-auto text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Drop question type here or choose a type
                                </p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button type="button" variant="outline" size="sm">
                                            <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                                            Add Question
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="center"
                                        className="w-64 max-h-72 overflow-y-auto"
                                        onCloseAutoFocus={(e) => {
                                            if (insertedFromMenuRef.current) {
                                                e.preventDefault();
                                                insertedFromMenuRef.current = false;
                                                const latestQuestion =
                                                    section.questions[section.questions.length - 1];
                                                if (latestQuestion) {
                                                    requestAnimationFrame(() => {
                                                        document
                                                            .querySelector<HTMLButtonElement>(
                                                                `[data-question-id="${latestQuestion.id}"]`
                                                            )
                                                            ?.focus();
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <DropdownMenuLabel>
                                            Insert into {section.title}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {questionTypeConfig.map((qt) => (
                                            <DropdownMenuItem
                                                key={qt.id}
                                                onSelect={() => {
                                                    if (qt.questionType) {
                                                        insertedFromMenuRef.current = true;
                                                        onAddQuestion(qt.questionType);
                                                    }
                                                }}
                                            >
                                                {qt.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

function PassageCard({ passage }: { passage: Passage }) {
    const isAudio = passage.audioUrl !== undefined;

    return (
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
                {isAudio ? <Headphones className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span className="font-medium text-sm">{passage.title}</span>
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3">
                {passage.content || "No content yet..."}
            </div>
        </div>
    );
}

function QuestionCard({ question, isPreview }: { question: Question; isPreview?: boolean }) {
    const config = getQuestionConfig(question.type);
    const { selectedId, selectItem } = useAssignmentBuilderStore();
    const isSelected = selectedId === question.id;

    return (
        <div
            className={cn(
                "flex items-center gap-2 p-2 rounded-lg border bg-card",
                "hover:border-primary/50 transition-colors",
                isSelected && "ring-2 ring-primary ring-offset-2"
            )}
        >
            <button
                type="button"
                data-question-id={question.id}
                onClick={() => selectItem(question.id)}
                className="flex flex-1 min-w-0 items-center gap-3 p-1 text-left rounded-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <GripVertical
                    className="h-4 w-4 text-muted-foreground shrink-0"
                    aria-hidden="true"
                />
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">{question.questionNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {question.questionText || config?.label || "Untitled Question"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{config?.description}</p>
                </div>
            </button>
            {!isPreview && (
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label={`Delete question ${question.questionNumber}`}
                    >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
                    </Button>
                </div>
            )}
        </div>
    );
}
