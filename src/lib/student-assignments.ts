import { IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";
import { getStudentSubmissionStatusBadge, type BadgeVariant } from "@/lib/ielts-badges";

export interface AssignmentSummary {
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

export interface AssignmentsData {
    assignments: AssignmentSummary[];
}

export type StatusFilterValue =
    | "all"
    | "todo"
    | "overdue"
    | "in_progress"
    | "not_started"
    | "submitted"
    | "graded"
    | "returned";

export type TodoBucket = "overdue" | "in_progress" | "upcoming" | "undated";

export interface ClassifiedAssignment {
    assignment: AssignmentSummary;
    deadline: Date | null;
    isPending: boolean;
    isOverdue: boolean;
    hasDraft: boolean;
    todoBucket: TodoBucket | null;
}

export interface TodoGroup {
    key: TodoBucket;
    label: string;
    items: ClassifiedAssignment[];
}

export interface OverviewCounts {
    todoCount: number;
    overdueCount: number;
    draftCount: number;
    completedCount: number;
}

export interface AssignmentFilterCriteria {
    searchQuery: string;
    statusFilter: StatusFilterValue;
    skillFilter: string;
}

export interface RowPresentation {
    statusLabel: string;
    statusVariant: BadgeVariant;
    actionLabel: string;
    actionVariant: "default" | "outline";
}

export const TODO_GROUP_LABELS: Record<TodoBucket, string> = {
    overdue: "Overdue",
    in_progress: "Drafts in progress",
    upcoming: "Upcoming deadlines",
    undated: "No due date"
};

export const TODO_BUCKET_ORDER: TodoBucket[] = ["overdue", "in_progress", "upcoming", "undated"];

export function parseValidDate(value?: string | null): Date | null {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function classifyAssignment(
    assignment: AssignmentSummary,
    nowMs: number
): ClassifiedAssignment {
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

export function getRowPresentation(item: ClassifiedAssignment): RowPresentation {
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

export function formatScoreLabel(assignment: AssignmentSummary): string | null {
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

export function getOverviewCounts(classified: ClassifiedAssignment[]): OverviewCounts {
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
}

export function filterAssignments(
    classified: ClassifiedAssignment[],
    { searchQuery, statusFilter, skillFilter }: AssignmentFilterCriteria
): ClassifiedAssignment[] {
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
}

export function groupTodoAssignments(filteredItems: ClassifiedAssignment[]): TodoGroup[] {
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
}

export function getCompletedAssignments(
    filteredItems: ClassifiedAssignment[]
): ClassifiedAssignment[] {
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
}

export function formatAssignmentsSummaryLine(counts: OverviewCounts): string {
    const parts: string[] = [`${counts.todoCount} to do`];
    if (counts.overdueCount > 0) {
        parts.push(`${counts.overdueCount} overdue`);
    }
    if (counts.draftCount > 0) {
        parts.push(`${counts.draftCount} in progress`);
    }
    parts.push(`${counts.completedCount} submitted or graded`);
    return parts.join(", ");
}
