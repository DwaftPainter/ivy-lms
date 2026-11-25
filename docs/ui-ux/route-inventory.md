# Route inventory

The App Router defines 20 page routes and 35 API handler files at the [baseline commit](baseline.md#snapshot). Parenthesized folders organize layouts and do not appear in URLs. This inventory describes source ownership. The [baseline](baseline.md#browser-evidence) records where rendering was verified.

## Page routes and ownership

| Surface | URL | Current UI ownership and data dependency |
| --- | --- | --- |
| Authentication | `/` | Root entry. Proxy redirects a signed-out visitor to login and a signed-in role to its portal. |
| Authentication | `/login` | Credentials and Google sign-in. React Hook Form, Zod, auth store, Auth0 and login API. |
| Authentication | `/register` | Student registration and Google sign-in. Same form stack with name fields and registration API. |
| Authentication | `/callback` | Auth0 callback loader and Google session exchange. |
| Student Portal | `/dashboard` | Welcome and upcoming assignments/classes. Auth, assignment, class and enrollment stores. |
| Student Portal | `/courses` | Enrolled course cards. Enrollment store and `CourseCard`. |
| Student Portal | `/extension` | Schedule, Classes and Assignments tabs. Schedule, class, assignment and enrollment stores. FullCalendar is loaded by Schedule. Progress is commented out. |
| Student Portal | `/lessons/[id]` | Session details, resources, meeting and assignment entry. Lesson detail store. |
| Student Portal | `/settings` | Work-in-progress state. |
| Student Portal | `/assignments` | Standalone assignment index, search/filters, summary and entry links. Loads student assignments directly. |
| Teacher Portal | `/teacher` | Overview, upcoming classes, pending grading and feedback. Teacher dashboard API and role-specific widgets. |
| Teacher Portal | `/teacher/lessons/[id]` | Session detail and editing, materials, attendance and linked assignments. Teacher lesson detail store. |
| Teacher Portal | `/teacher/messages` | Work-in-progress state. The current sidebar has no Messages entry. |
| Teacher Portal | `/teacher/settings` | Work-in-progress state. |
| Admin Portal | `/admin` | Overview, user and course management, teacher creation and course session dialogs. Teacher, course and admin session stores. |
| Admin Portal | `/api-doc` | Swagger documentation in the root shell. Admin proxy policy applies. No Admin sidebar or header. |
| Assignment Builder | `/teacher/assignments/builder` | Component library, canvas, inspector and save/preview actions. Uses builder store, dnd-kit, question config and teacher assignment APIs. Query inputs include `skill`, `classSessionId`, `assignmentId` and `returnTo`. |
| IELTS Examination | `/assignments/[id]` | Dedicated exam header, section and question navigation, skill-specific response, timers and submission. Persisted assignment session store. |
| Grading and AI Feedback | `/teacher/grading` | Grading queue, filters and links to grade an assignment. Teacher dashboard API. |
| Grading and AI Feedback | `/teacher/assignments/[id]/grade` | Submission selection, content, rubric, drafts, comments and grade publication. Teacher grading store and submission APIs. |

Student AI feedback sits inside Writing on `/assignments/[id]`. Corrections and regrade requests use the assignment session store and dedicated endpoints. Next.js also renders a framework 404. `/schedule` appears in the proxy matcher and has no page file. The Schedule tab lives in `/extension`. [Page tree](../../src/app), [Student extension](../../src/app/%28student%29/extension/page.tsx), [Writing question](../../src/components/assignment/WritingQuestion.tsx), [proxy](../../src/proxy.ts#L38).

## Layouts and navigation

| Owner | Consumers and variants |
| --- | --- |
| Root layout | All pages. Loads Geist/Geist Mono variables, global CSS, Auth0 provider and Sonner. |
| Auth group | Login, registration and callback. White form surface and red gradient aside at `lg`. Client layout sends a signed-in store session to `/`. |
| Student group | Dashboard, courses, extension, lessons and settings. `AuthGuard`, sidebar provider/inset, `AppSidebar`, `MainHeader` and WIP wrapper. Sidebar links to Dashboard, Courses, Extension and Settings. |
| Teacher layout | Dashboard, lessons, messages, settings, builder and grading. Same shared shell with Teacher navigation. Builder, grading queue and grader follow a full-width layout branch without the ordinary content top margin. Sidebar links to Dashboard, Grading and Settings. |
| Admin layout | `/admin` only. Shared sidebar/header, separate content spacing. The dashboard entry uses `#`. `AdminGuard` currently passes its children through, so the Admin page guard is the proxy. |
| Exam layout | `/assignments/[id]` only. `AuthGuard` and its own header, help/fullscreen actions, submission confirmation and session cleanup. The assignment index sits outside the exam and Student layouts. |

The proxy checks the signed JWT for routes in its matcher. Student and Teacher layout guards also fetch `/api/auth/me`. Student lesson and exam detail paths enter the client guard without a proxy redirect. Individual API handlers own their server-side checks. [Root layout](../../src/app/layout.tsx), [Auth layout](../../src/app/%28auth%29/layout.tsx), [Student layout](../../src/app/%28student%29/layout.tsx), [Teacher layout](../../src/app/teacher/layout.tsx), [Admin layout](../../src/app/%28admin%29/admin/layout.tsx), [Admin guard](../../src/components/admin/admin-guard.tsx), [exam layout](../../src/app/assignments/%5Bid%5D/layout.tsx), [role configs](../../src/config), [proxy](../../src/proxy.ts).

## API dependencies by surface

Paths are relative to the prefix in each row. Counts are route files. Several files expose more than one HTTP method.

| Prefix | Files | Routes and consumers |
| --- | ---: | --- |
| `/api/auth` | 5 | `/login`, `/register`, `/google`, `/me`, `/logout`. Auth pages and role shells. |
| `/api/student` | 8 | `/classes`, `/enrollments`, `/lessons/[id]`, `/schedule`, `/assignments`, `/assignments/[id]`, `/assignments/[id]/ai-grade`, `/assignments/[id]/request-regrade`. Student portal, exam and feedback. |
| `/api/teacher` | 12 | `/dashboard`, `/assignments`, `/assignments/[id]`, `/assignments/[id]/submissions`, `/class-sessions`, `/class-sessions/[id]`, its `/assignments`, `/attendance`, `/materials/[materialId]`, and `/submissions/[id]` with `/comments` and `/draft`. Teacher portal, builder and grading. |
| `/api/admin` | 3 | `/courses/[id]/sessions`, `/sessions`, `/sessions/[id]`. Admin course and session dialogs. |
| `/api` | 7 | `/courses`, `/courses/[id]`, `/teachers`, `/notifications`, `/notifications/[id]/read`, `/notifications/read-all`, `/upload`. Shared catalog, admin, shell notifications and media. |

See the [handler tree](../../src/app/api) for implementation and the existing [API reference](../api-reference.md) for project documentation.
