"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BuilderCanvas } from "@/components/assignment-builder/builder-canvas";
import { BuilderTopBar } from "@/components/assignment-builder/builder-top-bar";
import { ComponentLibraryPanel } from "@/components/assignment-builder/component-library";
import { DndProvider } from "@/components/assignment-builder/dnd-context";
import { InspectorPanel } from "@/components/assignment-builder/inspector-panel";
import { IeltsSkill } from "@/generated/prisma/enums";
import { apiFetch } from "@/lib/api-fetch";
import {
    mapLoadedAssignment,
    type ApiAssignmentPayload
} from "@/lib/assignment-builder/builder-helpers";
import { cn } from "@/lib/utils";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import { toast } from "sonner";

type NarrowPanel = "canvas" | "library" | "inspector";

export default function AssignmentBuilderPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const skill = (searchParams.get("skill") as IeltsSkill) || IeltsSkill.READING;
    const classSessionId = searchParams.get("classSessionId");
    const assignmentId = searchParams.get("assignmentId");
    const returnTo = searchParams.get("returnTo");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [narrowPanel, setNarrowPanel] = useState<NarrowPanel>("canvas");

    const {
        initializeAssignment,
        loadAssignment,
        assignment,
        selectedId,
        isDirty,
        isLoading,
        saveAssignment,
        saveToBackend,
        updateToBackend,
        setClassSessionId,
        viewMode,
        setViewMode,
        getTotalQuestions
    } = useAssignmentBuilderStore();

    const fetchAssignment = useCallback(
        async (id: string) => {
            setIsFetching(true);
            try {
                const response = await apiFetch<{
                    success: boolean;
                    data: ApiAssignmentPayload;
                }>(`/api/teacher/assignments/${id}`);

                loadAssignment(
                    mapLoadedAssignment(response.data, skill),
                    classSessionId || undefined
                );
                setIsEditMode(true);
            } catch {
                toast.error("Failed to load assignment");
                initializeAssignment(skill, "current-teacher-id", classSessionId || undefined);
            } finally {
                setIsFetching(false);
            }
        },
        [loadAssignment, initializeAssignment, skill, classSessionId]
    );

    useEffect(() => {
        if (assignmentId) {
            fetchAssignment(assignmentId);
        } else {
            initializeAssignment(skill, "current-teacher-id", classSessionId || undefined);
            setIsEditMode(false);
        }
        if (classSessionId) {
            setClassSessionId(classSessionId);
        }
    }, [
        initializeAssignment,
        loadAssignment,
        skill,
        classSessionId,
        setClassSessionId,
        assignmentId,
        fetchAssignment
    ]);

    const handleSave = async () => {
        try {
            await saveAssignment();

            if (isEditMode && assignmentId) {
                await updateToBackend(assignmentId);
                toast.success("Assignment updated successfully");
            } else if (classSessionId) {
                await saveToBackend(classSessionId);
                toast.success("Assignment created and linked to session");
            } else {
                toast.success("Assignment saved successfully");
            }

            if (returnTo) {
                router.push(returnTo);
            }
        } catch {
            toast.error(isEditMode ? "Failed to update assignment" : "Failed to save assignment");
        }
    };

    const handleBack = () => {
        router.push(returnTo || "/teacher/assignments");
    };

    const isPreview = viewMode === "preview";

    const handleItemInserted = () => {
        if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1280px)").matches) {
            setNarrowPanel("canvas");
        }
    };

    if (!assignment || isFetching) {
        return (
            <div className="flex items-center justify-center h-[calc(100dvh-3rem)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <DndProvider>
            <div className="h-[calc(100dvh-3rem)] min-w-0 w-full flex flex-col bg-background overflow-hidden">
                <BuilderTopBar
                    isEditMode={isEditMode}
                    assignmentTitle={assignment.title}
                    totalQuestions={getTotalQuestions()}
                    classSessionId={classSessionId}
                    viewMode={viewMode}
                    isDirty={isDirty}
                    isLoading={isLoading}
                    onBack={handleBack}
                    onViewModeChange={setViewMode}
                    onTogglePreview={() => setViewMode(isPreview ? "edit" : "preview")}
                    onSave={handleSave}
                />

                {!isPreview && (
                    <div
                        role="tablist"
                        aria-label="Builder panels"
                        className="xl:hidden border-b bg-muted/40 px-3 sm:px-4 py-1.5 flex items-center gap-1 shrink-0"
                    >
                        {(
                            [
                                { id: "canvas", label: "Canvas" },
                                { id: "library", label: "Library" },
                                { id: "inspector", label: selectedId ? "Inspector •" : "Inspector" }
                            ] as const
                        ).map((panel) => {
                            const isActive = narrowPanel === panel.id;
                            return (
                                <button
                                    key={panel.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setNarrowPanel(panel.id)}
                                    className={cn(
                                        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isActive
                                            ? "bg-background text-foreground shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {panel.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex-1 min-h-0 flex overflow-hidden">
                    {!isPreview && (
                        <div
                            className={cn(
                                "border-r bg-card flex-col overflow-hidden min-h-0",
                                narrowPanel === "library"
                                    ? "flex w-full xl:w-80 xl:shrink-0"
                                    : "hidden xl:flex xl:w-80 xl:shrink-0"
                            )}
                        >
                            <ComponentLibraryPanel
                                skill={skill}
                                onItemInserted={handleItemInserted}
                            />
                        </div>
                    )}

                    <div
                        className={cn(
                            "flex-1 min-w-0 min-h-0 flex-col overflow-hidden",
                            isPreview || narrowPanel === "canvas" ? "flex" : "hidden xl:flex"
                        )}
                    >
                        <BuilderCanvas
                            isPreview={isPreview}
                            onOpenInspector={() => {
                                if (
                                    typeof window !== "undefined" &&
                                    !window.matchMedia("(min-width: 1280px)").matches
                                ) {
                                    setNarrowPanel("inspector");
                                }
                            }}
                        />
                    </div>

                    {!isPreview && (
                        <div
                            className={cn(
                                "border-l bg-card flex-col overflow-hidden min-h-0",
                                narrowPanel === "inspector"
                                    ? "flex w-full xl:w-80 xl:shrink-0"
                                    : "hidden xl:flex xl:w-80 xl:shrink-0"
                            )}
                        >
                            <InspectorPanel />
                        </div>
                    )}
                </div>
            </div>
        </DndProvider>
    );
}
