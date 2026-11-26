"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IeltsSkill } from "@/generated/prisma/enums";
import { getSkillLabel, type BadgeVariant } from "@/lib/ielts-badges";
import {
    formatScoreLabel,
    getRowPresentation,
    parseValidDate,
    type AssignmentSummary,
    type ClassifiedAssignment
} from "@/lib/student-assignments";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, GraduationCap } from "lucide-react";

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
});

function AssignmentBadges({
    skill,
    statusLabel,
    statusVariant,
    isOverdue
}: {
    skill: IeltsSkill;
    statusLabel: string;
    statusVariant: BadgeVariant;
    isOverdue: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-medium">
                {getSkillLabel(skill)}
            </Badge>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
    );
}

function AssignmentTiming({
    assignment,
    deadline,
    isOverdue,
    isPending,
    scoreLabel
}: {
    assignment: AssignmentSummary;
    deadline: Date | null;
    isOverdue: boolean;
    isPending: boolean;
    scoreLabel: string | null;
}) {
    const submittedDate = parseValidDate(assignment.submission?.submittedAt);
    const gradedDate = parseValidDate(assignment.submission?.gradedAt);

    if (isPending) {
        if (!deadline) {
            return <span className="text-muted-foreground">No due date</span>;
        }
        return (
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 tabular-nums",
                    isOverdue ? "font-medium text-destructive" : "text-muted-foreground"
                )}
            >
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                    {isOverdue ? "Overdue" : "Due"}{" "}
                    <time dateTime={deadline.toISOString()}>
                        {shortDateFormatter.format(deadline)}
                    </time>
                </span>
            </span>
        );
    }

    return (
        <>
            {scoreLabel && (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground tabular-nums">
                    <GraduationCap className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{scoreLabel}</span>
                </span>
            )}
            {gradedDate ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                    Graded{" "}
                    <time dateTime={gradedDate.toISOString()}>
                        {shortDateFormatter.format(gradedDate)}
                    </time>
                </span>
            ) : submittedDate ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <CheckCircle2 className="size-3 shrink-0" aria-hidden="true" />
                    <span>
                        Submitted{" "}
                        <time dateTime={submittedDate.toISOString()}>
                            {shortDateFormatter.format(submittedDate)}
                        </time>
                    </span>
                </span>
            ) : (
                <span className="text-xs text-muted-foreground">Submitted</span>
            )}
        </>
    );
}

export function AssignmentRow({ item }: { item: ClassifiedAssignment }) {
    const { assignment, deadline, isOverdue, isPending } = item;
    const { statusLabel, statusVariant, actionLabel, actionVariant } = getRowPresentation(item);
    const scoreLabel = formatScoreLabel(assignment);

    return (
        <li className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4 xl:grid-cols-[minmax(0,1fr)_10.5rem_11.5rem_11.5rem]">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">
                        {assignment.title}
                    </h3>
                    {assignment.course?.title && (
                        <p className="mt-0.5 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                            {assignment.course.title}
                        </p>
                    )}
                    {!isPending && assignment.submission?.feedback && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-text-primary [overflow-wrap:anywhere]">
                            {assignment.submission.feedback}
                        </p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 xl:hidden">
                        <AssignmentBadges
                            skill={assignment.skill}
                            statusLabel={statusLabel}
                            statusVariant={statusVariant}
                            isOverdue={isOverdue}
                        />
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <AssignmentTiming
                                assignment={assignment}
                                deadline={deadline}
                                isOverdue={isOverdue}
                                isPending={isPending}
                                scoreLabel={scoreLabel}
                            />
                        </div>
                    </div>
                </div>

                <div className="hidden xl:block">
                    <AssignmentBadges
                        skill={assignment.skill}
                        statusLabel={statusLabel}
                        statusVariant={statusVariant}
                        isOverdue={isOverdue}
                    />
                </div>

                <div className="hidden text-sm xl:flex xl:flex-col xl:items-start xl:gap-0.5">
                    <AssignmentTiming
                        assignment={assignment}
                        deadline={deadline}
                        isOverdue={isOverdue}
                        isPending={isPending}
                        scoreLabel={scoreLabel}
                    />
                </div>

                <div className="flex md:justify-end">
                    <Button
                        asChild
                        variant={actionVariant}
                        className="min-h-10 w-full justify-between focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:w-auto md:justify-center"
                    >
                        <Link
                            href={`/assignments/${assignment.id}`}
                            aria-label={`${actionLabel}: ${assignment.title}`}
                        >
                            <span>{actionLabel}</span>
                            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>
        </li>
    );
}
