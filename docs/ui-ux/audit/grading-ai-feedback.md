# Grading and AI Feedback audit

## Design language

**Audited surface.** Teacher grading queue and loaded submission workspace, with the related Student Writing feedback path traced. The submission list, response viewer, rubric and action bar are dedicated workspace owners using shared cards and controls. Teacher's full-width branch is intentional. Student AI feedback remains in the Writing response path. [Grading page](../../../src/app/teacher/assignments/%5Bid%5D/grade/page.tsx), [Teacher layout](../../../src/app/teacher/layout.tsx), [Writing question](../../../src/components/assignment/WritingQuestion.tsx).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [GRD-01](../findings.md#grd-01) | Loaded submission puts Save Draft at x=544–661 in a 390px view with no document x-scroll. Wider compact views overflow. | Keep the current submission, score area and grading actions reachable in constrained widths. | Teacher workspace · High |
| [GRD-02](../findings.md#grd-02) | Chrome exposes two grade sliders and two score inputs with empty names. Feedback has an associated name. | Associate score labels with both input types. | Rubric controls · High |

Student Submission and Assignment Questions have named tabs in the loaded grader. On reopening a submitted Writing fixture, the AI Grading card displayed “AI grading failed. Please try again later.” The existing authenticated read endpoint returned HTTP 200 with `hasAIGrading: true` for the same attempt. View details was absent. The assignment load populates answers and assignment state without loading the grade that the Writing card reads. This is a functional coverage blocker for the correction modal and calls for separate data-path triage. [Writing card](../../../src/components/assignment/WritingQuestion.tsx#L137), [assignment load](../../../src/store/assignment-session.store.ts#L313), [AI read handler](../../../src/app/api/student/assignments/%5Bid%5D/ai-grade/route.ts). Generation, regrade, Save Draft and publish remain unverified. The Teacher queue's double active state is tracked in [TCH-01](../findings.md#tch-01). [Responsive evidence](../responsive-audit.md#measured-failures), [AI source and service notes](../baseline.md#coverage-gaps-and-hypotheses).

## Improve first

Address GRD-01 because the teacher cannot reach the draft action in the sampled narrow workspace.
