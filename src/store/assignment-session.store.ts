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
    content?: unknown; // Assignment content metadata (sections, questions, etc.)
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
        audioUrls?: { questionId: string; url: string; recordedAt: string }[] | null;
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
    audioUrl?: string; // Section-level audio for listening
    passage?: string; // Section-level passage text for reading
    imageUrl?: string; // Section-level image (for writing task 1)
}

export interface AICorrection {
    original: string;
    corrected: string;
    explanation: string;
    type: "grammar" | "vocabulary" | "spelling" | "structure";
    position?: { start: number; end: number };
}

export interface AIGradingResult {
    score: number;
    feedback: string;
    corrections: AICorrection[];
    gradedAt: string;
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

    // AI Grading State
    aiGrading: AIGradingResult | null;
    isAIGrading: boolean;
    teacherRegradeRequested: boolean;

    // Timer State (for speaking)
    timeRemaining: number;
    isTimerRunning: boolean;

    // Time Tracking (for writing - elapsed time)
    elapsedTime: number;
    isTrackingTime: boolean;

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

    // Time Tracking Actions
    startTimeTracking: () => void;
    pauseTimeTracking: () => void;
    resetElapsedTime: () => void;
    tickElapsedTime: () => void;

    // Data Fetching
    fetchAssignment: (id: string) => Promise<void>;
    submitAssignment: (id: string) => Promise<any>;

    // AI Grading Actions
    gradeWithAI: (id: string) => Promise<void>;
    fetchAIGrading: (id: string) => Promise<void>;
    requestTeacherRegrade: (id: string) => Promise<void>;

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
            elapsedTime: 0,
            isTrackingTime: false,
            isLoading: false,
            isSubmitting: false,
            error: null,

            // AI Grading Initial State
            aiGrading: null,
            isAIGrading: false,
            teacherRegradeRequested: false,

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

            // Time Tracking Actions
            startTimeTracking: () => {
                set({ isTrackingTime: true });
            },

            pauseTimeTracking: () => {
                set({ isTrackingTime: false });
            },

            resetElapsedTime: () => {
                set({ elapsedTime: 0, isTrackingTime: false });
            },

            tickElapsedTime: () => {
                const { elapsedTime, isTrackingTime } = get();
                if (isTrackingTime) {
                    set({ elapsedTime: elapsedTime + 1 });
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

                    // If there's an existing submission with content, populate answers
                    let loadedAnswers: Record<string, string> = {};
                    if (response.data.submission?.content) {
                        loadedAnswers = parseSubmissionContent(
                            response.data.submission.content,
                            response.data.skill,
                            parts
                        );
                    }

                    set({
                        currentAssignment: response.data,
                        parts,
                        answers: loadedAnswers,
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
                        data: {
                            submission: {
                                id: string;
                                status: string;
                                submittedAt: string;
                                content: string;
                                aiScore?: number;
                                aiFeedback?: string;
                                aiCorrections?: AICorrection[];
                                aiGradedAt?: string | null;
                            };
                            progress: any;
                        };
                    }>(`/api/student/assignments/${id}`, {
                        method: "POST",
                        body: JSON.stringify({ content })
                    });

                    // Update current assignment with submission data instead of clearing
                    const assignment = get().currentAssignment;
                    if (assignment) {
                        set({
                            currentAssignment: {
                                ...assignment,
                                submission: {
                                    ...assignment.submission,
                                    id: response.data.submission.id,
                                    status: response.data.submission.status as SubmissionStatus,
                                    submittedAt: new Date(response.data.submission.submittedAt),
                                    content: response.data.submission.content
                                }
                            },
                            isSubmitting: false
                        });
                    } else {
                        set({ isSubmitting: false });
                    }

                    // Auto-populate AI grading results if available (for writing assignments)
                    if (response.data.submission.aiGradedAt) {
                        set({
                            aiGrading: {
                                score: response.data.submission.aiScore || 0,
                                feedback: response.data.submission.aiFeedback || "",
                                corrections: response.data.submission.aiCorrections || [],
                                gradedAt: response.data.submission.aiGradedAt
                            }
                        });
                    }

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
                    elapsedTime: 0,
                    isTrackingTime: false,
                    error: null,
                    aiGrading: null,
                    isAIGrading: false,
                    teacherRegradeRequested: false
                });
            },

