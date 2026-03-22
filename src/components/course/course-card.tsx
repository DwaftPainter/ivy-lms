"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnrolledCourse } from "@/store/enrollment.store";
import { BookOpen, Users, Calendar, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
    course: EnrolledCourse;
}

export function CourseCard({ course }: CourseCardProps) {
    const teacherName = course.teacher
        ? `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.trim()
        : "Unknown Instructor";

    return (
        <Link href={`/courses/${course.id}`}>
            <Card className="overflow-hidden border rounded-[12px] hover:shadow-lg transition-shadow cursor-pointer group">
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
                    {course.thumbnailUrl ? (
                        <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="w-16 h-16 text-primary/30" />
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <span className="bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            {course.skill}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {teacherName}
                    </p>

                    {/* Progress Stats */}
                    <div className="space-y-4">
                        {/* Completion Percentage */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-medium text-foreground">
                                    {course.progress.completionPercentage}%
                                </span>
                            </div>
                            <Progress value={course.progress.completionPercentage} />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Sessions:</span>
                                <span className="font-medium text-foreground">
                                    {course.progress.completedSessions}/{course.progress.totalSessions}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Assignments:</span>
                                <span className="font-medium text-foreground">
                                    {course.progress.completedAssignments}/{course.progress.totalAssignments}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
