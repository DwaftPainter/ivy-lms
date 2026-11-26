# Component inventory

The baseline has 58 files under `src/components/ui` and 52 feature/shared component modules. Counts include barrel files. Ownership below comes from page and layout imports, component composition and data calls. The [route inventory](route-inventory.md) maps these owners to URLs.

## Shared foundations and shell

| Owner | Implemented variants and responsibilities | Known consumers or boundaries |
| --- | --- | --- |
| [Theme and tokens](../../src/app/globals.css) | Tailwind v4 semantic color roles, base/derived radii, light and `.dark` variables, IVY border-state utilities and FullCalendar overrides. | Root imports CSS. The [baseline](baseline.md#design-foundations) records how browser theme and typography resolve. |
| [Button](../../src/components/ui/button.tsx) and [Badge](../../src/components/ui/badge.tsx) | CVA variants. Button supports default, destructive, outline, secondary, ghost and link, four text sizes and four icon sizes. Slot supports `asChild`. Badge has pill shape and semantic variants. | Auth, portals, builder, exam and grading. Some badges supply skill/status colors locally. |
| [Form](../../src/components/ui/form.tsx) and controls | React Hook Form context, label/control/message IDs and invalid state. `Field` is another local composition module. Input, textarea, select, checkbox, switch, radio and slider have component-level focus/invalid states. | Auth uses `Form` with Zod. Admin, builder, exam and grading also compose controls directly. |
| [Card](../../src/components/ui/card.tsx), Alert, Empty, Skeleton and Sonner | Card header/title/description/action/content/footer, Alert default/destructive, reusable Empty, Skeleton/Spinner states and toast adapter. | Portals and assessment use cards, alerts and loading placeholders. Local loader and WIP surfaces coexist with these options. |
| [Sidebar](../../src/components/ui/sidebar.tsx) and shell components | Sidebar provider, controlled/uncontrolled desktop state, mobile Sheet, rail, icon collapse and keyboard shortcut. `AppSidebar` composes `TeamSwitcher`, `NavMain` and `NavUser`. `MainHeader` owns title/trigger and `NotificationBell`. | Student, Teacher and Admin shells supply their own nav configs. Header and sidebar active matching have separate implementations. |
| Overlay and navigation primitives | Dialog, alert dialog, sheet, dropdown menu, popover, tooltip, tabs, accordion, collapsible and scroll area wrap behavior in existing primitives. | Auth and shell, course/session dialogs, exam confirmation and teacher tools. Dialog/focus coverage belongs in Phase 1. |
| [Guards](../../src/components/layout/auth-guard.tsx), [Loader](../../src/components/custom-ui/loader.tsx) and [WIP](../../src/components/custom-ui/work-in-progress.tsx) | AuthGuard manages the session-check placeholder and redirect. AdminGuard passes through. Custom styled-components loader and WIP wrapper own separate animation and placeholder states. | Role layouts, callback, Student extension/courses and settings/messages. |

The component config records `new-york`, neutral base, CSS variables, TypeScript, RSC and Lucide. Local source mostly imports `radix-ui`. `combobox` imports Base UI, `drawer` wraps Vaul, and the specialist components wrap their respective libraries. Audio and image upload sit in the UI folder and call the application upload API. Treat these as integration components when planning changes to generic primitives. [Component config](../../components.json), [UI modules](../../src/components/ui), [utility composition](../../src/lib/utils.ts), [upload helper](../../src/lib/upload.ts).

## Feature owners

| Surface | Components and local variants | State and dependencies |
| --- | --- | --- |
| Authentication | Route-local login and registration forms with shared Auth layout and form primitives. Callback uses `Loader`. | Auth0 provider, auth store, RHF, Zod, email/password and Google routes. |
| Student Portal | `dashboard/upcoming-assignments`, `dashboard/upcoming-classes`, `course/course-card`, `extension/schedule-tab`, `classes-tab` and `assignments-tab`. Lesson detail and assignment list compose cards, controls and states in their route files. | Assignment, enrollment, class, lesson-detail and schedule stores. FullCalendar/date-fns for schedule. Shared notifications in the shell. |
| Teacher Portal | `dashboard/teacher-upcoming-classes`, `pending-grading` and `feedback-tasks`. Teacher lesson route owns materials, attendance, session editing and builder entry. | Teacher class, teacher lesson-detail, grading and feedback stores. Teacher dashboard and class session endpoints. |
| Admin Portal | `system-stats`, `user-management`, `create-teacher-dialog`, `course-management`, `course-dialog` and `class-sessions-dialog`. Course dialog supports create/edit. Session dialog contains management states. `ReactSwagger` is page-local. | Teacher, course and admin session stores. Swagger UI has its own presentation layer. |
| Assignment Builder | `component-library`, `builder-canvas`, `inspector-panel` and `dnd-context`. Library category/skill, canvas section/question selection and inspector type-specific settings are feature concerns. | Builder store, question config, generated IELTS enums, dnd-kit pointer/keyboard sensors and upload helpers. Retest library-to-canvas drag separately from in-canvas sorting. |
| IELTS Examination | `SectionContent`, `QuestionSidebar`, `BottomNavigation`, `ListeningQuestion`, `ReadingQuestion`, `WritingQuestion`, `SpeakingQuestion`, `Timer` and `WritingTimer`. Layout owns submit confirmation, help and fullscreen. | Assignment session store persists answers and position. Native audio, MediaRecorder, upload service and timed/writing response states. |
| Grading and AI Feedback | `grading-header`, `grading-action-bar`, `assignment-content-viewer`, `student-submission-list`, `submission-viewer`, `rubric-scoring` and student `AICorrectionsModal`. Queue filters live in the route. | Teacher grading store owns selected submission, drafts, rubric scores and comments. Writing consumes AI score/feedback and regrade state. |

Sources for feature ownership include the [feature directories](../../src/components), [state stores](../../src/store), [builder configuration](../../src/lib/assignment-builder/question-config.ts) and [application route files](../../src/app).

## Inventory without a traced page import

A static import walk from pages and layouts found these modules without a connected path. This is an inventory signal. Confirm dynamic or other consumers before treating any module as removable.

- Feature modules: `assignment-builder/question-renderers`, `assignment/WritingAnalyticsChart`, `assignment/index`, `customs/button-icon`, `extension/progress-tab`, `grading/index` and `layout/nav-project`.
- UI modules: `aspect-ratio`, `breadcrumb`, `button-group`, `calendar`, `carousel`, `chart`, `combobox`, `command`, `context-menu`, `direction`, `drawer`, `field`, `hover-card`, `input-group`, `input-otp`, `item`, `kbd`, `menubar`, `native-select`, `navigation-menu`, `pagination`, `progress`, `resizable`, `spinner`, `table`, `toggle` and `toggle-group`.

The remaining UI modules have a traced import path: `accordion`, `alert-dialog`, `alert`, `audio-upload`, `avatar`, `badge`, `button`, `card`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `empty`, `form`, `image-upload`, `input`, `label`, `popover`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `tabs`, `textarea` and `tooltip`. An import path can still include a conditional or currently unused export.
