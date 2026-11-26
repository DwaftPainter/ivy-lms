"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    Eye,
    EyeOff,
    Link as LinkIcon,
    Play,
    Save,
    Settings
} from "lucide-react";

interface BuilderTopBarProps {
    isEditMode: boolean;
    assignmentTitle: string;
    totalQuestions: number;
    classSessionId: string | null;
    viewMode: "edit" | "preview";
    isDirty: boolean;
    isLoading: boolean;
    onBack: () => void;
    onViewModeChange: (mode: "edit" | "preview") => void;
    onTogglePreview: () => void;
    onSave: () => void;
}

export function BuilderTopBar({
    isEditMode,
    assignmentTitle,
    totalQuestions,
    classSessionId,
    viewMode,
    isDirty,
    isLoading,
    onBack,
    onViewModeChange,
    onTogglePreview,
    onSave
}: BuilderTopBarProps) {
    const isPreview = viewMode === "preview";
    const saveLabel = isLoading
        ? "Saving..."
        : isEditMode
          ? "Update"
          : classSessionId
            ? "Save & Link"
            : "Save";

    return (
        <header className="min-h-14 border-b bg-card flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-4 py-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 basis-48">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    aria-label="Back"
                    className="shrink-0"
                >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="min-w-0">
                        <h1 className="font-semibold text-sm truncate">
                            {isEditMode ? "Edit Assignment" : "Assignment Builder"}
                        </h1>
                        <p className="text-xs text-muted-foreground truncate">
                            {assignmentTitle} • {totalQuestions} questions
                        </p>
                    </div>
                    {classSessionId && (
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded shrink-0">
                            <LinkIcon className="h-3 w-3" aria-hidden="true" />
                            <span>Linked to Session</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0 max-w-full">
                <Tabs
                    value={viewMode}
                    onValueChange={(v) => onViewModeChange(v as "edit" | "preview")}
                >
                    <TabsList>
                        <TabsTrigger value="edit" className="gap-1.5">
                            <Settings className="h-4 w-4" aria-hidden="true" />
                            Builder
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="gap-1.5">
                            <Play className="h-4 w-4" aria-hidden="true" />
                            Preview
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="hidden sm:block h-6 w-px bg-border mx-1" />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onTogglePreview}
                    className="gap-1.5 shrink-0"
                >
                    {isPreview ? (
                        <>
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                            Edit
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            Preview
                        </>
                    )}
                </Button>

                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={!isDirty || isLoading}
                    className="gap-1.5 shrink-0"
                >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {saveLabel}
                </Button>
            </div>
        </header>
    );
}
