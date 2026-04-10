/**
 * Builder Canvas
 * Center canvas for building the assignment with drop zones
 */

"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getQuestionConfig } from "@/lib/assignment-builder/question-config";

interface BuilderCanvasProps {
  isPreview?: boolean;
}

export function BuilderCanvas({ isPreview }: BuilderCanvasProps) {
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
    } else if (item.type === "passage" && sectionId) {
      addPassage(sectionId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
      {/* Canvas Header */}
      <div className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-sm">{assignment.title}</h2>
          <Badge variant="secondary" className="text-xs">
            {getTotalQuestions()} questions
          </Badge>
        </div>
        {!isPreview && (
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        )}
      </div>

      {/* Canvas Content */}
      <ScrollArea className="flex-1">
        <div
          ref={canvasRef}
          className="p-6 space-y-4 min-h-[calc(100vh-200px)]"
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
                onSelect={() => selectItem(section.id)}
                onDelete={() => deleteSection(section.id)}
                onDrop={(e) => handleCanvasDrop(e, section.id)}
                onDragOver={handleDragOver}
                _onAddQuestion={(type) => addQuestion(section.id, type)}
                _onAddPassage={() => addPassage(section.id)}
                _onUpdate={(updates) => updateSection(section.id, updates)}
              />
            ))
          )}
        </div>
      </ScrollArea>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _onAddQuestion: (type: any) => void;
  _onAddPassage: () => void;
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
  _onAddQuestion,
  _onAddPassage,
  _onUpdate,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader
        className="py-3 px-4 cursor-pointer hover:bg-muted/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle className="text-base font-medium">
              {section.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {section.questions.length} questions
            </Badge>
          </div>
          {!isPreview && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
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
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 mb-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={_onAddPassage}
            >
              <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to add passage
              </p>
            </div>
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

            {/* Add Question Drop Zone */}
            {!isPreview && (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
                onDragOver={onDragOver}
                onDrop={onDrop}
              >
                <HelpCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop question type here
                </p>
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

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        "hover:border-primary/50 transition-colors cursor-pointer"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <span className="text-sm font-medium">{question.questionNumber}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {question.questionText || config?.label || "Untitled Question"}
        </p>
        <p className="text-xs text-muted-foreground">{config?.description}</p>
      </div>
      {!isPreview && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}
