import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSkillLabel } from "@/lib/ielts-badges";
import type { Assignment } from "@/store/assignment.store";

export type DashboardAssignment = {
    assignment: Assignment;
    deadline: Date | null;
    overdue: boolean;
};

const deadlineLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23"
});

function Deadline({ item }: { item: DashboardAssignment }) {
    if (!item.deadline) return <span>No due date</span>;

    return (
        <span>
            {item.overdue ? "Overdue" : "Due"}{" "}
            <time dateTime={item.deadline.toISOString()}>{deadlineLabel.format(item.deadline)}</time>
        </span>
    );
}

export function NextAssignment({
    item,
    isLoading,
    error,
    onRetry
}: {
    item: DashboardAssignment | undefined;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}) {
    const assignment = item?.assignment;
    const action = assignment?.submission ? "Resume assignment" : "Open assignment";

    return (
        <section aria-labelledby="next-assignment-heading" className="min-w-0">
            <Card className="h-full min-h-57 gap-5 border-primary/15 bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h2 id="next-assignment-heading" className="flex items-center gap-2 text-sm font-semibold">
                        <ClipboardList className="size-4 shrink-0 text-primary" aria-hidden="true" />
                        Next assignment
                    </h2>
                    <Link
                        href="/assignments"
                        className="inline-flex min-h-8 items-center rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                        All assignments
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <p role="status" className="sr-only">Loading assignments</p>
                        <Skeleton className="h-7 w-3/4 animate-none" />
                        <Skeleton className="h-4 w-1/2 animate-none" />
                    </div>
                ) : error ? (
                    <div className="space-y-3">
                        <p role="alert">Could not load assignments.</p>
                        <Button variant="outline" onClick={onRetry}>Retry assignments</Button>
                    </div>
                ) : item && assignment ? (
                    <>
                        <div className="min-w-0">
                            <h3 className="text-xl leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">
                                {assignment.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                                {assignment.course.title}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{getSkillLabel(assignment.skill)}</Badge>
                                <p className="text-sm font-medium text-primary"><Deadline item={item} /></p>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <Button asChild className="min-h-10">
                                <Link href={`/assignments/${assignment.id}`} aria-label={`${action}: ${assignment.title}`}>
                                    {action} <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No assignments to do</h3>
                        <p className="text-sm text-muted-foreground">New assignments will appear here.</p>
                    </div>
                )}
            </Card>
        </section>
    );
}

export function UpcomingAssignments({ items }: { items: DashboardAssignment[] }) {
    if (items.length === 0) return null;

    return (
        <section aria-labelledby="upcoming-assignments-heading" className="min-w-0">
            <Card className="gap-0 py-0">
                <h2 id="upcoming-assignments-heading" className="border-b px-4 py-4 text-base font-semibold sm:px-6">
                    More assignments to do
                </h2>
                <ul className="divide-y">
                    {items.map((item) => {
                        const { assignment } = item;
                        return (
                            <li key={assignment.id}>
                                <Link
                                    href={`/assignments/${assignment.id}`}
                                    aria-label={`${assignment.submission ? "Resume" : "Open"} assignment: ${assignment.title}`}
                                    aria-describedby={`dashboard-deadline-${assignment.id}`}
                                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
                                >
                                    <div className="min-w-0 [overflow-wrap:anywhere]">
                                        <p className="text-sm font-semibold">{assignment.title}</p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <Badge variant="secondary">{getSkillLabel(assignment.skill)}</Badge>
                                            <p id={`dashboard-deadline-${assignment.id}`} className={item.overdue ? "text-xs font-medium text-primary" : "text-xs text-muted-foreground"}>
                                                <Deadline item={item} />
                                                {assignment.submission && (
                                                    <span className="ml-1.5 text-muted-foreground"> In progress</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </Card>
        </section>
    );
}
