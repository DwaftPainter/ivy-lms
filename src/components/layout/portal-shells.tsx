"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, HelpCircle, Maximize2, Minimize2, X } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AppShell } from "@/components/layout/app-shell";
import AuthGuard from "@/components/layout/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { adminSidebarNavConfig } from "@/config/admin/side-bar-config";
import { sidebarNavConfig } from "@/config/student/side-bar-config";
import { teacherSidebarNavConfig } from "@/config/teacher/side-bar-config";
import { useAssignmentSessionStore } from "@/store/assignment-session.store";
import { useAuthStore } from "@/store/auth.store";

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        if (user && isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, user, router]);

    return (
        <main className="flex min-h-dvh justify-center bg-muted/60 px-4 py-4 sm:px-8 sm:py-8">
            <div className="my-auto grid w-full max-w-5xl min-w-0 rounded-xl border bg-card text-card-foreground lg:grid-cols-[1.1fr_1fr]">
                <div className="flex min-w-0 items-center justify-center px-5 py-8 sm:px-10 sm:py-12">
                    <div className="w-full max-w-[26rem] min-w-0">
                        <div className="mb-6 flex items-center gap-3 lg:hidden">
                            <Image src="/IVY_IELTS_Logo.svg" alt="" width={36} height={36} className="rounded-sm" />
                            <span className="text-sm font-semibold">IVY LMS</span>
                        </div>
                        {children}
                    </div>
                </div>
                <div className="relative m-3 hidden min-h-136 flex-col justify-between gap-12 overflow-hidden rounded-lg bg-primary p-10 text-primary-foreground lg:flex xl:p-12">
                    <div className="flex items-center gap-3">
                        <Image src="/IVY_IELTS_Logo.svg" alt="" width={52} height={52} className="rounded-sm" />
                        <span className="text-lg font-semibold">IVY LMS</span>
                    </div>
                    <div className="space-y-6">
                        <p className="max-w-[10ch] text-5xl font-semibold leading-tight tracking-tight">
                            IELTS practice and assessment
                        </p>
                        <div className="grid grid-cols-4 gap-2" aria-hidden="true">
                            {[0, 1, 2, 3].map((segment) => (
                                <span key={segment} className="h-1 rounded-full bg-primary-foreground/45" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export function StudentLayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <AppShell navMain={sidebarNavConfig} homeUrl="/dashboard">
                {children}
            </AppShell>
        </AuthGuard>
    );
}

export function TeacherLayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isBuilderPage = pathname?.includes("/teacher/assignments/builder");
    const isGraderPage =
        pathname?.includes("/teacher/assignments/") && pathname?.includes("/grade");

    const mainClassName = isBuilderPage
        ? "flex flex-col overflow-hidden"
        : isGraderPage
          ? "flex flex-col xl:overflow-hidden"
          : undefined;

    return (
        <AuthGuard>
            <AppShell
                navMain={teacherSidebarNavConfig}
                homeUrl="/teacher"
                mainClassName={mainClassName}
            >
                {children}
            </AppShell>
        </AuthGuard>
    );
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <AppShell navMain={adminSidebarNavConfig} homeUrl="/admin" useWipWrapper={false}>
                {children}
            </AppShell>
        </AdminGuard>
    );
}

export function AssignmentExamLayoutShell({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [finishDialogOpen, setFinishDialogOpen] = useState(false);
    const [showSubmittedToast, setShowSubmittedToast] = useState(false);
    const { currentAssignment, answers, submitAssignment, isSubmitting } =
        useAssignmentSessionStore();
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
                <div className="flex min-h-screen min-w-0 flex-col bg-background">
                    <header className="sticky top-0 z-50 flex min-h-14 flex-wrap items-center justify-between gap-2 bg-primary px-3 py-2 shadow-md sm:px-4">
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                aria-label="Go back"
                                className="shrink-0 text-text-secondary hover:bg-white/10 hover:text-text-secondary"
                            >
                                <ArrowLeft className="size-5" aria-hidden="true" />
                            </Button>
                            <h1 className="min-w-0 truncate text-base font-semibold text-text-secondary sm:text-lg">
                                {currentAssignment?.title || "Assignment"}
                            </h1>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                className="size-8 text-text-secondary hover:bg-white/10 hover:text-text-secondary"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="size-4" aria-hidden="true" />
                                ) : (
                                    <Maximize2 className="size-4" aria-hidden="true" />
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        aria-label="Assignment help"
                                        className="gap-1 px-2 text-text-secondary hover:bg-white/10 hover:text-text-secondary sm:px-3"
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

                            {isSubmitted ? (
                                <Badge className="border-green-300 bg-green-100 px-3 py-1 text-green-700">
                                    <CheckCircle2 className="mr-1 size-4" />
                                    Submitted
                                </Badge>
                            ) : (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setFinishDialogOpen(true)}
                                    disabled={!hasAnswers || isSubmitting}
                                    className="bg-white font-medium text-primary hover:bg-white/90"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </Button>
                            )}
                        </div>
                    </header>

                    <main className="min-w-0 flex-1 overflow-auto">{children}</main>

                    <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit Assignment?</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to submit? You will not be able to edit
                                    after submission.
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

                {showSubmittedToast && (
                    <div
                        className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
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
