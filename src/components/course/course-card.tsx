"use client";

import { Card } from "@/components/ui/card";
import { EnrolledCourse } from "@/store/enrollment.store";
import { BookOpen, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
    course: EnrolledCourse;
}

export function CourseCard({ course }: CourseCardProps) {
    const teacherName = course.teacher
        ? `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.trim()
        : "Unknown Instructor";

    const getProgressColor = (percentage: number) => {
        if (percentage >= 75) return "bg-emerald-500";
        if (percentage >= 50) return "bg-blue-500";
        if (percentage >= 25) return "bg-amber-500";
        return "bg-primary";
    };

    return (
        <Link href={`/extension`} className="block h-full">
            <Card className="overflow-hidden border rounded-[16px] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
                    {course.thumbnailUrl ? (
                        <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <BookOpen className="w-20 h-20 text-primary/20" />
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                    {/* Skill Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-sm text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-primary/10">
                            {course.skill}
                        </span>
                    </div>

                    {/* Completion Badge */}
                    {course?.progress?.completionPercentage === 100 && (
                        <div className="absolute top-4 right-4">
                            <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Completed
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-foreground text-lg mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        {teacherName}
                    </p>

                    {/* Progress Stats */}
                    <div className="space-y-4 mt-auto">
                        {/* Completion Percentage */}
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Overall Progress</span>
                                <span className="font-bold text-foreground">
                                    {course?.progress?.completionPercentage}%
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(course?.progress?.completionPercentage || 0)}`}
                                    style={{ width: `${course?.progress?.completionPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Sessions</p>
                                    <p className="font-semibold text-foreground truncate">
                                        {course?.progress?.completedSessions}/{course?.progress?.totalSessions}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">Assignments</p>
                                    <p className="font-semibold text-foreground truncate">
                                        {course?.progress?.completedAssignments}/{course?.progress?.totalAssignments}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between text-sm font-medium text-primary group/btn">
                                <span>Continue Learning</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
