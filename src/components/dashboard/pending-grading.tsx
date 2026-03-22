"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PendingGradingItem } from "@/store/grading.store";
import { ClipboardCheck, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface PendingGradingProps {
    items?: PendingGradingItem[];
}

export function PendingGrading({ items = [] }: PendingGradingProps) {
    const router = useRouter();
    const isEmpty = items.length === 0;

    const handleGradeClick = (assignmentId: string) => {
        router.push(`/teacher/assignments/${assignmentId}/grade`);
    };

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">
                Pending Grading
            </h2>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-6" />
                    <p className="text-sm font-medium text-foreground">
                        No pending grading
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        All caught up! No submissions awaiting your review.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-secondary rounded-lg p-6 flex items-center justify-between border border-border/50 hover:border-border transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                    {item.course}
                                </p>
                                <h3 className="font-semibold text-foreground mb-4">
                                    {item.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 bg-destructive text-white px-3 py-1.5 rounded-md font-medium text-xs">
                                        <Users className="w-4 h-4" />
                                        {item.submissionsAwaiting} submissions awaiting
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-md font-medium text-xs">
                                        <Calendar className="w-4 h-4" />
                                        Due {item.deadline}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => handleGradeClick(item.assignmentId)}
                                className="bg-primary hover:bg-primary/90 text-white font-medium ml-6 shrink-0"
                                size="sm"
                            >
                                Grade Assignment
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