            // AI Grading Actions
            gradeWithAI: async (id: string) => {
                console.log("hello");
                set({ isAIGrading: true, error: null });
                try {
                    const response = await apiFetch<{
                        success: boolean;
                        data: {
                            aiScore: number;
                            aiFeedback: string;
                            aiCorrections: AICorrection[];
                            gradedAt: string;
                        };
                    }>(`/api/student/assignments/${id}/ai-grade`, {
                        method: "POST"
                    });

                    set({
                        aiGrading: {
                            score: response.data.aiScore,
                            feedback: response.data.aiFeedback,
                            corrections: response.data.aiCorrections,
                            gradedAt: response.data.gradedAt
                        },
                        isAIGrading: false
                    });
                } catch (error: any) {
                    set({
                        error: error?.message || "Failed to grade with AI",
                        isAIGrading: false
                    });
                }
            },

            fetchAIGrading: async (id: string) => {
                try {
                    const response = await apiFetch<{
                        success: boolean;
                        data: {
                            hasAIGrading: boolean;
                            aiScore: number;
                            aiFeedback: string;
                            aiCorrections: AICorrection[];
                            teacherRegradeRequested: boolean;
                            gradedAt: string;
                        };
                    }>(`/api/student/assignments/${id}/ai-grade`);

                    if (response.data.hasAIGrading) {
                        set({
                            aiGrading: {
                                score: response.data.aiScore,
                                feedback: response.data.aiFeedback,
                                corrections: response.data.aiCorrections,
                                gradedAt: response.data.gradedAt
                            },
                            teacherRegradeRequested: response.data.teacherRegradeRequested
                        });
                    }
                } catch (error: any) {
                    console.error("Failed to fetch AI grading:", error);
                }
            },

            requestTeacherRegrade: async (id: string) => {
                try {
                    await apiFetch<{ success: boolean }>(`/api/student/assignments/${id}/request-regrade`, {
                        method: "POST"
                    });
                    set({ teacherRegradeRequested: true });
                } catch (error: any) {
                    set({
                        error: error?.message || "Failed to request teacher regrade"
                    });
                }
            }
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                answers: state.answers,
                currentPartIndex: state.currentPartIndex,
                currentQuestionIndex: state.currentQuestionIndex,
                timeRemaining: state.timeRemaining,
                elapsedTime: state.elapsedTime,
                aiGrading: state.aiGrading,
                teacherRegradeRequested: state.teacherRegradeRequested
            })
        }
    )
);

// Helper function to map builder question type to session question type
function mapQuestionType(builderType: string): Question["type"] {
    switch (builderType) {
        case "multiple_choice_single":
        case "multiple_choice_multiple":
            return "multiple_choice";
        case "true_false_not_given":
            return "true_false";
        case "matching_headings":
        case "matching_information":
        case "matching_features":
            return "matching";
        case "sentence_completion":
        case "summary_completion":
        case "summary_completion_word_bank":
        case "form_completion":
        case "table_completion":
        case "flow_chart_completion":
            return "fill_blank";
        case "short_answer":
            return "essay"; // Short answer uses text input like essay
        default:
            return "essay";
    }
}

