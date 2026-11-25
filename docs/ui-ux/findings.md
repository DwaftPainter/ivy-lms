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

**Student lesson widens the page at the sidebar breakpoint** · Student lesson detail · M

- **Impact and evidence.** The sampled enrolled lesson reached 994px document width in a 768px viewport. The sidebar was 240px and the inset was 754px, beyond the available 528px. Desktop and narrower mobile samples fit in Phase 0. [Responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** The sidebar flex inset retains the lesson content's intrinsic minimum. Let the inset and the overflowing lesson content shrink within the sidebar allocation. [Sidebar inset](../../src/components/ui/sidebar.tsx#L281), [Student layout](../../src/app/%28student%29/layout.tsx), [lesson view](../../src/app/%28student%29/lessons/%5Bid%5D/page.tsx).
- **Dependencies and risk.** Shared inset, lesson content, resource rows and CTA. Check other role shells and long content before changing shell defaults.
- **Acceptance.** With the sidebar expanded at 768px, the title, lesson controls and resource actions remain reachable with no document-level horizontal scroll. Verify long text and populated and empty lesson sections.

### ADM-01

**Course Skill and Level selectors have empty accessible names** · Admin course dialog · S

- **Impact and evidence.** Chrome exposed a named Create New Course dialog. Title, Description, Target Band and other input names appeared, while the Skill and Level comboboxes had empty names. [Admin audit](audit/admin.md).
- **Cause and correction.** The Select labels and button-like triggers are separate and lack an explicit association. Associate each visible label with its actual Select trigger. [Course dialog](../../src/components/admin/course-dialog.tsx#L133).
- **Dependencies and risk.** Radix Select and create/edit mode. Preserve enum values, validation and visible field labels.
- **Acceptance.** The AX tree and one screen reader announce Skill and Level on their own controls, including current option and navigation, in create and edit dialogs.

### BLD-02

**Preview tab and displayed mode disagree** · Assignment Builder · S

- **Impact and evidence.** At 1440px Preview became the selected tab, while the editing panels stayed visible. The separate Preview button hid the panels and changed its label to Edit. [Builder audit](audit/assignment-builder.md).
- **Cause and correction.** Tabs update store `viewMode`, while rendered panels use page-local `isPreview`. Make the mode selector and displayed view read the same edit/preview state. [Mode owner and tab](../../src/app/teacher/assignments/builder/page.tsx#L159), [render branch](../../src/app/teacher/assignments/builder/page.tsx#L247).
- **Dependencies and risk.** Existing builder state and inspector behavior. Preserve draft contents and selection when switching modes.
- **Acceptance.** Selecting Preview via keyboard or pointer shows the existing preview presentation. Selecting Builder restores editing panels and state. Any retained duplicate control reflects the same state.

### EXM-01

**Exam header exceeds narrow viewport** · IELTS Examination · M

- **Impact and evidence.** Both sampled Writing exams reached 458px document width at 320px and 390px. The right-hand controls and Submitted badge reached x=458. Users opening an attempt can miss its submission state or header controls. [Responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** The title group and action group share a single row with intrinsic widths that exceed the available space. Constrain title and action layout within the dedicated exam header. [Exam layout](../../src/app/assignments/%5Bid%5D/layout.tsx#L73).
- **Dependencies and risk.** Exam-specific shell. Preserve timer, submitted state and confirmation, including long titles and sticky header behavior.
- **Acceptance.** Both Submitted and active Submit presentations fit at 320px and 390px with long titles. Confirm title remains available to assistive technology and header controls are reachable.

### EXM-02

**Exam icon buttons lack names, including labels hidden on mobile** · IELTS Examination · S

- **Impact and evidence.** At 320px and 390px, exam Back, fullscreen and Help had empty names. Previous and Next were also unnamed in the sampled single-question footer. Help, Previous and Next had text names at 1440px. [Exam audit](audit/ielts-examination.md).
- **Cause and correction.** Icon-only buttons have no accessible labels, and the narrow layout removes text spans from the AX tree. Give these controls persistent accessible names independent of the visible label breakpoint. [Header buttons](../../src/app/assignments/%5Bid%5D/layout.tsx#L74), [question navigation](../../src/components/assignment/BottomNavigation.tsx#L36).
- **Dependencies and risk.** Current fullscreen state and directional controls. Preserve disabled boundaries and button behavior.
- **Acceptance.** Names persist across widths, including when visible labels are hidden. Fullscreen announces enter or exit as appropriate. A multi-question test verifies usable previous/next controls as well as disabled edges.

### GRD-01

**Submission workspace clips grading controls on narrow screens** · Grading and AI Feedback · M

- **Impact and evidence.** In the loaded submission state at 390px, Save Draft occupied x=544–661 and the document reported only 390px of width. At 768px and 1024px the document reached 1008px and 1062px. Grade actions can fall outside the reachable content area. [Grading audit](audit/grading-ai-feedback.md), [responsive audit](responsive-audit.md#measured-failures).
- **Cause and correction.** A fixed submission rail and nonwrapping action bar compete inside the clipped workspace. Give the selected submission and its actions a usable narrow presentation while preserving a clear selection context. [Workspace](../../src/app/teacher/assignments/%5Bid%5D/grade/page.tsx#L108), [action bar](../../src/components/grading/grading-action-bar.tsx).
- **Dependencies and risk.** Teacher inset width, selection and draft state, Save Draft and final grading actions. Preserve desktop task density and keep destructive confirmation in scope.
- **Acceptance.** At every target width with a selected submission, the teacher can view content, reach Save Draft and the final grade action, and identify the current student. Verify focus order and retained scores when changing presentation.

### GRD-02

**Rubric score widgets have empty accessible names** · Grading and AI Feedback · S

- **Impact and evidence.** At 390px, 768px and 1440px, two rendered sliders and their two numeric inputs had empty names. The adjacent Feedback field was named. [Grading audit](audit/grading-ai-feedback.md).
- **Cause and correction.** Visible score labels sit apart from the Slider thumb and number input without accessible associations. Name both controls from their score or criterion label. [Rubric score](../../src/components/grading/rubric-scoring.tsx#L150), [IELTS band score](../../src/components/grading/rubric-scoring.tsx#L183).
- **Dependencies and risk.** Existing Slider, input and grade store. Preserve limits and synchronization between slider and numeric input.
- **Acceptance.** A screen reader and AX inspection can identify each control's score category and value. Keyboard changes keep the paired score in sync across generic, criterion and band-score variants.

## P2 — Moderate

### AUTH-01

**The sign-in method separator text has low contrast** · Login and Registration · S · **Resolved (Phase 2)**

- **Impact and evidence.** At 390px the 14px “or” text used 40% opacity over white, yielding about 2.72:1 contrast. Both forms use the same treatment, making the distinction between sign-in methods harder to read. [Accessibility audit](accessibility-audit.md#contrast-and-motion).
- **Cause and correction.** The separator fades default foreground with `opacity-40`. Use the existing muted foreground (`text-muted-foreground`) on the white surface at readable contrast. [Login](../../src/app/%28auth%29/login/page.tsx#L82), [registration](../../src/app/%28auth%29/register/page.tsx#L88).
- **Dependencies and risk.** Shared foreground roles. Keep the two authentication methods and their hierarchy.
- **Acceptance.** Verified in Phase 2: `"or"` computes `rgb(113, 113, 123)` on `rgb(255, 255, 255)` (`4.83:1` WCAG contrast, >= 4.5:1) on both `/login` and `/register`. [Login 390px](audit/evidence/phase2/login-390.png), [Register 390px](audit/evidence/phase2/register-390.png).

### AUTH-02

**Login tab order separates the credential fields from their submit action** · Login · S

- **Impact and evidence.** Tab walked Email, Password, Sign up, Google, then Log in. A keyboard user entering credentials must traverse the earlier alternative actions to reach the form button. [Phase 0 keyboard result](baseline.md#browser-evidence).
- **Cause and correction.** Login pins the fields to positive tab indexes. Follow the rendered order so either sign-in path can be completed predictably. [Login fields](../../src/app/%28auth%29/login/page.tsx#L85).
- **Dependencies and risk.** React Hook Form validation focus. Preserve the first-invalid-field focus and field descriptions.
- **Acceptance.** With ordinary Tab navigation, order matches the displayed links, fields and buttons. After an empty submission, the first invalid field still receives focus and its message is available.

### AUTH-03

**Callback loading has no visible status and keeps spinning under reduced motion** · Auth callback · S

- **Impact and evidence.** A direct callback rendered no visible text. Chrome computed the same loader animation with and without reduced motion. The global live region did not contain a callback message. [Authentication audit](audit/authentication.md).
- **Cause and correction.** Callback renders only a decorative loader. Provide one meaningful callback status presentation with static feedback when reduced motion is requested. [Callback](../../src/app/%28auth%29/callback/page.tsx), [loader](../../src/components/custom-ui/loader.tsx).
- **Dependencies and risk.** Auth layout and the shared loader. Preserve authentication progress and redirect logic. A provider failure screen needs separate evidence.
- **Acceptance.** The callback exposes readable status without relying on animation, and assistive technology can identify the progress message. Reduced motion suppresses the decorative loop. A permitted successful OAuth handoff still works.

### STU-01

**Calendar overrides fail to resolve semantic colors** · Student schedule · S · **Deferred (Fixture gap in Phase 2)**

- **Impact and evidence.** At 390px the calendar stylesheet was loaded. Chrome rejected the resolved foreground token wrapped in `hsl()` and computed the header and border from other rules. [Student audit](audit/student.md).
- **Cause and correction.** The FullCalendar layer wraps complete OKLCH-derived semantic colors in HSL syntax. Consume the existing semantic roles as valid CSS colors in the calendar overrides. [Calendar overrides](../../src/app/globals.css#L206).
- **Dependencies and risk.** FullCalendar cascade and local scrolling. Preserve event mapping and inspect a calendar with events before declaring theme coverage.
- **Phase 2 fixture gap.** Verified in Phase 2 against the dev DB and `/extension?tab=schedule`: all 3 published `ClassSession` records are dated `2026-04-22` to `2026-04-24`, while `ScheduleTab` mounts on the current month (`2026-11`) with `headerToolbar={false}` and no month navigation controls. Only empty-month rendering (`0` events) is currently reachable, so `STU-01` was left untouched per Phase 2 scope until a populated + empty schedule fixture is available.
- **Acceptance.** The intended color role resolves for headers, cell borders, today and focus states. Confirm populated and empty layouts and any supported theme.

### TCH-01

**Teacher navigation highlights Dashboard on Grading and mislabels the builder** · Teacher shell, Grading, Builder · M

- **Impact and evidence.** At 1440px, Dashboard and Grading both highlighted for `/teacher/grading`. The builder header said Dashboard while the task heading said Assignment Builder. [Teacher audit](audit/teacher.md), [builder at 1024px](screenshots/builder-1024.png).
- **Cause and correction.** Dashboard's base path matches descendants in `NavMain` and the header falls back to its first prefix match. Resolve one current navigation destination and an accurate task title for each supported route. [Active matching](../../src/components/layout/nav-main.tsx#L18), [header title matching](../../src/components/layout/main-header.tsx#L22).
- **Dependencies and risk.** Existing role nav configs and shell consumers. Preserve destinations, exact home match and WIP settings links.
- **Acceptance.** On the grading queue, only Grading is current and announced as such. Builder and detail routes expose their task identity without making Dashboard current. Role roots continue to identify Dashboard.
