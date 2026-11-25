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

- **Scope and prerequisites.** Build from the accepted foundation and actual shared consumers. Verify sidebar navigation, header, notifications, buttons, cards, forms, overlays and feedback states across roles.
- **Deliverables.** A focused shell and primitive change set with representative loading, empty, error, focus, disabled and destructive states. Define the ownership of active route and header labels.
- **Non-goals.** A new component library, permission changes, a notifications redesign or new messages features.
- **Acceptance and done.** The three role shells retain their destinations and visible navigation. Mobile sheet opens and dismisses with keyboard/pointer, returns focus, and leaves the active view reachable. Builder, grading and exam layout exceptions retain intended space and behavior.
- **Regression risks.** Radix slot/portal contracts, sidebar keyboard shortcut, route highlighting, sticky header offsets, popover sizing and feedback timing.

## Phase 4 — Student experience

- **Scope and prerequisites.** Use passing shell checks and fixtures through enrollment, upcoming work, assigned sessions and submissions. Focus on dashboard, courses, extension, lesson detail and assignment discovery.
- **Deliverables.** A consistent route-to-task hierarchy, including calendar/list, filtering, assignment entry and recoverable empty/error/loading states.
- **Non-goals.** Enrollment policy, new schedule route, Settings implementation and changes to the assessment engine.
- **Acceptance and done.** A student can find their next session or assignment, read deadline/status, switch extension tabs and reach lesson/assessment details at the five widths. Fixtures cover enrolled, empty and failed-data states. Existing URLs and filters remain compatible.
- **Regression risks.** Calendar date/time boundaries, grouping of enrollment and assignment statuses, matching lesson IDs, and long titles on narrow screens.

## Phase 5 — Teacher and Admin experience

- **Scope and prerequisites.** Use verified Teacher/Admin fixtures and stable shell primitives. Cover dashboard, session detail, course dialogs, teacher creation, materials and attendance.
- **Deliverables.** Portable patterns for management cards, filters, lists, forms and confirmations, plus role-specific regression evidence.
- **Non-goals.** Changes to roles, attendance semantics, account creation policy, table data models and WIP routes.
- **Acceptance and done.** Users can locate and inspect records, complete existing allowed actions in the dev fixture, cancel destructive actions and recover from validation/API failures. Verify scrolling, focus return and dense row access.
- **Regression risks.** Wrong record selected after filtering, action buttons clipped in narrow layouts, and dialog state carried into create/edit flows.

## Phase 6 — Assessment and grading experience

- **Scope and prerequisites.** Establish seeded drafts and submissions, per-skill assignments, media, and AI/regrade states. Stabilize earlier portal entry points. Work in separate builder, exam and grading slices.
- **Deliverables.** Verified builder selection/preview/drag and save flows, responsive exam navigation and media/answer states, and grading queue-to-submission presentation with AI feedback.
- **Non-goals.** Scoring, AI prompts, storage format, timing rules, drag library replacement and data model changes.
- **Acceptance and done.** Verify create/edit/preview and persistence, answer recovery, timers, media permissions, submission confirmation, rubric drafts, comments, publication and regrade. Test write actions only against approved disposable fixtures. Compare narrow/wide and failure cases with Phase 1 evidence.
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
