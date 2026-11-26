import type { AssignmentInfo } from "@/store/teacher-grading.store";
import { IeltsSkill } from "@/generated/prisma/enums";

export interface StudentAnswer {
    questionId: string;
    answer: string | string[] | boolean | number | null;
    questionNumber?: number;
}

export interface QuestionLookupEntry {
    number: number;
    text: string;
    type: string;
    points: number;
    correctAnswer?: string | string[];
}

export interface SpeakingRecordingItem {
    questionId?: string;
    url: string;
    duration?: number;
}

export function parseStudentAnswers(content: string | null | undefined): StudentAnswer[] {
    if (!content) return [];
    try {
        const parsed = JSON.parse(content) as {
            answers?: StudentAnswer[];
            [key: string]: unknown;
        };
        if (Array.isArray(parsed.answers)) {
            return parsed.answers;
        }
        const answers: StudentAnswer[] = [];
        for (const [key, value] of Object.entries(parsed)) {
            if (key !== "answers" && key !== "metadata") {
                answers.push({ questionId: key, answer: value as string | string[] });
            }
        }
        return answers;
    } catch {
        return [];
    }
}

export function buildQuestionLookup(
    assignment?: AssignmentInfo | null
): Map<string, QuestionLookupEntry> {
    const map = new Map<string, QuestionLookupEntry>();
    const content = assignment?.content as {
        sections?: Array<{
            questions: Array<{
                id: string;
                questionNumber: number;
                questionText?: string;
                type: string;
                points: number;
                config?: Record<string, unknown>;
            }>;
        }>;
    } | null;

    if (!content?.sections) return map;

    for (const section of content.sections) {
        for (const q of section.questions) {
            map.set(q.id, {
                number: q.questionNumber,
                text: q.questionText || "Question",
                type: q.type,
                points: q.points,
                correctAnswer: q.config?.correctAnswer as string | string[] | undefined
            });
        }
    }
    return map;
}

export function evaluateAnswerCorrectness(
    answerText: string,
    correctAnswer?: string | string[]
): boolean | undefined {
    if (!correctAnswer) return undefined;
    if (Array.isArray(correctAnswer)) {
        return correctAnswer.includes(answerText);
    }
    return correctAnswer.toLowerCase() === answerText.toLowerCase();
}

export function extractSpeakingRecordings(
    audioUrls?: unknown,
    audioUrl?: string | null
): SpeakingRecordingItem[] {
    if (audioUrls && Array.isArray(audioUrls)) {
        return audioUrls as SpeakingRecordingItem[];
    }
    if (audioUrl) {
        return [{ url: audioUrl }];
    }
    return [];
}

export interface GradingAssignmentSummary {
    assignmentId: string;
    title: string;
    courseName: string;
    courseId: string;
    sessionTitle: string;
    pendingCount: number;
    deadline: string | null;
    skill: IeltsSkill;
}

export function filterGradingAssignments(
    assignments: GradingAssignmentSummary[],
    searchQuery: string,
    selectedSkill: string | null
): GradingAssignmentSummary[] {
    const normalized = searchQuery.toLowerCase();
    return assignments.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(normalized) ||
            assignment.courseName.toLowerCase().includes(normalized);
        const matchesSkill = selectedSkill ? assignment.skill === selectedSkill : true;
        return matchesSearch && matchesSkill;
    });
}
