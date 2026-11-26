/**
 * Builder Canvas
 * Center canvas for building the assignment with drop zones
 */

"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useAssignmentBuilderStore,
} from "@/store/assignment-builder.store";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FileText,
  Headphones,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import { QuestionType } from "@/types/assignment-builder";
import { getQuestionConfig, questionTypeConfig } from "@/lib/assignment-builder/question-config";

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
    updateSection,
    getTotalQuestions,
  } = useAssignmentBuilderStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const prevAssignmentIdRef = useRef<string | null>(null);
  const prevQuestionIdsRef = useRef<Set<string>>(new Set());

  // Move focus meaningfully to newly inserted question regardless of insertion path
  useEffect(() => {
    if (!assignment) return;

    const currentIds = new Set<string>();
    for (const section of assignment.sections) {
      for (const question of section.questions) {
        currentIds.add(question.id);
      }
    }

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
      {/* Canvas Header */}
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

      {/* Canvas Content */}
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
                  _onUpdate={(updates) => updateSection(section.id, updates)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

interface EmptyCanvasProps {
  onDrop: (e: React.DragEvent) => void;
}

function EmptyCanvas({ onDrop }: EmptyCanvasProps) {
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

interface SectionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  section: any;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onUpdate: (updates: any) => void;
}

function SectionCard({
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
  onAddPassage,
  _onUpdate,
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
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
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
          {/* Passage / Audio */}
          {section.passage ? (
            <PassageCard
              passage={section.passage}
              isPreview={isPreview}
            />
          ) : !isPreview ? (
            <button
              type="button"
              className="w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 mb-4 text-center cursor-pointer hover:border-primary/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={onAddPassage}
            >
              <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">
                Add passage
              </span>
            </button>
          ) : null}

          {/* Questions */}
          <div className="space-y-2">
            {section.questions.map((question: { id: string; type: QuestionType; questionNumber: number; questionText: string }, idx: number) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={idx}
                isPreview={isPreview}
              />
            ))}

            {/* Add Question Drop Zone + Keyboard/Click Insertion */}
            {!isPreview && (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors space-y-2"
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                <HelpCircle className="h-5 w-5 mx-auto text-muted-foreground" aria-hidden="true" />
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
                        const latestQuestion = section.questions[section.questions.length - 1];
                        if (latestQuestion) {
                          requestAnimationFrame(() => {
                            document
                              .querySelector<HTMLButtonElement>(`[data-question-id="${latestQuestion.id}"]`)
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

interface PassageCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passage: any;
  isPreview?: boolean;
}

function PassageCard({ passage, isPreview: _isPreview }: PassageCardProps) {
  const isAudio = passage.audioUrl !== undefined;

  return (
    <div className="bg-muted/50 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        {isAudio ? (
          <Headphones className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="font-medium text-sm">{passage.title}</span>
      </div>
      <div className="text-sm text-muted-foreground line-clamp-3">
        {passage.content || "No content yet..."}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  question: any;
  index: number;
  isPreview?: boolean;
}

function QuestionCard({ question, isPreview }: QuestionCardProps) {
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
        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
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
