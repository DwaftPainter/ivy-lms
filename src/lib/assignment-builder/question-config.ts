/**
 * Question Type Configurations
 * Defines all available question types for the IELTS Assignment Builder
 */

import {
    QuestionType,
    ComponentLibraryItem,
    ComponentCategory,
    DragType
} from "@/types/assignment-builder";

export const questionTypeConfig: ComponentLibraryItem[] = [
    // Multiple Choice
    {
        id: "multiple-choice-single",
        type: DragType.QUESTION_TYPE,
        label: "Multiple Choice (Single)",
        description: "Select one answer from multiple options",
        icon: "circle-dot",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MULTIPLE_CHOICE_SINGLE
    },
    {
        id: "multiple-choice-multiple",
        type: DragType.QUESTION_TYPE,
        label: "Multiple Choice (Multiple)",
        description: "Select multiple answers from options",
        icon: "square-check",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MULTIPLE_CHOICE_MULTIPLE
    },

    // Matching
    {
        id: "matching-headings",
        type: DragType.QUESTION_TYPE,
        label: "Matching Headings",
        description: "Match headings to paragraphs or sections",
        icon: "list",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MATCHING_HEADINGS
    },
    {
        id: "matching-information",
        type: DragType.QUESTION_TYPE,
        label: "Matching Information",
        description: "Match information to sources (paragraphs, sections, speakers)",
        icon: "link",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MATCHING_INFORMATION
    },
    {
        id: "matching-features",
        type: DragType.QUESTION_TYPE,
        label: "Matching Features",
        description: "Match features or characteristics to options",
        icon: "git-compare",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MATCHING_FEATURES
    },

    // Completion
    {
        id: "sentence-completion",
        type: DragType.QUESTION_TYPE,
        label: "Sentence Completion",
        description: "Complete sentences with words from the text",
        icon: "text-cursor",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.SENTENCE_COMPLETION
    },
    {
        id: "summary-completion",
        type: DragType.QUESTION_TYPE,
        label: "Summary Completion",
        description: "Complete a summary using words from the text",
        icon: "file-text",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.SUMMARY_COMPLETION
    },
    {
        id: "summary-completion-word-bank",
        type: DragType.QUESTION_TYPE,
        label: "Summary with Word Bank",
        description: "Complete a summary using words from a provided list",
        icon: "book-open",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.SUMMARY_COMPLETION_WORD_BANK
    },

    // True/False/Not Given
    {
        id: "true-false-not-given",
        type: DragType.QUESTION_TYPE,
        label: "True / False / Not Given",
        description: "Determine if statements match the information in the text",
        icon: "scale",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.TRUE_FALSE_NOT_GIVEN
    },
    {
        id: "yes-no-not-given",
        type: DragType.QUESTION_TYPE,
        label: "Yes / No / Not Given",
        description: "Determine if statements agree with the writer's views",
        icon: "thumbs-up",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.YES_NO_NOT_GIVEN
    },

    // Diagram/Map/Form Completion
    {
        id: "form-completion",
        type: DragType.QUESTION_TYPE,
        label: "Form Completion",
        description: "Complete a form with information from the text or audio",
        icon: "clipboard-list",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.FORM_COMPLETION
    },
    {
        id: "table-completion",
        type: DragType.QUESTION_TYPE,
        label: "Table Completion",
        description: "Complete a table with information from the text or audio",
        icon: "table",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.TABLE_COMPLETION
    },
    {
        id: "flow-chart-completion",
        type: DragType.QUESTION_TYPE,
        label: "Flow-chart Completion",
        description: "Complete a flow-chart or process diagram",
        icon: "git-branch",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.FLOW_CHART_COMPLETION
    },
    {
        id: "map-labeling",
        type: DragType.QUESTION_TYPE,
        label: "Map Labeling",
        description: "Label locations on a map",
        icon: "map",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.MAP_LABELING
    },
    {
        id: "diagram-labeling",
        type: DragType.QUESTION_TYPE,
        label: "Diagram Labeling",
        description: "Label parts of a diagram or illustration",
        icon: "image",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.DIAGRAM_LABELING
    },

    // Short Answer
    {
        id: "short-answer",
        type: DragType.QUESTION_TYPE,
        label: "Short Answer Questions",
        description: "Answer questions using words from the text",
        icon: "message-square",
        category: ComponentCategory.QUESTION,
        questionType: QuestionType.SHORT_ANSWER
    }
];

