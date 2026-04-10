/**
 * Inspector Panel
 * Right sidebar for editing properties of selected items
 */

"use client";

// useState removed - not needed
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAssignmentBuilderStore,
} from "@/store/assignment-builder.store";
import {
  FileText,
  HelpCircle,
  LayoutGrid,
  Settings,
  Type,
} from "lucide-react";
import { QuestionType, Question } from "@/types/assignment-builder";
import { getQuestionConfig } from "@/lib/assignment-builder/question-config";

export function InspectorPanel() {
  const { selectedId, assignment, updateAssignment, updateSection, updateQuestion, updatePassage } = useAssignmentBuilderStore();

  if (!selectedId || !assignment) {
    return (
      <div className="w-80 border-l bg-card flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-2">
            Nothing Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Click on an item in the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  // Find selected item based on ID
  const getSelectedItem = () => {
    if (selectedId === assignment.id) {
      return { type: "assignment" as const, item: assignment };
    }
    for (const section of assignment.sections) {
      if (section.id === selectedId) {
        return { type: "section" as const, item: section };
      }
      if (section.passage?.id === selectedId) {
        return { type: "passage" as const, item: section.passage, sectionId: section.id };
      }
      const question = section.questions.find(q => q.id === selectedId);
      if (question) {
        return { type: "question" as const, item: question, sectionId: section.id };
      }
    }
    return { type: null, item: null } as const;
  };

  const selected = getSelectedItem();

  if (!selected || selected.type === null) {
    return (
      <div className="w-80 border-l bg-card flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-2">
            Nothing Selected
          </h3>
          <p className="text-sm text-muted-foreground">
            Click on an item in the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const renderInspector = () => {
    switch (selected.type) {
      case "assignment":
        return (
          <AssignmentInspector
            assignment={selected.item as { title: string; description?: string; totalTime: number; totalPoints: number; instructions?: string }}
            onUpdate={updateAssignment}
          />
        );
      case "section":
        return (
          <SectionInspector
            section={selected.item as { title: string; description?: string; partNumber: number; timeLimit?: number }}
            onUpdate={(updates) => updateSection(selectedId, updates)}
          />
        );
      case "passage":
        return (
          <PassageInspector
            passage={selected.item as { title: string; content?: string; source?: string; wordCount?: number }}
            onUpdate={(updates) => selected.sectionId && updatePassage(selected.sectionId, updates)}
          />
        );
      case "question":
        return (
          <QuestionInspector
            question={selected.item as Question}
            onUpdate={(updates) => selected.sectionId && updateQuestion(selected.sectionId, selectedId, updates as Partial<Question>)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          {selected.type === "assignment" && <LayoutGrid className="h-4 w-4" />}
          {selected.type === "section" && <FileText className="h-4 w-4" />}
          {selected.type === "passage" && <FileText className="h-4 w-4" />}
          {selected.type === "question" && <HelpCircle className="h-4 w-4" />}
          <h2 className="font-semibold text-sm capitalize">
            {selected.type} Properties
          </h2>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderInspector()}
        </div>
      </ScrollArea>
    </div>
  );
}

// Assignment Inspector
interface AssignmentInspectorProps {
  assignment: {
    title: string;
    description?: string;
    totalTime: number;
    totalPoints: number;
    instructions?: string;
  };
  onUpdate: (updates: Partial<AssignmentInspectorProps['assignment']>) => void;
}

function AssignmentInspector({ assignment, onUpdate }: AssignmentInspectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Assignment Title</Label>
        <Input
          id="title"
          value={assignment.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter assignment title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={assignment.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter assignment description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="time">Time Limit (min)</Label>
          <Input
            id="time"
            type="number"
            value={assignment.totalTime}
            onChange={(e) => onUpdate({ totalTime: parseInt(e.target.value) || 0 })}
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Total Points</Label>
          <Input
            id="points"
            type="number"
            value={assignment.totalPoints}
            onChange={(e) => onUpdate({ totalPoints: parseInt(e.target.value) || 0 })}
            min={1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={assignment.instructions || ""}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          placeholder="Enter instructions for students"
          rows={4}
        />
      </div>
    </div>
  );
}

// Section Inspector
interface SectionInspectorProps {
  section: {
    title: string;
    description?: string;
    partNumber: number;
    timeLimit?: number;
  };
  onUpdate: (updates: Partial<SectionInspectorProps['section']>) => void;
}

function SectionInspector({ section, onUpdate }: SectionInspectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="section-title">Section Title</Label>
        <Input
          id="section-title"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter section title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="section-desc">Description</Label>
        <Textarea
          id="section-desc"
          value={section.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter section description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="part-number">Part Number</Label>
        <Input
          id="part-number"
          type="number"
          value={section.partNumber}
          onChange={(e) => onUpdate({ partNumber: parseInt(e.target.value) || 1 })}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="section-time">Time Limit (min)</Label>
        <Input
          id="section-time"
          type="number"
          value={section.timeLimit || ""}
          onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || undefined })}
          placeholder="Optional"
          min={1}
        />
      </div>
    </div>
  );
}

// Passage Inspector
interface PassageInspectorProps {
  passage: {
    title: string;
    content?: string;
    source?: string;
    wordCount?: number;
    audioUrl?: string;
    audioDuration?: number;
  };
  onUpdate: (updates: Partial<PassageInspectorProps['passage']>) => void;
}

function PassageInspector({ passage, onUpdate }: PassageInspectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="passage-title">Passage Title</Label>
        <Input
          id="passage-title"
          value={passage.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter passage title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="passage-content">Content</Label>
        <Textarea
          id="passage-content"
          value={passage.content || ""}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Enter passage content"
          rows={10}
        />
        <p className="text-xs text-muted-foreground">
          Word count: {passage.wordCount || 0}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          value={passage.source || ""}
          onChange={(e) => onUpdate({ source: e.target.value })}
          placeholder="e.g., Cambridge IELTS 17"
        />
      </div>
    </div>
  );
}

// Question Inspector
interface QuestionInspectorProps {
  question: {
    type: QuestionType;
    questionNumber: number;
    instructions?: string;
    questionText?: string;
    points: number;
    config: Record<string, unknown>;
  };
  onUpdate: (updates: Partial<QuestionInspectorProps['question']>) => void;
}

function QuestionInspector({ question, onUpdate }: QuestionInspectorProps) {
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
            onChange={(e) => onUpdate({ questionNumber: parseInt(e.target.value) || 1 })}
            min={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={question.points}
            onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
            min={1}
          />
        </div>
      </div>

      <Separator />

      {/* Type-specific configuration */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Configuration</h4>
        <QuestionConfigEditor
          type={question.type}
          config={question.config}
          onUpdate={(config) => onUpdate({ config })}
        />
      </div>
    </div>
  );
}

// Question Configuration Editor
interface QuestionConfigEditorProps {
  type: QuestionType;
  config: Record<string, unknown>;
  onUpdate: (config: Record<string, unknown>) => void;
}

function QuestionConfigEditor({ type, config, onUpdate }: QuestionConfigEditorProps) {
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
            {(config.options as string[] || ["A", "B", "C", "D"]).map((option: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(config.options as string[] || [])];
                    newOptions[idx] = e.target.value;
                    updateField("options", newOptions);
                  }}
                  placeholder={`Option ${idx + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Input
              value={config.correctAnswer as string || ""}
              onChange={(e) => updateField("correctAnswer", e.target.value)}
              placeholder="Enter correct answer"
            />
          </div>
        </div>
      );

    case QuestionType.TRUE_FALSE_NOT_GIVEN:
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Statements</Label>
            {(config.statements as { id: string; text: string; correctAnswer: string }[] || []).map((stmt, idx) => (
              <div key={stmt.id} className="space-y-2 p-2 bg-muted rounded">
                <Input
                  value={stmt.text}
                  onChange={(e) => {
                    const newStatements = [...(config.statements as { id: string; text: string; correctAnswer: string }[] || [])];
                    newStatements[idx].text = e.target.value;
                    updateField("statements", newStatements);
                  }}
                  placeholder="Enter statement"
                />
                <Select
                  value={stmt.correctAnswer}
                  onValueChange={(value) => {
                    const newStatements = [...(config.statements as { id: string; text: string; correctAnswer: string }[] || [])];
                    newStatements[idx].correctAnswer = value;
                    updateField("statements", newStatements);
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

    case QuestionType.SENTENCE_COMPLETION:
    case QuestionType.SUMMARY_COMPLETION:
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Completion Text</Label>
            <Textarea
              value={config.text as string || ""}
              onChange={(e) => updateField("text", e.target.value)}
              placeholder="Enter text with blanks (use _____________ for blanks)"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Word Limit</Label>
            <Input
              type="number"
              value={config.wordLimit as number || 3}
              onChange={(e) => updateField("wordLimit", parseInt(e.target.value) || 3)}
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
              value={config.wordLimit as number || 3}
              onChange={(e) => updateField("wordLimit", parseInt(e.target.value) || 3)}
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
