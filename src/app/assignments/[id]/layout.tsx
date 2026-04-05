"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, Menu, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import AuthGuard from "@/components/layout/auth-guard";

export default function AssignmentLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [finishDialogOpen, setFinishDialogOpen] = useState(false);
    const { currentAssignment, answers, submitAssignment, isSubmitting } = useAssignmentSessionStore();

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
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const handleFinish = async () => {
        if (!id) return;
        try {
            await submitAssignment(id as string);
            setFinishDialogOpen(false);
            router.push("/dashboard");
        } catch {
            // Error handled in store
        }
    };

    const hasAnswers = Object.values(answers).some((a) => a && a.trim().length > 0);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background flex flex-col">
                {/* Sticky Header */}
                <header className="sticky top-0 z-50 bg-primary h-14 flex items-center justify-between px-4 shadow-md">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-text-secondary hover:text-text-secondary hover:bg-white/10"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <h1 className="text-text-secondary font-semibold text-lg truncate max-w-[200px] sm:max-w-md">
                            {currentAssignment?.title || "Assignment"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Zoom Controls - Hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-1 mr-2">
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
                        </div>

                        {/* Fullscreen Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="text-text-secondary hover:text-text-secondary hover:bg-white/10 size-8"
                        >
                            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                        </Button>

                        {/* Help Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-text-secondary hover:text-text-secondary hover:bg-white/10 gap-1"
                                >
                                    <HelpCircle className="size-4" />
                                    <span className="hidden sm:inline">Help</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem>Assignment Instructions</DropdownMenuItem>
                                <DropdownMenuItem>Time Guidelines</DropdownMenuItem>
                                <DropdownMenuItem>Marking Criteria</DropdownMenuItem>
                                <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Finish Button */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setFinishDialogOpen(true)}
                            disabled={!hasAnswers || isSubmitting}
                            className="bg-white text-primary hover:bg-white/90 font-medium"
                        >
                            {isSubmitting ? "Submitting..." : "Finish"}
                        </Button>

                        {/* Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-text-secondary hover:text-text-secondary hover:bg-white/10"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto">{children}</main>

                {/* Finish Confirmation Dialog */}
                <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit Assignment?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to submit? You won&apos;t be able to make changes after submission.
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
        </AuthGuard>
    );
}
