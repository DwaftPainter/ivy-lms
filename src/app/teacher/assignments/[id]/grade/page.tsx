"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTeacherGradingStore } from "@/store/teacher-grading.store";
import { StudentSubmissionList } from "@/components/grading/student-submission-list";
import { SubmissionViewer } from "@/components/grading/submission-viewer";
import { AssignmentContentViewer } from "@/components/grading/assignment-content-viewer";
import { RubricScoring } from "@/components/grading/rubric-scoring";
import { GradingHeader } from "@/components/grading/grading-header";
import { GradingActionBar } from "@/components/grading/grading-action-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const desktopRailQuery = "(min-width: 80rem)"; // Matches Tailwind's xl breakpoint.

export default function TeacherGradingPage() {
    const params = useParams();
    const assignmentId = params.id as string;
    const [submissionsSheetOpen, setSubmissionsSheetOpen] = useState(false);
    const selectedStudentHeadingRef = useRef<HTMLHeadingElement>(null);
    const submissionRailRef = useRef<HTMLDivElement>(null);
    const focusWorkspaceOnCloseRef = useRef(false);

    const {
        assignment,
        submissions,
        currentSubmissionId,
        isLoading,
        error,
        draftGrades,
        fetchSubmissions,
        setCurrentSubmission,
        updateDraftScore,
        updateBandScore,
        updateFeedback
    } = useTeacherGradingStore();

    // Use selectors for computed values to ensure reactivity
    const currentSubmission = useTeacherGradingStore((state) =>
        state.currentSubmissionId
            ? state.submissions.find((s) => s.id === state.currentSubmissionId) || null
            : null
    );

    useEffect(() => {
        if (assignmentId) {
            fetchSubmissions(assignmentId);
        }
    }, [assignmentId, fetchSubmissions]);

    useEffect(() => {
        const desktopRail = window.matchMedia(desktopRailQuery);
        const closeSheetOnDesktop = (event: MediaQueryListEvent) => {
            if (event.matches) setSubmissionsSheetOpen(false);
        };
        desktopRail.addEventListener("change", closeSheetOnDesktop);
        return () => desktopRail.removeEventListener("change", closeSheetOnDesktop);
    }, []);

    if (isLoading) {
        return (
            <div className="h-full p-6 space-y-6">
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-6 h-[calc(100vh-200px)]">
                    <Skeleton className="w-72 h-full" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!assignment || submissions.length === 0) {
        return (
            <div className="h-full p-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Submissions</AlertTitle>
                    <AlertDescription>
                        There are no submissions available for this assignment yet.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const draft = currentSubmissionId ? draftGrades.get(currentSubmissionId) : undefined;
    const currentIndex = currentSubmissionId
        ? submissions.findIndex((s) => s.id === currentSubmissionId)
        : -1;

    const handleSheetSelect = (submissionId: string) => {
        focusWorkspaceOnCloseRef.current = true;
        setCurrentSubmission(submissionId);
        setSubmissionsSheetOpen(false);
    };

    const savedScores = new Map(currentSubmission?.criteriaScores.map(({ criterionId, score }) => [criterionId, score]));
    const criteria = assignment.rubric?.criteria.map(({ id, name, maxScore }) => ({
        criterionId: id,
        criterionName: name,
        maxScore,
        score: savedScores.get(id)
    })) ?? [];

    return (
        <div className="min-h-full xl:h-full flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b bg-card">
                <GradingHeader />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 xl:hidden">
                    <Sheet open={submissionsSheetOpen} onOpenChange={setSubmissionsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Users className="size-4" aria-hidden="true" />
                                Submissions ({submissions.length})
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-80 p-0 sm:max-w-sm"
                            onCloseAutoFocus={(event) => {
                                const focusWorkspace = focusWorkspaceOnCloseRef.current;
                                focusWorkspaceOnCloseRef.current = false;
                                if (window.matchMedia(desktopRailQuery).matches) {
                                    event.preventDefault();
                                    submissionRailRef.current
                                        ?.querySelector<HTMLButtonElement>('button[aria-current="true"]')
                                        ?.focus();
                                } else if (focusWorkspace) {
                                    event.preventDefault();
                                    selectedStudentHeadingRef.current?.focus();
                                }
                            }}
                        >
                            <SheetHeader className="sr-only">
                                <SheetTitle>Student submissions</SheetTitle>
                                <SheetDescription>
                                    Select a student submission to review and grade.
                                </SheetDescription>
                            </SheetHeader>
                            <StudentSubmissionList
                                submissions={submissions}
                                currentSubmissionId={currentSubmissionId}
                                onSelect={handleSheetSelect}
                                className="h-full border-r-0"
                            />
                        </SheetContent>
                    </Sheet>

                    {currentSubmission && (
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <h2
                                ref={selectedStudentHeadingRef}
                                tabIndex={-1}
                                className="text-sm font-semibold focus:outline-none truncate"
                            >
                                {currentSubmission.student.firstName} {currentSubmission.student.lastName}
                            </h2>
                            <span className="text-xs text-muted-foreground tabular-nums">
                                {currentIndex + 1} / {submissions.length}
                            </span>
                            {draft?.isDraft && <Badge variant="outline">Unsaved draft</Badge>}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col xl:flex-row xl:overflow-hidden min-w-0">
                {/* Sidebar - Student List (>= 1280px inline rail) */}
                <div ref={submissionRailRef} className="hidden xl:block w-72 shrink-0">
                    <StudentSubmissionList
                        submissions={submissions}
                        currentSubmissionId={currentSubmissionId}
                        onSelect={setCurrentSubmission}
                        className="h-full"
                    />
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 xl:overflow-auto p-4 sm:p-6">
                        {currentSubmission ? (
                            <div className="max-w-5xl mx-auto space-y-6">
                                <Tabs defaultValue="submission" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="submission">Student Submission</TabsTrigger>
                                        <TabsTrigger value="assignment">Assignment Questions</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="submission" className="space-y-6">
                                        {/* Submission Viewer */}
                                        <SubmissionViewer
                                            submission={currentSubmission}
                                            skill={assignment.skill}
                                            assignment={assignment}
                                        />

                                        {/* Rubric Scoring */}
                                        <RubricScoring
                                            criteria={criteria}
                                            bandScore={currentSubmission.bandScore}
                                            feedback={currentSubmission.feedback}
                                            maxScore={assignment.maxScore}
                                            draftScores={draft?.criteriaScores || {}}
                                            draftBandScore={draft?.bandScore}
                                            draftFeedback={draft?.feedback}
                                            hasChanges={draft?.isDraft ?? false}
                                            onScoreChange={updateDraftScore}
                                            onBandScoreChange={updateBandScore}
                                            onFeedbackChange={updateFeedback}
                                        />
                                    </TabsContent>

                                    <TabsContent value="assignment">
                                        {/* Assignment Content / Questions */}
                                        <AssignmentContentViewer assignment={assignment} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto">
                                <AssignmentContentViewer assignment={assignment} />
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="shrink-0 p-4 border-t bg-card">
                        <GradingActionBar />
                    </div>
                </div>
            </div>
        </div>
    );
}
