# Authentication audit

## Design language

**Audited surface.** Login, registration and direct callback. The shared Auth layout supplies the IVY mark, credential and Google options, and the large-screen brand aside. Input, Button and Form supply shared control behavior. Documented decisions are the existing authentication options and the shared semantic roles. Explicit exceptions are limited to the desktop Auth aside and callback layout in their owning files. [Auth layout](../../../src/app/%28auth%29/layout.tsx), [form primitive](../../../src/components/ui/form.tsx), [design contract](../../../DESIGN.md).

## Findings

| ID | Problem and evidence | Recommended correction | Scope and confidence |
| --- | --- | --- | --- |
| [AUTH-01](../findings.md#auth-01) | The 14px “or” text composites to roughly 2.72:1. Login and registration show the same faded separator treatment. | Use the existing muted foreground on the white surface at readable contrast. | Both forms · High |
| [AUTH-02](../findings.md#auth-02) | Tab from the credential fields crosses Sign up and Google before reaching Log in. Positive tab indexes override the displayed order. | Follow the visible form order. | Login · High |
| [AUTH-03](../findings.md#auth-03) | Direct callback has no visible text and the same computed loader animation with reduced motion on. The global live region carries no callback status. | Present a readable callback status with a static reduced-motion state. | Callback · High |

Login and registration retain named fields and consistent visual method order. Empty login focused Email address and attached the inline message through the field description. Email input purpose and autocomplete use remain candidates for a device and password manager check. Google OAuth completion and callback error paths remain open. [Login validation capture](../screenshots/login-validation-390.png), [short registration viewport](../screenshots/register-320x568.png), [callback capture](../screenshots/callback-390.png).

## Improve first

Address AUTH-01 in the existing form presentation. It affects both entry points and requires a scoped foreground choice.
