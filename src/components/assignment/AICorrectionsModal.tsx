"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AICorrection, AIGradingResult } from "@/store/assignment-session.store";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Sparkles, User } from "lucide-react";

interface AICorrectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    essay: string;
    aiGrading: AIGradingResult | null;
    onRequestRegrade: () => void;
    teacherRegradeRequested: boolean;
    isLoadingRegrade: boolean;
}

export function AICorrectionsModal({
    isOpen,
    onClose,
    essay,
    aiGrading,
    onRequestRegrade,
    teacherRegradeRequested,
    isLoadingRegrade
}: AICorrectionsModalProps) {
    const [selectedCorrection, setSelectedCorrection] = useState<number | null>(null);
    const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(true);

    const getTypeColor = (type: AICorrection["type"]) => {
        switch (type) {
            case "grammar":
                return "bg-red-100 text-red-700 border-red-200";
            case "vocabulary":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "spelling":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "structure":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getTypeLabel = (type: AICorrection["type"]) => {
        switch (type) {
            case "grammar":
                return "Grammar";
            case "vocabulary":
                return "Vocabulary";
            case "spelling":
                return "Spelling";
            case "structure":
                return "Structure";
            default:
                return "Other";
        }
    };

    const renderEssayWithCorrections = () => {
        if (!aiGrading?.corrections?.length) {
            return <p className="whitespace-pre-wrap leading-relaxed">{essay}</p>;
        }

        const sortedCorrections = [...aiGrading.corrections].sort((a, b) => {
            if (a.position && b.position) {
                return a.position.start - b.position.start;
            }
            return 0;
        });

        return (
            <div className="space-y-3 leading-relaxed">
                {sortedCorrections.map((correction, index) => (
                    <div
                        key={index}
                        className={cn(
                            "p-4 rounded-lg border-l-4 cursor-pointer transition-all",
                            getTypeColor(correction.type)
                                .replace("bg-", "bg-opacity-20 ")
                                .replace("text-", "border-"),
                            selectedCorrection === index
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedCorrection(selectedCorrection === index ? null : index)}
                    >
                        <div className="flex items-start gap-2">
                            <Badge variant="outline" className={cn("text-xs", getTypeColor(correction.type))}>
                                {getTypeLabel(correction.type)}
                            </Badge>
                        </div>
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-destructive line-through">{correction.original}</span>
                                <span className="text-green-600">→</span>
                                <span className="text-green-600 font-medium">{correction.corrected}</span>
                            </div>
                            {selectedCorrection === index && (
                                <p className="text-sm text-muted-foreground mt-2 animate-in fade-in">
                                    {correction.explanation}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-350 h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="size-5 text-primary" />
                            AI Grading History
                        </DialogTitle>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">AI Score</p>
                                <p className="text-2xl font-bold text-primary">
                                    {aiGrading?.score ? aiGrading.score.toFixed(1) : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="essay" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="mx-6 mt-4 w-auto justify-start shrink-0">
                        <TabsTrigger value="essay" className="gap-2">
                            <FileText className="size-4" />
                            Essay
                        </TabsTrigger>
                        <TabsTrigger value="corrections" className="gap-2">
                            <AlertCircle className="size-4" />
                            Errors & Corrections
                            {aiGrading?.corrections?.length && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {aiGrading.corrections.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-hidden relative">
                        <TabsContent
                            value="essay"
                            className="absolute inset-0 m-0 data-[state=inactive]:hidden"
                        >
                            <ScrollArea className="h-full w-full">
                                <div className="space-y-6 py-4 px-6 pb-24">
                                    <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Sparkles className="size-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">AI Result</p>
                                                <p className="text-2xl font-bold">
                                                    {aiGrading?.score ? aiGrading.score.toFixed(1) : "-"} /
                                                    9.0
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
                                        >
                                            {isFeedbackExpanded ? "Collapse" : "View feedback"}
                                            {isFeedbackExpanded ? (
                                                <ChevronUp className="size-4 ml-1" />
                                            ) : (
                                                <ChevronDown className="size-4 ml-1" />
                                            )}
                                        </Button>
                                    </div>

                                    {isFeedbackExpanded && aiGrading?.feedback && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-sm text-green-800 leading-relaxed">
                                                {aiGrading.feedback}
                                            </p>
                                        </div>
                                    )}

                                    <div className="prose max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                                            {essay}
                                        </pre>
                                    </div>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent
                            value="corrections"
                            className="absolute inset-0 m-0 data-[state=inactive]:hidden"
                        >
                            <ScrollArea className="h-full w-full">
                                <div className="py-4 px-6 pb-24 space-y-4">
                                    {aiGrading?.corrections?.length === 0 ? (
                                        <div className="text-center py-12">
                                            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
                                            <p className="text-lg font-medium">No errors found!</p>
                                            <p className="text-muted-foreground">
                                                Your essay has no obvious mistakes.
                                            </p>
                                        </div>
                                    ) : (
                                        renderEssayWithCorrections()
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </div>
                </Tabs>

                <div className="px-6 py-4 border-t bg-card flex items-center justify-between shrink-0">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>

                    <div className="flex items-center gap-3">
                        {teacherRegradeRequested ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="size-4" />
                                <span className="text-sm">Teacher review requested</span>
                            </div>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={onRequestRegrade}
                                disabled={isLoadingRegrade}
                            >
                                {isLoadingRegrade ? "Sending..." : "Request teacher review"}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
