import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AssignmentType, IeltsSkill } from "../../generated/prisma/enums";
import {
    buildQuestionLookup,
    evaluateAnswerCorrectness,
    extractSpeakingRecordings,
    filterGradingAssignments,
    parseStudentAnswers
} from "../grading-submission";

describe("grading-submission helpers", () => {
    it("parses structured array answers, object map answers, and ignores non-JSON content", () => {
        assert.deepEqual(
            parseStudentAnswers(JSON.stringify({ answers: [{ questionId: "q1", answer: "True" }] })),
            [{ questionId: "q1", answer: "True" }]
        );
        assert.deepEqual(
            parseStudentAnswers(
                JSON.stringify({ q1: "A", q2: ["B", "C"], metadata: { savedAt: 1 } })
            ),
            [
                { questionId: "q1", answer: "A" },
                { questionId: "q2", answer: ["B", "C"] }
            ]
        );
        assert.deepEqual(parseStudentAnswers("plain essay text"), []);
        assert.deepEqual(parseStudentAnswers(null), []);
    });

    it("builds question lookup map and evaluates string and array answer keys", () => {
        const lookup = buildQuestionLookup({
            id: "a1",
            title: "Reading",
            type: AssignmentType.READING,
            skill: IeltsSkill.READING,
            courseName: "Course",
            content: {
                sections: [
                    {
                        questions: [
                            {
                                id: "q1",
                                questionNumber: 1,
                                questionText: "Main idea?",
                                type: "multiple_choice",
                                points: 1,
                                config: { correctAnswer: "Paragraph B" }
                            }
                        ]
                    }
                ]
            }
        });

        assert.equal(lookup.get("q1")?.number, 1);
        assert.equal(evaluateAnswerCorrectness("paragraph b", lookup.get("q1")?.correctAnswer), true);
        assert.equal(evaluateAnswerCorrectness("Option A", ["Option A", "Option B"]), true);
        assert.equal(evaluateAnswerCorrectness("Option C", ["Option A", "Option B"]), false);
        assert.equal(evaluateAnswerCorrectness("anything", undefined), undefined);
    });

    it("extracts speaking recordings and filters grading queue assignments", () => {
        assert.deepEqual(extractSpeakingRecordings([{ url: "/a.webm", duration: 42 }], "/fallback.webm"), [
            { url: "/a.webm", duration: 42 }
        ]);
        assert.deepEqual(extractSpeakingRecordings(null, "/single.webm"), [{ url: "/single.webm" }]);
        assert.deepEqual(extractSpeakingRecordings(null, null), []);

        const filtered = filterGradingAssignments(
            [
                {
                    assignmentId: "1",
                    title: "Essay 1",
                    courseName: "Writing Course",
                    courseId: "c1",
                    sessionTitle: "Session 1",
                    pendingCount: 2,
                    deadline: null,
                    skill: IeltsSkill.WRITING
                },
                {
                    assignmentId: "2",
                    title: "Listening Part 1",
                    courseName: "Listening Course",
                    courseId: "c2",
                    sessionTitle: "Session 2",
                    pendingCount: 1,
                    deadline: null,
                    skill: IeltsSkill.LISTENING
                }
            ],
            "essay",
            IeltsSkill.WRITING
        );
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0]?.assignmentId, "1");
    });
});
