import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IeltsSkill } from "@/generated/prisma/enums";
import { getSkillLabel } from "@/lib/ielts-badges";

export interface TeacherDashboardClass {
    id: string;
    title: string;
    courseName: string;
    dateKey: string;
    startTime: string;
    endTime: string;
    skill: IeltsSkill;
    startsAt: number;
    endsAt: number;
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC"
});

const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
});

function ClassDateBlock({ dateKey }: { dateKey: string }) {
    const parsed = dateKey ? new Date(`${dateKey}T00:00:00Z`) : null;
    const isValid = Boolean(parsed && Number.isFinite(parsed.getTime()));

    return (
        <time dateTime={dateKey} className="block leading-tight">
            <span className="block text-xs font-medium">
                {isValid && parsed ? weekdayFormatter.format(parsed) : "Class"}
            </span>
            <span className="mt-1 block whitespace-nowrap text-lg font-semibold">
                {isValid && parsed ? monthDayFormatter.format(parsed) : dateKey}
            </span>
        </time>
    );
}

export function TeacherNextClass({
    lesson,
    inProgress,
    isLoading,
    error,
    onRetry
}: {
    lesson: TeacherDashboardClass | undefined;
    inProgress: boolean;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}) {
    return (
        <section aria-labelledby="teacher-next-class-heading" className="min-w-0">
            <Card className="h-full min-h-57 gap-5 border-primary bg-primary p-5 text-primary-foreground sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h2
                        id="teacher-next-class-heading"
                        className="flex items-center gap-2 text-sm font-semibold"
                    >
                        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                        {lesson && inProgress && !isLoading && !error
                            ? "Class in progress"
                            : "Next class"}
                    </h2>
                </div>

                {isLoading ? (
                    <div className="space-y-3" aria-busy="true">
                        <p role="status" className="sr-only">
                            Loading next class
                        </p>
                        <Skeleton className="h-7 w-3/4 bg-primary-foreground/20 motion-reduce:animate-none" />
                        <Skeleton className="h-4 w-1/2 bg-primary-foreground/20 motion-reduce:animate-none" />
                        <Skeleton className="h-10 w-36 bg-primary-foreground/20 motion-reduce:animate-none" />
                    </div>
                ) : error ? (
                    <div className="space-y-3" role="alert">
                        <p className="text-sm">Could not load your upcoming class.</p>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onRetry}
                            className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
                        >
                            Retry classes
                        </Button>
                    </div>
                ) : lesson ? (
                    <>
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-4">
                            <div className="min-w-16 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-2.5 text-center sm:min-w-19">
                                <ClassDateBlock dateKey={lesson.dateKey} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">
                                    {lesson.title}
                                </h3>
                                <p className="mt-1 text-sm text-primary-foreground/90 [overflow-wrap:anywhere]">
                                    {lesson.courseName}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 text-sm text-primary-foreground/90">
                                <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                                    <Clock className="size-4 shrink-0" aria-hidden="true" />
                                    <span>
                                        {lesson.startTime} - {lesson.endTime}
                                    </span>
                                </span>
                                <Badge
                                    variant="outline"
                                    className="border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground"
                                >
                                    {getSkillLabel(lesson.skill)}
                                </Badge>
                            </div>

                            <Button
                                asChild
                                variant="secondary"
                                className="min-h-10 shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
                            >
                                <Link
                                    href={`/teacher/lessons/${lesson.id}`}
                                    aria-label={`View lesson: ${lesson.title}`}
                                >
                                    <span>View lesson</span>
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No upcoming classes</h3>
                        <p className="text-sm text-primary-foreground/90">
                            Published upcoming class sessions will appear here.
                        </p>
                    </div>
                )}
            </Card>
        </section>
    );
}

export function TeacherUpcomingClasses({ classes }: { classes: TeacherDashboardClass[] }) {
    if (classes.length === 0) return null;

    return (
        <section aria-labelledby="teacher-more-classes-heading" className="min-w-0">
            <Card className="gap-0 py-0">
                <div className="flex items-center justify-between border-b px-4 py-4 sm:px-6">
                    <h2 id="teacher-more-classes-heading" className="text-base font-semibold">
                        More upcoming classes
                    </h2>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {classes.length}
                    </span>
                </div>
                <ul className="divide-y">
                    {classes.map((lesson) => (
                        <li key={lesson.id}>
                            <Link
                                href={`/teacher/lessons/${lesson.id}`}
                                aria-label={`View lesson: ${lesson.title}`}
                                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
                            >
                                <div className="min-w-15 text-muted-foreground">
                                    <ClassDateBlock dateKey={lesson.dateKey} />
                                </div>
                                <div className="min-w-0 [overflow-wrap:anywhere]">
                                    <p className="text-sm font-semibold text-foreground">
                                        {lesson.title}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                        <span className="tabular-nums">
                                            {lesson.startTime} - {lesson.endTime}
                                        </span>
                                        <span aria-hidden="true">/</span>
                                        <span>{lesson.courseName}</span>
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
