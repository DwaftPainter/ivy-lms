import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AssignmentType, IeltsSkill } from "../../../generated/prisma/enums";
import { QuestionType, type Assignment, type Question } from "../../../types/assignment-builder";
import { createQuestion } from "../question-config";
import {
    collectQuestionIds,
    filterQuestionTypes,
    findSelectedBuilderItem,
    getSectionMediaLibraryItem,
    mapLoadedAssignment,
    resolveTargetSectionId
} from "../builder-helpers";

function makeAssignment(): Assignment {
    return {
        id: "asg-1",
        title: "Sample Builder Assignment",
        description: "",
        skill: IeltsSkill.READING,
        type: AssignmentType.READING,
        totalTime: 60,
        totalPoints: 40,
        instructions: "",
        sections: [
            {
                id: "sec-1",
                title: "Section 1",
                partNumber: 1,
                passage: { id: "pas-1", title: "Passage 1", content: "Body", wordCount: 1 },
                questions: [
                    {
                        ...createQuestion(QuestionType.MULTIPLE_CHOICE_SINGLE, 1),
                        id: "q-1",
                        questionText: "Q1"
                    } as Question
                ]
            },
            {
                id: "sec-2",
                title: "Section 2",
                partNumber: 2,
                questions: [
                    {
                        ...createQuestion(QuestionType.SHORT_ANSWER, 2),
                        id: "q-2",
                        questionText: "Q2"
                    } as Question
                ]
            }
        ],
        metadata: {
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
            createdBy: "t1",
            difficulty: "medium",
            tags: [],
            isPublished: false
        }
    };
}

describe("assignment-builder pure helpers", () => {
    it("resolves selected assignment, section, passage, question, or null", () => {
        const assignment = makeAssignment();
        assert.equal(findSelectedBuilderItem(assignment, "asg-1").type, "assignment");
        assert.equal(findSelectedBuilderItem(assignment, "sec-2").type, "section");
        const passageHit = findSelectedBuilderItem(assignment, "pas-1");
        assert.equal(passageHit.type, "passage");
        if (passageHit.type === "passage") assert.equal(passageHit.sectionId, "sec-1");
        const questionHit = findSelectedBuilderItem(assignment, "q-2");
        assert.equal(questionHit.type, "question");
        if (questionHit.type === "question") assert.equal(questionHit.sectionId, "sec-2");
        assert.equal(findSelectedBuilderItem(assignment, "missing").type, null);
    });

    it("resolves insertion target section prioritizing explicit valid choice then selected item owner then first", () => {
        const { sections } = makeAssignment();
        assert.equal(resolveTargetSectionId(sections, "sec-2", "q-1"), "sec-2");
        assert.equal(resolveTargetSectionId(sections, "deleted-sec", "q-2"), "sec-2");
        assert.equal(resolveTargetSectionId(sections, "", "pas-1"), "sec-1");
        assert.equal(resolveTargetSectionId(sections, "", null), "sec-1");
        assert.equal(resolveTargetSectionId([], "", null), "");
    });

    it("filters question types and selects skill-appropriate media item", () => {
        const filtered = filterQuestionTypes("multiple choice");
        assert.ok(filtered.length >= 2);
        assert.equal(getSectionMediaLibraryItem(IeltsSkill.LISTENING).type, "audio");
        assert.equal(getSectionMediaLibraryItem(IeltsSkill.READING).type, "passage");
    });

    it("maps API assignment payload with defaults and collects question IDs", () => {
        const mapped = mapLoadedAssignment(
            {
                id: "db-1",
                title: "Reading Test",
                description: "Desc",
                type: AssignmentType.READING,
                skill: IeltsSkill.READING,
                instructions: null,
                isPublished: true,
                content: null,
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-02T00:00:00Z"
            },
            IeltsSkill.READING
        );
        assert.equal(mapped.totalTime, 60);
        assert.equal(mapped.totalPoints, 40);
        assert.equal(mapped.metadata.isPublished, true);

        const ids = collectQuestionIds(makeAssignment());
        assert.deepEqual(Array.from(ids), ["q-1", "q-2"]);
    });
});
