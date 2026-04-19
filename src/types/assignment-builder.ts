/**
 * IELTS Assignment Builder Types
 * Comprehensive type definitions for the drag-and-drop assignment builder
 */

import { IeltsSkill, AssignmentType } from "@/generated/prisma/enums";

// ============================================================================
// Question Type Definitions
// ============================================================================

export enum QuestionType {
    MULTIPLE_CHOICE_SINGLE = "multiple_choice_single",
    MULTIPLE_CHOICE_MULTIPLE = "multiple_choice_multiple",
    MATCHING_HEADINGS = "matching_headings",
    MATCHING_INFORMATION = "matching_information",
    MATCHING_FEATURES = "matching_features",
    SENTENCE_COMPLETION = "sentence_completion",
    SUMMARY_COMPLETION = "summary_completion",
    SUMMARY_COMPLETION_WORD_BANK = "summary_completion_word_bank",
    TRUE_FALSE_NOT_GIVEN = "true_false_not_given",
    YES_NO_NOT_GIVEN = "yes_no_not_given",
    FORM_COMPLETION = "form_completion",
    TABLE_COMPLETION = "table_completion",
    FLOW_CHART_COMPLETION = "flow_chart_completion",
    MAP_LABELING = "map_labeling",
    DIAGRAM_LABELING = "diagram_labeling",
    SHORT_ANSWER = "short_answer"
}

// ============================================================================
// Base Question Interface
// ============================================================================

export interface BaseQuestion {
    id: string;
    type: QuestionType;
    questionNumber: number;
    instructions: string;
    questionText: string;
    points: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>;
}

// ============================================================================
// Specific Question Configurations
// ============================================================================

export interface MultipleChoiceConfig {
    options: string[];
    correctAnswer: string | string[];
    allowMultiple: boolean;
    showOptions: "vertical" | "horizontal";
}

export interface MatchingHeadingsConfig {
    headings: string[];
    paragraphs: { id: string; text: string }[];
    correctMatches: Record<string, string>;
}

export interface MatchingInformationConfig {
    statements: string[];
    options: string[];
    correctMatches: Record<string, string>;
    allowMultipleUses: boolean;
}

export interface CompletionConfig {
    text: string;
    blanks: { id: string; answer: string; alternatives?: string[] }[];
    wordLimit?: number;
    requireExactMatch: boolean;
}

export interface SummaryWordBankConfig extends CompletionConfig {
    wordBank: string[];
}

export interface TrueFalseNotGivenConfig {
    statements: { id: string; text: string; correctAnswer: "true" | "false" | "not_given" }[];
}

export interface YesNoNotGivenConfig {
    statements: { id: string; text: string; correctAnswer: "yes" | "no" | "not_given" }[];
}

export interface FormCompletionConfig {
    fields: {
        id: string;
        label: string;
        answer: string;
        wordLimit?: number;
        alternatives?: string[];
    }[];
}

export interface TableCompletionConfig {
    headers: string[];
    rows: {
        id: string;
        cells: (string | null)[];
        blankColumnIndex: number;
        answer: string;
    }[];
}

export interface FlowChartConfig {
    nodes: {
        id: string;
        label: string;
        isBlank: boolean;
        answer?: string;
    }[];
    connections: { from: string; to: string }[];
}

export interface MapDiagramConfig {
    imageUrl?: string;
    labels: {
        id: string;
        x: number;
        y: number;
        answer: string;
        hint?: string;
    }[];
}

export interface ShortAnswerConfig {
    questions: { id: string; text: string; answer: string; alternatives?: string[] }[];
    wordLimit: number;
}

// ============================================================================
// Question Union Type
// ============================================================================

