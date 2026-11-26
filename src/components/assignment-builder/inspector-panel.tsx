"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { findSelectedBuilderItem } from "@/lib/assignment-builder/builder-helpers";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import { FileText, HelpCircle, LayoutGrid, Settings } from "lucide-react";
import { AssignmentInspector } from "./inspector/assignment-inspector";
import { PassageInspector } from "./inspector/passage-inspector";
import { QuestionInspector } from "./inspector/question-inspector";
import { SectionInspector } from "./inspector/section-inspector";

function InspectorEmptyState() {
    return (
        <div className="w-full h-full bg-card flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-muted-foreground mb-2">Nothing Selected</h3>
                <p className="text-sm text-muted-foreground">
                    Click on an item in the canvas to edit its properties
                </p>
            </div>
        </div>
    );
}

export function InspectorPanel() {
    const {
        selectedId,
        assignment,
        updateAssignment,
        updateSection,
        updateQuestion,
        updatePassage
    } = useAssignmentBuilderStore();

    const selected = findSelectedBuilderItem(assignment, selectedId);

    if (!selectedId || !assignment || selected.type === null) {
        return <InspectorEmptyState />;
    }

    const renderInspector = () => {
        switch (selected.type) {
            case "assignment":
                return (
                    <AssignmentInspector assignment={selected.item} onUpdate={updateAssignment} />
                );
            case "section":
                return (
                    <SectionInspector
                        section={selected.item}
                        onUpdate={(updates) => updateSection(selectedId, updates)}
                    />
                );
            case "passage":
                return (
                    <PassageInspector
                        passage={selected.item}
                        onUpdate={(updates) => updatePassage(selected.sectionId, updates)}
                    />
                );
            case "question":
                return (
                    <QuestionInspector
                        question={selected.item}
                        onUpdate={(updates) =>
                            updateQuestion(selected.sectionId, selectedId, updates)
                        }
                    />
                );
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    {selected.type === "assignment" && <LayoutGrid className="h-4 w-4" />}
                    {(selected.type === "section" || selected.type === "passage") && (
                        <FileText className="h-4 w-4" />
                    )}
                    {selected.type === "question" && <HelpCircle className="h-4 w-4" />}
                    <h2 className="font-semibold text-sm capitalize">{selected.type} Properties</h2>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full overflow-y-auto">
                    <div className="p-4">{renderInspector()}</div>
                </ScrollArea>
            </div>
        </div>
    );
}
