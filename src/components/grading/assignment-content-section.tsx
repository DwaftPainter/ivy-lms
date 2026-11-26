"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, ChevronRight, Clock, FileText, ImageIcon, Music } from "lucide-react";

export interface ViewerSection {
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

interface AssignmentContentSectionProps {
    section: ViewerSection;
    sectionIndex: number;
    isExpanded: boolean;
    onToggle: (sectionId: string) => void;
}

export function AssignmentContentSection({
    section,
    sectionIndex,
    isExpanded,
    onToggle
}: AssignmentContentSectionProps) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => onToggle(section.id)}
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

            {isExpanded && (
                <div className="p-4 space-y-4">
                    {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                    )}

                    {section.passage && <SectionPassagePreview passage={section.passage} />}

                    {section.questions.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Questions ({section.questions.length})
                            </h4>

                            <div className="space-y-2">
                                {section.questions.map((question, qIndex) => (
                                    <QuestionPreviewCard
                                        key={question.id}
                                        question={question}
                                        index={qIndex}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SectionPassagePreview({
    passage
}: {
    passage: NonNullable<ViewerSection["passage"]>;
}) {
    return (
        <div className="space-y-3">
            {passage.content && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Passage</span>
                    </div>
                    <div className="text-sm text-muted-foreground max-h-48 overflow-y-auto">
                        {passage.content}
                    </div>
                </div>
            )}

            {passage.audioUrl && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Music className="w-4 h-4" />
                        <span>Audio</span>
                    </div>
                    <audio controls className="w-full h-10" src={passage.audioUrl}>
                        Your browser does not support audio.
                    </audio>
                </div>
            )}

            {passage.imageUrl?.trim() && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Image</span>
                    </div>
                    <Image
                        src={passage.imageUrl.trim()}
                        alt="Passage"
                        width={0}
                        height={0}
                        unoptimized
                        className="w-auto max-w-full h-auto rounded"
                    />
                </div>
            )}
        </div>
    );
}

function QuestionPreviewCard({
    question,
    index
}: {
    question: ViewerSection["questions"][number];
    index: number;
}) {
    const rawOptions = question.config?.options;
    const options = Array.isArray(rawOptions) ? rawOptions.map((opt) => String(opt)) : null;
    const correctAnswer = question.config?.correctAnswer;

    return (
        <div className="p-3 bg-background border rounded-lg">
            <div className="flex items-start gap-3">
                <span className="text-sm font-medium text-primary min-w-[24px]">{index + 1}.</span>
                <div className="flex-1 space-y-2">
                    {question.instructions && (
                        <p className="text-sm text-muted-foreground">{question.instructions}</p>
                    )}
                    <p className="text-sm font-medium">{question.questionText || "Question"}</p>

                    {options && (
                        <div className="flex flex-wrap gap-2">
                            {options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="outline" className="text-xs">
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {correctAnswer !== undefined && correctAnswer !== null && (
                        <p className="text-xs text-green-600">
                            Correct:{" "}
                            {typeof correctAnswer === "string"
                                ? correctAnswer
                                : JSON.stringify(correctAnswer)}
                        </p>
                    )}
                </div>
                <Badge variant="secondary" className="text-xs">
                    {question.points} pts
                </Badge>
            </div>
        </div>
    );
}
