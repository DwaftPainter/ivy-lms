# Shared shell audit

## Design language

**Audited surface.** Student, Teacher and Admin role headers and the mobile Sidebar Sheet. The app sidebar and header are shared owners. Each role supplies its own destination config. The mobile Sheet and desktop icon-collapsible sidebar are explicit branches. Exam navigation and Swagger have separate shells. [Header](../../../src/components/layout/main-header.tsx), [app sidebar](../../../src/components/layout/app-sidebar.tsx), [sidebar primitive](../../../src/components/ui/sidebar.tsx), [layout inventory](../route-inventory.md#layouts-and-navigation).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [SHELL-01](../findings.md#shell-01) | Sidebar, notification and messages exposed empty names in each role's 390px header. | Give the actual interactive elements purpose-specific names. | Shared header · High |
| [SHELL-02](../findings.md#shell-02) | The named sidebar dialog moved focus inside. Its close control was hidden and after Escape focus did not return to the opener in each role. | Use the existing Sheet to provide a visible dismissal and restore opener focus. | Mobile role navigation · High |

All three roles use the same header owner and responsive branch. Desktop layout variation is described in the [consistency report](../consistency-report.md). Data-changing notification actions and the messages placeholder were outside the interaction pass.

## Improve first

Address SHELL-02 to restore the point of interaction after mobile navigation closes.
