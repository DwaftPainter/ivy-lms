import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiFetch } from "@/lib/api-fetch";
import { AssignmentType, IeltsSkill, SubmissionStatus } from "@/generated/prisma/enums";

export interface AssignmentDetails {
    id: string;
    title: string;
    description?: string;
    type: AssignmentType;
    skill: IeltsSkill;
    dueDate: Date | null;
    maxScore: number;
    instructions?: string;
    attachmentUrl?: string;
    isPublished: boolean;
    createdAt: Date;
    isOverdue: boolean;
    course: {
        id: string;
        title: string;
        thumbnailUrl: string | null;
    };
    classSession: {
        id: string;
        title: string;
        scheduledDate: Date;
        startTime: string;
        endTime: string;
        courseId: string;
    };
    rubric?: {
        id: string;
        criteria: {
            id: string;
            name: string;
            description?: string;
            maxScore: number;
        }[];
    } | null;
    submission: {
        id: string;
        status: SubmissionStatus;
        content?: string | null;
        fileUrl?: string | null;
        audioUrl?: string | null;
        score?: number | null;
        bandScore?: number | null;
        feedback?: string | null;
        submittedAt?: Date | null;
        gradedAt?: Date | null;
        criteriaScores?: {
            score: number;
            criterion: {
                id: string;
                name: string;
            };
        }[];
        comments?: {
            id: string;
            content: string;
            createdAt: Date;
            author: {
                firstName: string;
                lastName: string;
                role: string;
            };
        }[];
    } | null;
}

export interface Question {
    id: string;
    type: "essay" | "multiple_choice" | "fill_blank" | "matching" | "true_false" | "recording";
    prompt: string;
    options?: string[];
    maxWords?: number;
    minWords?: number;
    audioUrl?: string;
    imageUrl?: string;
    passage?: string;
}

export interface Part {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
    timeLimit?: number; // in seconds, for speaking
}

interface AssignmentSessionState {
    // Assignment Data
    currentAssignment: AssignmentDetails | null;
    parts: Part[];

    // Navigation State
    currentPartIndex: number;
    currentQuestionIndex: number;

    // Answers State
    answers: Record<string, string>; // questionId -> answer

    // Timer State (for speaking)
    timeRemaining: number;
    isTimerRunning: boolean;

    // UI State
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions
    setCurrentAssignment: (assignment: AssignmentDetails) => void;
    setParts: (parts: Part[]) => void;
    setAnswer: (questionId: string, answer: string) => void;
    goToPart: (index: number) => void;
    goToQuestion: (partIndex: number, questionIndex: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;

    // Timer Actions
    startTimer: (seconds: number) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    stopTimer: () => void;
    tickTimer: () => void;

    // Data Fetching
    fetchAssignment: (id: string) => Promise<void>;
    submitAssignment: (id: string) => Promise<void>;

    // Persistence
    clearSession: () => void;
}

const STORAGE_KEY = "ivy-assignment-session";

export const useAssignmentSessionStore = create<AssignmentSessionState>()(
    persist(
        (set, get) => ({
            // Initial State
            currentAssignment: null,
            parts: [],
            currentPartIndex: 0,
            currentQuestionIndex: 0,
            answers: {},
            timeRemaining: 0,
            isTimerRunning: false,
            isLoading: false,
            isSubmitting: false,
            error: null,

            // Setters
            setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

            setParts: (parts) => set({ parts }),

            setAnswer: (questionId, answer) => {
                set((state) => ({
                    answers: { ...state.answers, [questionId]: answer }
                }));
                // Autosave is handled by the persist middleware
            },

            // Navigation
            goToPart: (index) => {
                const { parts } = get();
                if (index >= 0 && index < parts.length) {
                    set({ currentPartIndex: index, currentQuestionIndex: 0 });
                }
            },

            goToQuestion: (partIndex, questionIndex) => {
                const { parts } = get();
                if (
                    partIndex >= 0 &&
                    partIndex < parts.length &&
                    questionIndex >= 0 &&
                    questionIndex < parts[partIndex].questions.length
                ) {
                    set({ currentPartIndex: partIndex, currentQuestionIndex: questionIndex });
                }
            },

            nextQuestion: () => {
                const { currentPartIndex, currentQuestionIndex, parts } = get();
                const currentPart = parts[currentPartIndex];

                if (currentQuestionIndex < currentPart.questions.length - 1) {
                    // Next question in same part
                    set({ currentQuestionIndex: currentQuestionIndex + 1 });
                } else if (currentPartIndex < parts.length - 1) {
                    // First question in next part
                    set({
                        currentPartIndex: currentPartIndex + 1,
                        currentQuestionIndex: 0
                    });
                }
            },

            previousQuestion: () => {
                const { currentPartIndex, currentQuestionIndex, parts } = get();

                if (currentQuestionIndex > 0) {
                    // Previous question in same part
                    set({ currentQuestionIndex: currentQuestionIndex - 1 });
                } else if (currentPartIndex > 0) {
                    // Last question in previous part
                    const previousPart = parts[currentPartIndex - 1];
                    set({
                        currentPartIndex: currentPartIndex - 1,
                        currentQuestionIndex: previousPart.questions.length - 1
                    });
                }
            },

            // Timer Actions
            startTimer: (seconds) => {
                set({ timeRemaining: seconds, isTimerRunning: true });
            },

            pauseTimer: () => {
                set({ isTimerRunning: false });
            },

            resumeTimer: () => {
                set({ isTimerRunning: true });
            },

            stopTimer: () => {
                set({ isTimerRunning: false, timeRemaining: 0 });
            },

            tickTimer: () => {
                const { timeRemaining, isTimerRunning } = get();
                if (isTimerRunning && timeRemaining > 0) {
                    set({ timeRemaining: timeRemaining - 1 });
                } else if (isTimerRunning && timeRemaining <= 0) {
                    set({ isTimerRunning: false });
                }
            },

            // Data Fetching
            fetchAssignment: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiFetch<{
                        success: boolean;
                        data: AssignmentDetails;
                    }>(`/api/student/assignments/${id}`);

                    // Generate parts based on assignment type
                    const parts = generatePartsFromAssignment(response.data);

                    set({
                        currentAssignment: response.data,
                        parts,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({
                        error: error?.message || "Failed to fetch assignment",
                        isLoading: false
                    });
                }
            },

            submitAssignment: async (id: string) => {
                set({ isSubmitting: true, error: null });
                try {
                    const { answers, currentAssignment } = get();

                    // Combine all answers into a single content string
                    const content = formatAnswersForSubmission(answers, currentAssignment?.skill);

                    const response = await apiFetch<{
                        success: boolean;
                        message: string;
                        data: any;
                    }>(`/api/student/assignments/${id}`, {
                        method: "POST",
                        body: JSON.stringify({ content })
                    });

                    set({ isSubmitting: false });

                    // Clear session after successful submission
                    get().clearSession();

                    return response.data;
                } catch (error: any) {
                    set({
                        error: error?.message || "Failed to submit assignment",
                        isSubmitting: false
                    });
                    throw error;
                }
            },

            // Clear session
            clearSession: () => {
                set({
                    currentAssignment: null,
                    parts: [],
                    currentPartIndex: 0,
                    currentQuestionIndex: 0,
                    answers: {},
                    timeRemaining: 0,
                    isTimerRunning: false,
                    error: null
                });
            }
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                answers: state.answers,
                currentPartIndex: state.currentPartIndex,
                currentQuestionIndex: state.currentQuestionIndex,
                timeRemaining: state.timeRemaining
            })
        }
    )
);

