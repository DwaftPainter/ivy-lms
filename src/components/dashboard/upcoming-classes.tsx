"use client";

import { Card } from "@/components/ui/card";
import { ClassItem } from "@/store/class.store";
import { Paperclip, Clock, User, SearchAlertIcon } from "lucide-react";

interface UpcomingClassesProps {
    classes: Array<ClassItem>;
}

export function UpcomingClasses({ classes = [] }: UpcomingClassesProps) {
    const isEmpty = classes.length === 0;

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">
                Upcoming Classes
            </h2>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <SearchAlertIcon className="w-12 h-12 text-muted-foreground mb-6" />
                    <div className="text-muted-foreground text-sm mb-2">
                        You are not enrolled in any classes yet
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Browse courses and enroll to see them here
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((lesson, idx) => (
                        <div
                            key={idx}
                            className="pb-4 border-b border-border last:border-0 last:pb-0"
                        >
                            <div className="flex gap-5 items-start">
                                {/* Date Box */}
                                <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center flex flex-col items-center justify-center w-16 shrink-0 border border-primary/10">
                                    <div className="font-bold text-base text-foreground">
                                        {lesson.date}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {lesson.day}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {lesson.course}
                                    </p>

                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:opacity-80 transition-opacity"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                        View Material
                                    </a>
                                </div>

                                {/* Right Info */}
                                <div className="text-right space-y-2 shrink-0">
                                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{lesson.time}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-foreground">
                                            {lesson.instructor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}