# Verified findings

Evidence is from the tracked application at `089565ab1bab615d8b6e9669394544ffa2dae640` on `refactor/ui-ux`. The [audit index](audit/README.md) describes the browser checks and sample limits. Effort is relative to this codebase. **S** covers one existing owner, **M** covers a component and its consumers, and **L** covers a workflow across several modes. The corrections describe intended outcomes. Approval is required before writing detailed implementation plans.

| Severity | Count | Meaning |
| --- | ---: | --- |
| P0 | 2 | A core task is blocked in the verified viewport or input mode. |
| P1 | 9 | Significant barrier to operation, comprehension, or consistent use. |
| P2 | 5 | Localized usability or presentation defect with a supported correction. |
| P3 | 0 | Visual polish. Unapproved design choices live in [design decisions](design-decisions.md). |

## P0 — Critical

### BLD-01

**Builder Save is clipped after an edit** · Assignment Builder · M · **Resolved (Phase 2)**

- **Impact and evidence.** At 390px, adding an unsaved section at desktop width and narrowing the viewport left the enabled Save button at x=470–544. Document width remained 390px and the button could not be hit. The blank builder matches that geometry at 320px. Wider affected widths introduce whole-page overflow. [Responsive measurements](responsive-audit.md), [unsaved builder capture](audit/evidence/builder-dirty-save-390.png).
- **Cause and correction.** The toolbar combines nonwrapping action controls next to the title inside an overflow-hidden builder, alongside fixed-width side panels. Make the existing save and preview controls reachable in the builder's available inline size. [Builder owner](../../src/app/teacher/assignments/builder/page.tsx#L174).
- **Dependencies and risk.** Teacher shell width and builder panel layout. Preserve Create, Update and Save & Link, dirty/loading states, and the existing preview and return behavior. Narrow panel presentation approved under [D-04](design-decisions.md#d-04) (`Canvas` | `Library` | `Inspector` switcher below `xl`).
- **Acceptance.** Verified in Phase 2: enabled `Save`, `Update`, and `Save & Link` remain inside the viewport, focusable, pointer-hittable, and free of document horizontal overflow (`scrollWidth === innerWidth`) at 320, 390, 768, 1024, and 1440px, with `Update` and `Save & Link` persistence verified against disposable fixtures. [After 390px](audit/evidence/phase2/builder-dirty-save-390.png), [After 1440px](audit/evidence/phase2/builder-dirty-save-1440.png).

### BLD-03

**Question insertion depends on dragging** · Assignment Builder · M · **Resolved (Phase 2)**

- **Impact and evidence.** After adding a section, the library entries were native draggable divs outside the tab sequence. The question drop zone exposes no insertion control. Keyboard and single-pointer users can create a section but cannot use the observed question insertion path. [Builder audit](audit/assignment-builder.md), [keyboard and dragging evidence](accessibility-audit.md).
- **Cause and correction.** Library insertion uses native drag events and canvas drop handlers. The existing keyboard sensor does not turn those library items into keyboard actions. Offer a reachable question insertion action using the existing section and question type model. [Library](../../src/components/assignment-builder/component-library.tsx), [canvas](../../src/components/assignment-builder/builder-canvas.tsx), [DnD provider](../../src/components/assignment-builder/dnd-context.tsx#L29).
- **Dependencies and risk.** Existing target-section selection, allowed question types and insertion logic. Preserve the drag path, type restrictions, numbering and saved data.
- **Acceptance.** Verified in Phase 2: added questions to a chosen section via keyboard alone (Library target-section selector + `Enter`), click/tap (Canvas `Add Question` menu), and drag-and-drop, producing identical question objects, moving focus onto the inserted question card, and exposing inline/alert explanation when no section exists.

## P1 — Significant

### SHELL-01

**Three shared header buttons have empty accessible names** · Student, Teacher and Admin · S · **Resolved (Phase 2)**

- **Impact and evidence.** At 390px, Chrome exposed the sidebar, notification and message buttons as three focusable buttons with empty names in each role. The role header repeats the same markup. [Accessibility audit](accessibility-audit.md#control-names).
- **Cause and correction.** The actual buttons render icons without names. Add names that describe each rendered control's purpose, on the elements receiving focus. The message button's product behavior is a separate decision. [Header](../../src/components/layout/main-header.tsx#L51), [sidebar trigger](../../src/components/ui/sidebar.tsx#L251), [notification trigger](../../src/components/notifications/notification-bell.tsx#L72).
- **Dependencies and risk.** Shell, notification popover trigger and localization for any added text. Preserve the visual icons, keyboard order and notification count.
- **Acceptance.** Verified in Phase 2: Chrome/Playwright AX tree exposes `"Toggle sidebar"`, `"Notifications"` (and `"Notifications (1 unread)"` with unread notifications), and `"Messages"` across Student, Teacher, and Admin at 390px.

### SHELL-02

**Mobile sidebar has no visible close control and loses focus on dismissal** · Student, Teacher and Admin · M · **Resolved (Phase 2)**

- **Impact and evidence.** At 390px, each role opened a named Sidebar dialog and focus moved inside. The close control was hidden. Escape dismissed the dialog but focus did not return to the opening button after the transition. [Accessibility audit](accessibility-audit.md#focus-and-dialogs).
- **Cause and correction.** The controlled Sheet hides its supplied close button, and its external SidebarTrigger sits outside the Sheet trigger association. Use the existing Sheet close and trigger behavior so the drawer has a visible dismissal and restores focus. [Mobile Sheet](../../src/components/ui/sidebar.tsx#L166), [external trigger](../../src/components/ui/sidebar.tsx#L251).
- **Dependencies and risk.** Sidebar provider, route navigation and Radix Sheet. Preserve the desktop rail, sidebar shortcut, focus trap and mobile role links.
- **Acceptance.** Verified in Phase 2 across Student, Teacher, and Admin at 390px: mobile Sheet renders a visible `"Close"` button (`255..271, 16..32`), closing via `"Close"` button or `Escape` restores focus to `"Toggle sidebar"` after the exit transition, and route navigation via mobile sidebar links (`/courses`) closes the sheet cleanly without pulling focus back. [Open drawer](audit/evidence/phase2/teacher-mobile-sidebar-390.png).

### STU-02

**Student lesson widens the page at the sidebar breakpoint** · Student lesson detail · M · **Resolved (Phase 4)**

- **Impact and evidence.** The sampled enrolled lesson reached 994px document width in a 768px viewport. The sidebar was 240px and the inset was 754px, beyond the available 528px. Desktop and narrower mobile samples fit in Phase 0. [Responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** The sidebar flex inset retains the lesson content's intrinsic minimum. Added `min-w-0` on `SidebarInset`, student `<main>`, and lesson grids/cards alongside `D-03` badges. [Sidebar inset](../../src/components/ui/sidebar.tsx#L306), [Student layout](../../src/app/%28student%29/layout.tsx), [lesson view](../../src/app/%28student%29/lessons/%5Bid%5D/page.tsx).
- **Dependencies and risk.** Shared inset, lesson content, resource rows and CTA. Check other role shells and long content before changing shell defaults.
- **Acceptance.** Verified in Phase 4 at 768px against `ivy-mock-session-reading-month` and `ivy-mock-session-writing-past`: `scrollWidth === 768 === innerWidth`, lesson controls and assignments remain reachable with zero horizontal scroll. [After 768px](audit/evidence/phase3-6/student-lesson-768.png).

### ADM-01

**Course Skill and Level selectors have empty accessible names** · Admin course dialog · S · **Resolved (Phase 5)**

- **Impact and evidence.** Chrome exposed a named Create New Course dialog. Title, Description, Target Band and other input names appeared, while the Skill and Level comboboxes had empty names. [Admin audit](audit/admin.md).
- **Cause and correction.** Added matching `id="skill"` and `id="level"` attributes to the Radix `SelectTrigger` controls so `<Label htmlFor>` binds directly. [Course dialog](../../src/components/admin/course-dialog.tsx#L143).
- **Dependencies and risk.** Radix Select and create/edit mode. Preserve enum values, validation and visible field labels.
- **Acceptance.** Verified in Phase 5 via Playwright AX snapshot in `admin@ivy-mock.test`: `combobox "Skill *"` and `combobox "Level *"` expose accessible names in `CourseDialog`. [Course dialog capture](audit/evidence/phase3-6/admin-course-dialog.png).

### BLD-02

**Preview tab and displayed mode disagree** · Assignment Builder · S · **Resolved (Phase 6)**

- **Impact and evidence.** At 1440px Preview became the selected tab, while the editing panels stayed visible. The separate Preview button hid the panels and changed its label to Edit. [Builder audit](audit/assignment-builder.md).
- **Cause and correction.** Removed local `isPreview` state and derived `const isPreview = viewMode === "preview"` from `useAssignmentBuilderStore`. [Mode owner and tab](../../src/app/teacher/assignments/builder/page.tsx#L160).
- **Dependencies and risk.** Existing builder state and inspector behavior. Preserve draft contents and selection when switching modes.
- **Acceptance.** Verified in Phase 6 on `/teacher/assignments/builder?assignmentId=ivy-mock-assignment-reading`: clicking header `Preview` activates the `Preview` tab and toggles the button to `Edit`; selecting the `Builder` tab restores `Preview` and builder panels.

### EXM-01

**Exam header exceeds narrow viewport** · IELTS Examination · M · **Resolved (Phase 6)**

- **Impact and evidence.** Both sampled Writing exams reached 458px document width at 320px and 390px. The right-hand controls and Submitted badge reached x=458. Users opening an attempt can miss its submission state or header controls. [Responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** Constrained the exam header with `flex-wrap`, `min-w-0` title container, and `shrink-0` control wrapping. [Exam layout](../../src/app/assignments/%5Bid%5D/layout.tsx#L72).
- **Dependencies and risk.** Exam-specific shell. Preserve timer, submitted state and confirmation, including long titles and sticky header behavior.
- **Acceptance.** Verified in Phase 6 at 320px and 390px for both submitted (`ivy-mock-assignment-writing-2`, `Submitted` badge) and active (`ivy-mock-assignment-listening`, `Submit` button): `scrollWidth === innerWidth` (`320` and `390`) with `56px` header fit and reachable controls. [Active 320px](audit/evidence/phase3-6/student-exam-listening-320.png), [Submitted 320px](audit/evidence/phase3-6/student-exam-submitted-320.png).

### EXM-02

**Exam icon buttons lack names, including labels hidden on mobile** · IELTS Examination · S · **Resolved (Phase 6)**

- **Impact and evidence.** At 320px and 390px, exam Back, fullscreen and Help had empty names. Previous and Next were also unnamed in the sampled single-question footer. Help, Previous and Next had text names at 1440px. [Exam audit](audit/ielts-examination.md).
- **Cause and correction.** Added persistent `aria-label` names on Back (`Go back`), Fullscreen (`Enter fullscreen` / `Exit fullscreen`), Help (`Assignment help`), toast dismiss (`Dismiss notification`), `Previous question`, `Next question`, and Part buttons (`{title} ({n} question(s))`) with `aria-current="step"`. [Header buttons](../../src/app/assignments/%5Bid%5D/layout.tsx#L76), [question navigation](../../src/components/assignment/BottomNavigation.tsx#L40).
- **Dependencies and risk.** Current fullscreen state and directional controls. Preserve disabled boundaries and button behavior.
- **Acceptance.** Verified in Phase 6 at 320px on multi-question (`ivy-mock-assignment-reading`) and listening (`ivy-mock-assignment-listening`) fixtures: all icon-only controls expose explicit accessible names and disabled boundaries are preserved.

### GRD-01

**Submission workspace clips grading controls on narrow screens** · Grading and AI Feedback · M · **Resolved (Phase 6)**

- **Impact and evidence.** In the loaded submission state at 390px, Save Draft occupied x=544–661 and the document reported only 390px of width. At 768px and 1024px the document reached 1008px and 1062px. Grade actions can fall outside the reachable content area. [Grading audit](audit/grading-ai-feedback.md), [responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** Implemented approved `D-04` grader layout: below `1280px` (`xl`), `Submissions ({n})` opens a `Sheet` while keeping the selected student heading, queue position, and wrapping `Previous`/`Next` + `Save Draft`/`Submit Grade`/`Reset` actions inside normal scroll flow; `>= 1280px` keeps the inline rail. Also fixed frozen Zustand getters (`currentSubmission`/`currentIndex`) in `useTeacherGradingStore` so `Previous`/`Next` and draft actions resolve live state. [Workspace](../../src/app/teacher/assignments/%5Bid%5D/grade/page.tsx), [action bar](../../src/components/grading/grading-action-bar.tsx), [grading store](../../src/store/teacher-grading.store.ts).
- **Dependencies and risk.** Teacher inset width, selection and draft state, Save Draft and final grading actions. Preserve desktop task density and keep destructive confirmation in scope.
- **Acceptance.** Verified in Phase 6 at 320, 390, 768, 1024, and 1440px on `ivy-mock-assignment-reading`: `scrollWidth === innerWidth` at all widths, `Escape` returns focus to `Submissions (2)`, selecting a student closes the `Sheet` and focuses the selected `h2`, per-student drafts remain isolated and preserved across switches (`Unsaved draft` badge + `Reset`), and `Previous`/`Next` navigate `1 / 2` ↔ `2 / 2`. [Sheet 768px](audit/evidence/phase3-6/teacher-grade-sheet-768.png), [Workspace 320px](audit/evidence/phase3-6/teacher-grade-320.png), [Desktop 1440px](audit/evidence/phase3-6/teacher-grade-1440.png).

### GRD-02

**Rubric score widgets have empty accessible names** · Grading and AI Feedback · S · **Resolved (Phase 6)**

- **Impact and evidence.** At 390px, 768px and 1440px, two rendered sliders and their two numeric inputs had empty names. The adjacent Feedback field was named. [Grading audit](audit/grading-ai-feedback.md).
- **Cause and correction.** Forwarded `aria-label`/`aria-labelledby` to `SliderPrimitive.Thumb` (`role="slider"`) in `Slider` and added associated labels/accessible names for criterion, generic `maxScore`, and IELTS Band Score sliders and numeric inputs. [Slider](../../src/components/ui/slider.tsx#L8), [Rubric scoring](../../src/components/grading/rubric-scoring.tsx#L98).
- **Dependencies and risk.** Existing Slider, input and grade store. Preserve limits and synchronization between slider and numeric input.
- **Acceptance.** Verified in Phase 6 on `ivy-mock-assignment-writing-review`: AX tree exposes `slider "Task Response slider"`, `spinbutton "Task Response score"`, `slider "Grammatical Range and Accuracy slider"`, `spinbutton "Grammatical Range and Accuracy score"`, `slider "IELTS Band Score slider"`, and `spinbutton "IELTS Band Score"`, and `ArrowRight` increments update both slider value and numeric spinbutton synchronously. [Rubric 1280px](audit/evidence/phase3-6/teacher-grade-rubric-1280.png).

## P2 — Moderate

### AUTH-01

**The sign-in method separator text has low contrast** · Login and Registration · S · **Resolved (Phase 2)**

- **Impact and evidence.** At 390px the 14px “or” text used 40% opacity over white, yielding about 2.72:1 contrast. Both forms use the same treatment, making the distinction between sign-in methods harder to read. [Accessibility audit](accessibility-audit.md#contrast-and-motion).
- **Cause and correction.** The separator fades default foreground with `opacity-40`. Use the existing muted foreground (`text-muted-foreground`) on the white surface at readable contrast. [Login](../../src/app/%28auth%29/login/page.tsx#L82), [registration](../../src/app/%28auth%29/register/page.tsx#L88).
- **Dependencies and risk.** Shared foreground roles. Keep the two authentication methods and their hierarchy.
- **Acceptance.** Verified in Phase 2: `"or"` computes `rgb(113, 113, 123)` on `rgb(255, 255, 255)` (`4.83:1` WCAG contrast, >= 4.5:1) on both `/login` and `/register`. [Login 390px](audit/evidence/phase2/login-390.png), [Register 390px](audit/evidence/phase2/register-390.png).

### AUTH-02

**Login tab order separates the credential fields from their submit action** · Login · S · **Resolved (Phase 3)**

- **Impact and evidence.** Tab walked Email, Password, Sign up, Google, then Log in. A keyboard user entering credentials must traverse the earlier alternative actions to reach the form button. [Phase 0 keyboard result](baseline.md#browser-evidence).
- **Cause and correction.** Removed positive `tabIndex={1}` and `tabIndex={2}` from the email and password inputs so focus follows DOM/visual order. [Login fields](../../src/app/%28auth%29/login/page.tsx#L85).
- **Dependencies and risk.** React Hook Form validation focus. Preserve the first-invalid-field focus and field descriptions.
- **Acceptance.** Verified in Phase 3: Tab sequence walks `"Sign up" → "Continue With Google" → "Email address" → "Password" → "Log in"`, and empty Enter submission focuses `"Email address"` (`aria-invalid="true"`).

### AUTH-03

**Callback loading has no visible status and keeps spinning under reduced motion** · Auth callback · S · **Resolved (Phase 3)**

- **Impact and evidence.** A direct callback rendered no visible text. Chrome computed the same loader animation with and without reduced motion. The global live region did not contain a callback message. [Authentication audit](audit/authentication.md).
- **Cause and correction.** Added live status announcement (`"Signing you in…"` with `role="status"` and `aria-live="polite"`), accessible error alert + `/login` recovery link, and higher-specificity `:nth-child(...)` reduced-motion CSS overrides suppressing `spin78236`, `wobble1`, and `wobble2` in `Loader`. [Callback](../../src/app/%28auth%29/callback/page.tsx), [loader](../../src/components/custom-ui/loader.tsx#L120).
- **Dependencies and risk.** Auth layout and the shared loader. Preserve authentication progress and redirect logic.
- **Acceptance.** Verified in Phase 3 under Playwright `prefers-reduced-motion: reduce`: `/callback` renders `role="status"` (`Signing you in…`) and computed `animationName === "none"` across `.three-body` and all three `.three-body__dot::after` rings. [Callback reduced motion](audit/evidence/phase3-6/callback-reduced-motion.png).

### STU-01

**Calendar overrides fail to resolve semantic colors** · Student schedule · S · **Resolved (Populated + Empty QA Fixtures)**

- **Impact and evidence.** At 390px the calendar stylesheet was loaded. Chrome rejected the resolved foreground token wrapped in `hsl()` and computed the header and border from other rules. [Student audit](audit/student.md).
- **Cause and correction.** Replaced `hsl(var(--...))` declarations in `.fc-custom` with `var(--...)` and `color-mix(in oklab, ...)`, added `:focus-visible` focus rings (`var(--ring)`), fixed `.fc-event-main-frame` / `.fc-event-time` clipping, and prefixed event titles with written IELTS skill names (`D-03`). [Calendar overrides](../../src/app/globals.css#L206), [schedule tab](../../src/components/extension/schedule-tab.tsx).
- **Dependencies and risk.** FullCalendar cascade and local scrolling. Preserve event mapping across populated and empty states.
- **Acceptance.** Verified against `student@ivy-mock.test` (populated `2026-11`) and `empty@ivy-mock.test` (0 events) at 390px: semantic `colHeaderBg`, `dayBorder`, `todayBg`, and `todayNumBg` compute cleanly, times display in full (`09:00`), and `scrollWidth === 390`. [Populated 390px](audit/evidence/phase3-6/student-calendar-390.png), [Empty 390px](audit/evidence/phase3-6/student-calendar-empty-390.png).

### TCH-01

**Teacher navigation highlights Dashboard on Grading and mislabels the builder** · Teacher shell, Grading, Builder · M · **Resolved (Phase 3)**

- **Impact and evidence.** At 1440px, Dashboard and Grading both highlighted for `/teacher/grading`. The builder header said Dashboard while the task heading said Assignment Builder. [Teacher audit](audit/teacher.md), [builder at 1024px](screenshots/builder-1024.png).
- **Cause and correction.** Fixed `isLinkActive` in `NavMain` to exact-match role roots and match descendants on segment boundaries with `aria-current="page"`, and added task-route title matching in `MainHeader`. [Active matching](../../src/components/layout/nav-main.tsx), [header title matching](../../src/components/layout/main-header.tsx).
- **Dependencies and risk.** Existing role nav configs and shell consumers. Preserve destinations, exact home match and WIP settings links.
- **Acceptance.** Verified in Phase 3: `/teacher` marks only `Dashboard` active; `/teacher/grading` marks only `Grading` (`aria-current="page"`) with header `"Grading"`; `/teacher/assignments/builder` clears `Dashboard` and shows header `"Assignment Builder"`. [Grading queue 768px](audit/evidence/phase3-6/teacher-grading-queue-768.png).
