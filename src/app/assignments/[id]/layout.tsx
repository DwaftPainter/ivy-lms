"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, Maximize2, Minimize2, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import AuthGuard from "@/components/layout/auth-guard";

export default function AssignmentLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [finishDialogOpen, setFinishDialogOpen] = useState(false);
    const [showSubmittedToast, setShowSubmittedToast] = useState(false);
    const { currentAssignment, answers, submitAssignment, isSubmitting } = useAssignmentSessionStore();
    const isSubmitted = !!currentAssignment?.submission?.submittedAt;

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            // Cleanup assignment session state when component unmounts
            useAssignmentSessionStore.getState().clearSession();
        };
    }, []);

    const handleFinish = async () => {
        if (!id) return;
        try {
            await submitAssignment(id as string);
            setFinishDialogOpen(false);
            setShowSubmittedToast(true);
            setTimeout(() => setShowSubmittedToast(false), 3000);
        } catch {
            // Error handled in store
        }
    };

    const hasAnswers = Object.values(answers).some((a) => a && a.trim().length > 0);

    return (
        <AuthGuard>
            <>
                <div className="min-h-screen min-w-0 bg-background flex flex-col">
                    {/* Sticky Header */}
                    <header className="sticky top-0 z-50 bg-primary min-h-14 flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 shadow-md">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                aria-label="Go back"
                                className="shrink-0 text-text-secondary hover:text-text-secondary hover:bg-white/10"
                            >
                                <ArrowLeft className="size-5" aria-hidden="true" />
                            </Button>
                            <h1 className="text-text-secondary font-semibold text-base sm:text-lg truncate min-w-0">
                                {currentAssignment?.title || "Assignment"}
                            </h1>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                            {/* Zoom Controls */}
                            {/* <div className="hidden sm:flex items-center gap-1 mr-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-text-secondary hover:text-text-secondary hover:bg-white/10 size-8"
                                >
                                    <ZoomOut className="size-4" />
                                </Button>
                                <span className="text-text-secondary text-sm">100%</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-text-secondary hover:text-text-secondary hover:bg-white/10 size-8"
                                >
                                    <ZoomIn className="size-4" />
                                </Button>
                            </div> */}

                            {/* Fullscreen */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                className="text-text-secondary hover:text-text-secondary hover:bg-white/10 size-8"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="size-4" aria-hidden="true" />
                                ) : (
                                    <Maximize2 className="size-4" aria-hidden="true" />
                                )}
                            </Button>

                            {/* Help */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        aria-label="Assignment help"
                                        className="text-text-secondary hover:text-text-secondary hover:bg-white/10 gap-1 px-2 sm:px-3"
                                    >
                                        <HelpCircle className="size-4" aria-hidden="true" />
                                        <span className="hidden sm:inline">Help</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem>Assignment Instructions</DropdownMenuItem>
                                    <DropdownMenuItem>Time Guidelines</DropdownMenuItem>
                                    <DropdownMenuItem>Grading Criteria</DropdownMenuItem>
                                    <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Submit Button */}
                            {isSubmitted ? (
                                <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1">
                                    <CheckCircle2 className="size-4 mr-1" />
                                    Submitted
                                </Badge>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setFinishDialogOpen(true)}
                                    disabled={!hasAnswers || isSubmitting}
                                    className="bg-white text-primary hover:bg-white/90 font-medium"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            )}
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 min-w-0 overflow-auto">{children}</main>

                    {/* Confirmation Dialog */}
                    <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit Assignment?</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to submit? You will not be able to edit after
                                    submission.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setFinishDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleFinish} disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Toast */}
                {showSubmittedToast && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50" role="status" aria-live="polite">
                        <div className="bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
                            <CheckCircle2 className="size-5" aria-hidden="true" />
                            <span className="font-medium">Assignment submitted successfully!</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Dismiss notification"
                                className="size-6 text-white hover:bg-white/20"
                                onClick={() => setShowSubmittedToast(false)}
                            >
                                <X className="size-4" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                )}
            </>
        </AuthGuard>
    );
}
