"use client";

import { Card } from "@/components/ui/card";
import { EnrolledCourse } from "@/store/enrollment.store";

interface ProgressTabProps {
    enrolledCourses: EnrolledCourse[];
}

export function ProgressTab({ enrolledCourses }: ProgressTabProps) {
    return (
        <Card className="p-6 border rounded-[12px]">
            <h2 className="text-lg font-semibold text-foreground mb-6">Course Progress</h2>
            {enrolledCourses.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No enrolled courses</div>
            ) : (
                <div className="space-y-6">
                    {enrolledCourses.map((course) => {
                        const progress = course.progress?.completionPercentage || 0;
                        return (
                            <div
                                key={course.id}
                                className="border border-border/50 rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-foreground">
                                        {course.title}
                                    </h3>
                                    <span
                                        className={`text-sm px-2 py-1 rounded ${
                                            course.status === "STUDYING"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : course.status === "DONE"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-amber-100 text-amber-700"
                                        }`}
                                    >
                                        {course.status}
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                        <span>Overall Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Assignments
                                        </p>
                                        <p className="font-medium">
                                            {course.progress?.completedAssignments || 0} /{" "}
                                            {course.progress?.totalAssignments || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lessons</p>
                                        <p className="font-medium">
                                            {course.progress?.completedSessions || 0} /{" "}
                                            {course.progress?.totalSessions || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
