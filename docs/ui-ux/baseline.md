# Phase 0 baseline

## Snapshot

| Item | Observed |
| --- | --- |
| Branch | `refactor/ui-ux` |
| Commit | `089565ab1bab615d8b6e9669394544ffa2dae640` |
| Starting workspace | Tracked application clean. `.agents/` and `skills-lock.json` were already untracked. |
| Runtime | Node 25.2.1, pnpm 12.21.0, installed Next.js 16.2.3, React 19.2.3, shadcn CLI 3.8.4, Chrome 158.0.8127.88. |
| App under test | Local production-mode servers built from a tracked checkout with existing dependencies and generated Prisma Client 7.7.0. Public checks used a server without dev database credentials. Authenticated checks used the authorized Neon dev database and existing accounts. |
| Browser method | Isolated headless Chrome via DevTools Protocol. Widths were CSS pixels at DPR 1 and 900px high unless noted. Inspected rendered DOM, computed styles, navigation, relevant HTTP statuses and selected interactions. |

Source discovery covered the [root README](../../README.md), [CLAUDE.md](../../CLAUDE.md), [docs index](../README.md), [architecture](../architecture.md), [authentication](../authentication.md), [getting started](../getting-started.md), [database and seed](../database.md), [AI grading](../ai-grading.md), [API reference](../api-reference.md), [environment variables](../environment-variables.md), [deployment](../deployment.md) and [contributing](../contributing.md). The [route inventory](route-inventory.md) and [component inventory](component-inventory.md) trace their active implementation.

## Design foundations

| Area | Documented or configured evidence | Observed implementation |
| --- | --- | --- |
| Identity and color | The repository describes an IELTS-focused, role-based LMS. shadcn config selects `new-york`, neutral base, CSS variables and Lucide. | The existing IVY IELTS SVG, deep red `--primary` (`oklch(0.4953 0.1866 27.51)`), red auth gradient and role header convey the active identity. CSS exposes semantic surface, text, status, focus, chart and sidebar roles. |
| Typography | The root loads Geist and Geist Mono and maps their variables into Tailwind font tokens. | The audited public pages computed the system UI sans stack for body text. The body gets font variables and antialiasing, and the base rule applies background/foreground. A product-wide type scale has no explicit contract in the inspected docs. |
| Spacing, radii and elevation | CSS sets `--radius: 0.65rem` with derived radius utilities. Shared primitives define their own sizes and variants. | Cards, controls and panels use a mix of stock utility spacing/shadows and local treatments. Role layouts set gray content surfaces and different top margins. Repeated utilities are implementation evidence. |
| Themes | The stylesheet declares light and `.dark` palettes and a class-based dark variant. | Root has no mounted `ThemeProvider`. Emulated dark preference left `/login` and `/callback` light. Sonner queries `next-themes` with a system fallback. Product intent for dark-mode support needs a decision. |
| Feedback and interaction | Shared primitives provide focus and invalid states, alert variants, dialog composition, skeletons and toast. | Local loaders, WIP presentation, inline form errors and persistent alerts coexist. The callback loader's CSS animation remained active with reduced motion enabled. |
| Responsive layout | The auth aside uses `lg`. Sidebar uses `useIsMobile` and a mobile Sheet. | Login and registration showed the aside at 1024px and 1440px. Admin used the mobile navigation branch at 390px. Feature scroll regions need individual checks. |

The repository has no tracked `DESIGN.md` at this SHA. Duplicate base `@apply` declarations, two values for `--border-gradient-bg-active`, and FullCalendar rules wrapping OKLCH tokens in `hsl(var(...))` are source observations. The latter may drop color declarations after substitution. Verify computed styles on a populated calendar before assigning impact or choosing a correction. [Global CSS](../../src/app/globals.css), [root layout](../../src/app/layout.tsx), [component config](../../components.json), [Auth layout](../../src/app/%28auth%29/layout.tsx), [Sonner](../../src/components/ui/sonner.tsx), [sidebar](../../src/components/ui/sidebar.tsx), [loader](../../src/components/custom-ui/loader.tsx), [IVY IELTS logo](../../public/IVY_IELTS_Logo.svg).

## Browser evidence

