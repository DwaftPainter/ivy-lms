# Acceptance criteria

These criteria define the evidence expected as the [roadmap](roadmap.md) proceeds. The [baseline](baseline.md) records checks already completed and gaps to fill.

## Phase 0 exit

- Record the branch, full commit, tooling, and workspace differences that affect validation.
- Inventory every UI page, its layout and principal dependencies. Group API routes and shared/feature components with source links.
- Run existing validation with installed tools. Record the tracked checkout and working-tree results separately.
- Inspect available screens at 320, 390, 768, 1024 and 1440 CSS px. Save sanitized screenshots, name the tested states and note all blocked or unsupported paths.
- Record documented and observed design evidence without promoting page-local values into a design contract.
- Deliver the six linked documents and a Phase 1 plan. Restrict Phase 0 changes to discovery documents and their visual evidence.

## Phase 1 exit

- Reconcile Phase 0 with the current tracked SHA. Carry forward still-current coverage and update evidence for ambiguous or high-impact states.
- Validate the root [design contract](../../DESIGN.md) with the supported spec and Tailwind v4 export. Record omitted token groups, alternate theme representation and validator warnings.
- Audit all available surface families with rendered evidence. Include a source owner and measurable correction for every verified [finding](findings.md), and record untested fixture states separately.
- Provide a [severity-ranked backlog](findings.md) and a visibly separate [approval list](design-decisions.md). Limit each coherent report to the most supported findings.
- Keep application code and configuration untouched. Restrict changes to discovery artifacts and approved document updates.

## Phase 2 entry and exit

