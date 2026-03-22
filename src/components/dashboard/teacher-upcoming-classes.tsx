"use client";

import { Card } from "@/components/ui/card";
import { TeacherClassItem } from "@/store/teacher-class.store";
import { Clock, Users, CalendarDays } from "lucide-react";

interface TeacherUpcomingClassesProps {
    classes: Array<TeacherClassItem>;
}

export function TeacherUpcomingClasses({ classes = [] }: TeacherUpcomingClassesProps) {
    const isEmpty = classes.length === 0;

    return (
        <Card className="p-6 shadow-none border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">
                Upcoming Classes
            </h2>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mb-6" />
                    <div className="text-muted-foreground text-sm mb-2">
                        No upcoming classes
                    </div>
                    <p className="text-xs text-muted-foreground">
                        You have no scheduled classes at the moment
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {classes.map((classItem, idx) => (
                        <div
                            key={idx}
                            className="pb-4 border-b border-border last:border-0 last:pb-0"
                        >
                            <div className="flex gap-5 items-start">
                                {/* Date Box */}
                                <div className="bg-linear-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center flex flex-col items-center justify-center w-16 shrink-0 border border-primary/10">
                                    <div className="font-bold text-base text-foreground">
                                        {classItem.date}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {classItem.day}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        {classItem.course}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {classItem.title}
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md">
                                        <span className="text-xs font-medium text-foreground">
                                            {classItem.classType}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Info */}
                                <div className="text-right space-y-2 shrink-0">
                                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{classItem.startTime} - {classItem.endTime}</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{classItem.enrolledStudents} students</span>
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
