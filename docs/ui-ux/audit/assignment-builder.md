# Assignment Builder audit

## Design language

**Audited surface.** New Reading assignment authoring and preview. The page owns a task toolbar and library, canvas and inspector layout within the Teacher shell. Components reuse the established controls and the existing builder store. The expanded authoring layout is a documented Teacher shell exception. [Builder](../../../src/app/teacher/assignments/builder/page.tsx), [layout exception](../../../src/app/teacher/layout.tsx#L15), [component owners](../component-inventory.md).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [BLD-01](../findings.md#bld-01) | Enabled Save spans x=470–544 at 390px after adding an unsaved section. Document width remains 390px and the right side is clipped. | Keep all task actions reachable in the builder's available inline size. | Toolbar and panel sizing · High |
| [BLD-03](../findings.md#bld-03) | After creating a section, library items have tabIndex -1 and the question zone accepts only drag/drop. The canvas's passed add-question callback has no exposed action. | Expose a reachable add-question action connected to the existing insertion model. | Question insertion · High |
| [BLD-02](../findings.md#bld-02) | Preview tab is selected without changing visible panels. The other Preview control actually hides the panels. | Use one edit/preview state for both selection and presentation. | Builder toolbar and displayed mode · High |

At 1440px the editing task fits and the separate Preview button shows preview. At narrow widths the crop shows the lost control area. The audit kept the new section in the isolated browser and did not save it. Edit/link modes and actual submission persistence remain acceptance checks. [Unsaved case](evidence/builder-dirty-save-390.png), [desktop case](../screenshots/builder-1440.png).

## Improve first

Address BLD-01. It hides the primary action even when a draft has become eligible to save.
