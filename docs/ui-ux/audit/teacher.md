# Teacher Portal audit

## Design language

**Audited surface.** Teacher dashboard, lesson detail, grading-queue entry and task orientation. The Teacher layout consumes the shared shell and Teacher navigation config. The layout gives builder and grading screens a dedicated width treatment. Settings and Messages are documented WIP states. [Teacher layout](../../../src/app/teacher/layout.tsx), [navigation config](../../../src/config/teacher/side-bar-config.ts), [WIP owner](../../../src/components/custom-ui/work-in-progress.tsx).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [TCH-01](../findings.md#tch-01) | The grading queue highlights Dashboard and Grading simultaneously. The builder's shell header says Dashboard while its own heading names the builder task. | Resolve one current destination and the actual task title through the existing shell. | Teacher navigation and task routes · High |

The sampled lesson fit at 390px. The task groups use separate owners for attendance, resources and linked work. No write actions were exercised. The queue's narrow overflow and workspace controls correctly belong to the [grading audit](grading-ai-feedback.md). Header name and focus defects are tracked in the [shell audit](shared-shell.md). [Builder screenshot](../screenshots/builder-1024.png), [NavMain](../../../src/components/layout/nav-main.tsx).

## Improve first

Correct TCH-01 so the current task remains recognizable when moving among dashboard, queue and builder.
