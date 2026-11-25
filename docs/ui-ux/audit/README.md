# Phase 1 surface audits

Reviewed on `refactor/ui-ux` at `089565ab1bab615d8b6e9669394544ffa2dae640`. Phase 0 prerequisites were satisfied at the same SHA. The [baseline](../baseline.md) supplies the route matrix, clean application validation and 36 captures. Phase 1 reused that evidence and retested uncertain or high-impact states in the production-mode local build with isolated Chrome 158 profiles and authorized Neon dev sessions.

| Audit unit | Fresh browser focus | Report |
| --- | --- | --- |
| Authentication | Login validation and computed colors, registration labels, callback status and reduced motion. | [Authentication](authentication.md) |
| Student Portal | Mobile shell, schedule calendar and enrolled lesson at 768px. | [Student](student.md) |
| Teacher Portal | Mobile shell, grading queue navigation at 1440px and lesson at 390px. | [Teacher](teacher.md) |
| Admin Portal | Mobile shell and blank Add Course dialog accessibility. | [Admin](admin.md) |
| Assignment Builder | Five widths, Preview tab/button comparison and an unsaved section for reachability. | [Assignment Builder](assignment-builder.md) |
| IELTS Examination | Two Writing attempts at 320, 390 and 1440px, including accessibility names and header geometry. | [IELTS Examination](ielts-examination.md) |
| Grading and AI Feedback | Loaded teacher submission at 390, 768, 1024 and 1440px, score control names and action geometry. Checked the reopened Student feedback card against the existing result endpoint. | [Grading and AI Feedback](grading-ai-feedback.md) |
| Shared shell | Three role headers and mobile sidebar opening, Escape and focus return at 390px. | [Shared shell](shared-shell.md) |

The audit uses rendered screenshots, DOM and accessibility trees, computed styles, keyboard and pointer interaction, and the traced source path. Each surface lists up to three supported findings. Shared defects have one owning entry in the [backlog](../findings.md). The audit did not send saves, submissions or other workflow mutations. The builder test kept a single unsaved section in its isolated browser profile. Captures omit learner content and account details.

## Evidence by dimension

| Surface | Hierarchy, spacing and wording | Interaction, states and efficiency |
| --- | --- | --- |
| Auth | Compared logo, heading, OAuth and form order, method separator and responsive split. | Tab order, invalid inputs, first-error focus, direct callback and reduced motion. |
| Student | Traced role header, course and assignment cards, schedule tokens, tabs and enrolled lesson inset. | Tab selection, sidebar dismissal, calendar scroll and empty month. Reuse Phase 0 for course and assignment loaded states. |
| Teacher | Compared role dashboard labels, current queue destination, dense lesson layout and task header. | Navigation and shared feedback, loaded lesson and WIP. Session edits and their success/error transitions require a disposable fixture. |
| Admin | Compared dashboard management cards, search, dialog hierarchy and Course field labels with existing primitives. | Blank modal, initial focus and selector names. Mutation feedback and the final focus state remain open. |
| Builder | Compared task toolbar, library/canvas/inspector proportions, preview copy, responsive states and action reachability. | Blank and unsaved drafts, both Preview actions, and pointer and keyboard affordances for insertion. Persistence awaits approval. |
| Exam | Compared title, action group, Submitted status, response region and footer hierarchy at compact and desktop widths. | Reopened Writing attempts, navigation and accessible names. Scoped evidence excludes timer expiration, media and submission writes. |
| Grading and feedback | Compared queue, submission rails, visible pane/tab labels, score forms and action-bar density. | Loaded submission selection, score names and reachability, and Student feedback availability. Draft save, publishing and regrade results are separate acceptance states. |

## Limits

The browser probes covered existing dev fixtures. They did not establish OAuth success or failure behavior, real hardware/media and upload states, live AI generation, correction and regrade actions, or grade and submission persistence. A reopened Writing attempt showed the AI failure state even though its read endpoint had a stored result. This blocked correction-modal inspection. The calendar month sampled had no rendered events. Speaking, Listening, Reading and multi-question exam operations still need fixtures. The keyboard and AX checks do not replace assistive-technology, touch, zoom or full WCAG testing. [Accessibility audit](../accessibility-audit.md), [responsive audit](../responsive-audit.md).