// Helper function to generate parts based on assignment type
function generatePartsFromAssignment(assignment: AssignmentDetails & { content?: unknown }): Part[] {
    // Try to parse content from assignment metadata first
    let content = assignment.content;

    // Content might be a JSON string from the database - parse it if needed
    if (typeof content === "string") {
        try {
            content = JSON.parse(content);
        } catch {
            // Invalid JSON, continue with raw value
        }
    }

    if (content && typeof content === "object") {
        const contentData = content as {
            sections?: Array<{
                id: string;
                title: string;
                description?: string;
                timeLimit?: number;
                passage?: {
                    id: string;
                    title: string;
                    content?: string;
                    audioUrl?: string;
                    imageUrl?: string;
                    wordCount?: number;
                };
                questions: Array<{
                    id: string;
                    type: string;
                    questionNumber: number;
                    instructions?: string;
                    questionText?: string;
                    points: number;
                    config: Record<string, unknown>;
                }>;
            }>;
            totalTime?: number;
            totalPoints?: number;
        };

        if (contentData.sections && Array.isArray(contentData.sections) && contentData.sections.length > 0) {
            // Map builder sections to Parts format
            return contentData.sections.map((section) => {
                // Extract passage info if available
                const passageContent = section.passage?.content;
                const passageAudioUrl = section.passage?.audioUrl;
                const passageImageUrl = section.passage?.imageUrl;

                return {
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    timeLimit: section.timeLimit,
                    // Section-level content
                    audioUrl: passageAudioUrl,
                    passage: passageContent,
                    imageUrl: passageImageUrl,
                    questions: section.questions.map((q) => {
                        const mappedType = mapQuestionType(q.type);

                        // Extract options from config based on question type
                        let options: string[] | undefined;
                        if (mappedType === "multiple_choice" && q.config?.options) {
                            options = q.config.options as string[];
                        } else if (mappedType === "true_false") {
                            options = ["True", "False", "Not Given"];
                        } else if (mappedType === "matching" && q.config?.options) {
                            options = q.config.options as string[];
                        }

                        // Build prompt from instructions and question text
                        const prompt = q.instructions
                            ? `${q.instructions}\n\n${q.questionText || ""}`
                            : (q.questionText || "Answer the question");

                        return {
                            id: q.id,
                            type: mappedType,
                            prompt: prompt.trim(),
                            options
                        };
                    })
                };
            });
        }
    }

    // Fallback to default generation if no content or empty content
    switch (assignment.type) {
        case AssignmentType.WRITING_TASK1:
            return [
                {
                    id: "part1",
                    title: "Writing Task 1",
                    description: assignment.instructions || "Complete the essay",
                    questions: [
                        {
                            id: "essay-1",
                            type: "essay" as const,
                            prompt: assignment.description || "Write your essay here",
                            minWords: 150,
                            maxWords: 250,
                            imageUrl: assignment.attachmentUrl
                        }
                    ]
                }
            ];

        case AssignmentType.WRITING_TASK2:
            return [
                {
                    id: "part1",
                    title: "Writing Task 2",
                    description: assignment.instructions || "Complete the essay",
                    questions: [
                        {
                            id: "essay-1",
                            type: "essay" as const,
                            prompt: assignment.description || "Write your essay here",
                            minWords: 250,
                            maxWords: 350,
                            imageUrl: assignment.attachmentUrl
                        }
                    ]
                }
            ];

        case AssignmentType.SPEAKING:
            return [
                {
                    id: "part1",
                    title: "Part 1: Introduction",
                    description: "Answer the following questions about yourself",
                    timeLimit: 60,
                    questions: [
                        {
                            id: "speak-1-1",
                            type: "recording" as const,
                            prompt: "Tell me about your hometown"
                        },
                        {
                            id: "speak-1-2",
                            type: "recording" as const,
                            prompt: "What do you like to do in your free time?"
                        }
                    ]
                },
                {
                    id: "part2",
                    title: "Part 2: Cue Card",
                    description: "Speak for 1-2 minutes on the given topic",
                    timeLimit: 120,
                    questions: [
                        {
                            id: "speak-2-1",
                            type: "recording" as const,
                            prompt: "Describe a memorable journey you have taken"
                        }
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
                        {
                            id: "listen-1-1",
                            type: "fill_blank" as const,
                            prompt: "The meeting will start at ___"
                        },
                        {
                            id: "listen-1-2",
                            type: "multiple_choice" as const,
                            prompt: "What is the main topic?",
                            options: ["Travel", "Education", "Technology", "Health"]
                        }
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
                        {
                            id: "read-1-1",
                            type: "true_false" as const,
                            prompt: "The author believes climate change is reversible"
                        },
                        {
                            id: "read-1-2",
                            type: "multiple_choice" as const,
                            prompt: "What is the main purpose of the passage?",
                            options: ["To inform", "To persuade", "To entertain", "To criticize"]
                        }
                    ]
                }
            ];

        default:
            return [
                {
                    id: "part1",
                    title: "Questions",
                    questions: [{ id: "q1", type: "essay" as const, prompt: "Answer here" }]
                }
            ];
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

// Helper function to parse submission content back into answers
function parseSubmissionContent(content: string, skill?: IeltsSkill, parts?: Part[]): Record<string, string> {
    const answers: Record<string, string> = {};

    if (!content || !parts || parts.length === 0) {
        return answers;
    }

    if (skill === IeltsSkill.WRITING) {
        // For writing, the content is the essay - put it in the first question
        const firstQuestion = parts[0]?.questions[0];
        if (firstQuestion) {
            answers[firstQuestion.id] = content;
        }
    } else {
        // For other skills, try to parse JSON
        try {
            const parsed = JSON.parse(content);
            if (typeof parsed === "object" && parsed !== null) {
                Object.assign(answers, parsed);
            }
        } catch {
            // If not valid JSON, store as first question answer
            const firstQuestion = parts[0]?.questions[0];
            if (firstQuestion) {
                answers[firstQuestion.id] = content;
            }
        }
    }

    return answers;
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
