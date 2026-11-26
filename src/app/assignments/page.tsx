"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/layout/auth-guard";
import AppSidebar from "@/components/layout/app-sidebar";
import MainHeader from "@/components/layout/main-header";
import { WorkInProgressWrapper } from "@/components/custom-ui/work-in-progress";
import { sidebarNavConfig } from "@/config/student/side-bar-config";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";
import { apiFetch, getErrorMessage } from "@/lib/api-fetch";
import {
    IELTS_SKILL_LABELS,
    getSkillLabel,
    getStudentSubmissionStatusBadge,
    type BadgeVariant
} from "@/lib/ielts-badges";
import { cn } from "@/lib/utils";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Clock,
    GraduationCap,
    RotateCcw,
    Search,
    X
} from "lucide-react";

interface AssignmentSummary {
    id: string;
    title: string;
    description?: string;
    type: string;
    skill: IeltsSkill;
    dueDate?: string | null;
    maxScore: number;
    course?: {
        id: string;
        title: string;
    } | null;
    classSession?: {
        id: string;
        title: string;
    } | null;
    isOverdue: boolean;
    submissionStatus: SubmissionStatus;
    submission?: {
        id: string;
        status: SubmissionStatus;
        submittedAt?: string | null;
        gradedAt?: string | null;
        score?: number | null;
        bandScore?: number | null;
        feedback?: string | null;
    } | null;
}

interface AssignmentsData {
    assignments: AssignmentSummary[];
}

type StatusFilterValue =
    | "all"
    | "todo"
    | "overdue"
    | "in_progress"
    | "not_started"
    | "submitted"
    | "graded"
    | "returned";

type TodoBucket = "overdue" | "in_progress" | "upcoming" | "undated";

interface ClassifiedAssignment {
    assignment: AssignmentSummary;
    deadline: Date | null;
    isPending: boolean;
    isOverdue: boolean;
    hasDraft: boolean;
    todoBucket: TodoBucket | null;
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
});

const TODO_GROUP_LABELS: Record<TodoBucket, string> = {
    overdue: "Overdue",
    in_progress: "Drafts in progress",
    upcoming: "Upcoming deadlines",
    undated: "No due date"
};

const TODO_BUCKET_ORDER: TodoBucket[] = ["overdue", "in_progress", "upcoming", "undated"];

function parseValidDate(value?: string | null): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function classifyAssignment(assignment: AssignmentSummary, nowMs: number): ClassifiedAssignment {
    const deadline = parseValidDate(assignment.dueDate);
    const isPending = assignment.submissionStatus === SubmissionStatus.PENDING;
    const isPastDue = Boolean(deadline && deadline.getTime() < nowMs);
    const isOverdue = isPending && (assignment.isOverdue || isPastDue);
    const hasDraft = isPending && Boolean(assignment.submission);

    let todoBucket: TodoBucket | null = null;
    if (isPending) {
        if (isOverdue) {
            todoBucket = "overdue";
        } else if (hasDraft) {
            todoBucket = "in_progress";
        } else if (deadline) {
            todoBucket = "upcoming";
        } else {
            todoBucket = "undated";
        }
    }

    return {
        assignment,
        deadline,
        isPending,
        isOverdue,
        hasDraft,
        todoBucket
    };
}

function getRowPresentation(item: ClassifiedAssignment): {
    statusLabel: string;
    statusVariant: BadgeVariant;
    actionLabel: string;
    actionVariant: "default" | "outline";
} {
    const { assignment, hasDraft, isPending } = item;

    if (isPending) {
        if (hasDraft) {
            return {
                statusLabel: "In progress",
                statusVariant: "secondary",
                actionLabel: "Resume assignment",
                actionVariant: "default"
            };
        }
        return {
            statusLabel: "Not started",
            statusVariant: "outline",
            actionLabel: "Open assignment",
            actionVariant: "default"
        };
    }

    const completedBadge = getStudentSubmissionStatusBadge(assignment.submissionStatus);
    const hasDestinationResult =
        (assignment.submissionStatus === SubmissionStatus.GRADED ||
            assignment.submissionStatus === SubmissionStatus.RETURNED) &&
        assignment.skill === IeltsSkill.WRITING &&
        Boolean(assignment.submission?.feedback);

    return {
        statusLabel: completedBadge.label,
        statusVariant: completedBadge.variant,
        actionLabel: hasDestinationResult ? "View result" : "View submission",
        actionVariant: "outline"
    };
}

