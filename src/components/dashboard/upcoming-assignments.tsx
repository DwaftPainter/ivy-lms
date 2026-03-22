"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList } from "lucide-react";

interface Assignment {
    course: string;
    title: string;
    deadline: string;
}

interface UpcomingAssignmentsProps {
    assignments?: Assignment[];
}

export function UpcomingAssignments({ assignments = [] }: UpcomingAssignmentsProps) {
    const isEmpty = assignments.length === 0;

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">
                Upcoming Assignments
            </h2>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mb-6" />
                    <p className="text-sm font-medium text-foreground">
                        No assignments yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        You're all caught up! 
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment, idx) => (
                        <div
                            key={idx}
                            className="bg-secondary rounded-lg p-6 flex items-center justify-between border border-border/50 hover:border-border transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                                    {assignment.course}
                                </p>
                                <h3 className="font-semibold text-foreground mb-4">
                                    {assignment.title}
                                </h3>

                                <div className="inline-flex items-center gap-2 bg-destructive text-white px-3 py-1.5 rounded-md font-medium text-xs">
                                    <Calendar className="w-4 h-4" />
                                    {assignment.deadline}
                                </div>
                            </div>

                            <Button
                                className="bg-primary hover:bg-primary/90 text-white font-medium ml-6 shrink-0"
                                size="sm"
                            >
                                Finish Now
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}