"use client";

import { useMemo, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { IeltsSkill } from "@/generated/prisma/enums";
import {
    filterQuestionTypes,
    getSectionMediaLibraryItem,
    resolveTargetSectionId
} from "@/lib/assignment-builder/builder-helpers";
import { componentLibrary } from "@/lib/assignment-builder/question-config";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import type { ComponentLibraryItem } from "@/types/assignment-builder";
import { CircleDot, FileText, Layers, Search } from "lucide-react";
import { toast } from "sonner";
import { DraggableLibraryItem } from "./draggable-library-item";

interface ComponentLibraryPanelProps {
    skill: IeltsSkill;
    onItemInserted?: () => void;
}

export function ComponentLibraryPanel({ skill, onItemInserted }: ComponentLibraryPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [chosenSectionId, setChosenSectionId] = useState<string>("");
    const [insertionNotice, setInsertionNotice] = useState<string | null>(null);

    const { assignment, selectedId, addSection, addPassage, addQuestion } =
        useAssignmentBuilderStore();

    const sections = useMemo(() => assignment?.sections ?? [], [assignment?.sections]);

    const targetSectionId = useMemo(
        () => resolveTargetSectionId(sections, chosenSectionId, selectedId),
        [chosenSectionId, sections, selectedId]
    );

    const targetSection = sections.find((s) => s.id === targetSectionId);
    const filteredQuestions = useMemo(() => filterQuestionTypes(searchQuery), [searchQuery]);
    const mediaItem = getSectionMediaLibraryItem(skill);
    const mediaDisabledReason = !targetSection
        ? "Add a section first"
        : targetSection.passage
          ? skill === IeltsSkill.LISTENING
              ? "Section already has media"
              : "Section already has a passage"
          : undefined;

    const handleInsertItem = (item: ComponentLibraryItem) => {
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

        if (item.type === "question_type" && item.questionType) {
            addQuestion(targetSection.id, item.questionType);
            setInsertionNotice(null);
            onItemInserted?.();
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="p-4 border-b shrink-0 space-y-3">
                <h2 className="font-semibold text-sm">Component Library</h2>
                <div className="relative">
                    <Search
                        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        aria-label="Search components"
                        placeholder="Search components..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                    />
                </div>

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

            <ScrollArea className="flex-1 min-h-0 overflow-y-auto [&_[data-slot=scroll-area-viewport]>div]:block!">
                <div className="p-2 min-w-0">
                    <Accordion type="single" collapsible defaultValue="structure" className="w-full">
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
                                        <DraggableLibraryItem
                                            key={item.id}
                                            item={item}
                                            onInsert={() => handleInsertItem(item)}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Accordion type="single" collapsible defaultValue="media" className="w-full">
                        <AccordionItem value="media" className="border-none">
                            <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-2">
                                <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" aria-hidden="true" />
                                    Media
                                </span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-1 pl-2">
                                    <DraggableLibraryItem
                                        item={mediaItem}
                                        disabledReason={mediaDisabledReason}
                                        onInsert={() => handleInsertItem(mediaItem)}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <Accordion type="single" collapsible defaultValue="questions" className="w-full">
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
                                        <DraggableLibraryItem
                                            key={item.id}
                                            item={item}
                                            questionType={item.questionType}
                                            disabledReason={
                                                !targetSection ? "Add a section first" : undefined
                                            }
                                            onInsert={() => handleInsertItem(item)}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </ScrollArea>

            <div className="p-3 border-t bg-muted/50 shrink-0">
                <p className="text-xs text-muted-foreground">
                    Drag to canvas, or click/press Enter to insert
                </p>
            </div>
        </div>
    );
}
