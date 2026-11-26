"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { collectQuestionIds } from "@/lib/assignment-builder/builder-helpers";
import { cn } from "@/lib/utils";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import type { QuestionType } from "@/types/assignment-builder";
import { Plus } from "lucide-react";
import { SectionCard } from "./section-card";

interface BuilderCanvasProps {
    isPreview?: boolean;
    onOpenInspector?: () => void;
}

export function BuilderCanvas({ isPreview, onOpenInspector }: BuilderCanvasProps) {
    const {
        assignment,
        selectedId,
        expandedSections,
        addSection,
        selectItem,
        toggleSectionExpanded,
        deleteSection,
        addQuestion,
        addPassage,
        getTotalQuestions
    } = useAssignmentBuilderStore();

    const canvasRef = useRef<HTMLDivElement>(null);
    const prevAssignmentIdRef = useRef<string | null>(null);
    const prevQuestionIdsRef = useRef<Set<string>>(new Set());

    // Move focus meaningfully to newly inserted question regardless of insertion path
    useEffect(() => {
        if (!assignment) return;

        const currentIds = collectQuestionIds(assignment);

        if (prevAssignmentIdRef.current !== assignment.id) {
            prevAssignmentIdRef.current = assignment.id;
            prevQuestionIdsRef.current = currentIds;
            return;
        }

        const newlyAddedId = Array.from(currentIds).find(
            (id) => !prevQuestionIdsRef.current.has(id)
        );
        prevQuestionIdsRef.current = currentIds;

        if (newlyAddedId && !isPreview) {
            const frame = requestAnimationFrame(() => {
                const target = canvasRef.current?.querySelector<HTMLButtonElement>(
                    `[data-question-id="${newlyAddedId}"]`
                );
                if (target && target.offsetParent !== null) {
                    target.focus();
                }
            });
            return () => cancelAnimationFrame(frame);
        }
    }, [assignment, isPreview]);

    if (!assignment) return null;

    const handleCanvasDrop = (e: React.DragEvent, sectionId?: string) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("application/json");
        if (!data) return;

        const item = JSON.parse(data);

        if (item.type === "section") {
            addSection();
        } else if (item.type === "question_type" && sectionId) {
            addQuestion(sectionId, item.questionType as QuestionType);
        } else if ((item.type === "passage" || item.type === "audio") && sectionId) {
            addPassage(sectionId);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="min-h-14 border-b bg-card px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <h2 className="font-semibold text-sm truncate">{assignment.title}</h2>
                    <Badge variant="secondary" className="text-xs shrink-0">
                        {getTotalQuestions()} questions
                    </Badge>
                </div>
                {!isPreview && (
                    <Button variant="outline" size="sm" onClick={addSection} className="shrink-0">
                        <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                        Add Section
                    </Button>
                )}
            </div>

            <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
                <ScrollArea className="h-full w-full overflow-y-auto [&_[data-slot=scroll-area-viewport]>div]:block!">
                    <div
                        ref={canvasRef}
                        className="p-3 sm:p-6 space-y-4 min-h-full min-w-0"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleCanvasDrop(e)}
                    >
                        {assignment.sections.length === 0 ? (
                            <EmptyCanvas onDrop={handleCanvasDrop} />
                        ) : (
                            assignment.sections.map((section) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    isExpanded={expandedSections.includes(section.id)}
                                    isSelected={selectedId === section.id}
                                    isPreview={isPreview}
                                    onToggleExpand={() => toggleSectionExpanded(section.id)}
                                    onSelect={() => {
                                        selectItem(section.id);
                                        onOpenInspector?.();
                                    }}
                                    onDelete={() => deleteSection(section.id)}
                                    onDrop={(e) => handleCanvasDrop(e, section.id)}
                                    onDragOver={handleDragOver}
                                    onAddQuestion={(type) => addQuestion(section.id, type)}
                                    onAddPassage={() => addPassage(section.id)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

function EmptyCanvas({ onDrop }: { onDrop: (e: React.DragEvent) => void }) {
    return (
        <div
            className={cn(
                "h-96 border-2 border-dashed rounded-lg flex flex-col items-center justify-center",
                "border-muted-foreground/25 hover:border-muted-foreground/50",
                "transition-colors duration-200"
            )}
            onDrop={onDrop}
        >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-muted-foreground mb-2">
                Start Building Your Assignment
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
                Drag components from the library or click &quot;Add Section&quot; to begin
            </p>
        </div>
    );
}
