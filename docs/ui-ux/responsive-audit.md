# Responsive audit

Phase 0 establishes the five-width matrix at 320, 390, 768, 1024 and 1440 CSS px. Phase 1 retested the affected tasks in headless Chrome and waited for active submission content before sampling Grading. Heights were 900px unless noted. Measurements distinguish document scroll width from actual button bounds. [Baseline](baseline.md#browser-evidence), [other coverage](audit/README.md).

## Measured failures

| Surface and state | 320px | 390px | 768px | 1024px | 1440px |
| --- | --- | --- | --- | --- | --- |
| Builder, blank toolbar | Save x=470–544; document 320 | Save x=470–544; document 390 | Document 1008; Save x=918–992 | Document 1222; Save x=1132–1206 | Document 1440; Save in view |
| Builder, unsaved section | Phase 1 sampled blank only | Enabled Save x=470–544; no hit or document scroll | Unsaved not sampled | Unsaved not sampled | Section added and Save enabled before resize |
| Exam, two Writing fixtures | Document 458 | Document 458 | Fits in Phase 0 | Fits in Phase 0 | Document 1440 |
| Student lesson, enrolled session | Fits in Phase 0 | Fits in Phase 0 | Document 994 | Fits in Phase 0 | Fits in Phase 0 |
| Grading workspace, loaded submission | Phase 0 document fits; action geometry unmeasured | Document 390; Save Draft x=544–661 | Document 1008 | Document 1062 | Document 1440; Save Draft visible |

Sources and acceptance checks appear in [BLD-01](findings.md#bld-01), [EXM-01](findings.md#exm-01), [STU-02](findings.md#stu-02) and [GRD-01](findings.md#grd-01). The 390px builder capture shows the unsaved edit with the task toolbar and right panel clipped. [Unsaved builder](audit/evidence/builder-dirty-save-390.png).

At 768px the desktop sidebar uses 240px of the viewport. The 528px allowance helps explain why intrinsic content constraints appear around that breakpoint. The measured student inset itself grew to 754px. The compact builder and grading workspace can hide descendants even when document scroll width equals viewport width. A reflow gate must include button visibility, focus and hit testing.

## Other observations

- Student's FullCalendar grid at 390px measured 308px visible against 840px of local scrolling width. Preserve controlled local scroll and check keyboard/touch access. Its empty visible month limits populated evidence. [Calendar audit](audit/student.md).
- Phase 0 showed a 785px document in the Teacher grading queue at 768px. Phase 1 retested queue navigation at 1440px. Keep the earlier queue measurement for the next compact queue test. [Phase 0 risks](baseline.md#confirmed-responsive-risks).
- Login and registration retain their existing split at 1024px and 1440px, with one form column below. At 320 × 568, the registration logo reaches y=-1 and the button bottom reaches y=569. Recheck with virtual keyboard, zoom and validation before calling this a blocking layout defect. [Short registration capture](screenshots/register-320x568.png).

Remaining tests include device keyboard, pinch/zoom and text scaling, touch scrolling, sticky focus visibility, populated calendar events, long authenticated fixtures, full exam/grade mutations and narrow localized content. [Acceptance criteria](acceptance-criteria.md#verification-for-future-changes).
