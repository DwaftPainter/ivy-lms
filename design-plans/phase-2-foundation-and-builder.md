# Phase 2 Implementation Plan — Design Foundation and Critical Usability Fixes

**Branch:** `refactor/ui-ux`  
**Base SHA:** `089565ab1bab615d8b6e9669394544ffa2dae640`  
**Approved Scope:** `BLD-01`, `BLD-03` (with `D-04` narrow-panel approval), `SHELL-01`, `SHELL-02`, `AUTH-01`, and `STU-01` (conditional on populated + empty dev schedule fixture availability).

## 1. Assignment Builder (`BLD-01`, `BLD-03`, `D-04`)

### Approved `D-04` Narrow-Panel Layout (< `xl` / 1280px)
- **Desktop (`>= xl` / 1440px):** Preserve the existing 3-column workspace (`w-80` Component Library | `flex-1` Builder Canvas | `w-80` Inspector).
- **Narrow (`< xl`, covering 320, 390, 768, and 1024px):**
  - Keep **Canvas** visible by default (`Canvas` | `Library` | `Inspector` task view switch bar directly under the builder header when in Edit mode).
  - Render only the active narrow panel (`w-full flex-1 min-w-0`), removing horizontal competition between fixed `w-80` sidebars and the canvas.
  - Preserve `selectedId`, `expandedSections`, `isDirty`, and unsaved draft state across panel switches and viewport resizes (same Zustand store, responsive CSS/state visibility without re-initializing).
  - Ensure `InspectorPanel` empty/fallback states use `w-full h-full` inside its container rather than a second hardcoded `w-80`.

### Toolbar Reachability (`BLD-01`)
- Refactor the builder `<header>` in `src/app/teacher/assignments/builder/page.tsx` so it wraps cleanly (`flex-wrap`, `min-w-0` on title group, `h-auto min-h-14 py-2`) instead of overflowing or clipping inside `overflow-hidden` at 320, 390, 768, and 1024px.
- Keep `Save`, `Update`, and `Save & Link` primary actions, `Preview`/`Edit`, `Builder`/`Preview` tabs, `Back`, and `Linked to Session` badge reachable by pointer and keyboard inside the viewport at all five widths, with `document.documentElement.scrollWidth <= window.innerWidth`.
- Replace `h-screen` with `h-full min-h-0` (or `h-[calc(100dvh-3rem)]`) inside the Teacher shell so the builder header + main content fit cleanly beneath the 48px (`h-12`) `MainHeader` without vertical clipping.
- Add accessible `aria-label="Back"` (or `"Go back"`) on the icon-only back button in the builder header as part of making builder controls reachable.

### Keyboard & Click/Tap Question Insertion (`BLD-03`)
- **Component Library (`src/components/assignment-builder/component-library.tsx`):**
  - Upgrade library items from plain `<div draggable>` elements into accessible interactive controls that preserve native HTML5 drag-and-drop (`draggable`, `onDragStart`) **and** support keyboard activation (`Enter` / `Space` / button click/tap).
  - Provide an explicit target-section selector (or insert into the currently selected/expanded section, defaulting cleanly to the active/first section when available) and explain clearly when no section exists yet (for question types and passage/audio) so invalid target states are never silent.
  - Clicking/activating `Section` calls `addSection()` and switches/scrolls/focuses meaningfully; activating `Reading Passage` adds a passage to the target section; activating a Question Type calls `addQuestion(targetSectionId, questionType)` and produces the exact same store state as dragging and dropping onto that section.
- **Builder Canvas (`src/components/assignment-builder/builder-canvas.tsx`):**
  - Replace the drag-only `"Drop question type here"` zone inside each expanded `SectionCard` with an interactive insertion area that keeps drag-and-drop (`onDragOver`/`onDrop`) AND provides an inline click/tap & keyboard `"Add Question"` control (`Select` or `Popover`/menu of `questionTypeConfig` items) wired to `_onAddQuestion(type)`.
  - Also make the `"Click to add passage"` dashed box a semantic `<button>` (not a `div` with `onClick`) and give section/question icon-only buttons meaningful accessible names.
  - After inserting a question (via Library click/keyboard, Canvas inline click/keyboard, or drag-and-drop), select the new question (`selectedId`) and move focus meaningfully to the newly added question card (or announce/highlight it) while preserving question numbering, section expansion, and dirty state.

## 2. Shared Shell Accessibility (`SHELL-01`, `SHELL-02`)

- **`SHELL-01` Header control names:**
  - `SidebarTrigger` (`src/components/ui/sidebar.tsx`): add `aria-label="Toggle sidebar"`, `aria-expanded` (reflecting `isMobile ? openMobile : open`), and `aria-hidden="true"` on the decorative icon.
  - `NotificationBell` (`src/components/notifications/notification-bell.tsx`): place `PopoverTrigger asChild` directly on the `<button>` (keeping the `.border-gradient` and unread badge wrapper around it) and provide a dynamic accessible name: `unreadCount > 0 ? \`Notifications (${unreadCount} unread)\` : "Notifications"`, plus `aria-hidden="true"` on the icon and badge text so it isn't announced redundantly. Also name the filter and mark-all-read icon buttons inside the popover if unnamed.
  - Messages button (`src/components/layout/main-header.tsx`): add `aria-label="Messages"` and `aria-hidden="true"` on `MessageSquareIcon`.
- **`SHELL-02` Mobile sidebar dismissal and focus restoration:**
  - Remove `[&>button]:hidden` from mobile `SheetContent` in `src/components/ui/sidebar.tsx` so the Sheet's built-in Close button (`XIcon` + `sr-only` "Close") is visible and keyboard-reachable inside the mobile drawer, and ensure `SidebarHeader` has right clearance (`pr-10` on mobile) so the Close button never overlaps `IVY LMS`.
  - Track the opener element ref in `SidebarContext` (set when `SidebarTrigger` toggles mobile sidebar open) and wire `SheetContent`'s `onCloseAutoFocus` so when the mobile Sheet closes via Close button or `Escape` (and not via route navigation), focus returns cleanly to the `SidebarTrigger` opener button after close.
  - On link click inside mobile `NavMain`, close the mobile sheet cleanly without stealing focus back to the trigger during route navigation.
  - Verify separately on Student, Teacher, and Admin at 390px (and check desktop rail/shortcut `Cmd/Ctrl+B`).

## 3. Auth Color Role Pilot (`AUTH-01`)

- Replace `opacity-40` on the `"or"` separator text in `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx` with the existing `DESIGN.md` semantic foreground role `text-muted-foreground` (or verify its computed contrast in Chrome; if `muted-foreground` is >= 4.5:1 over white `#ffffff`, use `text-muted-foreground`, otherwise `text-text-primary`).
- Measure exact computed foreground/background contrast in Chrome on both `/login` and `/register` (>= 4.5:1).

## 4. Scoped Calendar Pilot (`STU-01`)

- Pre-check confirmed a fixture gap in the dev environment: all 3 published `ClassSession` records are dated `2026-04-22` to `2026-04-24`, while `ScheduleTab` mounts `FullCalendar` on the current date (`2026-11-25`) with `headerToolbar={false}` and no month navigation controls. Neither enrolled nor unenrolled dev students render any calendar events in the current view.
- Per Phase 2 instructions, record this fixture gap without modifying `STU-01` (`globals.css` FullCalendar rules) or altering dev schedule data.
