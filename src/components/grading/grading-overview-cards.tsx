"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IeltsSkill } from "@/generated/prisma/enums";
import type { GradingAssignmentSummary } from "@/lib/grading-submission";
import { getSkillLabel } from "@/lib/ielts-badges";
import { format } from "date-fns";
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    Filter,
    GraduationCap,
    Search,
    Users
} from "lucide-react";

export interface GradingOverviewStats {
    totalCourses: number;
    totalStudents: number;
    totalSubmissionsToGrade: number;
    upcomingClassesCount: number;
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
    READING: <BookOpen className="w-4 h-4" />,
    LISTENING: <BarChart3 className="w-4 h-4" />,
    WRITING: <GraduationCap className="w-4 h-4" />,
    SPEAKING: <Users className="w-4 h-4" />
};

export function GradingStatsGrid({ stats }: { stats?: GradingOverviewStats }) {
    const cards = [
        {
            label: "Pending Grading",
            value: stats?.totalSubmissionsToGrade || 0,
            iconBg: "bg-amber-500/10",
            icon: <ClipboardCheck className="w-6 h-6 text-amber-600" />
        },
        {
            label: "Active Courses",
            value: stats?.totalCourses || 0,
            iconBg: "bg-blue-500/10",
            icon: <BookOpen className="w-6 h-6 text-blue-600" />
        },
        {
            label: "Total Students",
            value: stats?.totalStudents || 0,
            iconBg: "bg-emerald-500/10",
            icon: <Users className="w-6 h-6 text-emerald-600" />
        },
        {
            label: "Upcoming Classes",
            value: stats?.upcomingClassesCount || 0,
            iconBg: "bg-purple-500/10",
            icon: <GraduationCap className="w-6 h-6 text-purple-600" />
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card key={card.label} className="border shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <div
                                className={`h-12 w-12 rounded-full ${card.iconBg} flex items-center justify-center`}
                            >
                                {card.icon}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
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
    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5" aria-hidden="true" />
                            Assignments Awaiting Grading
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""} need
                            attention
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <Input
                                placeholder="Search assignments..."
                                aria-label="Search assignments"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                    <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">Filter by skill:</span>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedSkill === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => onSkillChange(null)}
                        >
                            All
                        </Button>
                        {(Object.keys(IeltsSkill) as string[]).map((skill) => (
                            <Button
                                key={skill}
                                variant={selectedSkill === skill ? "default" : "outline"}
                                size="sm"
                                onClick={() => onSkillChange(skill)}
                            >
                                {SKILL_ICONS[skill]}
                                <span className="ml-1">{getSkillLabel(skill)}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {assignments.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2
                            className="w-12 h-12 text-green-500 mx-auto mb-4"
                            aria-hidden="true"
                        />
                        <h3 className="text-lg font-medium">All caught up!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery || selectedSkill
                                ? "No assignments match your filters."
                                : "No submissions awaiting your review."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assignments.map((assignment) => (
                            <div
                                key={assignment.assignmentId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                        <Badge variant="secondary" className="font-medium">
                                            {SKILL_ICONS[assignment.skill]}
                                            <span className="ml-1">
                                                {getSkillLabel(assignment.skill)}
                                            </span>
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {assignment.courseName}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold truncate">{assignment.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Session: {assignment.sessionTitle}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sm text-amber-600">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-medium">
                                                {assignment.pendingCount} pending
                                            </span>
                                        </div>
                                        {assignment.deadline && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>
                                                    Due{" "}
                                                    {format(
                                                        new Date(assignment.deadline),
                                                        "MMM d, yyyy"
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => onGradeClick(assignment.assignmentId)}
                                    className="sm:ml-4 shrink-0 self-start sm:self-center"
                                >
                                    Grade Now
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