export type Question =
    | (BaseQuestion & { type: QuestionType.MULTIPLE_CHOICE_SINGLE; config: MultipleChoiceConfig })
    | (BaseQuestion & { type: QuestionType.MULTIPLE_CHOICE_MULTIPLE; config: MultipleChoiceConfig })
    | (BaseQuestion & { type: QuestionType.MATCHING_HEADINGS; config: MatchingHeadingsConfig })
    | (BaseQuestion & { type: QuestionType.MATCHING_INFORMATION; config: MatchingInformationConfig })
    | (BaseQuestion & { type: QuestionType.MATCHING_FEATURES; config: MatchingInformationConfig })
    | (BaseQuestion & { type: QuestionType.SENTENCE_COMPLETION; config: CompletionConfig })
    | (BaseQuestion & { type: QuestionType.SUMMARY_COMPLETION; config: CompletionConfig })
    | (BaseQuestion & { type: QuestionType.SUMMARY_COMPLETION_WORD_BANK; config: SummaryWordBankConfig })
    | (BaseQuestion & { type: QuestionType.TRUE_FALSE_NOT_GIVEN; config: TrueFalseNotGivenConfig })
    | (BaseQuestion & { type: QuestionType.YES_NO_NOT_GIVEN; config: YesNoNotGivenConfig })
    | (BaseQuestion & { type: QuestionType.FORM_COMPLETION; config: FormCompletionConfig })
    | (BaseQuestion & { type: QuestionType.TABLE_COMPLETION; config: TableCompletionConfig })
    | (BaseQuestion & { type: QuestionType.FLOW_CHART_COMPLETION; config: FlowChartConfig })
    | (BaseQuestion & { type: QuestionType.MAP_LABELING; config: MapDiagramConfig })
    | (BaseQuestion & { type: QuestionType.DIAGRAM_LABELING; config: MapDiagramConfig })
    | (BaseQuestion & { type: QuestionType.SHORT_ANSWER; config: ShortAnswerConfig });

// ============================================================================
// Section & Passage Definitions
// ============================================================================

export interface Passage {
    id: string;
    title: string;
    content: string;
    wordCount?: number;
    source?: string;
    // For Listening
    audioUrl?: string;
    audioDuration?: number;
    transcript?: string;
    // For images
    imageUrl?: string;
}

export interface Section {
    id: string;
    title: string;
    description?: string;
    partNumber: number;
    passage?: Passage;
    questions: Question[];
    timeLimit?: number; // in minutes
}

// ============================================================================
// Assignment Definition
// ============================================================================

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    skill: IeltsSkill;
    type: AssignmentType;
    sections: Section[];
    totalTime: number; // in minutes
    totalPoints: number;
    instructions?: string;
    bandScoreCalculator?: BandScoreCalculator;
    metadata: AssignmentMetadata;
}

export interface AssignmentMetadata {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    difficulty: "easy" | "medium" | "hard";
    targetBandScore?: number;
    tags: string[];
    isPublished: boolean;
}

export interface BandScoreCalculator {
    // Maps raw score to band score
    scoreMapping: { rawScore: number; bandScore: number }[];
}

// ============================================================================
// Builder State
// ============================================================================

export interface BuilderState {
    assignment: Assignment;
    selectedId: string | null;
    expandedSections: string[];
    draggedItem: DragItem | null;
    viewMode: "edit" | "preview";
    history: Assignment[];
    historyIndex: number;
}

export interface DragItem {
    type: DragType;
    data: unknown;
}

export enum DragType {
    QUESTION_TYPE = "question_type",
    SECTION = "section",
    PASSAGE = "passage",
    AUDIO = "audio",
    QUESTION = "question"
}

// ============================================================================
// Component Library Items
// ============================================================================

export interface ComponentLibraryItem {
    id: string;
    type: DragType;
    label: string;
    description: string;
    icon: string;
    category: ComponentCategory;
    questionType?: QuestionType;
}

export enum ComponentCategory {
    STRUCTURE = "structure",
    QUESTION = "question",
    MEDIA = "media"
}

// ============================================================================
// Inspector State
// ============================================================================

export interface InspectorState {
    selectedType: "assignment" | "section" | "passage" | "question" | null;
    selectedItem: Assignment | Section | Passage | Question | null;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationError {
    field: string;
    message: string;
    severity: "error" | "warning";
}

export interface AssignmentValidation {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ============================================================================
// Export/Import
// ============================================================================

export interface AssignmentExport {
    version: string;
    exportedAt: string;
    assignment: Assignment;
}

// ============================================================================
// Preview State
// ============================================================================

export interface PreviewState {
    currentSectionIndex: number;
    currentQuestionIndex: number;
    answers: Record<string, string | string[]>;
    flaggedQuestions: string[];
    timeRemaining: number;
}