// Structure components
export const structureComponents: ComponentLibraryItem[] = [
    {
        id: "section",
        type: DragType.SECTION,
        label: "Section",
        description: "Add a new section (Part 1, 2, 3, etc.)",
        icon: "layers",
        category: ComponentCategory.STRUCTURE
    }
];

// Media components
export const mediaComponents: ComponentLibraryItem[] = [
    {
        id: "passage",
        type: DragType.PASSAGE,
        label: "Reading Passage",
        description: "Add a reading passage to the section",
        icon: "file-text",
        category: ComponentCategory.MEDIA
    },
    {
        id: "audio",
        type: DragType.AUDIO,
        label: "Audio Recording",
        description: "Add an audio recording (for Listening)",
        icon: "headphones",
        category: ComponentCategory.MEDIA
    }
];

// Group by category
export const componentLibrary = {
    structure: structureComponents,
    questions: questionTypeConfig,
    media: mediaComponents
};

// Get question config by type
export function getQuestionConfig(type: QuestionType): ComponentLibraryItem | undefined {
    return questionTypeConfig.find((q) => q.questionType === type);
}

// Get default configuration for a question type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDefaultQuestionConfig(type: QuestionType): Record<string, any> {
    switch (type) {
        case QuestionType.MULTIPLE_CHOICE_SINGLE:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            return {
                options: ["A", "B", "C", "D"],
                correctAnswer: type === QuestionType.MULTIPLE_CHOICE_SINGLE ? "" : [],
                allowMultiple: type === QuestionType.MULTIPLE_CHOICE_MULTIPLE,
                showOptions: "vertical"
            };

        case QuestionType.MATCHING_HEADINGS:
            return {
                headings: ["Heading 1", "Heading 2", "Heading 3"],
                paragraphs: [
                    { id: "para-1", text: "Paragraph A" },
                    { id: "para-2", text: "Paragraph B" },
                    { id: "para-3", text: "Paragraph C" }
                ],
                correctMatches: {}
            };

        case QuestionType.MATCHING_INFORMATION:
        case QuestionType.MATCHING_FEATURES:
            return {
                statements: ["Statement 1", "Statement 2", "Statement 3"],
                options: ["A", "B", "C", "D"],
                correctMatches: {},
                allowMultipleUses: false
            };

        case QuestionType.SENTENCE_COMPLETION:
        case QuestionType.SUMMARY_COMPLETION:
            return {
                text: "Complete the sentence with words from the text: _____________",
                blanks: [{ id: "blank-1", answer: "", alternatives: [] }],
                wordLimit: 3,
                requireExactMatch: true
            };

        case QuestionType.SUMMARY_COMPLETION_WORD_BANK:
            return {
                text: "Complete the summary using words from the list: _____________",
                blanks: [{ id: "blank-1", answer: "" }],
                wordBank: ["word1", "word2", "word3", "word4", "word5"],
                wordLimit: 1,
                requireExactMatch: true
            };

        case QuestionType.TRUE_FALSE_NOT_GIVEN:
            return {
                statements: [
                    { id: "stmt-1", text: "Statement text here", correctAnswer: "true" },
                    { id: "stmt-2", text: "Another statement", correctAnswer: "false" }
                ]
            };

        case QuestionType.YES_NO_NOT_GIVEN:
            return {
                statements: [
                    { id: "stmt-1", text: "Statement text here", correctAnswer: "yes" },
                    { id: "stmt-2", text: "Another statement", correctAnswer: "no" }
                ]
            };

        case QuestionType.FORM_COMPLETION:
            return {
                fields: [
                    { id: "field-1", label: "Name", answer: "", wordLimit: 2 },
                    { id: "field-2", label: "Age", answer: "" }
                ]
            };

        case QuestionType.TABLE_COMPLETION:
            return {
                headers: ["Column 1", "Column 2", "Column 3"],
                rows: [
                    {
                        id: "row-1",
                        cells: ["Data 1", null, "Data 3"],
                        blankColumnIndex: 1,
                        answer: ""
                    }
                ]
            };

        case QuestionType.FLOW_CHART_COMPLETION:
            return {
                nodes: [
                    { id: "node-1", label: "Start", isBlank: false },
                    { id: "node-2", label: "Step 1", isBlank: true, answer: "" },
                    { id: "node-3", label: "End", isBlank: false }
                ],
                connections: [
                    { from: "node-1", to: "node-2" },
                    { from: "node-2", to: "node-3" }
                ]
            };

        case QuestionType.MAP_LABELING:
        case QuestionType.DIAGRAM_LABELING:
            return {
                imageUrl: "",
                labels: [
                    { id: "label-1", x: 50, y: 50, answer: "", hint: "" },
                    { id: "label-2", x: 100, y: 100, answer: "", hint: "" }
                ]
            };

        case QuestionType.SHORT_ANSWER:
            return {
                questions: [
                    { id: "q-1", text: "Question text here", answer: "" }
                ],
                wordLimit: 3
            };

        default:
            return {};
    }
}

