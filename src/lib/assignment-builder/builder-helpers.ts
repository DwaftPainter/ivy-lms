import { AssignmentType, IeltsSkill } from "@/generated/prisma/enums";
import {
    ComponentCategory,
    DragType,
    QuestionType,
    type Assignment,
    type ComponentLibraryItem,
    type Passage,
    type Question,
    type Section
} from "@/types/assignment-builder";
import { questionTypeConfig } from "@/lib/assignment-builder/question-config";

export type SelectedBuilderItem =
    | { type: "assignment"; item: Assignment }
    | { type: "section"; item: Section }
    | { type: "passage"; item: Passage; sectionId: string }
    | { type: "question"; item: Question; sectionId: string }
    | { type: null; item: null };

export function findSelectedBuilderItem(
    assignment: Assignment | null,
    selectedId: string | null
): SelectedBuilderItem {
    if (!assignment || !selectedId) {
        return { type: null, item: null };
    }
    if (selectedId === assignment.id) {
        return { type: "assignment", item: assignment };
    }
    for (const section of assignment.sections) {
        if (section.id === selectedId) {
            return { type: "section", item: section };
        }
        if (section.passage?.id === selectedId) {
            return { type: "passage", item: section.passage, sectionId: section.id };
        }
        const question = section.questions.find((q) => q.id === selectedId);
        if (question) {
            return { type: "question", item: question, sectionId: section.id };
        }
    }
    return { type: null, item: null };
}

export function resolveTargetSectionId(
    sections: Section[],
    chosenSectionId: string,
    selectedId: string | null
): string {
    if (chosenSectionId && sections.some((s) => s.id === chosenSectionId)) {
        return chosenSectionId;
    }
    if (selectedId) {
        const owningSection = sections.find(
            (s) =>
                s.id === selectedId ||
                s.passage?.id === selectedId ||
                s.questions.some((q) => q.id === selectedId)
        );
        if (owningSection) return owningSection.id;
    }
    return sections[0]?.id ?? "";
}

export function filterQuestionTypes(searchQuery: string): ComponentLibraryItem[] {
    const normalized = searchQuery.toLowerCase();
    return questionTypeConfig.filter(
        (q) =>
            q.label.toLowerCase().includes(normalized) ||
            q.description.toLowerCase().includes(normalized)
    );
}

export function getSectionMediaLibraryItem(skill: IeltsSkill): ComponentLibraryItem {
    if (skill === IeltsSkill.LISTENING) {
        return {
            id: "audio",
            type: DragType.AUDIO,
            label: "Audio Recording",
            description: "Add an audio recording",
            icon: "headphones",
            category: ComponentCategory.MEDIA
        };
    }
    return {
        id: "passage",
        type: DragType.PASSAGE,
        label: "Reading Passage",
        description: "Add a reading passage",
        icon: "file-text",
        category: ComponentCategory.MEDIA
    };
}

export interface ApiAssignmentPayload {
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
}

export function mapLoadedAssignment(
    data: ApiAssignmentPayload,
    fallbackSkill: IeltsSkill
): Assignment {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        skill: data.skill,
        type: data.type,
        sections: data.content?.sections || [],
        totalTime:
            data.content?.totalTime || (fallbackSkill === IeltsSkill.READING ? 60 : 30),
        totalPoints: data.content?.totalPoints || 40,
        instructions: data.instructions || "",
        metadata: {
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            createdBy: "",
            difficulty: "medium",
            tags: [],
            isPublished: data.isPublished
        }
    };
}

export function collectQuestionIds(assignment: Assignment | null): Set<string> {
    const ids = new Set<string>();
    if (!assignment) return ids;
    for (const section of assignment.sections) {
        for (const question of section.questions) {
            ids.add(question.id);
        }
    }
    return ids;
}

export type CanvasDropPayload =
    | { type: "section" }
    | { type: "question_type"; questionType?: QuestionType }
    | { type: "passage" | "audio" };
