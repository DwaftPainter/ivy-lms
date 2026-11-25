# Design decisions

## Established decisions

| Decision | Evidence and scope |
| --- | --- |
| Preserve the IVY IELTS mark and named brand red. | The mark is used in Auth and the shared app sidebar, and primary red drives default actions and shell branding. [Design contract](../../DESIGN.md). |
| Keep Tailwind 4, the local shadcn New York components, Radix and Lucide. | Existing wrappers and role-specific compositions remain the governing owners. The modernization brief establishes this constraint. [Component config](../../components.json), [component inventory](component-inventory.md). |
| Maintain dedicated assessment composition. | Exam navigation and grading/builder workspaces have distinct task responsibilities and explicit layout owners. [Consistency report](consistency-report.md#intentional-specialized-layouts). |
| Use the shipped semantic roles as the foundation. | Colors, the named font families and the base radius trace directly to the stylesheet and root. No new token scale was accepted. [Design system audit](design-system-audit.md). |

## Observations with verified corrections

The [backlog](findings.md) owns the corrections supported by source and runtime, including lost control names and focus, clipping and the invalid calendar token syntax. Interface differences without a binding contract remain evidence in the [consistency report](consistency-report.md). The decisions below cover changes to shared presentation that require product approval.

## Pending approval

### D-01

**Light and dark support.** Keep the currently delivered light experience as the Phase 2 reference. Decide whether to activate dark mode through system preference, a user setting, or a later release. CSS already defines a dormant dark palette. Activate it only with tested roles, controls, calendar content and grade/exam states. [Theme evidence](design-system-audit.md#design-evidence).

### D-02

**Body typography.** Approve either the currently rendered system stack or a scoped pilot of configured Geist before applying a body-wide change. Use Auth and a role page to compare hierarchy, density, Vietnamese glyphs and wrapping at the five widths. Keep the existing mono timer role. [Typography evidence](design-system-audit.md#design-evidence).

### D-03

**Skill and status semantics.** Define whether a given IELTS skill should have one cross-surface color and which task statuses may share an existing Badge variant. Current assignment and schedule colors differ, and their meaning depends on the task. Confirm the labels, existing roles and contrast before promoting any mapping. [Status comparison](consistency-report.md).

### D-04

**Narrow assessment composition.**
- **Builder (Approved in Phase 2):** Canvas-first task view switch (`Canvas` | `Library` | `Inspector`) below `xl` (`1280px`), preserving the 3-column desktop workspace at `>= xl` (`1440px`), `selectedId`, `expandedSections`, and unsaved draft state. Implemented in [Assignment Builder](../../src/app/teacher/assignments/builder/page.tsx) and recorded in [Phase 2 plan](../../design-plans/phase-2-foundation-and-builder.md).
- **Grader submission rail (Pending approval):** Approve how the grader's submission rail behaves when narrow (`GRD-01`). Candidate directions include stacking, an on-demand panel or a task view switch, depending on the workflow. Review real grading fixtures before choosing.

### D-05

**Reduced motion and interaction feedback.** Approve a shared policy for showing status when decorative motion is suppressed, and which existing transitions can remain. Keep established Dialog and Sheet owners. Start with the callback's evidenced issue and test reduced-motion alongside normal operation before generalizing. [AUTH-03](findings.md#auth-03), [motion evidence](design-system-audit.md#design-evidence).

### D-06

**Tasks, placeholders and feedback.** Approve which header placeholders should remain visible and how persistent errors, empty states and toasts should be used across portals. The shared messages icon and WIP route boundaries need a product decision. Favor evidence from a real task before setting a rule about state copy or component reuse. [Feedback comparison](consistency-report.md), [shared shell](audit/shared-shell.md).

These proposals are pending. Once the user selects findings and relevant decisions, their approved implementation plans belong in `design-plans/`.
