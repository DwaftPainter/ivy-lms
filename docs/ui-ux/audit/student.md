# Student Portal audit

## Design language

**Audited surface.** Student dashboard, courses, assignment list, extension and lesson detail, with fresh checks for the schedule and one enrolled lesson. The role layout governs navigation and supplies shared primitives. The Scheduler owns its FullCalendar adaptation. Explicit exceptions are the standalone assignment index and the documented Settings WIP route. [Student layout](../../../src/app/%28student%29/layout.tsx), [schedule owner](../../../src/components/extension/schedule-tab.tsx), [Phase 0 inventory](../route-inventory.md).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [STU-02](../findings.md#stu-02) | At 768px, the 240px sidebar and 754px content inset produce a 994px document on the sampled lesson. | Allow the lesson inset and its long content to shrink together. | Enrolled lesson at the sidebar breakpoint · High |
| [STU-01](../findings.md#stu-01) | The loaded calendar styles wrap semantic colors in invalid HSL syntax. Chrome fell back to other styles on calendar header and border roles. | Resolve the original semantic roles directly through the calendar styles. | Student schedule · High |

The calendar grid scrolls locally, with 308px visible out of 840px in the 390px viewport. This two-dimensional region is distinct from the lesson's whole-document overflow. The Schedule, Classes and Assignments tabs switched successfully in Phase 0. The sampled month had no events, so event colors, calendar keyboard navigation and meeting actions still need follow-up. Shared header findings are owned by the [shell audit](shared-shell.md). [Extension](../../../src/app/%28student%29/extension/page.tsx), [calendar rules](../../../src/app/globals.css#L206), [rendered calendar grid](evidence/student-calendar-grid-390.png).

## Improve first

Address STU-02 because it makes the enrolled lesson task extend beyond its viewport exactly where the desktop sidebar appears.
