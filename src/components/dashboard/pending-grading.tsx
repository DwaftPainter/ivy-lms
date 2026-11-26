import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IeltsSkill } from "@/generated/prisma/enums";
import { getSkillLabel } from "@/lib/ielts-badges";

export interface TeacherGradingTask {
    assignmentId: string;
    title: string;
    courseName: string;
    sessionTitle?: string;
    pendingCount: number;
    deadline: string | null;
    skill: IeltsSkill;
}

const deadlineFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
});

function formatPendingCount(count: number): string {
    return count === 1 ? "1 pending submission" : `${count} pending submissions`;
}

function formatDeadlineLabel(deadline: string | null): string {
    if (!deadline) return "No due date";
    const parsed = new Date(deadline);
    if (!Number.isFinite(parsed.getTime())) return "No due date";
    return `Due ${deadlineFormatter.format(parsed)}`;
}

export function TeacherNeedsGrading({
    item,
    totalAwaitingCount,
    isLoading,
    error,
    onRetry
}: {
    item: TeacherGradingTask | undefined;
    totalAwaitingCount: number;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}) {
    return (
        <section aria-labelledby="teacher-needs-grading-heading" className="min-w-0">
            <Card className="h-full min-h-57 gap-5 border-primary/15 bg-card p-5 shadow-none sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h2
                        id="teacher-needs-grading-heading"
                        className="flex items-center gap-2 text-sm font-semibold"
                    >
                        <ClipboardCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
                        Needs grading
                    </h2>
                    <Link
                        href="/teacher/grading"
                        className="inline-flex min-h-8 items-center rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                        All grading
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3" aria-busy="true">
                        <p role="status" className="sr-only">
                            Loading grading queue
                        </p>
                        <Skeleton className="h-7 w-3/4 motion-reduce:animate-none" />
                        <Skeleton className="h-4 w-1/2 motion-reduce:animate-none" />
                        <Skeleton className="h-10 w-40 motion-reduce:animate-none" />
                    </div>
                ) : error ? (
                    <div className="space-y-3" role="alert">
                        <p className="text-sm text-foreground">
                            Could not load submissions awaiting grading.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onRetry}
                            className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                            Retry grading
                        </Button>
                    </div>
                ) : item ? (
                    <>
                        <div className="min-w-0">
                            <h3 className="text-xl leading-tight font-semibold tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-2xl">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                                {item.courseName}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                                <Badge variant="secondary">{getSkillLabel(item.skill)}</Badge>
                                <Badge variant="outline" className="tabular-nums">
                                    {formatPendingCount(item.pendingCount)}
                                </Badge>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {formatDeadlineLabel(item.deadline)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                            <Button
                                asChild
                                className="min-h-10 shrink-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                                <Link
                                    href={`/teacher/assignments/${item.assignmentId}/grade`}
                                    aria-label={`Grade submissions: ${item.title}`}
                                >
                                    <span>Grade submissions</span>
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>

                            {totalAwaitingCount > item.pendingCount && (
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    {totalAwaitingCount} submissions pending total
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col justify-between gap-4">
                        <div className="space-y-1.5">
                            <h3 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                                <CheckCircle2
                                    className="size-5 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span>All caught up</span>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                No submitted assignments are waiting for review.
                            </p>
                        </div>
                        <div>
                            <Button
                                asChild
                                variant="outline"
                                className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                                <Link href="/teacher/grading">Open grading queue</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </section>
    );
}

export function PendingGrading({ items }: { items: TeacherGradingTask[] }) {
    if (items.length === 0) return null;

    return (
        <section aria-labelledby="teacher-more-grading-heading" className="min-w-0">
            <Card className="gap-0 py-0 shadow-none">
                <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
                    <h2 id="teacher-more-grading-heading" className="text-base font-semibold">
                        More assignments to grade
                    </h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {items.length}
                    </span>
                </div>
                <ul className="divide-y">
                    {items.map((item) => (
                        <li key={item.assignmentId}>
                            <Link
                                href={`/teacher/assignments/${item.assignmentId}/grade`}
                                aria-label={`Grade submissions: ${item.title}`}
                                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
                            >
                                <div className="min-w-0 [overflow-wrap:anywhere]">
                                    <p className="text-sm font-semibold text-foreground">
                                        {item.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {item.courseName}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <Badge variant="secondary">{getSkillLabel(item.skill)}</Badge>
                                        <Badge variant="outline" className="tabular-nums">
                                            {formatPendingCount(item.pendingCount)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {formatDeadlineLabel(item.deadline)}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </Card>
        </section>
    );
}
