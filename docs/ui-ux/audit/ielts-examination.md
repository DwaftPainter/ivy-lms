# IELTS Examination audit

## Design language

**Audited surface.** Writing attempt navigation and submitted presentation. The dedicated exam layout owns its sticky toolbar and submission confirmation. Response and question components own per-skill presentation, and the shared footer controls question sequence. This route deliberately uses a dedicated shell. [Exam layout](../../../src/app/assignments/%5Bid%5D/layout.tsx), [navigation footer](../../../src/components/assignment/BottomNavigation.tsx), [route inventory](../route-inventory.md).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [EXM-01](../findings.md#exm-01) | Two Writing fixtures expanded the document to 458px at both 320px and 390px. The submitted status and toolbar contributed to the rightward extension. | Fit the title and action groups within the task viewport. | Exam header · High |
| [EXM-02](../findings.md#exm-02) | Back, fullscreen, Help, Previous and Next had empty AX names at narrow widths. At desktop, the visible Help and navigation text returned. | Give these controls names that survive presentation changes. | Exam header and footer · High |

Both sampled Writing layouts fit at 1440px. Previous and Next were disabled in the sampled one-question state, so navigation across several questions remains an acceptance test. Timers, answer restoration, media, assistive technology and actual submission need approved fixtures. [Responsive measurements](../responsive-audit.md).

## Improve first

Address EXM-01 so learners see attempt status and can reach the exam controls on narrow screens.
