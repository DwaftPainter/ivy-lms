import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IeltsSkill, SubmissionStatus } from "../../generated/prisma/enums";
import {
    classifyAssignment,
    filterAssignments,
    formatAssignmentsSummaryLine,
    formatScoreLabel,
    getCompletedAssignments,
    getOverviewCounts,
    getRowPresentation,
    groupTodoAssignments,
    type AssignmentSummary
} from "../student-assignments";

const NOW_MS = Date.parse("2026-06-15T12:00:00.000Z");

function makeAssignment(overrides: Partial<AssignmentSummary> = {}): AssignmentSummary {
    return {
        id: "a-1",
        title: "Sample Assignment",
        type: "ESSAY",
        skill: IeltsSkill.WRITING,
        dueDate: "2026-06-20T12:00:00.000Z",
        maxScore: 40,
        course: { id: "c-1", title: "Academic IELTS" },
        isOverdue: false,
        submissionStatus: SubmissionStatus.PENDING,
        submission: null,
        ...overrides
    };
}

describe("student-assignments domain rules", () => {
    it("classifies overdue, draft-in-progress, upcoming, undated, and completed items", () => {
        const overduePast = classifyAssignment(
            makeAssignment({ id: "1", dueDate: "2026-06-10T12:00:00.000Z" }),
            NOW_MS
        );
        const draft = classifyAssignment(
            makeAssignment({
                id: "2",
                submission: { id: "s-2", status: SubmissionStatus.PENDING }
            }),
            NOW_MS
        );
        const upcoming = classifyAssignment(makeAssignment({ id: "3" }), NOW_MS);
        const undated = classifyAssignment(makeAssignment({ id: "4", dueDate: null }), NOW_MS);
        const submittedLate = classifyAssignment(
            makeAssignment({
                id: "5",
                dueDate: "2026-06-10T12:00:00.000Z",
                isOverdue: true,
                submissionStatus: SubmissionStatus.SUBMITTED
            }),
            NOW_MS
        );

        assert.equal(overduePast.todoBucket, "overdue");
        assert.equal(overduePast.isOverdue, true);
        assert.equal(draft.todoBucket, "in_progress");
        assert.equal(upcoming.todoBucket, "upcoming");
        assert.equal(undated.todoBucket, "undated");
        assert.equal(submittedLate.isPending, false);
        assert.equal(submittedLate.isOverdue, false);
        assert.equal(submittedLate.todoBucket, null);
    });

    it("maps row presentation labels for pending, draft, writing result, and non-writing graded", () => {
        const notStarted = classifyAssignment(makeAssignment(), NOW_MS);
        const inProgress = classifyAssignment(
            makeAssignment({ submission: { id: "s1", status: SubmissionStatus.PENDING } }),
            NOW_MS
        );
        const writingResult = classifyAssignment(
            makeAssignment({
                skill: IeltsSkill.WRITING,
                submissionStatus: SubmissionStatus.GRADED,
                submission: { id: "s2", status: SubmissionStatus.GRADED, feedback: "Good structure" }
            }),
            NOW_MS
        );
        const readingGraded = classifyAssignment(
            makeAssignment({
                skill: IeltsSkill.READING,
                submissionStatus: SubmissionStatus.GRADED,
                submission: { id: "s3", status: SubmissionStatus.GRADED, feedback: "Good" }
            }),
            NOW_MS
        );

        assert.equal(getRowPresentation(notStarted).actionLabel, "Open assignment");
        assert.equal(getRowPresentation(inProgress).actionLabel, "Resume assignment");
        assert.equal(getRowPresentation(writingResult).actionLabel, "View result");
        assert.equal(getRowPresentation(readingGraded).actionLabel, "View submission");
    });

    it("formats scores preferring bandScore over raw score", () => {
        assert.equal(
            formatScoreLabel(
                makeAssignment({
                    submission: { id: "s1", status: SubmissionStatus.GRADED, bandScore: 7.5, score: 32 }
                })
            ),
            "Band 7.5 / 9"
        );
        assert.equal(
            formatScoreLabel(
                makeAssignment({
                    maxScore: 40,
                    submission: { id: "s1", status: SubmissionStatus.GRADED, score: 32 }
                })
            ),
            "Score 32 / 40"
        );
        assert.equal(formatScoreLabel(makeAssignment()), null);
    });

    it("filters by search query, skill, and status buckets accurately", () => {
        const items = [
            makeAssignment({
                id: "1",
                title: "Task 2 Essay",
                skill: IeltsSkill.WRITING,
                dueDate: "2026-06-01T00:00:00Z"
            }),
            makeAssignment({
                id: "2",
                title: "Listening Part 1",
                course: { id: "c2", title: "Listening Lab" },
                skill: IeltsSkill.LISTENING,
                submission: { id: "s2", status: SubmissionStatus.PENDING }
            }),
            makeAssignment({
                id: "3",
                title: "Reading Passage",
                skill: IeltsSkill.READING,
                submissionStatus: SubmissionStatus.GRADED,
                submission: {
                    id: "s3",
                    status: SubmissionStatus.GRADED,
                    gradedAt: "2026-06-14T10:00:00Z"
                }
            })
        ].map((item) => classifyAssignment(item, NOW_MS));

        assert.equal(
            filterAssignments(items, { searchQuery: "lab", statusFilter: "all", skillFilter: "all" })
                .length,
            1
        );
        assert.equal(
            filterAssignments(items, {
                searchQuery: "",
                statusFilter: "overdue",
                skillFilter: IeltsSkill.WRITING
            }).length,
            1
        );
        assert.equal(
            filterAssignments(items, {
                searchQuery: "",
                statusFilter: "in_progress",
                skillFilter: "all"
            })[0]?.assignment.id,
            "2"
        );
        assert.equal(
            filterAssignments(items, {
                searchQuery: "",
                statusFilter: "graded",
                skillFilter: "all"
            })[0]?.assignment.id,
            "3"
        );
    });

    it("groups todo buckets in priority order, sorts undated alphabetically, and sorts completed descending", () => {
        const items = [
            makeAssignment({ id: "u2", title: "Zebra", dueDate: null }),
            makeAssignment({ id: "u1", title: "Alpha", dueDate: null }),
            makeAssignment({ id: "o1", title: "Overdue", dueDate: "2026-06-01T00:00:00Z" }),
            makeAssignment({
                id: "d1",
                title: "Draft",
                submission: { id: "sd1", status: SubmissionStatus.PENDING }
            }),
            makeAssignment({
                id: "c1",
                title: "Older Graded",
                submissionStatus: SubmissionStatus.GRADED,
                submission: { id: "sc1", status: SubmissionStatus.GRADED, gradedAt: "2026-06-10T00:00:00Z" }
            }),
            makeAssignment({
                id: "c2",
                title: "Newer Graded",
                submissionStatus: SubmissionStatus.GRADED,
                submission: { id: "sc2", status: SubmissionStatus.GRADED, gradedAt: "2026-06-14T00:00:00Z" }
            })
        ].map((item) => classifyAssignment(item, NOW_MS));

        const groups = groupTodoAssignments(items);
        assert.deepEqual(
            groups.map((g) => g.key),
            ["overdue", "in_progress", "undated"]
        );
        assert.deepEqual(
            groups.find((g) => g.key === "undated")?.items.map((i) => i.assignment.id),
            ["u1", "u2"]
        );

        const completed = getCompletedAssignments(items);
        assert.deepEqual(
            completed.map((c) => c.assignment.id),
            ["c2", "c1"]
        );

        const counts = getOverviewCounts(items);
        assert.equal(formatAssignmentsSummaryLine(counts), "4 to do, 1 overdue, 1 in progress, 2 submitted or graded");
    });
});
