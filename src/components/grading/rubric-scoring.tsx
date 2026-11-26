"use client";

import { CriterionScore } from "@/store/teacher-grading.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RubricScoringProps {
    hasChanges: boolean;
    criteria: CriterionScore[];
    bandScore?: number | null;
    feedback?: string | null;
    maxScore?: number | null;
    draftScores: Record<string, number>;
    draftBandScore?: number;
    draftFeedback?: string;
    onScoreChange: (criterionId: string, score: number) => void;
    onBandScoreChange: (bandScore: number) => void;
    onFeedbackChange: (feedback: string) => void;
    className?: string;
}

function getBandScoreLabel(score: number): string {
    if (score >= 8) return "Expert User";
    if (score >= 7) return "Good User";
    if (score >= 6) return "Competent User";
    if (score >= 5) return "Modest User";
    if (score >= 4) return "Limited User";
    if (score >= 3) return "Extremely Limited";
    if (score >= 2) return "Intermittent";
    return "Non User";
}

function getBandScoreColor(score: number): string {
    if (score >= 7) return "bg-green-500";
    if (score >= 5) return "bg-amber-500";
    if (score >= 3) return "bg-orange-500";
    return "bg-red-500";
}

export function RubricScoring({
    criteria,
    bandScore,
    feedback,
    maxScore,
    draftScores,
    draftBandScore,
    draftFeedback,
    hasChanges,
    onScoreChange,
    onBandScoreChange,
    onFeedbackChange,
    className
}: RubricScoringProps) {
    const calculatedBandScore = (() => {
        const scores = Object.values(draftScores);
        if (scores.length === 0 || scores.length !== criteria.length) {
            return draftBandScore ?? bandScore ?? null;
        }
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return Math.round(avg * 2) / 2;
    })();

    const displayBandScore = draftBandScore ?? calculatedBandScore ?? bandScore;
    const displayFeedback = draftFeedback ?? feedback ?? "";

    return (
        <Card className={cn("border shadow-sm", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Grading Rubric</CardTitle>
                    {hasChanges && (
                        <Badge variant="outline" className="text-amber-600 border-amber-500">
                            Unsaved Changes
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Criteria Scores */}
                {criteria.length > 0 ? (
                    <div className="space-y-4">
                        {criteria.map((criterion) => {
                            const currentScore =
                                draftScores[criterion.criterionId] ?? criterion.score ?? 0;

                            return (
                                <div key={criterion.criterionId} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor={`criterion-input-${criterion.criterionId}`}
                                            className="text-sm font-medium"
                                        >
                                            {criterion.criterionName}
                                        </Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        Max score: {criterion.maxScore}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Slider
                                            value={[currentScore]}
                                            min={0}
                                            max={criterion.maxScore}
                                            step={0.5}
                                            aria-label={`${criterion.criterionName} slider`}
                                            onValueChange={([value]) =>
                                                onScoreChange(criterion.criterionId, value)
                                            }
                                            className="flex-1"
                                        />
                                        <Input
                                            id={`criterion-input-${criterion.criterionId}`}
                                            type="number"
                                            aria-label={`${criterion.criterionName} score`}
                                            min={0}
                                            max={criterion.maxScore}
                                            step={0.5}
                                            value={currentScore}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                if (!isNaN(value)) {
                                                    onScoreChange(
                                                        criterion.criterionId,
                                                        Math.min(Math.max(value, 0), criterion.maxScore)
                                                    );
                                                }
                                            }}
                                            className="w-16 h-8 text-center"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : maxScore ? (
                    <div className="space-y-2">
                        <Label htmlFor="generic-score-input" className="text-sm font-medium">
                            Score (0 - {maxScore})
                        </Label>
                        <div className="flex items-center gap-3">
                            <Slider
                                value={[displayBandScore || 0]}
                                min={0}
                                max={maxScore}
                                step={0.5}
                                aria-label={`Score slider (0 to ${maxScore})`}
                                onValueChange={([value]) => onBandScoreChange(value)}
                                className="flex-1"
                            />
                            <Input
                                id="generic-score-input"
                                type="number"
                                aria-label={`Score (0 to ${maxScore})`}
                                min={0}
                                max={maxScore}
                                step={0.5}
                                value={displayBandScore ?? ""}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                        onBandScoreChange(Math.min(Math.max(value, 0), maxScore));
                                    }
                                }}
                                className="w-16 h-8 text-center"
                            />
                        </div>
                    </div>
                ) : null}

                <hr className="border-border" />

                {/* Band Score */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Label htmlFor="band-score-input" className="text-sm font-medium">
                            IELTS Band Score
                        </Label>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Slider
                                value={[displayBandScore || 0]}
                                min={0}
                                max={9}
                                step={0.5}
                                aria-label="IELTS Band Score slider"
                                onValueChange={([value]) => onBandScoreChange(value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="band-score-input"
                                type="number"
                                aria-label="IELTS Band Score"
                                min={0}
                                max={9}
                                step={0.5}
                                value={displayBandScore ?? ""}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                        onBandScoreChange(Math.min(Math.max(value, 0), 9));
                                    }
                                }}
                                className="w-16 h-10 text-center text-lg font-semibold"
                            />
                            <span className="text-sm text-muted-foreground">/ 9</span>
                        </div>
                    </div>

                    {displayBandScore !== null && displayBandScore !== undefined && displayBandScore > 0 && (
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    "h-2 w-2 rounded-full",
                                    getBandScoreColor(displayBandScore)
                                )}
                            />
                            <span className="text-sm text-muted-foreground">
                                {getBandScoreLabel(displayBandScore)}
                            </span>
                        </div>
                    )}
                </div>

                <hr className="border-border" />

                {/* Feedback */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium" htmlFor="feedback">
                        Feedback
                    </Label>
                    <Textarea
                        id="feedback"
                        placeholder="Provide feedback to the student..."
                        value={displayFeedback}
                        onChange={(e) => onFeedbackChange(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