| Width | Login | Registration | Admin | Student | Teacher |
| ---: | --- | --- | --- | --- | --- |
| 320 | [Login](screenshots/login-320.png) | [Registration](screenshots/register-320.png) | [Admin](screenshots/admin-shell-320.png) | [Student](screenshots/student-shell-320.png) | [Teacher](screenshots/teacher-shell-320.png) |
| 390 | [Login](screenshots/login-390.png) | [Registration](screenshots/register-390.png) | [Admin](screenshots/admin-shell-390.png) | [Student](screenshots/student-shell-390.png) | [Teacher](screenshots/teacher-shell-390.png) |
| 768 | [Login](screenshots/login-768.png) | [Registration](screenshots/register-768.png) | [Admin](screenshots/admin-shell-768.png) | [Student](screenshots/student-shell-768.png) | [Teacher](screenshots/teacher-shell-768.png) |
| 1024 | [Login](screenshots/login-1024.png) | [Registration](screenshots/register-1024.png) | [Admin](screenshots/admin-shell-1024.png) | [Student](screenshots/student-shell-1024.png) | [Teacher](screenshots/teacher-shell-1024.png) |
| 1440 | [Login](screenshots/login-1440.png) | [Registration](screenshots/register-1440.png) | [Admin](screenshots/admin-shell-1440.png) | [Student](screenshots/student-shell-1440.png) | [Teacher](screenshots/teacher-shell-1440.png) |

