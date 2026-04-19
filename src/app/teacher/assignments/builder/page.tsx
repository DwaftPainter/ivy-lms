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
import Link from "next/link";
import { IeltsSkill } from "@/generated/prisma/enums";
import { toast } from "sonner";
import { DndProvider } from "@/components/assignment-builder/dnd-context";
import { apiFetch } from "@/lib/api-fetch";
import type { Assignment } from "@/types/assignment-builder";
import { AssignmentType } from "@/generated/prisma/enums";

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

  const {
    initializeAssignment,
    loadAssignment,
    assignment,
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
    } catch (error) {
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
    } catch (error) {
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

  if (!assignment || isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DndProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-semibold text-sm">{isEditMode ? "Edit Assignment" : "Assignment Builder"}</h1>
                <p className="text-xs text-muted-foreground">
                  {assignment.title} • {getTotalQuestions()} questions
                </p>
              </div>
              {classSessionId && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                  <LinkIcon className="h-3 w-3" />
                  <span>Linked to Session</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "edit" | "preview")}
            >
              <TabsList>
                <TabsTrigger value="edit" className="gap-1.5">
                  <Settings className="h-4 w-4" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Play className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-6 w-px bg-border mx-2" />

            <Button
              variant="outline"
              size="sm"
              onClick={togglePreview}
              className="gap-1.5"
            >
              {isPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isLoading}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : (isEditMode ? "Update" : (classSessionId ? "Save & Link" : "Save"))}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Component Library */}
          {!isPreview && <ComponentLibraryPanel skill={skill} />}

          {/* Center - Builder Canvas */}
          <BuilderCanvas isPreview={isPreview} />

          {/* Right Panel - Inspector */}
          {!isPreview && <InspectorPanel />}
        </div>
      </div>
    </DndProvider>
  );
}
