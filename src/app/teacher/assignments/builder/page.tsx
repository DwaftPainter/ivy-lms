"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAssignmentBuilderStore } from "@/store/assignment-builder.store";
import { ComponentLibraryPanel } from "@/components/assignment-builder/component-library";
import { BuilderCanvas } from "@/components/assignment-builder/builder-canvas";
import { InspectorPanel } from "@/components/assignment-builder/inspector-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  EyeOff,
  Settings,
  ChevronLeft,
  Play,
  Link as LinkIcon,
} from "lucide-react";
import { IeltsSkill } from "@/generated/prisma/enums";
import { toast } from "sonner";
import { DndProvider } from "@/components/assignment-builder/dnd-context";
import { apiFetch } from "@/lib/api-fetch";
import type { Assignment } from "@/types/assignment-builder";
import { AssignmentType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

type NarrowPanel = "canvas" | "library" | "inspector";

export default function AssignmentBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const skill = (searchParams.get("skill") as IeltsSkill) || IeltsSkill.READING;
  const classSessionId = searchParams.get("classSessionId");
  const assignmentId = searchParams.get("assignmentId");
  const returnTo = searchParams.get("returnTo");
  const [isPreview, setIsPreview] = useState(false);
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
    getTotalQuestions,
  } = useAssignmentBuilderStore();

  // Fetch existing assignment if editing
  const fetchAssignment = useCallback(async (id: string) => {
    setIsFetching(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        data: {
          id: string;
          title: string;
          description: string;
          type: AssignmentType;
          skill: IeltsSkill;
          instructions: string | null;
          isPublished: boolean;
          content: {
            sections: Assignment["sections"];
            totalTime: number;
            totalPoints: number;
          } | null;
          createdAt: string;
          updatedAt: string;
        };
      }>(`/api/teacher/assignments/${id}`);

      const assignmentData = response.data;

      // Convert API response to Assignment type
      const loadedAssignment: Assignment = {
        id: assignmentData.id,
        title: assignmentData.title,
        description: assignmentData.description,
        skill: assignmentData.skill,
        type: assignmentData.type,
        sections: assignmentData.content?.sections || [],
        totalTime: assignmentData.content?.totalTime || (skill === IeltsSkill.READING ? 60 : 30),
        totalPoints: assignmentData.content?.totalPoints || 40,
        instructions: assignmentData.instructions || "",
        metadata: {
          createdAt: assignmentData.createdAt,
          updatedAt: assignmentData.updatedAt,
          createdBy: "",
          difficulty: "medium",
          tags: [],
          isPublished: assignmentData.isPublished
        }
      };

      loadAssignment(loadedAssignment, classSessionId || undefined);
      setIsEditMode(true);
    } catch {
      toast.error("Failed to load assignment");
      // Initialize new assignment on error
      initializeAssignment(skill, "current-teacher-id", classSessionId || undefined);
    } finally {
      setIsFetching(false);
    }
  }, [loadAssignment, initializeAssignment, skill, classSessionId]);

  useEffect(() => {
    if (assignmentId) {
      // Editing existing assignment
      fetchAssignment(assignmentId);
    } else {
      // Creating new assignment
      initializeAssignment(skill, "current-teacher-id", classSessionId || undefined);
      setIsEditMode(false);
    }
    if (classSessionId) {
      setClassSessionId(classSessionId);
    }
  }, [initializeAssignment, loadAssignment, skill, classSessionId, setClassSessionId, assignmentId, fetchAssignment]);

  const handleSave = async () => {
    try {
      // First save locally
      await saveAssignment();

      if (isEditMode && assignmentId) {
        // Update existing assignment
        await updateToBackend(assignmentId);
        toast.success("Assignment updated successfully");
      } else if (classSessionId) {
        // Create new assignment and link to session
        await saveToBackend(classSessionId);
        toast.success("Assignment created and linked to session");
      } else {
        toast.success("Assignment saved successfully");
      }

      // Navigate back if returnTo is specified
      if (returnTo) {
        router.push(returnTo);
      }
    } catch {
      toast.error(isEditMode ? "Failed to update assignment" : "Failed to save assignment");
    }
  };

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push("/teacher/assignments");
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
    setViewMode(isPreview ? "edit" : "preview");
  };

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
        {/* Header */}
        <header className="min-h-14 border-b bg-card flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 sm:px-4 py-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 basis-48">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
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
                  {assignment.title} • {getTotalQuestions()} questions
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
              onValueChange={(v) => setViewMode(v as "edit" | "preview")}
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
              onClick={togglePreview}
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
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="gap-1.5 shrink-0"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isLoading ? "Saving..." : (isEditMode ? "Update" : (classSessionId ? "Save & Link" : "Save"))}
            </Button>
          </div>
        </header>

        {/* Narrow-panel task view switcher (D-04, below xl) */}
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
                { id: "inspector", label: selectedId ? "Inspector •" : "Inspector" },
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

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Left Panel - Component Library */}
          {!isPreview && (
            <div
              className={cn(
                "border-r bg-card flex-col overflow-hidden min-h-0",
                narrowPanel === "library"
                  ? "flex w-full xl:w-80 xl:shrink-0"
                  : "hidden xl:flex xl:w-80 xl:shrink-0"
              )}
            >
              <ComponentLibraryPanel skill={skill} onItemInserted={handleItemInserted} />
            </div>
          )}

          {/* Center - Builder Canvas */}
          <div
            className={cn(
              "flex-1 min-w-0 min-h-0 flex-col overflow-hidden",
              isPreview || narrowPanel === "canvas" ? "flex" : "hidden xl:flex"
            )}
          >
            <BuilderCanvas
              isPreview={isPreview}
              onOpenInspector={() => {
                if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1280px)").matches) {
                  setNarrowPanel("inspector");
                }
              }}
            />
          </div>

          {/* Right Panel - Inspector */}
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