- **Public widths.** Login and registration filled the available width at 320, 390 and 768px. Both split evenly with the brand aside at 1024 and 1440px. No page-level horizontal overflow in this matrix. At 320 × 568, registration's logo extended 1px above the viewport and the submit button ended 1px below it. [Short viewport](screenshots/register-320x568.png).
- **Public states.** Empty submission at 390px showed labelled inline errors, set invalid state, and focused the first invalid input on both forms. Login Tab order reached email and password before the earlier Sign up and Google actions. Both email controls rendered with `type="text"` and no autocomplete attribute. Both password controls specified `autocomplete="off"`. [Validation](screenshots/login-validation-390.png), [Login source](../../src/app/%28auth%29/login/page.tsx), [registration source](../../src/app/%28auth%29/register/page.tsx).
- **Public fallback states.** Direct callback at 390px showed a loader as the only visible feedback. The same animation ran with reduced motion enabled. A missing URL showed framework 404. Signed-out `/assignments` showed an Unauthorized alert from a 401. The proxy returned 307 to login for sampled role URLs. Direct Student lesson and exam URLs returned a page document then navigated to login through the client guard. [Callback](screenshots/callback-390.png), [404](screenshots/not-found-390.png), [signed-out assignments](screenshots/assignments-signed-out-390.png).
- **Admin.** Normal local sign-in succeeded. Dashboard and Swagger rendered at all five widths, with no page-level horizontal overflow in the sampled states. The dashboard loaded and teacher, course and notification requests returned 200. Direct Student and Teacher destinations redirected the Admin session back to Admin.  Swagger showed schemas and “No operations defined in spec”. [Swagger at 390px](screenshots/api-doc-390.png).
- **Admin mobile shell at 390px.** Sidebar opened as a named dialog and moved focus inside. Escape dismissed it. Focus did not return to the opener after the closing animation. Header sidebar, alerts and messages buttons had empty text and no explicit accessible name in the inspected DOM and source. The screenshots show the top of the shell and omit account and record lists. [Sidebar trigger](../../src/components/ui/sidebar.tsx#L235), [header](../../src/components/layout/main-header.tsx#L37), [notifications trigger](../../src/components/notifications/notification-bell.tsx#L72).

- **Student.** At all five widths, inspected dashboard, courses, assignment index, extension, settings, one enrolled lesson and two exam fixtures, including an assignment linked to existing AI-graded data. The main Student reads returned 200. Schedule, Classes and Assignments selected successfully at 390px. Settings rendered a WIP state. [Extension at 390px](screenshots/extension-shell-390.png).
- **Teacher.** At all five widths, inspected dashboard, grading queue, an owned lesson and its management view, the blank Reading builder, one assignment grader, and the messages and settings WIP routes. The dashboard, lesson and submission reads returned 200. The builder rendered with “Dashboard” in the shell header, even while its own header indicated the builder task. [Builder at 390px](screenshots/builder-390.png), [builder at 1440px](screenshots/builder-1440.png), [header route matching](../../src/components/layout/main-header.tsx#L22).

The Admin, Student and Teacher dashboard captures are top-of-page clips. This preserves shell evidence without exposing account or learner records. Protected lesson, exam and grading fixture content was inspected in the isolated browser and omitted from the images. No uncaught browser exceptions were observed in the sampled passes.

### Confirmed responsive risks

| Surface and state | Browser observation |
| --- | --- |
| Student exam, two assignments | Document width reached 458px at 320px and 390px for both samples. |
| Student lesson detail | Document width reached 994px at the 768px viewport. |
| Teacher builder, blank Reading | Document width reached 1008px at 768px and 1222px at 1024px. At 320px and 390px the Save button starts at x=470px and the toolbar and inspector visibly clip. Document width still equals the viewport at both sizes. [390px](screenshots/builder-390.png), [768px](screenshots/builder-768.png), [1024px](screenshots/builder-1024.png). |
| Teacher grading queue | Document width reached 785px at 768px. |
| Teacher assignment grader | Document width reached 1008px at 768px and 1062px at 1024px. |

Measurements compare `document.documentElement.scrollWidth` with the emulated viewport. These are fixture-specific results. Phase 1 should trace the overflow owner for each state and test whether controls remain reachable by keyboard, touch and localized scrolling.

## Technical validation

| Check | Outcome |
| --- | --- |
| `pnpm lint --max-warnings 0` in the working tree | Failed on two pre-existing `no-console` errors at lines 46 and 51 of the untracked `.agents/skills/shadcn/scripts/showcase-coverage.mjs`. |
| Same lint command in the tracked checkout | Passed with zero warnings. |
| `pnpm exec tsc --noEmit --incremental false` after Next generated its types | Passed in the tracked checkout. Next also completed its build-time TypeScript check. |
| `pnpm build` and local `pnpm start` | Passed. Build produced 37 static pages during generation and listed the page/API routes. Node emitted a non-blocking `--localstorage-file` warning. |
| Test and CI discovery | No test script, checked-in test suite or GitHub Actions workflow at this SHA. The contributing guide contains test examples. Local `ci/add-checks` contains a proposed lint/type/build workflow at `91b20aa`; it is outside this baseline. |
| shadcn project metadata | Installed `pnpm exec shadcn info` worked. Its `--json` option was unavailable in this version. The component inventory also uses local source and config. |

The build used a temporary source copy and no dependency installation. Development database connections emitted a non-blocking PostgreSQL client SSL-mode advisory. [Package scripts](../../package.json), [ESLint config](../../eslint.config.mjs), [contributing guide](../contributing.md), [deployment guide](../deployment.md).


## Coverage gaps and hypotheses

| State or service | Verified boundary and next evidence |
| --- | --- |
| Auth services | All three supplied development roles eventually signed in. The initial Student and Teacher credential did not match, and the updated credential succeeded. Google OAuth exchange, successful registration and sign-out were outside the browser pass. Use approved dev OAuth and disposable accounts to verify these states. |
| Exam, media and AI | Sampled exam and grading pages loaded from dev fixtures. Microphone, upload, active and expired timers, final submission, correction modal, AI generation and regrade were outside the interaction pass. Validate native permissions and known success/failure states with approved test fixtures. AI docs describe a local Ollama setup. The current helper specifies a hosted Ollama endpoint and a fallback. [AI docs](../ai-grading.md), [AI helper](../../src/lib/ai-grading.ts). |
| Portal and builder mutations | Sidebar, route navigation and Student tabs were exercised. Create/edit/publish, drag/sort, attendance updates, notification read states and draft/grade actions still need resettable fixtures and keyboard/pointer walkthroughs. |
| Unsupported states | Settings for Student/Teacher and Teacher messages render WIP. Progress tab is inactive. Admin Add Student is disabled. The Swagger build shows only schemas. The Swagger scan path appears as `app/api` while checked-in handlers are under `src/app/api`; test that configuration before assigning cause. [WIP owner](../../src/components/custom-ui/work-in-progress.tsx), [Admin user management](../../src/components/admin/user-management.tsx), [Swagger config](../../src/lib/swagger.ts). |
| Theme and calendar | Dark and reduced-motion preferences were probed on public pages. Forced dark contrast, assistive technology, real touch/virtual keyboard, browser zoom and populated calendar token resolution remain open. FullCalendar color substitution and shell layout offsets are hypotheses to isolate. |

To reproduce the baseline, use the recorded SHA and installed dependencies. Generate Prisma Client in an isolated copy if needed, build and start on loopback, and use an isolated Chrome profile. Compare the same role, viewport and fixture type. Use the approved dev environment for sign-in and record visible states before attempting actions. See the [acceptance criteria](acceptance-criteria.md) for the next verification matrix.
