# Admin Portal audit

## Design language

**Audited surface.** Admin dashboard shell and Create New Course task. The role layout supplies the shared sidebar/header; management cards launch local dialogs using Radix primitives and existing inputs. Swagger intentionally sits outside the Admin layout, with its own styling and route protection. [Admin layout](../../../src/app/%28admin%29/admin/layout.tsx), [course management](../../../src/components/admin/course-management.tsx), [course dialog](../../../src/components/admin/course-dialog.tsx), [route inventory](../route-inventory.md).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [ADM-01](../findings.md#adm-01) | The named Create New Course dialog exposes the Skill and Level comboboxes with empty names, while nearby text inputs are named. | Connect each visible label to the relevant Select trigger. | Create/Edit Course · High |

Chrome moved focus into the create dialog and keyboard dismissal changed its state to closed. Its post-dismissal settling and focus return need a separate stable check. The 390px sidebar failure is owned by the [shell audit](shared-shell.md). The Admin dashboard and Swagger captures retain the Phase 0 evidence. Teacher creation, course deletion and session mutations require disposable fixtures. [Admin baseline](../baseline.md#browser-evidence).

## Improve first

Address ADM-01 so an administrator using assistive technology can identify both required selections in the course form.
