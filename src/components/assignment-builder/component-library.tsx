/**
 * Component Library Panel
 * Left sidebar with draggable components for building assignments
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import { ComponentCategory } from "@/types/assignment-builder";
import { IeltsSkill } from "@/generated/prisma/enums";
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
} from "lucide-react";

interface ComponentLibraryPanelProps {
  skill: IeltsSkill;
}


export function ComponentLibraryPanel({ skill }: ComponentLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = questionTypeConfig.filter(
    (q) =>
      q.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h2 className="font-semibold text-sm mb-3">Component Library</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Component Categories */}
      <ScrollArea className="flex-1 h-full overflow-y-auto">
        <div className="p-2">
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
                  <Layers className="h-4 w-4" />
                  Structure
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-2">
                  {componentLibrary.structure.map((item) => (
                    <DraggableComponent key={item.id} item={item} />
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
                  <FileText className="h-4 w-4" />
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
                  <CircleDot className="h-4 w-4" />
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
          Drag components to the canvas
        </p>
      </div>
    </div>
  );
}

interface DraggableComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  questionType?: string;
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

function DraggableComponent({ item, questionType }: DraggableComponentProps) {
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
        "group flex items-center gap-3 p-2 rounded-md cursor-grab",
        "hover:bg-accent hover:text-accent-foreground",
        "active:cursor-grabbing",
        "transition-colors duration-150"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        {getIconNode(item.icon)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {item.description}
        </p>
      </div>
    </div>
  );
}
