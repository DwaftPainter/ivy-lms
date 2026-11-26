# Accessibility audit

Manual keyboard and pointer checks, Chrome accessibility-tree inspection and computed colors support the findings below. Coverage is scoped to sampled dev states. Screen reader, device and end-to-end conformance checks remain future verification. [Audit setup](audit/README.md), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Control names

| Checked surface | Rendered evidence | Finding |
| --- | --- | --- |
| Student, Teacher, Admin header | Three focusable buttons with empty names in each 390px header. The sidebar trigger, alerts and messages use icon markup. | [SHELL-01](findings.md#shell-01) |
| Admin Create New Course | Dialog has a name. Skill and Level comboboxes have empty names; adjacent title, description and number fields are named. | [ADM-01](findings.md#adm-01) |
| Exam at 320 and 390px | Back, fullscreen and Help have empty names. Disabled Previous and Next also lack names. Visible Help and navigation text names reappear at 1440px. | [EXM-02](findings.md#exm-02) |
| Teacher submission grader | Two sliders and two spinbuttons have empty names at all three measured widths. Feedback and both view tabs expose names. | [GRD-02](findings.md#grd-02) |
| Login and registration | Both forms expose the expected text fields and submit controls with names. Empty login gives both fields an invalid state and associated error text. | Preserve this behavior. |

These issues relate to purpose and name/role/value on real focus targets. Keep visible icon positions and use the owning primitive's semantic mechanisms. [WCAG name, role, value](https://www.w3.org/TR/WCAG22/#name-role-value).

## Focus and dialogs

- On all three role shells at 390px the Sidebar opened as a named dialog and focus moved inside. Its close control had no visible box. After Escape and a settling delay focus was outside the opener. [SHELL-02](findings.md#shell-02).
- Login's positive tab indexes move focus to Email and Password ahead of the sign-up and identity-provider actions. Empty submission still focuses Email and exposes inline errors. [AUTH-02](findings.md#auth-02).
- Admin Create New Course moved focus into the dialog and Escape set its state to closed. A persistent closed DOM node made reliable post-dismissal focus testing inconclusive. Future checks should distinguish closed state, AX removal, animation settling and focus. [Admin audit](audit/admin.md).

## Keyboard and dragging

The new builder's Add Section button could create a section. In that state, the native library items still exposed neither a keyboard control nor a click/tap insertion action. The canvas displays a drop target, and the sortable sensor in the DnD provider belongs to a different interaction path. Verify authoring with keyboard and a single pointer independently. [BLD-03](findings.md#bld-03), [WCAG keyboard](https://www.w3.org/TR/WCAG22/#keyboard), [WCAG dragging movements](https://www.w3.org/TR/WCAG22/#dragging-movements).

## Contrast and motion

- Login “or” reads as 14px text at 40% opacity. Browser sRGB foreground is `#09090b` over white, which composites near `#9d9d9d` and yields roughly **2.72:1**. Registration shares the same treatment. Login's white primary action text remains a separate pair. [AUTH-01](findings.md#auth-01), [WCAG contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum).
- Loaded callback remained textless and `spin78236` stayed active with reduced motion enabled. The root live region offers no callback message. [AUTH-03](findings.md#auth-03).
- The design validator's 4.39:1 advisory refers to the declared TabsList pair. Computed inactive Student and grading triggers used foreground at 60% opacity on the muted list, about 5.14:1 after sRGB compositing. Other tab states, widths and themes remain unverified. [Design validation](design-system-audit.md#basis-and-validation).

Remaining coverage includes screen reader names and announcements, results across modalities, touch and target sizing, zoom/text spacing, keyboard obscuration by sticky elements, permission failures, the full set of media states, and approved dark palette conditions.
