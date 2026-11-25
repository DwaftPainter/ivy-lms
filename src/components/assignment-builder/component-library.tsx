/**
 * Component Library Panel
 * Left sidebar with draggable components for building assignments
 */

"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  componentLibrary,
  questionTypeConfig,
} from "@/lib/assignment-builder/question-config";
import { ComponentCategory, QuestionType } from "@/types/assignment-builder";
import { IeltsSkill } from "@/generated/prisma/enums";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import { toast } from "sonner";
import {
  Layers,
  FileText,
  Headphones,
  Search,
  GripVertical,
  CircleDot,
  SquareCheck,
  List,
  Link,
  GitCompare,
  TextCursor,
  BookOpen,
  Scale,
  ThumbsUp,
  ClipboardList,
  Table,
  GitBranch,
  Map,
  Image as ImageIcon,
  MessageSquare,
  Plus,
} from "lucide-react";

interface ComponentLibraryPanelProps {
  skill: IeltsSkill;
  onItemInserted?: () => void;
}


export function ComponentLibraryPanel({ skill, onItemInserted }: ComponentLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chosenSectionId, setChosenSectionId] = useState<string>("");
  const [insertionNotice, setInsertionNotice] = useState<string | null>(null);

  const {
    assignment,
    selectedId,
    addSection,
    addPassage,
    addQuestion,
  } = useAssignmentBuilderStore();

  const sections = useMemo(() => assignment?.sections ?? [], [assignment?.sections]);

  // Resolve target section: explicit choice -> section owning selectedId -> first section
  const targetSectionId = useMemo(() => {
    if (chosenSectionId && sections.some((s) => s.id === chosenSectionId)) {
      return chosenSectionId;
    }
    if (selectedId) {
      const owningSection = sections.find(
        (s) =>
          s.id === selectedId ||
          s.passage?.id === selectedId ||
          s.questions.some((q) => q.id === selectedId)
      );
      if (owningSection) return owningSection.id;
    }
    return sections[0]?.id ?? "";
  }, [chosenSectionId, sections, selectedId]);

  const targetSection = sections.find((s) => s.id === targetSectionId);

  const filteredQuestions = questionTypeConfig.filter(
    (q) =>
      q.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInsertItem = (item: any, questionType?: string) => {
    if (item.type === "section") {
      addSection();
      setInsertionNotice(null);
      onItemInserted?.();
      return;
    }

    if (!targetSection) {
      const message = "Add a section first before inserting a passage or question.";
      setInsertionNotice(message);
      toast.error(message);
      return;
    }

    if (item.type === "passage" || item.type === "audio") {
      if (targetSection.passage) {
        const message = `${targetSection.title} already has a ${skill === IeltsSkill.LISTENING ? "recording" : "passage"}.`;
        setInsertionNotice(message);
        toast.error(message);
        return;
      }
      addPassage(targetSection.id);
      setInsertionNotice(null);
      onItemInserted?.();
      return;
    }

    if (item.type === "question_type" && questionType) {
      addQuestion(targetSection.id, questionType as QuestionType);
      setInsertionNotice(null);
      onItemInserted?.();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b shrink-0 space-y-3">
        <h2 className="font-semibold text-sm">Component Library</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label="Search components"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Target Section Selector for keyboard & click/tap insertion */}
        <div className="space-y-1.5">
          <Label htmlFor="library-target-section" className="text-xs text-muted-foreground">
            Insert into section
          </Label>
          {sections.length > 0 ? (
            <Select
              value={targetSectionId}
              onValueChange={(value) => {
                setChosenSectionId(value);
                setInsertionNotice(null);
              }}
            >
              <SelectTrigger id="library-target-section" className="h-8 w-full text-xs">
                <SelectValue placeholder="Choose a section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.title} ({section.questions.length} questions)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p
              role="status"
              className="text-xs text-muted-foreground bg-muted/60 rounded-md px-2.5 py-2"
            >
              Add a Section first to insert passages or questions.
            </p>
          )}
          {insertionNotice && (
            <p
              role="alert"
              className="text-xs text-destructive bg-destructive/10 rounded-md px-2.5 py-1.5"
            >
              {insertionNotice}
            </p>
          )}
        </div>
      </div>

      {/* Component Categories */}
      <ScrollArea className="flex-1 min-h-0 overflow-y-auto [&_[data-slot=scroll-area-viewport]>div]:block!">
        <div className="p-2 min-w-0">
          {/* Structure Section */}
          <Accordion
            type="single"
            collapsible
            defaultValue="structure"
            className="w-full"
          >
            <AccordionItem value="structure" className="border-none">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-2">
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  Structure
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-2">
                  {componentLibrary.structure.map((item) => (
                    <DraggableComponent
                      key={item.id}
                      item={item}
                      onInsert={() => handleInsertItem(item)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Media Section */}
          <Accordion
            type="single"
            collapsible
            defaultValue="media"
            className="w-full"
          >
            <AccordionItem value="media" className="border-none">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-2">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Media
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-2">
                  {skill === IeltsSkill.LISTENING ? (
                    <DraggableComponent
                      item={{
                        id: "audio",
                        type: "audio" as const,
                        label: "Audio Recording",
                        description: "Add an audio recording",
                        icon: "headphones",
                        category: ComponentCategory.MEDIA,
                      }}
                      disabledReason={
                        !targetSection
                          ? "Add a section first"
                          : targetSection.passage
                            ? "Section already has media"
                            : undefined
                      }
                      onInsert={() =>
                        handleInsertItem({
                          id: "audio",
                          type: "audio" as const,
                          label: "Audio Recording",
                          description: "Add an audio recording",
                          icon: "headphones",
                          category: ComponentCategory.MEDIA,
                        })
                      }
                    />
                  ) : (
                    <DraggableComponent
                      item={{
                        id: "passage",
                        type: "passage" as const,
                        label: "Reading Passage",
                        description: "Add a reading passage",
                        icon: "file-text",
                        category: ComponentCategory.MEDIA,
                      }}
                      disabledReason={
                        !targetSection
                          ? "Add a section first"
                          : targetSection.passage
                            ? "Section already has a passage"
                            : undefined
                      }
                      onInsert={() =>
                        handleInsertItem({
                          id: "passage",
                          type: "passage" as const,
                          label: "Reading Passage",
                          description: "Add a reading passage",
                          icon: "file-text",
                          category: ComponentCategory.MEDIA,
                        })
                      }
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Question Types Section */}
          <Accordion
            type="single"
            collapsible
            defaultValue="questions"
            className="w-full"
          >
            <AccordionItem value="questions" className="border-none">
              <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-2">
                <span className="flex items-center gap-2">
                  <CircleDot className="h-4 w-4" aria-hidden="true" />
                  Question Types
                  <span className="ml-auto text-xs text-muted-foreground font-normal">
                    {filteredQuestions.length}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-2">
                  {filteredQuestions.map((item) => (
                    <DraggableComponent
                      key={item.id}
                      item={item}
                      questionType={item.questionType}
                      disabledReason={!targetSection ? "Add a section first" : undefined}
                      onInsert={() => handleInsertItem(item, item.questionType)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t bg-muted/50 shrink-0">
        <p className="text-xs text-muted-foreground">
          Drag to canvas, or click/press Enter to insert
        </p>
      </div>
    </div>
  );
}

interface DraggableComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  questionType?: string;
  disabledReason?: string;
  onInsert?: () => void;
}

// Static icon component mapping
const iconComponents: Record<string, React.ReactNode> = {
  Layers: <Layers className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Headphones: <Headphones className="h-4 w-4" />,
  "circle-dot": <CircleDot className="h-4 w-4" />,
  "square-check": <SquareCheck className="h-4 w-4" />,
  List: <List className="h-4 w-4" />,
  Link: <Link className="h-4 w-4" />,
  "git-compare": <GitCompare className="h-4 w-4" />,
  "text-cursor": <TextCursor className="h-4 w-4" />,
  "book-open": <BookOpen className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  "thumbs-up": <ThumbsUp className="h-4 w-4" />,
  "clipboard-list": <ClipboardList className="h-4 w-4" />,
  Table: <Table className="h-4 w-4" />,
  "git-branch": <GitBranch className="h-4 w-4" />,
  Map: <Map className="h-4 w-4" />,
  Image: <ImageIcon className="h-4 w-4" />,
  "message-square": <MessageSquare className="h-4 w-4" />,
};

function getIconNode(iconName: string): React.ReactNode {
  return iconComponents[iconName] || <FileText className="h-4 w-4" />;
}

function DraggableComponent({
  item,
  questionType,
  disabledReason,
  onInsert,
}: DraggableComponentProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: item.type,
        questionType,
        ...item,
      })
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group flex items-center gap-1 rounded-md cursor-grab",
        "hover:bg-accent hover:text-accent-foreground",
        "active:cursor-grabbing",
        "transition-colors duration-150",
        disabledReason && "opacity-75"
      )}
    >
      <GripVertical
        className="h-4 w-4 ml-1 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity shrink-0"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onInsert}
        aria-label={
          disabledReason
            ? `${item.label} (${disabledReason})`
            : `Insert ${item.label}`
        }
        title={disabledReason ? `${item.label} (${disabledReason})` : `Insert ${item.label}`}
        className={cn(
          "flex flex-1 min-w-0 items-center gap-3 p-2 pl-1 text-left rounded-md cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
          {getIconNode(item.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.label}</p>
          <p className="text-xs text-muted-foreground truncate">
            {disabledReason ? disabledReason : item.description}
          </p>
        </div>
        <Plus
          className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 shrink-0"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