- Confirm human approval of the findings and any design choices they depend on. Keep task-specific layouts and the IVY mark and primary role as the reference.
- Create disposable authoring, submit and grading fixtures before any destructive or persistence check. For builder, verify an enabled primary action after an actual edit at the five widths, and prove click/tap and keyboard question insertion.
- Verify header controls and sidebar closing behavior in Student, Teacher, and Admin. Check accessible names and meaningful focus after dismissal with a keyboard and one screen reader.
- Verify Auth normal, error and focus states against the shared roles. Check rendered foreground/background contrast, including hover, active and disabled treatments where applicable.
- Validate the selected token consumer in populated and empty states. For FullCalendar, confirm token resolution in the actual grid and its local scroll region.
- Capture before/after screenshots and manual interaction evidence at the target widths. Test whole-document scroll and inside-container clipping separately.
- Run the technical gates below on the intended checkout and record any pre-existing workspace lint failures. Read the [Phase 2 recommendation](roadmap.md#recommended-phase-2-order-for-approval) and each selected finding's acceptance checks.

### Phase 2 execution record

- **Resolved findings:** `BLD-01` (`D-04` builder narrow-panel task view switch approved), `BLD-03`, `SHELL-01`, `SHELL-02`, `AUTH-01`.
- **Deferred at Phase 2 exit:** `STU-01` was deferred due to a dev schedule fixture gap (the available `ClassSession` rows were dated `2026-04` while `ScheduleTab` rendered `2026-11` with `headerToolbar={false}`). Reopened Student AI Writing feedback remains tracked in the [grading audit](audit/grading-ai-feedback.md). The `GRD-01` implementation belongs to Phase 6 under the approved grader direction in [D-04](design-decisions.md#d-04).
- **Browser verification summary (localhost dev server, isolated Playwright Chromium, disposable non-production fixtures):**
  - `BLD-01`: `Save`, `Update`, and `Save & Link` enabled after edits, visible, focusable, pointer-hittable, and `document.documentElement.scrollWidth === window.innerWidth` at 320, 390, 768, 1024, and 1440px. `Update` and `Save & Link` persistence verified against disposable fixtures.
  - `BLD-03`: Invalid-target explanation verified (`role="alert"` + status text); keyboard (`Enter`), click/tap (Canvas `Add Question`), and drag-and-drop insertion verified with matching question structure and focus landing on the newly inserted question card.
  - `SHELL-01` & `SHELL-02`: Verified separately on Student (including unread badge state `Notifications (1 unread)` and mobile route navigation to `/courses`), Teacher, and Admin at 390px: distinct non-empty header names, visible `Close` control in mobile `Sheet`, and focus restoration to `"Toggle sidebar"` after both `Close` click and `Escape`.
  - `AUTH-01`: `"or"` separator text on `/login` and `/register` computed `rgb(113, 113, 123)` on `rgb(255, 255, 255)` (`4.83:1` >= 4.5:1).
- **Note on screen-reader check:** Accessibility names, roles, expanded states, and focus restoration were verified via the browser accessibility tree and keyboard navigation; an external OS screen reader (VoiceOver/NVDA) was not run in this headless pass.

### Phases 3–6 execution record

- **Resolved findings & approved decisions:** `STU-01`, `D-06`, `D-05`, `TCH-01`, `AUTH-02`, `AUTH-03`, `STU-02`, `D-03`, `ADM-01`, `BLD-02`, `EXM-01`, `EXM-02`, `GRD-01` (`D-04`), `GRD-02`.
- **Browser verification summary (`localhost:3000`, isolated Playwright Chromium, `@ivy-mock.test` fixtures from `prisma/mock-data.sql`, evidence under `docs/ui-ux/audit/evidence/phase3-6/`):**
  - `STU-01`: Populated (`student@ivy-mock.test`, 2026-11) and empty (`empty@ivy-mock.test`) calendars fit cleanly at 390px (`scrollWidth === 390`), resolve semantic `colHeaderBg`/`dayBorder`/`todayBg`/`todayNumBg`, display untruncated start times (`09:00`), and include skill labels (`Reading:`, etc.).
  - `D-06` & `TCH-01`: Header exposes `Toggle sidebar` and `Notifications` only; Teacher sidebar highlights only the active destination (`Dashboard` on `/teacher`, `Grading` with `aria-current="page"` on `/teacher/grading`, none on `/teacher/assignments/builder` with header `"Assignment Builder"`).
  - `AUTH-02` & `AUTH-03` (`D-05`): `/login` Tab order follows visual order and empty submit focuses `"Email address"` (`aria-invalid="true"`); `/callback` under `prefers-reduced-motion: reduce` exposes `role="status"` `"Signing you in…"` with `animationName === "none"` across `.three-body` and all three `.three-body__dot::after` rings.
  - `STU-02` & `D-03`: 768px lesson detail (`ivy-mock-session-reading-month`, `ivy-mock-session-writing-past`) fits within `768px` (`scrollWidth === 768`); neutral `secondary` skill badges and `outline`/`secondary` status badges verified on `/courses`, `/assignments`, `/lessons/[id]`, `/teacher/grading`, and grading workspaces.
  - `ADM-01`: `Create New Course` dialog in `admin@ivy-mock.test` exposes `combobox "Skill *"` and `combobox "Level *"` in the AX tree.
  - `BLD-02`, `EXM-01`, `EXM-02`: Builder `Preview`/`Edit` button and Tabs stay synchronized; Listening (active `Submit`), Writing (Submitted), and Reading (multi-question) exams fit `320px` and `390px` (`scrollWidth === innerWidth`) with accessible names on all icon controls.
  - `GRD-01` (`D-04`) & `GRD-02`: Grading workspace fits `320`, `390`, `768`, `1024`, and `1440px` (`>=1280px` inline rail; `<1280px` `Submissions` Sheet with Escape focus return to trigger, selection focus transfer to selected student `h2`, per-student draft preservation across switching, `Reset` button, and working `Previous`/`Next` navigation); Criterion and IELTS Band sliders/spinbuttons expose paired names and sync on `ArrowRight`.
  - Grading follow-up with mocked requests in Chrome and isolated store and API checks. Failed saves and grade submissions retain edits and allow retry. In-flight saves preserve newer edits. Reopened partial drafts show the full rubric with its original limits. The Sheet closes and focuses the inline selection at the desktop breakpoint and respects reduced motion. Save Draft persists changes before publication. Regrade edits stay in the workspace until submission. Lesson details distinguish existing drafts from assignments that have never been started.
- **Tracked separately / unverified items:**
  - Reopened Student AI Writing feedback display after assignment reopen remains tracked separately in [grading audit](audit/grading-ai-feedback.md).
  - Headless Playwright checks verified browser AX names, roles, focus, and keyboard navigation; no external OS screen reader (VoiceOver/NVDA) was attached.

## Verification for future changes

| Area | Acceptance evidence |
| --- | --- |
| Reflow | Compare the same task and state at 320, 390, 768, 1024 and 1440 CSS px. No unintended page-level horizontal scroll or unreachable affordance. Document intrinsically two-dimensional regions and verify localized scrolling and keyboard access. Test zoom and text spacing against the applicable criteria. |
| Keyboard and focus | Reach every interactive element in a meaningful order. Verify visible, unobscured focus, escape from overlays, focus restoration, and a keyboard workflow for authoring and grading. For nonessential dragging, verify a single-pointer alternative. |
| Names, forms and feedback | Controls have meaningful accessible names. Form labels, invalid state and messages are associated. Pending/error/result feedback is discoverable to assistive technology and stays available for recovery. Test valid submission, errors and cancellation. |
| Color and motion | Measure applicable text and control/focus contrast using the actual rendered color pairs. Verify light and any approved dark presentation. Verify reduced-motion behavior for repeated and nonessential motion. |
| Design and ownership | Trace changes to an accepted design decision, shared variant or local task need. Check unaffected consumers when changing a shared token or component. Preserve IVY branding, URLs and existing interaction contracts. |
| Technical gates | Run `pnpm lint --max-warnings 0`, `pnpm exec next typegen` followed by `pnpm exec tsc --noEmit --incremental false`, and `pnpm build` using the intended checkout and toolchain. Record generated Prisma prerequisites and any scripts outside the tracked app. |
| Evidence | Include the SHA, route, role, non-production fixture, viewport, state, steps and observed result. Include matched screenshots for visible changes where possible. Treat automated audits as one input and record manual verification for keyboard, assistive technology and complete flows. |

Use applicable WCAG 2.2 A and AA criteria, especially keyboard access, reflow, focus visibility and obstruction, contrast, form errors, dragging movements and target size. The scope is the changed journey and its shared dependencies. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Behavior to preserve

| Flow | Regression check |
| --- | --- |
| Authentication and role routing | Verify email/password success and field errors, registration validation, Auth0 success/failure with authorized test access, sign-out, signed-out direct links and cross-role redirects. Keep authorization decisions where the application currently enforces them. |
| Student portal | Dashboard links, course cards, schedule and other extension tabs, lessons and assignment list. Cover data present, empty and failed data. |
| Teacher and Admin | Teacher sessions, materials and attendance. Admin course and class session workflows and teacher creation. Confirm cancel/error paths and role-appropriate access. |
| Assignment builder | Create/edit/preview, skill-specific inputs, library insertion and sorting, media attachments and persistence. Verify both the form actions and the return destination. |
| Examination | Skill variants, question/section navigation, timer behavior, saved answers, audio playback and speaking recording. Verify upload failure, submit/cancel and reopening a submitted attempt. |
| Grading and AI feedback | Grading queue, submission switching, rubric and feedback, saved draft, comment and publication, plus Writing correction display/regrade states. Compare outputs for the same fixture. |
| Placeholder and unavailable | Preserve explicit WIP coverage. Record access restrictions, absent fixture data and external integrations as blocked or not exercised until there is evidence. |

Use authorized dev accounts and approved, resettable fixtures for any state-changing workflow. Keep credentials, tokens, private content and personal data out of screenshots and persistent evidence.
