"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IeltsSkill } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { AssignmentInfo } from "@/store/teacher-grading.store";
import { BookOpen, FileText, Headphones, Mic, PenTool } from "lucide-react";
import { AssignmentContentSection, type ViewerSection } from "./assignment-content-section";

interface AssignmentContentViewerProps {
    assignment: AssignmentInfo;
    className?: string;
}

const SKILL_BADGE_COLORS: Record<IeltsSkill, string> = {
    [IeltsSkill.READING]: "bg-blue-100 text-blue-700 border-blue-200",
    [IeltsSkill.LISTENING]: "bg-purple-100 text-purple-700 border-purple-200",
    [IeltsSkill.WRITING]: "bg-amber-100 text-amber-700 border-amber-200",
    [IeltsSkill.SPEAKING]: "bg-emerald-100 text-emerald-700 border-emerald-200"
};

function getSkillIcon(skill: IeltsSkill) {
    switch (skill) {
        case IeltsSkill.READING:
            return <BookOpen className="w-5 h-5" />;
        case IeltsSkill.LISTENING:
            return <Headphones className="w-5 h-5" />;
        case IeltsSkill.WRITING:
            return <PenTool className="w-5 h-5" />;
        case IeltsSkill.SPEAKING:
            return <Mic className="w-5 h-5" />;
        default:
            return <FileText className="w-5 h-5" />;
    }
}

export function AssignmentContentViewer({
    assignment,
    className
}: AssignmentContentViewerProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const content = assignment.content as {
        sections?: ViewerSection[];
        totalTime?: number;
        totalPoints?: number;
    } | null;
    const sections = content?.sections || [];

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
        );
    };

    if (sections.length === 0) {
        return (
            <Card className={cn("border shadow-sm", className)}>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        {getSkillIcon(assignment.skill)}
                        <CardTitle className="text-base font-semibold">
                            Assignment Details
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground space-y-4">
                        <p>{assignment.description || "No assignment description available."}</p>
                        {assignment.type.includes("WRITING") && (
                            <div className="bg-amber-50 rounded-lg p-4">
                                <p className="font-medium text-amber-800">Writing Task</p>
                                <p className="text-amber-700 mt-1">
                                    Students submit written essays based on the assignment
                                    instructions.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("border shadow-sm", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getSkillIcon(assignment.skill)}
                        <CardTitle className="text-base font-semibold">
                            Assignment Questions
                        </CardTitle>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            SKILL_BADGE_COLORS[assignment.skill] ||
                                "bg-gray-100 text-gray-700 border-gray-200"
                        )}
                    >
                        {sections.length} {sections.length === 1 ? "Section" : "Sections"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                        {sections.map((section, sectionIndex) => (
                            <AssignmentContentSection
                                key={section.id}
                                section={section}
                                sectionIndex={sectionIndex}
                                isExpanded={expandedSections.includes(section.id)}
                                onToggle={toggleSection}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
