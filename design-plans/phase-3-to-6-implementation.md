# Phase 3–6 Implementation Plan — Shell, Portal Flows, and Assessment/Grading

- Branch `refactor/ui-ux`
- Baseline after Phase 2 `563592f`
- [Approved design decisions D-01 through D-06](../docs/ui-ux/design-decisions.md)

## Implemented Slices

1. **Calendar Semantic Tokens (`STU-01`)**
   - `src/app/globals.css`: Replaced invalid `hsl(var(--...))` wrappers in `.fc-custom` with CSS color variables (`var(--...)`) and `color-mix(in oklab, ...)` so headers, borders, today states, and `:focus-visible` outlines resolve from Tailwind v4 OKLCH tokens. Fixed `.fc-event-main-frame` and `.fc-event-time` layout so event start times (e.g., `09:00`) do not truncate.
   - `src/components/extension/schedule-tab.tsx`: Prefixed calendar event labels with written IELTS skill names (`Reading:`, `Listening:`, `Writing:`, `Speaking:`) per `D-03`.

2. **Phase 3 — Shared Shell and Auth (`D-06`, `D-05`, `TCH-01`, `AUTH-02`, `AUTH-03`)**
   - `src/components/layout/main-header.tsx`: Removed inactive `Messages` header button while preserving `Notifications`; added route-specific task header titles (`Grading`, `Assignment Builder`, `Lesson Details`, `Edit Course Session`, `New Course`, `Assessment`) without falling back to `Dashboard`.
   - `src/components/layout/nav-main.tsx`: Matched root portal URLs (`/student`, `/dashboard`, `/teacher`, `/admin`, `/courses`, `/extension`, `/settings`) cleanly and matched nested routes by path-segment boundary (`pathname.startsWith(\`${url}/\`)`) with `aria-current="page"`.
   - `src/app/(auth)/login/page.tsx`: Removed positive `tabIndex` attributes so Tab order matches visual order (`Sign up` → `Continue With Google` → `Email` → `Password` → `Log in`) while retaining React Hook Form first-invalid-field focus on error.
   - `src/app/(auth)/callback/page.tsx` & `src/components/custom-ui/loader.tsx`: Added live status copy (`Signing you in…`, `role="status"`, `aria-live="polite"`), accessible error alert + `/login` recovery link, `aria-hidden="true"` on the decorative loader, and specific `:nth-child(...)` reduced-motion CSS overrides (`animation: none`) when `prefers-reduced-motion: reduce` matches.

3. **Phase 4 — Student Experience (`STU-02`, `D-03`)**
   - `src/lib/ielts-badges.ts`: Centralized neutral `secondary` IELTS skill labels (`IELTS_SKILL_LABELS`, `getSkillLabel`) and task-semantic status badge variants (`getStudentSubmissionStatusBadge`, `getTeacherSubmissionStatusBadge`).
   - `src/components/ui/sidebar.tsx`, `src/app/(student)/layout.tsx`, `src/app/(student)/lessons/[id]/page.tsx`: Added `min-w-0` flex constraints across `SidebarInset`, student `<main>`, and lesson cards/grids so 768px lesson views fit within `768px` without horizontal overflow, plus `D-03` badge styling.
   - `src/app/assignments/page.tsx`, `src/components/extension/assignments-tab.tsx`, `src/components/extension/classes-tab.tsx`, `src/components/course/course-card.tsx`: Standardized `D-03` skill and status badge mappings and narrow wrapping.

4. **Phase 5 — Admin (`ADM-01`)**
   - `src/components/admin/course-dialog.tsx`: Associated `Skill *` and `Level *` `<Label htmlFor="...">` elements with matching `id`s on `SelectTrigger` controls for create and edit flows.

5. **Phase 6 — Assessment & Grading (`BLD-02`, `EXM-01`, `EXM-02`, `GRD-01`/`D-04`, `GRD-02`, `D-03`)**
   - `src/app/teacher/assignments/builder/page.tsx`: Replaced page-local `isPreview` state with `viewMode === "preview"` so tabs and the header `Preview`/`Edit` button share one source of truth.
   - `src/app/assignments/[id]/layout.tsx` & `src/components/assignment/BottomNavigation.tsx`: Made the exam header flex-wrap cleanly with `min-w-0` at 320px/390px in both active `Submit` and `Submitted` states; added persistent `aria-label` names for Back, Fullscreen, Help, toast dismiss, Previous, Next, and Part controls.
   - `src/components/ui/slider.tsx` & `src/components/grading/rubric-scoring.tsx`: Forwarded `aria-label`/`aria-labelledby` to `SliderPrimitive.Thumb` (`role="slider"`) and associated labels/names for criterion, generic, and IELTS Band Score controls.
   - `src/app/teacher/assignments/[id]/grade/page.tsx`, `src/components/grading/grading-action-bar.tsx`, `src/components/grading/grading-header.tsx`, `src/components/grading/student-submission-list.tsx`, `src/components/grading/submission-viewer.tsx`, `src/app/teacher/grading/page.tsx`: Implemented `D-04` (below 1280px `Submissions` `Sheet` with focus management back to trigger on Escape/close or onto the selected student's heading on selection, wrapping Previous/Next and Save Draft/Submit Grade/Reset actions in normal scroll flow, persistent inline error alerts on save/submit failures, `D-03` badges, and >=1280px inline rail).
   - `src/store/teacher-grading.store.ts`: Fixed Zustand state getters (`currentSubmission`, `currentIndex`) that became frozen after initial `set(...)` calls by computing from `submissions` and `currentSubmissionId` inside store actions (`navigateSubmission`, `updateDraftScore`, `calculateBandScore`, `saveDraft`, `submitGrade`, `addComment`).

## Out-of-Scope / Tracked Separately

- Student AI Writing feedback mismatch after submission reopen remains tracked separately in [Grading audit](../docs/ui-ux/audit/grading-ai-feedback.md).
