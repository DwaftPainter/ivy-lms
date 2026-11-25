# Design system audit

## Basis and validation

The root [DESIGN.md](../../DESIGN.md) records the portable, established shared roles at `089565ab1bab615d8b6e9669394544ffa2dae640`. The current application retains the IVY mark, deep red brand accent, Tailwind 4 semantic roles, local shadcn New York components and Lucide. Auth, role shells and assessment layouts supply distinct task compositions. Their existing owners are documented in the [component inventory](component-inventory.md).

| Gate | Result |
| --- | --- |
| Installed specification | `npx @google/design.md spec` resolved to 0.4.0. The schema has no theme-mode YAML. The contract uses default tokens and an exact dark fallback table. |
| Structural lint | `npx @google/design.md@0.4.0 lint DESIGN.md` exited successfully with 0 errors and 6 warnings. Five warnings concern active border/focus colors that the component sub-token schema cannot reference using their actual properties. The sixth flags the declared TabsList color pair at 4.39:1. |
| Tailwind v4 export | `npx @google/design.md@0.4.0 export --format css-tailwind DESIGN.md` succeeded and emitted all 26 color roles, both font roles and the base radius. The exporter serializes the default colors to sRGB. Dark overrides are in the human-readable Themes table. |
| Scope | CSS, package configuration, dependencies and generated application artifacts in the workspace stayed untouched. The validator ran as a temporary tool. |

Checked the six token warnings against runtime. The CSS consumes the five named border/focus roles in base, Input and Sidebar. In the sampled Student and Grading tabs, inactive triggers override the declared list text with foreground at 60% opacity, so the validator's pair alone does not establish a visible contrast defect there. [Global CSS](../../src/app/globals.css), [Input](../../src/components/ui/input.tsx), [Sidebar](../../src/components/ui/sidebar.tsx), [Tabs](../../src/components/ui/tabs.tsx), [contrast notes](accessibility-audit.md#contrast-and-motion).

## Design evidence

| Area | Established decision or owner | Observed, unresolved or accidental |
| --- | --- | --- |
| Brand and iconography | The IVY IELTS asset and the named primary red are used in Auth and portal navigation. Config names Lucide. | Auth's gradient is an Auth treatment. It does not establish a portal-wide gradient rule. Notification and assessment icons require names where they carry an action. |
| Semantic color | Surface and foreground pairs cover background, card and popover. Named roles cover primary, secondary, muted, accent, destructive, focus and sidebar. Button and Card use role pairs. | Role surfaces also use a hard-coded gray and local skill colors. Duplicated base declarations and a duplicate active background custom property are source inconsistencies. Calendar wrappers make existing roles invalid in one consumer. [STU-01](findings.md#stu-01). |
| Light and dark | CSS defines a light default and alternate `.dark` values without a competing palette. | Emulated system dark left Auth light and the root lacks theme switching. Dark contrast and user activation are unresolved. The export does not encode the fallback table. [D-01](design-decisions.md#d-01). |
| Typography | Geist and Geist Mono are named utility families. Card title/description, field label/message and mono timers establish local hierarchy. | Login body computed system UI sans, while the heading computed 20px/500. Role page headings have local sizing. Treat these as current presentation observations. A global type scale and font rollout require approval. [D-02](design-decisions.md#d-02). |
| Spacing and layout | Shared role shell owns sidebar/header. Auth, builder/grades and exam compose their task layouts through distinct branches. | Stock Tailwind spacing and local margins coexist. The shared Sidebar appears at 768px, reducing the usable content width. No named product spacing scale was established. |
| Radius and elevation | `--radius` is 0.65rem plus utility derivations. Card owns its border and shadow. Overlays own their modality and layering. | Cards with local rounded and shadow overrides and shadowless schedule cards are observable variants. There is no named elevation scale. Retain role and task distinctions pending audit evidence. |
| Components and states | Button defines action variants and sizes. Form associates labels, errors and invalid state. Dialog/Sheet and Radix primitives own interaction state. | Unnamed icon buttons and uncontrolled focus return are verified defects. Cross-role differences in skeletons, spinner and alert presentation are ownership evidence for later selection. |
| Motion | Dialog and Sheet define state transitions in their primitives. The shared loader implements a looping CSS animation. | Direct callback animation remains active in reduced motion. Sidebar width animation and broad transitions are source observations; the audit did not measure frame cost. [AUTH-03](findings.md#auth-03), [D-05](design-decisions.md#d-05). |

Evidence sources include [component config](../../components.json), [theme](../../src/app/globals.css), [root](../../src/app/layout.tsx), [Button](../../src/components/ui/button.tsx), [Card](../../src/components/ui/card.tsx), [form primitive](../../src/components/ui/form.tsx), [Sheet](../../src/components/ui/sheet.tsx) and the [rendered coverage](audit/README.md).

No application-owned spacing, heading, elevation, skill/status or motion token scale met the evidence gate. Those areas stay documented as observations or [approval decisions](design-decisions.md). Chart tokens, derived radius aliases and local literals stay in their current owners.
