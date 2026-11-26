# Design decisions

## Established decisions

| Decision | Evidence and scope |
| --- | --- |
| Preserve the IVY IELTS mark and named brand red. | The mark is used in Auth and the shared app sidebar, and primary red drives default actions and shell branding. [Design contract](../../DESIGN.md). |
| Keep Tailwind 4, the local shadcn New York components, Radix and Lucide. | Existing wrappers and role-specific compositions remain the governing owners. The modernization brief establishes this constraint. [Component config](../../components.json), [component inventory](component-inventory.md). |
| Maintain dedicated assessment composition. | Exam navigation and grading/builder workspaces have distinct task responsibilities and explicit layout owners. [Consistency report](consistency-report.md#intentional-specialized-layouts). |
| Use the shipped semantic roles as the foundation. | Colors, the named font families and the base radius trace directly to the stylesheet and root. No new token scale was accepted. [Design system audit](design-system-audit.md). |

## Observations with verified corrections

The [backlog](findings.md) owns the corrections supported by source and runtime, including lost control names and focus, clipping and the invalid calendar token syntax. The [consistency report](consistency-report.md) records other interface differences observed during the audit.

## Approved directions for Phases 3–6

### D-01

**Light and dark support.** Use light mode as the release and verification baseline through Phase 6. Defer dark-mode activation to a separate release decision. Its entry checks include rendered contrast and legibility across Auth, all three role shells, the calendar, overlays, exams and grading. The root currently renders the light palette even when the device prefers dark mode. [Theme evidence](design-system-audit.md#design-evidence).

### D-02

**Body typography.** Retain the rendered system sans stack for body text through Phase 6 and the existing mono role for assessment timers. The audit verified the current Auth presentation. A later Geist pilot can compare hierarchy, density, Vietnamese glyphs and wrapping on Auth and a role page at the five target widths before any body-wide rollout. [Typography evidence](design-system-audit.md#design-evidence).

### D-03

**Skill and status semantics.** Use the neutral `secondary` Badge variant and a written skill name for IELTS skill badges in portal lists and cards. Calendar colors may distinguish events within the calendar. Provide skill names in the event presentation or details and a labeled legend.

Use `outline` for draft, upcoming or waiting states, `secondary` for in-progress and completed states, and `destructive` for urgent issues that require user action. Retain task-specific wording when it conveys a different next step, such as “Submitted” for a student and “Pending review” for a teacher. Check contrast on the actual background and confirm each state remains understandable without color. Adopt the mapping where the relevant phase touches a badge. [Status comparison](consistency-report.md), [Badge variants](../../src/components/ui/badge.tsx).

### D-04

**Narrow assessment composition.**

- **Builder, implemented in Phase 2.** Use the Canvas-first task view switch (`Canvas` | `Library` | `Inspector`) below `xl` (1280px) and the three-column workspace at and above `xl`. Keep the selection, expanded sections and unsaved draft through view changes. [Assignment Builder](../../src/app/teacher/assignments/builder/page.tsx), [Phase 2 plan](../../design-plans/phase-2-foundation-and-builder.md).
- **Grader, approved for Phase 6.** Keep the selected response and rubric as the primary workspace. Below `xl` (1280px), open the submission list from a labeled **Submissions** button in the existing Sheet pattern. Keep the selected student's name and queue position visible in the workspace. Close the Sheet on selection and move focus to the selected submission heading. Dismissal returns focus to the opener. Keep **Previous** and **Next** as a navigation group. Let it wrap independently of the **Save Draft**, **Submit Grade** and conditional **Reset** group in the workspace scroll flow. At and above `xl`, retain the inline rail and desktop layout. The Sheet frees horizontal space while keeping the full queue available. Verify at 320, 390, 768, 1024 and 1440px with multiple submissions and an edited rubric. Check that actions remain reachable, the layout fits and each submission retains its own draft when switching students or resizing. [GRD-01](findings.md#grd-01), [grading audit](audit/grading-ai-feedback.md).

### D-05

**Reduced motion and interaction feedback.** Give waiting and processing states visible text and expose a single meaningful status announcement. Start with the callback and a short message such as “Signing you in…”. Treat its spinner as decorative and show a static indicator when reduced motion is requested. Existing brief Dialog and Sheet transitions can remain in standard mode. Suppress decorative loops and nonessential movement in reduced-motion mode while preserving focus, dismissal and readable status. Verify both motion settings and the existing authentication handoff for `AUTH-03`. [AUTH-03](findings.md#auth-03), [motion evidence](design-system-audit.md#design-evidence).

### D-06

**Header placeholders and task feedback.** Remove the inactive Messages button from the shared header until a usable destination exists. Keep the working Notifications control and its unread state. Use field-level messages for validation and persistent feedback next to the task when an error blocks progress, needs retry or needs a user decision. Present an empty result as an inline state with its next action when one exists. Use a toast for a short confirmation or informational update that requires no follow-up. Announce each outcome once and keep confirmation for consequential actions in the task flow. [Feedback comparison](consistency-report.md), [shared shell](audit/shared-shell.md).

These approvals settle the design direction. Finding selection and implementation scope are recorded in approved plans under `design-plans/`.
