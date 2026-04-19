"use client";

import { useState } from "react";
import { AssignmentInfo } from "@/store/teacher-grading.store";
import { IeltsSkill } from "@/generated/prisma/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Headphones,
    PenTool,
    Mic,
    ChevronDown,
    ChevronRight,
    FileText,
    Music,
    ImageIcon,
    Clock
} from "lucide-react";

interface AssignmentContentViewerProps {
    assignment: AssignmentInfo;
    className?: string;
}

interface Section {
    id: string;
    title: string;
    description?: string;
    timeLimit?: number;
    passage?: {
        id: string;
        title: string;
        content?: string;
        audioUrl?: string;
        imageUrl?: string;
    };
    questions: Array<{
        id: string;
        type: string;
        questionNumber: number;
        instructions?: string;
        questionText?: string;
        points: number;
        config: Record<string, unknown>;
    }>;
}

export function AssignmentContentViewer({ assignment, className }: AssignmentContentViewerProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    // Extract sections from content
    const content = assignment.content as { sections?: Section[]; totalTime?: number; totalPoints?: number } | null;
    const sections = content?.sections || [];

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
        );
    };

    const getSkillIcon = () => {
        switch (assignment.skill) {
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
    };

    const getSkillColor = () => {
        switch (assignment.skill) {
            case IeltsSkill.READING:
                return "bg-blue-100 text-blue-700 border-blue-200";
            case IeltsSkill.LISTENING:
                return "bg-purple-100 text-purple-700 border-purple-200";
            case IeltsSkill.WRITING:
                return "bg-amber-100 text-amber-700 border-amber-200";
            case IeltsSkill.SPEAKING:
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    // If no content available, show fallback
    if (sections.length === 0) {
        return (
            <Card className={cn("border shadow-sm", className)}>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        {getSkillIcon()}
                        <CardTitle className="text-base font-semibold">Assignment Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground space-y-4">
                        <p>{assignment.description || "No assignment description available."}</p>
                        {assignment.type.includes("WRITING") && (
                            <div className="bg-amber-50 rounded-lg p-4">
                                <p className="font-medium text-amber-800">Writing Task</p>
                                <p className="text-amber-700 mt-1">
                                    Students submit written essays based on the assignment instructions.
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
                        {getSkillIcon()}
                        <CardTitle className="text-base font-semibold">Assignment Questions</CardTitle>
                    </div>
                    <Badge variant="outline" className={cn(getSkillColor())}>
                        {sections.length} {sections.length === 1 ? "Section" : "Sections"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="max-h-[400px]">
                    <div className="space-y-4">
                        {sections.map((section, sectionIndex) => {
                            const isExpanded = expandedSections.includes(section.id);

                            return (
                                <div
                                    key={section.id}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Section {sectionIndex + 1}
                                            </span>
                                            <span className="font-semibold">{section.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {section.timeLimit && (
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {Math.floor(section.timeLimit / 60)}m
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Section Content */}
                                    {isExpanded && (
                                        <div className="p-4 space-y-4">
                                            {section.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {section.description}
                                                </p>
                                            )}

                                            {/* Passage/Audio for Reading/Listening */}
                                            {section.passage && (
                                                <div className="space-y-3">
                                                    {section.passage.content && (
                                                        <div className="bg-muted/50 rounded-lg p-4">
                                                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                                <BookOpen className="w-4 h-4" />
                                                                <span>Passage</span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                                                {section.passage.content}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {section.passage.audioUrl && (
                                                        <div className="bg-muted/50 rounded-lg p-4">
                                                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                                <Music className="w-4 h-4" />
                                                                <span>Audio</span>
                                                            </div>
                                                            <audio
                                                                controls
                                                                className="w-full h-10"
                                                                src={section.passage.audioUrl}
                                                            >
                                                                Your browser does not support audio.
                                                            </audio>
                                                        </div>
                                                    )}

                                                    {section.passage.imageUrl && (
                                                        <div className="bg-muted/50 rounded-lg p-4">
                                                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                                                <ImageIcon className="w-4 h-4" />
                                                                <span>Image</span>
                                                            </div>
                                                            <img
                                                                src={section.passage.imageUrl}
                                                                alt="Passage"
                                                                className="max-w-full h-auto rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Questions */}
                                            {section.questions.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        Questions ({section.questions.length})
                                                    </h4>

                                                    <div className="space-y-2">
                                                        {section.questions.map((question, qIndex) => (
                                                            <div
                                                                key={question.id}
                                                                className="p-3 bg-background border rounded-lg"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <span className="text-sm font-medium text-primary min-w-[24px]">
                                                                        {qIndex + 1}.
                                                                    </span>
                                                                    <div className="flex-1 space-y-2">
                                                                        {question.instructions && (
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {question.instructions}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-sm font-medium">
                                                                            {question.questionText || "Question"}
                                                                        </p>

                                                                        {/* Show options if available */}
                                                                        {(() => {
                                                                            const opts = question.config?.options;
                                                                            if (!opts || !Array.isArray(opts)) return null as React.ReactNode;
                                                                            const options = opts.map((opt) => String(opt));
                                                                            return (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {options.map((option, optIndex) => (
                                                                                        <Badge
                                                                                            key={optIndex}
                                                                                            variant="outline"
                                                                                            className="text-xs"
                                                                                        >
                                                                                            {String.fromCharCode(65 + optIndex)}. {option}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })()}

                                                                        {/* Show correct answer if configured */}
                                                                        {(() => {
                                                                            const answer = question.config?.correctAnswer;
                                                                            if (answer === undefined || answer === null) return null;
                                                                            return (
                                                                                <p className="text-xs text-green-600">
                                                                                    Correct: {typeof answer === "string"
                                                                                        ? answer
                                                                                        : JSON.stringify(answer)}
                                                                                </p>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {question.points} pts
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
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