function formatScoreLabel(assignment: AssignmentSummary): string | null {
    const band = assignment.submission?.bandScore;
    if (band !== null && band !== undefined) {
        return `Band ${band} / 9`;
    }
    const rawScore = assignment.submission?.score;
    if (rawScore !== null && rawScore !== undefined) {
        return `Score ${rawScore} / ${assignment.maxScore}`;
    }
    return null;
}

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

function AssignmentRow({ item }: { item: ClassifiedAssignment }) {
    const { assignment, deadline, isOverdue, isPending } = item;
    const { statusLabel, statusVariant, actionLabel, actionVariant } = getRowPresentation(item);
    const scoreLabel = formatScoreLabel(assignment);

    return (
        <li className="px-4 py-4 transition-colors hover:bg-muted/40 sm:px-6">
            <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4 xl:grid-cols-[minmax(0,1fr)_10.5rem_11.5rem_11.5rem]">
                {/* Title, course, and optional feedback preview */}
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

                    {/* Inline metadata & badges on compact viewports before 4-col xl grid */}
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

                {/* Desktop (>= xl) aligned skill and status column */}
                <div className="hidden xl:block">
                    <AssignmentBadges
                        skill={assignment.skill}
                        statusLabel={statusLabel}
                        statusVariant={statusVariant}
                        isOverdue={isOverdue}
                    />
                </div>

                {/* Desktop (>= xl) aligned deadline and score column */}
                <div className="hidden text-sm xl:flex xl:flex-col xl:items-start xl:gap-0.5">
                    <AssignmentTiming
                        assignment={assignment}
                        deadline={deadline}
                        isOverdue={isOverdue}
                        isPending={isPending}
                        scoreLabel={scoreLabel}
                    />
                </div>

                {/* Direct row action */}
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

function AssignmentsLoadingSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true">
            <p role="status" className="sr-only">
                Loading assignments
            </p>
            <div className="space-y-2">
                <Skeleton className="h-9 w-56 motion-reduce:animate-none" />
                <Skeleton className="h-5 w-72 max-w-full motion-reduce:animate-none" />
            </div>
            <Card className="p-4 shadow-none">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Skeleton className="h-9 flex-1 motion-reduce:animate-none" />
                    <Skeleton className="h-9 w-full sm:w-40 motion-reduce:animate-none" />
                    <Skeleton className="h-9 w-full sm:w-40 motion-reduce:animate-none" />
                </div>
            </Card>
            <Card className="gap-0 py-0 shadow-none">
                <div className="border-b px-4 py-4 sm:px-6">
                    <Skeleton className="h-6 w-32 motion-reduce:animate-none" />
                </div>
                <div className="divide-y">
                    {[1, 2, 3].map((row) => (
                        <div key={row} className="space-y-2 px-4 py-4 sm:px-6">
                            <Skeleton className="h-5 w-2/3 motion-reduce:animate-none" />
                            <Skeleton className="h-4 w-1/3 motion-reduce:animate-none" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default function StudentAssignmentsPage() {
    const [nowMs] = useState(() => Date.now());
    const [data, setData] = useState<AssignmentsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
    const [skillFilter, setSkillFilter] = useState<string>("all");

    const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{
                success: boolean;
                data: AssignmentsData;
            }>("/api/student/assignments");
            setData(response.data);
        } catch (err) {
            setError(getErrorMessage(err) || "Could not load your assignments.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSkillFilter("all");
    };

    const hasActiveFilters =
        searchQuery.trim().length > 0 || statusFilter !== "all" || skillFilter !== "all";

    const classified = useMemo(() => {
        const items = data?.assignments ?? [];
        return items.map((assignment) => classifyAssignment(assignment, nowMs));
    }, [data?.assignments, nowMs]);

    const overviewCounts = useMemo(() => {
        let todoCount = 0;
        let overdueCount = 0;
        let draftCount = 0;
        let completedCount = 0;

        for (const item of classified) {
            if (item.isPending) {
                todoCount += 1;
                if (item.isOverdue) overdueCount += 1;
                if (item.hasDraft) draftCount += 1;
            } else {
                completedCount += 1;
            }
        }

        return { todoCount, overdueCount, draftCount, completedCount };
    }, [classified]);

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return classified.filter((item) => {
            const { assignment, isOverdue, hasDraft, isPending } = item;

            if (normalizedQuery) {
                const inTitle = assignment.title.toLowerCase().includes(normalizedQuery);
                const inCourse =
                    assignment.course?.title.toLowerCase().includes(normalizedQuery) ?? false;
                if (!inTitle && !inCourse) return false;
            }

            if (skillFilter !== "all" && assignment.skill !== skillFilter) {
                return false;
            }

            switch (statusFilter) {
                case "todo":
                    return isPending;
                case "overdue":
                    return isOverdue;
                case "in_progress":
                    return isPending && hasDraft;
                case "not_started":
                    return isPending && !hasDraft;
                case "submitted":
                    return assignment.submissionStatus === SubmissionStatus.SUBMITTED;
                case "graded":
                    return assignment.submissionStatus === SubmissionStatus.GRADED;
                case "returned":
                    return assignment.submissionStatus === SubmissionStatus.RETURNED;
                case "all":
                default:
                    return true;
            }
        });
    }, [classified, searchQuery, skillFilter, statusFilter]);

    const todoGroups = useMemo(() => {
        const buckets: Record<TodoBucket, ClassifiedAssignment[]> = {
            overdue: [],
            in_progress: [],
            upcoming: [],
            undated: []
        };

        for (const item of filteredItems) {
            if (item.todoBucket) {
                buckets[item.todoBucket].push(item);
            }
        }

        const sortByDue = (a: ClassifiedAssignment, b: ClassifiedAssignment) =>
            (a.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER) -
            (b.deadline?.getTime() ?? Number.MAX_SAFE_INTEGER);

        buckets.overdue.sort(sortByDue);
        buckets.in_progress.sort(sortByDue);
        buckets.upcoming.sort(sortByDue);
        buckets.undated.sort((a, b) => a.assignment.title.localeCompare(b.assignment.title));

        return TODO_BUCKET_ORDER.map((key) => ({
            key,
            label: TODO_GROUP_LABELS[key],
            items: buckets[key]
        })).filter((group) => group.items.length > 0);
    }, [filteredItems]);

    const todoFilteredCount = useMemo(
        () => todoGroups.reduce((total, group) => total + group.items.length, 0),
        [todoGroups]
    );

    const completedItems = useMemo(() => {
        return filteredItems
            .filter((item) => !item.isPending)
            .sort((a, b) => {
                const aActivity =
                    parseValidDate(a.assignment.submission?.gradedAt)?.getTime() ??
                    parseValidDate(a.assignment.submission?.submittedAt)?.getTime() ??
                    a.deadline?.getTime() ??
                    0;
                const bActivity =
                    parseValidDate(b.assignment.submission?.gradedAt)?.getTime() ??
                    parseValidDate(b.assignment.submission?.submittedAt)?.getTime() ??
                    b.deadline?.getTime() ??
                    0;
                return bActivity - aActivity;
            });
    }, [filteredItems]);

    const isCompletedOnlyFilter =
        statusFilter === "submitted" ||
        statusFilter === "graded" ||
        statusFilter === "returned";

    const buildSummaryLine = () => {
        const parts: string[] = [];
        parts.push(`${overviewCounts.todoCount} to do`);
        if (overviewCounts.overdueCount > 0) {
            parts.push(`${overviewCounts.overdueCount} overdue`);
        }
        if (overviewCounts.draftCount > 0) {
            parts.push(`${overviewCounts.draftCount} in progress`);
        }
        parts.push(`${overviewCounts.completedCount} submitted or graded`);
        return parts.join(", ");
    };

    return (
        <AuthGuard>
            <SidebarProvider>
                <AppSidebar navMain={sidebarNavConfig} />
                <SidebarInset className="min-w-0">
                    <MainHeader navMain={sidebarNavConfig} />
                    <WorkInProgressWrapper>
                        <main className="flex-1 min-w-0 bg-[rgb(241,241,241)]">
                            <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-7 sm:pt-10 lg:px-9">
                                {isLoading ? (
                                    <AssignmentsLoadingSkeleton />
                                ) : error ? (
                                    <div className="space-y-6">
                                        <header>
                                            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                                Assignments
                                            </h1>
                                        </header>
                                        <Card className="p-6 shadow-none">
                                            <div role="alert" className="flex items-start gap-3">
                                                <AlertCircle
                                                    className="mt-0.5 size-5 shrink-0 text-destructive"
                                                    aria-hidden="true"
                                                />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h2 className="text-base font-semibold text-foreground">
                                                            Could not load assignments
                                                        </h2>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {error}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={fetchAssignments}
                                                    >
                                                        <RotateCcw
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                        Try again
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Page heading and status summary */}
                                        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                            <div className="min-w-0">
                                                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                                    Assignments
                                                </h1>
                                                <p className="mt-1.5 text-sm text-text-primary [overflow-wrap:anywhere] sm:text-base">
                                                    {classified.length === 0
                                                        ? "Assignments from your courses will appear here."
                                                        : buildSummaryLine()}
                                                </p>
                                            </div>
                                            <Link
                                                href="/dashboard"
                                                className="inline-flex min-h-8 shrink-0 items-center self-start rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
                                            >
                                                Back to study plan
                                            </Link>
                                        </header>

                                        {classified.length === 0 ? (
                                            <Card className="p-6 shadow-none sm:p-8">
                                                <div className="flex flex-col items-start gap-4">
                                                    <div className="space-y-1.5">
                                                        <h2 className="text-lg font-semibold text-foreground">
                                                            No assignments yet
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            When your instructors publish coursework
                                                            for your enrolled courses, it will show
                                                            up here in one place.
                                                        </p>
                                                    </div>
                                                    <Button asChild variant="outline">
                                                        <Link href="/courses">Browse courses</Link>
                                                    </Button>
                                                </div>
                                            </Card>
                                        ) : (
                                            <>
                                                {/* Search & filters */}
                                                <section aria-label="Filter assignments">
                                                    <Card className="p-3.5 shadow-none sm:p-4">
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                                            <div className="relative flex-1 min-w-0">
                                                                <Search
                                                                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                                                    aria-hidden="true"
                                                                />
                                                                <Input
                                                                    type="search"
                                                                    placeholder="Search by assignment or course..."
                                                                    aria-label="Search assignments"
                                                                    value={searchQuery}
                                                                    onChange={(e) =>
                                                                        setSearchQuery(
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "pl-9",
                                                                        searchQuery && "pr-9"
                                                                    )}
                                                                />
                                                                {searchQuery && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSearchQuery("")
                                                                        }
                                                                        aria-label="Clear search"
                                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                                                                    >
                                                                        <X
                                                                            className="size-3.5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                                                                <Select
                                                                    value={statusFilter}
                                                                    onValueChange={(value) =>
                                                                        setStatusFilter(
                                                                            value as StatusFilterValue
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger
                                                                        aria-label="Filter by status"
                                                                        className="w-full sm:w-44"
                                                                    >
                                                                        <SelectValue placeholder="All statuses" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">
                                                                            All statuses
                                                                        </SelectItem>
                                                                        <SelectItem value="todo">
                                                                            To do
                                                                        </SelectItem>
                                                                        <SelectItem value="overdue">
                                                                            Overdue
                                                                        </SelectItem>
                                                                        <SelectItem value="in_progress">
                                                                            In progress
                                                                        </SelectItem>
                                                                        <SelectItem value="not_started">
                                                                            Not started
                                                                        </SelectItem>
                                                                        <SelectItem value="submitted">
                                                                            Submitted
                                                                        </SelectItem>
                                                                        <SelectItem value="graded">
                                                                            Graded
                                                                        </SelectItem>
                                                                        <SelectItem value="returned">
                                                                            Returned
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>

                                                                <Select
                                                                    value={skillFilter}
                                                                    onValueChange={setSkillFilter}
                                                                >
                                                                    <SelectTrigger
                                                                        aria-label="Filter by skill"
                                                                        className="w-full sm:w-40"
                                                                    >
                                                                        <SelectValue placeholder="All skills" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="all">
                                                                            All skills
                                                                        </SelectItem>
                                                                        {(
                                                                            Object.keys(
                                                                                IeltsSkill
                                                                            ) as IeltsSkill[]
                                                                        ).map((skill) => (
                                                                            <SelectItem
                                                                                key={skill}
                                                                                value={skill}
                                                                            >
                                                                                {
                                                                                    IELTS_SKILL_LABELS[
                                                                                        skill
                                                                                    ]
                                                                                }
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>

                                                                {hasActiveFilters && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={resetFilters}
                                                                        className="col-span-2 justify-center sm:col-span-1"
                                                                    >
                                                                        <RotateCcw
                                                                            className="size-3.5"
                                                                            aria-hidden="true"
                                                                        />
                                                                        Reset filters
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </section>

                                                {filteredItems.length === 0 ? (
                                                    <Card className="p-6 shadow-none sm:p-8">
                                                        <div className="flex flex-col items-start gap-4">
                                                            <div className="space-y-1.5">
                                                                <h2 className="text-lg font-semibold text-foreground">
                                                                    No matching assignments
                                                                </h2>
                                                                <p className="text-sm text-muted-foreground">
                                                                    No assignments match your
                                                                    current search or filters.
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={resetFilters}
                                                            >
                                                                <RotateCcw
                                                                    className="size-4"
                                                                    aria-hidden="true"
                                                                />
                                                                Reset filters
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ) : (
                                                    <div className="space-y-6">
                                                        {/* Primary Section: To do */}
                                                        {!isCompletedOnlyFilter && (
                                                            <section
                                                                aria-labelledby="todo-section-heading"
                                                                className="min-w-0"
                                                            >
                                                                <Card className="gap-0 border-primary/15 py-0 shadow-none">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
                                                                        <div className="flex items-center gap-2">
                                                                            <ClipboardList
                                                                                className="size-4 shrink-0 text-primary"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <h2
                                                                                id="todo-section-heading"
                                                                                className="text-base font-semibold text-foreground"
                                                                            >
                                                                                To do
                                                                            </h2>
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground tabular-nums">
                                                                            {todoFilteredCount}{" "}
                                                                            {todoFilteredCount === 1
                                                                                ? "assignment"
                                                                                : "assignments"}
                                                                        </span>
                                                                    </div>

                                                                    {todoFilteredCount === 0 ? (
                                                                        <CardContent className="px-4 py-6 sm:px-6">
                                                                            <p className="text-sm text-muted-foreground">
                                                                                All caught up —
                                                                                nothing pending here.
                                                                            </p>
                                                                        </CardContent>
                                                                    ) : (
                                                                        <div>
                                                                            {todoGroups.map(
                                                                                (group) => (
                                                                                    <div
                                                                                        key={
                                                                                            group.key
                                                                                        }
                                                                                        className={cn(
                                                                                            group.key ===
                                                                                                "overdue" &&
                                                                                                "border-l-2 border-l-destructive"
                                                                                        )}
                                                                                    >
                                                                                        {(todoGroups.length >
                                                                                            1 ||
                                                                                            group.key ===
                                                                                                "overdue" ||
                                                                                            group.key ===
                                                                                                "in_progress") && (
                                                                                            <div
                                                                                                className={cn(
                                                                                                    "border-b px-4 py-2 text-xs font-medium sm:px-6",
                                                                                                    group.key ===
                                                                                                        "overdue"
                                                                                                        ? "bg-destructive/5 text-destructive"
                                                                                                        : "bg-muted/40 text-muted-foreground"
                                                                                                )}
                                                                                            >
                                                                                                {
                                                                                                    group.label
                                                                                                }{" "}
                                                                                                (
                                                                                                {
                                                                                                    group
                                                                                                        .items
                                                                                                        .length
                                                                                                }
                                                                                                )
                                                                                            </div>
                                                                                        )}
                                                                                        <ul className="divide-y">
                                                                                            {group.items.map(
                                                                                                (
                                                                                                    item
                                                                                                ) => (
                                                                                                    <AssignmentRow
                                                                                                        key={
                                                                                                            item
                                                                                                                .assignment
                                                                                                                .id
                                                                                                        }
                                                                                                        item={
                                                                                                            item
                                                                                                        }
                                                                                                    />
                                                                                                )
                                                                                            )}
                                                                                        </ul>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </Card>
                                                            </section>
                                                        )}

                                                        {/* Secondary Section: Submitted, graded, and returned */}
                                                        {completedItems.length > 0 && (
                                                            <section
                                                                aria-labelledby="completed-section-heading"
                                                                className="min-w-0"
                                                            >
                                                                <Card className="gap-0 py-0 shadow-none">
                                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle2
                                                                                className="size-4 shrink-0 text-muted-foreground"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <h2
                                                                                id="completed-section-heading"
                                                                                className="text-base font-semibold text-foreground"
                                                                            >
                                                                                Submitted and graded
                                                                            </h2>
                                                                        </div>
                                                                        <span className="text-sm text-muted-foreground tabular-nums">
                                                                            {completedItems.length}{" "}
                                                                            {completedItems.length ===
                                                                            1
                                                                                ? "assignment"
                                                                                : "assignments"}
                                                                        </span>
                                                                    </div>
                                                                    <ul className="divide-y">
                                                                        {completedItems.map(
                                                                            (item) => (
                                                                                <AssignmentRow
                                                                                    key={
                                                                                        item
                                                                                            .assignment
                                                                                            .id
                                                                                    }
                                                                                    item={item}
                                                                                />
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </Card>
                                                            </section>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </main>
                    </WorkInProgressWrapper>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
