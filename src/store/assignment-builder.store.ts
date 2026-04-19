/**
 * Assignment Builder Store
 * Manages the state of the IELTS assignment builder
 */

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { apiFetch } from "@/lib/api-fetch";
import type {
    Assignment,
    Section,
    Question,
    Passage,
    QuestionType
} from "@/types/assignment-builder";
import {
    createQuestion,
    createSection,
    createPassage,
    generateId
} from "@/lib/assignment-builder/question-config";
import { IeltsSkill, AssignmentType } from "@/generated/prisma/enums";

interface AssignmentBuilderState {
    // Core state
    assignment: Assignment | null;
    selectedId: string | null;
    expandedSections: string[];
    isDirty: boolean;
    isLoading: boolean;
    error: string | null;
    classSessionId: string | null;

    // View state
    viewMode: "edit" | "preview";
    activeTab: "builder" | "settings" | "preview";

    // Actions
    initializeAssignment: (skill: IeltsSkill, teacherId: string, classSessionId?: string) => void;
    loadAssignment: (assignment: Assignment, classSessionId?: string) => void;
    updateAssignment: (updates: Partial<Assignment>) => void;

    // Section actions
    addSection: () => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    deleteSection: (sectionId: string) => void;
    reorderSections: (sectionIds: string[]) => void;
    toggleSectionExpanded: (sectionId: string) => void;

    // Passage actions
    addPassage: (sectionId: string) => void;
    updatePassage: (sectionId: string, updates: Partial<Passage>) => void;
    deletePassage: (sectionId: string) => void;

    // Question actions
    addQuestion: (sectionId: string, type: QuestionType) => void;
    updateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
    deleteQuestion: (sectionId: string, questionId: string) => void;
    reorderQuestions: (sectionId: string, questionIds: string[]) => void;
    duplicateQuestion: (sectionId: string, questionId: string) => void;

    // Selection
    selectItem: (id: string | null) => void;
    getSelectedItem: () => { type: "assignment" | "section" | "question" | "passage" | null; item: unknown };

    // View mode
    setViewMode: (mode: "edit" | "preview") => void;
    setActiveTab: (tab: "builder" | "settings" | "preview") => void;

    // Class Session
    setClassSessionId: (classSessionId: string | null) => void;

    // Persistence
    saveAssignment: () => Promise<string | void>;
    saveToBackend: (classSessionId: string) => Promise<void>;
    resetAssignment: () => void;

    // Computed
    getTotalQuestions: () => number;
    getTotalPoints: () => number;
    getQuestionNumber: (sectionId: string, questionId: string) => number;
}

