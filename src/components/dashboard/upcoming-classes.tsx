import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassItem } from "@/store/class.store";

const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
});

function ClassDate({ lesson }: { lesson: ClassItem }) {
    const date = lesson.fullDate ? new Date(lesson.fullDate) : null;
    return (
        <time dateTime={lesson.fullDate?.slice(0, 10)} className="block leading-tight">
            <span className="block text-xs font-medium">{lesson.day}</span>
            <span className="mt-1 block text-lg font-semibold whitespace-nowrap">
                {date && Number.isFinite(date.getTime()) ? dateLabel.format(date) : lesson.date}
            </span>
        </time>
    );
}

export function NextClass({
    lesson,
    inProgress,
    isLoading,
    error,
    onRetry
}: {
    lesson: ClassItem | undefined;
    inProgress: boolean;
    isLoading: boolean;
    error: string | null;
    onRetry: () => void;
}) {
    return (
        <section aria-labelledby="next-class-heading" className="min-w-0">
            <Card className="h-full min-h-57 gap-5 border-primary bg-primary p-5 text-primary-foreground shadow-none sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h2 id="next-class-heading" className="flex items-center gap-2 text-sm font-semibold">
                        <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                        {lesson && inProgress && !isLoading && !error ? "Class in progress" : "Next class"}
                    </h2>
                    <Link
                        href="/extension?tab=schedule"
                        className="inline-flex min-h-8 items-center rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
                    >
                        View schedule
                    </Link>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        <p role="status" className="sr-only">Loading classes</p>
                        <Skeleton className="h-7 w-3/4 animate-none bg-primary-foreground/20" />
                        <Skeleton className="h-4 w-1/2 animate-none bg-primary-foreground/20" />
                    </div>
                ) : error ? (
                    <div className="space-y-3">
                        <p role="alert">Could not load classes.</p>
                        <Button variant="secondary" onClick={onRetry}>Retry classes</Button>
                    </div>
                ) : lesson ? (
                    <>
                        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:gap-4">
                            <div className="min-w-16 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-2.5 text-center sm:min-w-19">
                                <ClassDate lesson={lesson} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-xl leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-2xl">
                                    {lesson.title}
                                </h3>
                                <p className="mt-1 text-sm text-primary-foreground/90 [overflow-wrap:anywhere]">
                                    {lesson.course}
                                </p>
                            </div>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                            <p className="flex min-w-0 items-start gap-2 text-sm text-primary-foreground/90">
                                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                <span>
                                    <span className="block font-medium">{lesson.time}</span>
                                    <span className="[overflow-wrap:anywhere]">{lesson.instructor}</span>
                                </span>
                            </p>
                            <Button asChild variant="secondary" className="min-h-10 bg-primary-foreground text-primary hover:bg-primary-foreground/90 focus-visible:ring-primary-foreground">
                                <Link href={`/lessons/${lesson.id}`} aria-label={`View lesson: ${lesson.title}`}>
                                    View lesson <ArrowRight aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No upcoming classes</h3>
                        <p className="text-sm text-primary-foreground/90">Browse courses to find your next class.</p>
                        <Button asChild variant="secondary" className="mt-2 focus-visible:ring-primary-foreground">
                            <Link href="/courses">Browse courses</Link>
                        </Button>
                    </div>
                )}
            </Card>
        </section>
    );
}

export function UpcomingClasses({ classes }: { classes: ClassItem[] }) {
    if (classes.length === 0) return null;

    return (
        <section aria-labelledby="upcoming-classes-heading" className="min-w-0">
            <Card className="gap-0 py-0 shadow-none">
                <h2 id="upcoming-classes-heading" className="border-b px-4 py-4 text-base font-semibold sm:px-6">
                    More upcoming classes
                </h2>
                <ul className="divide-y">
                    {classes.map((lesson) => (
                        <li key={lesson.id}>
                            <Link
                                href={`/lessons/${lesson.id}`}
                                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6"
                            >
                                <div className="min-w-15 text-muted-foreground"><ClassDate lesson={lesson} /></div>
                                <div className="min-w-0 [overflow-wrap:anywhere]">
                                    <p className="text-sm font-semibold">{lesson.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {lesson.time}<span className="mx-1.5" aria-hidden="true">/</span>{lesson.course}
                                    </p>
                                </div>
                                <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </Card>
        </section>
    );
}
