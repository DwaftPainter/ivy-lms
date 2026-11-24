"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";

interface QuestionSidebarProps {
    isCollapsed?: boolean;
}

export function QuestionSidebar({ isCollapsed }: QuestionSidebarProps) {
    const {
        parts,
        currentPartIndex,
        currentQuestionIndex,
        answers,
        goToQuestion
    } = useAssignmentSessionStore();

    const [expandedParts, setExpandedParts] = useState<Set<number>>(
        new Set([currentPartIndex])
    );

    const togglePart = (index: number) => {
        setExpandedParts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const isQuestionAnswered = (questionId: string) => {
        const answer = answers[questionId];
        return answer && answer.trim().length > 0;
    };

    if (isCollapsed) {
        return (
            <div className="w-12 bg-card border-r border-border flex flex-col items-center py-4 gap-2">
                {parts.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToQuestion(index, 0)}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            currentPartIndex === index
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <Card className="h-full border-0 rounded-none bg-muted/30">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Question List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-200px)]">
                    <div className="px-4 pb-4 space-y-2">
                        {parts.map((part, partIndex) => {
                            const isExpanded = expandedParts.has(partIndex);
                            const isActive = currentPartIndex === partIndex;

                            return (
                                <div
                                    key={part.id}
                                    className={cn(
                                        "rounded-lg overflow-hidden",
                                        isActive && "bg-card shadow-sm"
                                    )}
                                >
                                    <button
                                        onClick={() => togglePart(partIndex)}
                                        className={cn(
                                            "w-full px-3 py-2 flex items-center justify-between text-left",
                                            "hover:bg-muted/50 transition-colors",
                                            isActive && "bg-card"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-medium text-sm",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {part.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {part.questions.length} question{part.questions.length !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isExpanded ? (
                                                <ChevronUp className="size-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Questions in this part */}
                                    {isExpanded && (
                                        <div className="px-2 pb-2 space-y-1">
                                            {part.questions.map((question, qIndex) => {
                                                const isCurrent =
                                                    currentPartIndex === partIndex &&
                                                    currentQuestionIndex === qIndex;
                                                const isAnswered = isQuestionAnswered(question.id);

                                                return (
                                                    <button
                                                        key={question.id}
                                                        onClick={() => goToQuestion(partIndex, qIndex)}
                                                        className={cn(
                                                            "w-full px-3 py-2 flex items-center gap-2 rounded-md text-left",
                                                            "transition-colors text-sm",
                                                            isCurrent
                                                                ? "bg-primary/10 text-primary font-medium"
                                                                : "hover:bg-muted/50 text-muted-foreground",
                                                            isAnswered && !isCurrent && "text-foreground"
                                                        )}
                                                    >
                                                        {isAnswered ? (
                                                            <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                                                        ) : (
                                                            <Circle className="size-4 shrink-0" />
                                                        )}
                                                        <span className="truncate flex-1">
                                                            Question {qIndex + 1}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