export const useAssignmentBuilderStore = create<AssignmentBuilderState>()(
    immer((set, get) => ({
        // Initial state
        assignment: null,
        selectedId: null,
        expandedSections: [],
        isDirty: false,
        isLoading: false,
        error: null,
        classSessionId: null,
        viewMode: "edit",
        activeTab: "builder",

        // Initialize new assignment
        initializeAssignment: (skill, teacherId, classSessionId) => {
            const now = new Date().toISOString();

            set((state) => {
                state.assignment = {
                    id: generateId("assignment"),
                    title: `New ${skill === IeltsSkill.READING ? "Reading" : "Listening"} Assignment`,
                    description: "",
                    skill,
                    type: skill === IeltsSkill.READING ? "READING" : "LISTENING",
                    sections: [],
                    totalTime: skill === IeltsSkill.READING ? 60 : 30,
                    totalPoints: 40,
                    instructions: "",
                    metadata: {
                        createdAt: now,
                        updatedAt: now,
                        createdBy: teacherId,
                        difficulty: "medium",
                        tags: [],
                        isPublished: false
                    }
                };
                state.classSessionId = classSessionId || null;
                state.isDirty = true;
                state.selectedId = null;
                state.expandedSections = [];
            });
        },

        // Load existing assignment
        loadAssignment: (assignment, classSessionId) => {
            set((state) => {
                state.assignment = assignment;
                state.classSessionId = classSessionId || null;
                state.isDirty = false;
                state.selectedId = null;
                state.expandedSections = assignment.sections.map((s) => s.id);
            });
        },

        // Update assignment
        updateAssignment: (updates) => {
            set((state) => {
                if (!state.assignment) return;
                Object.assign(state.assignment, updates);
                state.isDirty = true;
            });
        },

        // Add section
        addSection: () => {
            set((state) => {
                if (!state.assignment) return;

                const newSection = createSection(state.assignment.sections.length + 1);
                state.assignment.sections.push(newSection);
                state.expandedSections.push(newSection.id);
                state.isDirty = true;
                state.selectedId = newSection.id;
            });
        },

        // Update section
        updateSection: (sectionId, updates) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section) {
                    Object.assign(section, updates);
                    state.isDirty = true;
                }
            });
        },

        // Delete section
        deleteSection: (sectionId) => {
            set((state) => {
                if (!state.assignment) return;

                state.assignment.sections = state.assignment.sections.filter(
                    (s) => s.id !== sectionId
                );
                state.expandedSections = state.expandedSections.filter(
                    (id) => id !== sectionId
                );

                // Renumber remaining sections
                state.assignment.sections.forEach((s, idx) => {
                    s.partNumber = idx + 1;
                    s.title = s.title.startsWith("Part ") ? `Part ${idx + 1}` : s.title;
                });

                if (state.selectedId === sectionId) {
                    state.selectedId = null;
                }
                state.isDirty = true;
            });
        },

        // Reorder sections
        reorderSections: (sectionIds) => {
            set((state) => {
                if (!state.assignment) return;

                const sections = state.assignment.sections;
                const newOrder: Section[] = [];

                sectionIds.forEach((id, idx) => {
                    const section = sections.find((s) => s.id === id);
                    if (section) {
                        section.partNumber = idx + 1;
                        section.title = section.title.startsWith("Part ")
                            ? `Part ${idx + 1}`
                            : section.title;
                        newOrder.push(section);
                    }
                });

                state.assignment.sections = newOrder;
                state.isDirty = true;
            });
        },

        // Toggle section expanded
        toggleSectionExpanded: (sectionId) => {
            set((state) => {
                const index = state.expandedSections.indexOf(sectionId);
                if (index > -1) {
                    state.expandedSections.splice(index, 1);
                } else {
                    state.expandedSections.push(sectionId);
                }
            });
        },

        // Add passage
        addPassage: (sectionId) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.passage = createPassage();
                    state.isDirty = true;
                    state.selectedId = section.passage.id;
                }
            });
        },

        // Update passage
        updatePassage: (sectionId, updates) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section?.passage) {
                    Object.assign(section.passage, updates);
                    state.isDirty = true;
                }
            });
        },

        // Delete passage
        deletePassage: (sectionId) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.passage = undefined;
                    state.isDirty = true;
                }
            });
        },

        // Add question
        addQuestion: (sectionId, type) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section) {
                    const questionNumber = get().getQuestionNumber(sectionId, "");
                    const question = createQuestion(type, questionNumber);
                    section.questions.push(question as Question);
                    state.isDirty = true;
                    state.selectedId = question.id;
                }
            });
        },

        // Update question
        updateQuestion: (sectionId, questionId, updates) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                const question = section?.questions.find((q) => q.id === questionId);
                if (question) {
                    Object.assign(question, updates);
                    state.isDirty = true;
                }
            });
        },

        // Delete question
        deleteQuestion: (sectionId, questionId) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (section) {
                    section.questions = section.questions.filter((q) => q.id !== questionId);

                    // Renumber questions
                    section.questions.forEach((q, idx) => {
                        q.questionNumber = idx + 1;
                    });

                    if (state.selectedId === questionId) {
                        state.selectedId = null;
                    }
                    state.isDirty = true;
                }
            });
        },

        // Reorder questions
        reorderQuestions: (sectionId, questionIds) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                if (!section) return;

                const questions = section.questions;
                const newOrder: Question[] = [];

                questionIds.forEach((id, idx) => {
                    const question = questions.find((q) => q.id === id);
                    if (question) {
                        question.questionNumber = idx + 1;
                        newOrder.push(question);
                    }
                });

                section.questions = newOrder;
                state.isDirty = true;
            });
        },

        // Duplicate question
        duplicateQuestion: (sectionId, questionId) => {
            set((state) => {
                if (!state.assignment) return;

                const section = state.assignment.sections.find((s) => s.id === sectionId);
                const question = section?.questions.find((q) => q.id === questionId);
                if (section && question) {
                    const duplicated = {
                        ...question,
                        id: generateId("question"),
                        questionNumber: section.questions.length + 1
                    };
                    section.questions.push(duplicated as Question);
                    state.isDirty = true;
                    state.selectedId = duplicated.id;
                }
            });
        },

        // Select item
        selectItem: (id) => {
            set({ selectedId: id });
        },

        // Get selected item
        getSelectedItem: () => {
            const { assignment, selectedId } = get();
            if (!assignment || !selectedId) return { type: null, item: null };

            if (selectedId === assignment.id) {
                return { type: "assignment" as const, item: assignment };
            }

            for (const section of assignment.sections) {
                if (section.id === selectedId) {
                    return { type: "section" as const, item: section };
                }

                if (section.passage?.id === selectedId) {
                    return { type: "passage" as const, item: section.passage };
                }

                const question = section.questions.find((q) => q.id === selectedId);
                if (question) {
                    return { type: "question" as const, item: question };
                }
            }

            return { type: null, item: null };
        },

        // Set view mode
        setViewMode: (mode) => {
            set({ viewMode: mode });
        },

        // Set active tab
        setActiveTab: (tab) => {
            set({ activeTab: tab });
        },

        // Save assignment locally
        saveAssignment: async () => {
            const { assignment } = get();
            if (!assignment) return;

            set({ isLoading: true, error: null });

            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 500));

                set((state) => {
                    state.isDirty = false;
                    state.isLoading = false;
                    if (state.assignment) {
                        state.assignment.metadata.updatedAt = new Date().toISOString();
                    }
                });

                return assignment.id;
            } catch (err) {
                set({
                    error: err instanceof Error ? err.message : "Failed to save assignment",
                    isLoading: false
                });
                throw err;
            }
        },

        // Save assignment to backend API
        saveToBackend: async (classSessionId: string) => {
            const { assignment } = get();
            if (!assignment) return;

            set({ isLoading: true, error: null });

            try {
                // Map assignment type to proper AssignmentType enum
                let assignmentType: AssignmentType;
                const skill = assignment.skill;

                if (skill === IeltsSkill.WRITING) {
                    assignmentType = assignment.type === "WRITING_TASK1" ? AssignmentType.WRITING_TASK1 : AssignmentType.WRITING_TASK2;
                } else if (skill === IeltsSkill.SPEAKING) {
                    assignmentType = AssignmentType.SPEAKING;
                } else if (skill === IeltsSkill.LISTENING) {
                    assignmentType = AssignmentType.LISTENING;
                } else if (skill === IeltsSkill.READING) {
                    assignmentType = AssignmentType.READING;
                } else {
                    assignmentType = AssignmentType.MOCK_TEST;
                }

                await apiFetch<{
                    success: boolean;
                    data: { assignment: { id: string } };
                }>("/api/teacher/assignments", {
                    method: "POST",
                    body: JSON.stringify({
                        classSessionId,
                        title: assignment.title,
                        description: assignment.description,
                        type: assignmentType,
                        skill: assignment.skill,
                        instructions: assignment.instructions,
                        isPublished: assignment.metadata?.isPublished || false,
                        content: {
                            sections: assignment.sections,
                            totalTime: assignment.totalTime,
                            totalPoints: assignment.totalPoints
                        }
                    })
                });

                set((state) => {
                    state.isDirty = false;
                    state.isLoading = false;
                });
            } catch (err) {
                set({
                    error: err instanceof Error ? err.message : "Failed to save assignment",
                    isLoading: false
                });
                throw err;
            }
        },

        // Set classSessionId
        setClassSessionId: (classSessionId: string | null) => {
            set((state) => {
                state.classSessionId = classSessionId;
            });
        },

        // Reset assignment
        resetAssignment: () => {
            set({
                assignment: null,
                selectedId: null,
                expandedSections: [],
                isDirty: false,
                error: null,
                classSessionId: null
            });
        },

        // Get total questions
        getTotalQuestions: () => {
            const { assignment } = get();
            if (!assignment) return 0;
            return assignment.sections.reduce((total, section) => total + section.questions.length, 0);
        },

        // Get total points
        getTotalPoints: () => {
            const { assignment } = get();
            if (!assignment) return 0;
            return assignment.sections.reduce(
                (total, section) =>
                    total + section.questions.reduce((qTotal, q) => qTotal + (q.points || 1), 0),
                0
            );
        },

        // Get question number (global)
        getQuestionNumber: (sectionId, questionId) => {
            const { assignment } = get();
            if (!assignment) return 1;

            let number = 1;
            for (const section of assignment.sections) {
                if (section.id === sectionId) {
                    const idx = section.questions.findIndex((q) => q.id === questionId);
                    return idx >= 0 ? number + idx : number;
                }
                number += section.questions.length;
            }
            return number;
        }
    }))
);
