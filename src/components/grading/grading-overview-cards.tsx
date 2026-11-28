"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { IeltsSkill } from "@/generated/prisma/enums";
import type { GradingAssignmentSummary } from "@/lib/grading-submission";
import { getSkillLabel } from "@/lib/ielts-badges";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    GraduationCap,
    RotateCcw,
    Search,
    Users,
    X
} from "lucide-react";

export interface GradingOverviewStats {
    totalCourses: number;
    totalStudents: number;
    totalSubmissionsToGrade: number;
    upcomingClassesCount: number;
}

export function GradingStatsGrid({ stats }: { stats?: GradingOverviewStats }) {
    const cards = [
        {
            label: "Pending grading",
            value: stats?.totalSubmissionsToGrade || 0,
            icon: <ClipboardCheck className="size-4 text-primary" aria-hidden="true" />
        },
        {
            label: "Active courses",
            value: stats?.totalCourses || 0,
            icon: <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
        },
        {
            label: "Total students",
            value: stats?.totalStudents || 0,
            icon: <Users className="size-4 text-muted-foreground" aria-hidden="true" />
        },
        {
            label: "Upcoming classes",
            value: stats?.upcomingClassesCount || 0,
            icon: <GraduationCap className="size-4 text-muted-foreground" aria-hidden="true" />
        }
    ];

    return (
        <section aria-label="Grading summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {cards.map((card) => (
                <Card key={card.label} className="shadow-none">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                                {card.label}
                            </p>
                            {card.icon}
                        </div>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
                            {card.value}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

interface GradingQueueCardProps {
    assignments: GradingAssignmentSummary[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedSkill: string | null;
    onSkillChange: (skill: string | null) => void;
    onGradeClick: (assignmentId: string) => void;
}

export function GradingQueueCard({
    assignments,
    searchQuery,
    onSearchChange,
    selectedSkill,
    onSkillChange,
    onGradeClick
}: GradingQueueCardProps) {
    const hasActiveFilters = searchQuery.trim().length > 0 || selectedSkill !== null;

    const handleReset = () => {
        onSearchChange("");
        onSkillChange(null);
    };

    return (
        <div className="space-y-4">
            <section aria-label="Filter grading queue">
                <Card className="bg-muted/25 p-3.5 shadow-none sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative min-w-0 flex-1">
                            <Search
                                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                type="search"
                                placeholder="Search by assignment or course..."
                                aria-label="Search assignments"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className={cn("bg-background pl-9", searchQuery && "pr-9")}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => onSearchChange("")}
                                    aria-label="Clear search"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                                >
                                    <X className="size-3.5" aria-hidden="true" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={selectedSkill ?? "all"}
                                onValueChange={(value) =>
                                    onSkillChange(value === "all" ? null : value)
                                }
                            >
                                <SelectTrigger
                                    aria-label="Filter by skill"
                                    className="w-full bg-background sm:w-44"
                                >
                                    <SelectValue placeholder="All skills" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All skills</SelectItem>
                                    {(Object.keys(IeltsSkill) as string[]).map((skill) => (
                                        <SelectItem key={skill} value={skill}>
                                            {getSkillLabel(skill)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                >
                                    <RotateCcw className="size-3.5" aria-hidden="true" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </section>

            <section aria-labelledby="grading-queue-heading" className="min-w-0">
                <Card className="gap-0 border-primary/15 py-0 shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                            <h2
                                id="grading-queue-heading"
                                className="text-base font-semibold text-foreground"
                            >
                                Assignments awaiting grading
                            </h2>
                        </div>
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {assignments.length} {assignments.length === 1 ? "assignment" : "assignments"}
                        </span>
                    </div>

                    {assignments.length === 0 ? (
                        <CardContent className="px-4 py-10 text-center sm:px-6">
                            <CheckCircle2
                                className="mx-auto mb-3 size-10 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <h3 className="text-base font-semibold text-foreground">All caught up!</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {hasActiveFilters
                                    ? "No assignments match your current search or skill filter."
                                    : "No submissions awaiting your review."}
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="mt-4"
                                >
                                    <RotateCcw className="size-4" aria-hidden="true" />
                                    Reset filters
                                </Button>
                            )}
                        </CardContent>
                    ) : (
                        <ul className="divide-y">
                            {assignments.map((assignment) => (
                                <li
                                    key={assignment.assignmentId}
                                    className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6"
                                >
                                    <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4 xl:grid-cols-[minmax(0,1fr)_11rem_10.5rem_auto]">
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">
                                                {assignment.title}
                                            </h3>
                                            <p className="mt-0.5 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                                                {assignment.courseName}
                                                {assignment.sessionTitle ? ` · ${assignment.sessionTitle}` : ""}
                                            </p>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 xl:hidden">
                                                <Badge variant="secondary" className="font-medium">
                                                    {getSkillLabel(assignment.skill)}
                                                </Badge>
                                                <Badge variant="outline" className="tabular-nums">
                                                    <Clock className="mr-1 size-3 text-primary" aria-hidden="true" />
                                                    {assignment.pendingCount} pending
                                                </Badge>
                                                {assignment.deadline && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                                                        <AlertCircle className="size-3" aria-hidden="true" />
                                                        Due {format(new Date(assignment.deadline), "MMM d, yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="hidden xl:flex xl:flex-wrap xl:items-center xl:gap-1.5">
                                            <Badge variant="secondary" className="font-medium">
                                                {getSkillLabel(assignment.skill)}
                                            </Badge>
                                            <Badge variant="outline" className="tabular-nums">
                                                {assignment.pendingCount} pending
                                            </Badge>
                                        </div>

                                        <div className="hidden text-sm text-muted-foreground tabular-nums xl:block">
                                            {assignment.deadline
                                                ? `Due ${format(new Date(assignment.deadline), "MMM d, yyyy")}`
                                                : "No due date"}
                                        </div>

                                        <div className="flex md:justify-end">
                                            <Button
                                                type="button"
                                                onClick={() => onGradeClick(assignment.assignmentId)}
                                                aria-label={`Grade now: ${assignment.title}`}
                                                className="min-h-10 w-full justify-between md:w-auto md:justify-center"
                                            >
                                                <span>Grade Now</span>
                                                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </section>
        </div>
    );
}
