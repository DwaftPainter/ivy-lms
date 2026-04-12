"use client";

import { useEffect, useState } from "react";
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

export default function AssignmentBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const skill = (searchParams.get("skill") as IeltsSkill) || IeltsSkill.READING;
  const classSessionId = searchParams.get("classSessionId");
  const returnTo = searchParams.get("returnTo");
  const [isPreview, setIsPreview] = useState(false);

  const {
    initializeAssignment,
    assignment,
    isDirty,
    isLoading,
    saveAssignment,
    saveToBackend,
    setClassSessionId,
    viewMode,
    setViewMode,
    getTotalQuestions,
  } = useAssignmentBuilderStore();

  useEffect(() => {
    initializeAssignment(skill, "current-teacher-id", classSessionId || undefined);
    if (classSessionId) {
      setClassSessionId(classSessionId);
    }
  }, [initializeAssignment, skill, classSessionId, setClassSessionId]);

  const handleSave = async () => {
    try {
      // First save locally
      await saveAssignment();

      // If we have a classSessionId, also save to backend
      if (classSessionId) {
        await saveToBackend(classSessionId);

        // Optionally link the assignment to the session
        toast.success("Assignment created and linked to session");

        // Navigate back to lesson details if returnTo is specified
        if (returnTo) {
          router.push(returnTo);
          return;
        }
      } else {
        toast.success("Assignment saved successfully");
      }
    } catch (error) {
      toast.error("Failed to save assignment");
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

  if (!assignment) {
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
                <h1 className="font-semibold text-sm">Assignment Builder</h1>
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
              {isLoading ? "Saving..." : (classSessionId ? "Save & Link" : "Save")}
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