// Generate unique IDs
export function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new blank question
export function createQuestion(
    type: QuestionType,
    questionNumber: number,
    overrides?: Partial<{
        instructions: string;
        questionText: string;
        points: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: Record<string, any>;
    }>
) {
    return {
        id: generateId("question"),
        type,
        questionNumber,
        instructions: overrides?.instructions || "",
        questionText: overrides?.questionText || "",
        points: overrides?.points || 1,
        config: overrides?.config || getDefaultQuestionConfig(type)
    };
}

// Create a new section
export function createSection(partNumber: number, overrides?: Partial<{ title: string; description: string }>) {
    return {
        id: generateId("section"),
        title: overrides?.title || `Part ${partNumber}`,
        description: overrides?.description || "",
        partNumber,
        passage: undefined,
        questions: [],
        timeLimit: undefined
    };
}

// Create a new passage
export function createPassage(overrides?: Partial<{ title: string; content: string }>) {
    return {
        id: generateId("passage"),
        title: overrides?.title || "Passage Title",
        content: overrides?.content || "",
        wordCount: 0,
        source: ""
    };
}

// Create a new blank assignment
export function createAssignment(skill: "READING" | "LISTENING", teacherId: string): {
    id: string;
    title: string;
    description: string;
    skill: "READING" | "LISTENING";
    type: "READING" | "LISTENING";
    sections: never[];
    totalTime: number;
    totalPoints: number;
    instructions: string;
    metadata: {
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        difficulty: "medium";
        targetBandScore: undefined;
        tags: never[];
        isPublished: boolean;
    };
} {
    const now = new Date().toISOString();

    return {
        id: generateId("assignment"),
        title: `New ${skill === "READING" ? "Reading" : "Listening"} Assignment`,
        description: "",
        skill,
        type: skill,
        sections: [],
        totalTime: skill === "READING" ? 60 : 30,
        totalPoints: 0,
        instructions: "",
        metadata: {
            createdAt: now,
            updatedAt: now,
            createdBy: teacherId,
            difficulty: "medium",
            targetBandScore: undefined,
            tags: [],
            isPublished: false
        }
    };
}

// Validate assignment
export function validateAssignment(assignment: {
    sections: { length: number; questions: string | unknown[] }[]
}): { isValid: boolean; errors: { field: string; message: string; severity: string }[]; warnings: { field: string; message: string; severity: string }[] } {
    const errors: { field: string; message: string; severity: string }[] = [];
    const warnings: { field: string; message: string; severity: string }[] = [];

    if (assignment.sections.length === 0) {
        errors.push({
            field: "sections",
            message: "Assignment must have at least one section",
            severity: "error"
        });
    }

    assignment.sections.forEach((section, idx) => {
        if (section.questions.length === 0) {
            warnings.push({
                field: `section-${idx}`,
                message: `Section ${idx + 1} has no questions`,
                severity: "warning"
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
