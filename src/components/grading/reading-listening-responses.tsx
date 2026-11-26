"use client";

import { Badge } from "@/components/ui/badge";
import {
    buildQuestionLookup,
    evaluateAnswerCorrectness,
    parseStudentAnswers
} from "@/lib/grading-submission";
import { cn } from "@/lib/utils";
import type { AssignmentInfo } from "@/store/teacher-grading.store";
import { Check, FileText, X } from "lucide-react";

export function ReadingListeningResponses({
    content,
    assignment
}: {
    content: string;
    assignment?: AssignmentInfo;
}) {
    const answers = parseStudentAnswers(content);
    const questionMap = buildQuestionLookup(assignment);

    if (answers.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Response</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Student Answers</span>
                </div>
                <Badge variant="outline" className="text-xs">
                    {answers.length} answered
                </Badge>
            </div>

            <div className="space-y-2">
                {answers.map((ans, idx) => {
                    const question = questionMap.get(ans.questionId);
                    const answerText = Array.isArray(ans.answer)
                        ? ans.answer.join(", ")
                        : String(ans.answer ?? "No answer");
                    const isCorrect = evaluateAnswerCorrectness(answerText, question?.correctAnswer);

                    return (
                        <div key={ans.questionId || idx} className="p-3 bg-muted/50 rounded-lg border">
                            <div className="flex items-start gap-3">
                                <span className="text-sm font-medium text-primary min-w-[28px]">
                                    {question?.number || idx + 1}.
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                                        {question?.text || "Question"}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            variant={
                                                isCorrect === true
                                                    ? "default"
                                                    : isCorrect === false
                                                      ? "destructive"
                                                      : "secondary"
                                            }
                                            className={cn(
                                                "text-xs",
                                                isCorrect === true &&
                                                    "bg-green-100 text-green-700 border-green-200",
                                                isCorrect === false &&
                                                    "bg-red-100 text-red-700 border-red-200"
                                            )}
                                        >
                                            {isCorrect === true && (
                                                <Check className="w-3 h-3 mr-1" />
                                            )}
                                            {isCorrect === false && <X className="w-3 h-3 mr-1" />}
                                            {answerText}
                                        </Badge>
                                        {question?.correctAnswer && isCorrect === false && (
                                            <span className="text-xs text-green-600">
                                                Correct:{" "}
                                                {Array.isArray(question.correctAnswer)
                                                    ? question.correctAnswer.join(" or ")
                                                    : question.correctAnswer}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {question && (
                                    <Badge variant="outline" className="text-xs shrink-0">
                                        {question.points} pts
                                    </Badge>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