// Helper function to generate parts based on assignment type
function generatePartsFromAssignment(assignment: AssignmentDetails): Part[] {
    switch (assignment.type) {
        case AssignmentType.WRITING_TASK1:
            return [{
                id: "part1",
                title: "Writing Task 1",
                description: assignment.instructions || "Complete the essay",
                questions: [{
                    id: "essay-1",
                    type: "essay" as const,
                    prompt: assignment.description || "Write your essay here",
                    minWords: 150,
                    maxWords: 250
                }]
            }];

        case AssignmentType.WRITING_TASK2:
            return [{
                id: "part1",
                title: "Writing Task 2",
                description: assignment.instructions || "Complete the essay",
                questions: [{
                    id: "essay-1",
                    type: "essay" as const,
                    prompt: assignment.description || "Write your essay here",
                    minWords: 250,
                    maxWords: 350
                }]
            }];

        case AssignmentType.SPEAKING:
            return [
                {
                    id: "part1",
                    title: "Part 1: Introduction",
                    description: "Answer the following questions about yourself",
                    timeLimit: 60,
                    questions: [
                        { id: "speak-1-1", type: "recording" as const, prompt: "Tell me about your hometown" },
                        { id: "speak-1-2", type: "recording" as const, prompt: "What do you like to do in your free time?" }
                    ]
                },
                {
                    id: "part2",
                    title: "Part 2: Cue Card",
                    description: "Speak for 1-2 minutes on the given topic",
                    timeLimit: 120,
                    questions: [
                        { id: "speak-2-1", type: "recording" as const, prompt: "Describe a memorable journey you have taken" }
                    ]
                }
            ];

        case AssignmentType.LISTENING:
            return [
                {
                    id: "section1",
                    title: "Section 1",
                    description: "Listen and answer the questions",
                    questions: [
                        { id: "listen-1-1", type: "fill_blank" as const, prompt: "The meeting will start at ___" },
                        { id: "listen-1-2", type: "multiple_choice" as const, prompt: "What is the main topic?", options: ["Travel", "Education", "Technology", "Health"] }
                    ]
                }
            ];

        case AssignmentType.READING:
            return [
                {
                    id: "passage1",
                    title: "Passage 1",
                    description: "Read the passage and answer questions",
                    questions: [
                        { id: "read-1-1", type: "true_false" as const, prompt: "The author believes climate change is reversible" },
                        { id: "read-1-2", type: "multiple_choice" as const, prompt: "What is the main purpose of the passage?", options: ["To inform", "To persuade", "To entertain", "To criticize"] }
                    ]
                }
            ];

        default:
            return [{
                id: "part1",
                title: "Questions",
                questions: [{ id: "q1", type: "essay" as const, prompt: "Answer here" }]
            }];
    }
}

// Helper function to format answers for submission
function formatAnswersForSubmission(answers: Record<string, string>, skill?: IeltsSkill): string {
    if (skill === IeltsSkill.WRITING) {
        // For writing, just return the essay content
        return Object.values(answers).join("\n\n");
    }

    // For other skills, format as JSON
    return JSON.stringify(answers);
}

// Timer hook for components
export function useTimer() {
    const { timeRemaining, isTimerRunning, tickTimer } = useAssignmentSessionStore();

    React.useEffect(() => {
        if (!isTimerRunning) return;

        const interval = setInterval(() => {
            tickTimer();
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, tickTimer]);

    return { timeRemaining, isTimerRunning };
}

// Need to import React for the hook
import React from "react";
