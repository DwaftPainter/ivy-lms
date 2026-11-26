# Modernization roadmap

Complete a small, reviewable slice at a time. Keep the application on its existing component stack and preserve the evidenced IVY identity. Treat the [baseline](baseline.md) as a record of the starting point and the [acceptance criteria](acceptance-criteria.md) as the verification contract for future work.

## Phase 0 — Discovery and preparation

- **Scope and prerequisites.** Inventory the tracked checkout, existing docs and installed skills. Use the installed dependencies, isolated browser and authorized dev access for available evidence.
- **Deliverables.** The six Phase 0 documents, current commit and validation results, screenshots where available, and recorded coverage gaps.
- **Non-goals.** Screen design, app changes, a new design contract, database changes and deployment.
- **Acceptance and done.** The inventory accounts for every routed page and feature owner. Browser results and technical checks are reproducible from their recorded setup. Every blocked flow has a reason and a Phase 1 verification task.
- **Regression risks.** Accidental service writes, disclosure of dev records, and reporting source inferences as runtime findings. Use read-only navigation after sign-in and exclude account details from captures.

## Phase 1 — Design system and UI/UX audit

- **Status.** Complete for the available read-only scope at the [baseline SHA](baseline.md#snapshot). Phase 1 reconciled the standing evidence and retested affected states.
- **Deliverables.** The validated [design contract](../../DESIGN.md), separate [surface audits](audit/README.md), detailed [findings](findings.md) and [pending design decisions](design-decisions.md).
- **Acceptance and done.** Auth and all three roles rendered using authorized dev sessions. Builder, exam, grading and shared shell issues have owning sources and acceptance conditions. Fixture and service gaps remain in the [coverage record](audit/README.md#limits).
- **Non-goals and regression risks.** Preserve the read-only boundary for application source and workflows. Record differences between verified defects and task-specific layouts so Phase 2 does not erase intentional distinctions.

## Phase 2 — Design foundation

- **Status.** Implemented for the approved scope (`BLD-01`, `BLD-03` with `D-04` builder approval, `SHELL-01`, `SHELL-02`, `AUTH-01`). `STU-01` was not modified due to the verified dev schedule fixture gap. Track the reopened Student AI Writing feedback mismatch separately ([Grading audit](audit/grading-ai-feedback.md)).
- **Scope and prerequisites.** Approve the Phase 2 selection and relevant [design decisions](design-decisions.md). Use the evidenced semantic roles and current shared owners. Confirm the narrow builder decision and a disposable draft fixture first.
- **Deliverables.** Approved [Phase 2 plan](../../design-plans/phase-2-foundation-and-builder.md), Auth `text-muted-foreground` separator pilot, shared header accessible names and mobile sidebar close/focus restoration across Student, Teacher, and Admin, and responsive builder reachability + keyboard/click question insertion with matched evidence in [Phase 2 captures](audit/evidence/phase2/).
- **Non-goals.** A new brand, new library, global token renaming, unexplained font rollout, full-page redesigns, or changes to authentication and assessment logic.
- **Acceptance and done.** `BLD-01`, `BLD-03`, `SHELL-01`, `SHELL-02`, and `AUTH-01` pass their acceptance checks in the [acceptance record](acceptance-criteria.md#phase-2-entry-and-exit). **Remaining blocker in Phase 2:** `STU-01` remains open because all 3 published dev `ClassSession` records are in `2026-04` while `ScheduleTab` renders `2026-11` with `headerToolbar={false}`, preventing populated-schedule verification against the current dev data.
- **Regression risks.** Global color or font inheritance, dark contrast, FullCalendar cascade, changes to modal focus lifecycle, toolbar clipping, and losing builder draft state across presentation modes.

## Phase 3 — Shared components and application shell

- **Status.** Implemented for approved scope (`D-06`, `D-05`, `TCH-01`, `AUTH-02`, `AUTH-03`) alongside `STU-01` after `prisma/mock-data.sql` populated the dev schedule fixtures.
- **Scope and prerequisites.** Build from the accepted foundation and actual shared consumers. Verify sidebar navigation, header, notifications, buttons, cards, forms, overlays and feedback states across roles.
- **Deliverables.** [Phase 3–6 plan](../../design-plans/phase-3-to-6-implementation.md), removal of the inactive `Messages` header button (`D-06`), route active matching and task header titles (`TCH-01`), natural DOM login Tab order (`AUTH-02`), announced reduced-motion callback loading state (`AUTH-03` / `D-05`), and FullCalendar token overrides + skill labels (`STU-01`).
- **Non-goals.** A new component library, permission changes, a notifications redesign or new messages features.
- **Acceptance and done.** The three role shells retain their destinations and visible navigation. Header shows only `Toggle sidebar` and `Notifications`; Teacher routes highlight their true section (`Dashboard`, `Grading`, task routes); Auth callback announces `"Signing you in…"` with static dots under reduced motion; both populated (`student@ivy-mock.test`) and empty (`empty@ivy-mock.test`) calendar schedules pass.
- **Regression risks.** Radix slot/portal contracts, sidebar keyboard shortcut, route highlighting, sticky header offsets, popover sizing and feedback timing.

## Phase 4 — Student experience

- **Status.** Implemented for approved scope (`STU-02`, `D-03`, plus `STU-01` calendar verification).
- **Scope and prerequisites.** Use passing shell checks and fixtures through enrollment, upcoming work, assigned sessions and submissions. Focus on dashboard, courses, extension, lesson detail and assignment discovery.
- **Deliverables.** `min-w-0` flex containment fixing 768px lesson detail overflow (`STU-02`) and shared neutral `secondary` IELTS skill badges + status variant helpers in `src/lib/ielts-badges.ts` (`D-03`) applied across lessons, assignments, extension tabs, and course cards.
- **Non-goals.** Enrollment policy, new schedule route, Settings implementation and changes to the assessment engine.
- **Acceptance and done.** Verified `scrollWidth === 768` at 768px on populated and empty lesson states, plus clean `D-03` badges on `/courses`, `/assignments`, `/extension`, and `/lessons/[id]`.
- **Regression risks.** Calendar date/time boundaries, grouping of enrollment and assignment statuses, matching lesson IDs, and long titles on narrow screens.

## Phase 5 — Teacher and Admin experience

- **Status.** Implemented for approved scope (`ADM-01`, `D-03` Teacher grading queue, plus 768px queue reflow).
- **Scope and prerequisites.** Use verified Teacher/Admin fixtures and stable shell primitives. Cover dashboard, session detail, course dialogs, teacher creation, materials and attendance.
- **Deliverables.** Explicit `id`/`htmlFor` label associations on `Skill *` and `Level *` Select triggers in `CourseDialog` (`ADM-01`), neutral `secondary` skill badges and responsive card wrapping on `/teacher/grading` (`D-03`).
- **Non-goals.** Changes to roles, attendance semantics, account creation policy, table data models and WIP routes.
- **Acceptance and done.** Verified `combobox "Skill *"` and `combobox "Level *"` in `CourseDialog` and zero horizontal overflow (`scrollWidth === 768`) on `/teacher/grading`.
- **Regression risks.** Wrong record selected after filtering, action buttons clipped in narrow layouts, and dialog state carried into create/edit flows.

## Phase 6 — Assessment and grading experience

- **Status.** Implemented for approved scope (`BLD-02`, `EXM-01`, `EXM-02`, `GRD-01` with `D-04`, `GRD-02`, `D-03`). Track the reopened Student AI Writing feedback mismatch separately ([Grading audit](audit/grading-ai-feedback.md)).
- **Scope and prerequisites.** Establish seeded drafts and submissions, per-skill assignments, media, and AI/regrade states. Stabilize earlier portal entry points. Work in separate builder, exam and grading slices.
- **Deliverables.** Unified `viewMode` state in Builder (`BLD-02`), responsive wrapping exam header (`EXM-01`) + persistent accessible names across exam header and footer navigation (`EXM-02`), narrow `Submissions` `Sheet` with focus return/heading transfer and wrapping action bar (`GRD-01` / `D-04`), Zustand grading-store selector fix, accessible rubric/band slider & spinbutton names (`GRD-02`), and `D-03` badge consistency.
- **Non-goals.** Scoring, AI prompts, storage format, timing rules, drag library replacement and data model changes.
- **Acceptance and done.** Verified across 320, 390, 768, 1024, and 1440px in Playwright against `@ivy-mock.test` fixtures, including bidirectional Preview/Builder sync, multi-question & active/submitted exams, Sheet Escape focus restoration, per-student draft isolation across switching, Previous/Next queue navigation, and ArrowRight slider/spinbutton sync.
- **Regression risks.** Draft/answer loss, cross-submission state, invalid reorder, duplicate submission, timer or recording drift, and overwritten scoring or feedback.

## Phase 7 — Accessibility and responsiveness

- **Scope and prerequisites.** Consolidate cross-role issues after component and flow improvements. Keep accessibility checks in each earlier phase as well.
- **Deliverables.** Manual keyboard, screen-reader and zoom/reflow evidence, targeted automated checks, reduced-motion review and a device/browser matrix.
- **Non-goals.** A universal conformance claim or new feature requirements.
- **Acceptance and done.** Resolve blocking issues in the chosen flows. Verify names, focus, dialog return, form errors, status announcements, reflow, target size, contrast and accessible alternatives for nonessential drag interactions. Record exceptions with evidence and an owner.
- **Regression risks.** Hidden mobile actions, sticky UI obscuring focus, verbosity of live announcements, stray animation and controls requiring pointer-only input.

## Phase 8 — Final polish and quality gates

- **Scope and prerequisites.** Review changed routes against the accepted design contract and the final fixtures. Consolidate evidence, validate long and empty data, and align available CI with reproducible local checks.
- **Deliverables.** Final visual comparison, test results and a short handoff with residual risks. Add agreed quality gates only after naming their owner and reproducing them.
- **Non-goals.** Deployment, placeholder functionality, broad cleanup and unrelated baseline failures.
- **Acceptance and done.** The changed flows pass current lint/type/build and agreed behavior checks. Capture final screenshots at matching widths, resolve regressions against accepted evidence and record any remaining unverified state.
- **Regression risks.** CI checkout differing from local workspace, external service availability, visual fixtures drifting and late cross-role changes.

## Recommended Phase 2 order for approval

1. **Unblock authoring.** Prioritize [BLD-01](findings.md#bld-01) and [BLD-03](findings.md#bld-03). Approve [D-04](design-decisions.md#d-04) at the narrow workspace level, keeping save reachability and non-drag insertion independently verifiable.
2. **Pilot shared accessibility.** Prioritize [SHELL-01](findings.md#shell-01), [SHELL-02](findings.md#shell-02) and [AUTH-01](findings.md#auth-01). Keep existing role navigation and visual identity.
3. **Verify the color consumer.** Select [STU-01](findings.md#stu-01) as a scoped semantic-color pilot once a populated schedule is available. Use the light reference unless [D-01](design-decisions.md#d-01) is approved.
4. **Carry the remaining significant barriers into the next approved slices.** Start with course and rubric labels, exam names and reflow, and the grading action area. Use [findings](findings.md) to select scope and dependencies before creating implementation plans.

See the [audit gaps](audit/README.md#limits) and [behavior matrix](acceptance-criteria.md#behavior-to-preserve).
