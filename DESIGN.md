---
version: alpha
name: IVY LMS
description: Shared design roles for the IVY IELTS learning application.
colors:
  background: oklch(1 0 0)
  foreground: oklch(0.141 0.005 285.823)
  primary: oklch(0.4953 0.1866 27.51)
  primary-foreground: oklch(0.971 0.013 17.38)
  card: oklch(1 0 0)
  card-foreground: oklch(0.141 0.005 285.823)
  popover: oklch(1 0 0)
  popover-foreground: oklch(0.141 0.005 285.823)
  secondary: oklch(0.967 0.001 286.375)
  secondary-foreground: oklch(0.21 0.006 285.885)
  muted: oklch(0.967 0.001 286.375)
  muted-foreground: oklch(0.552 0.016 285.938)
  accent: oklch(0.967 0.001 286.375)
  accent-foreground: oklch(0.21 0.006 285.885)
  destructive: oklch(0.577 0.245 27.325)
  border: oklch(0.9401 0 0)
  input: oklch(0.92 0.004 286.32)
  ring: oklch(0.704 0.191 22.216)
  sidebar: oklch(0.985 0 0)
  sidebar-foreground: oklch(0.141 0.005 285.823)
  sidebar-accent: oklch(0.967 0.001 286.375)
  sidebar-accent-foreground: oklch(0.21 0.006 285.885)
  sidebar-border: oklch(0.92 0.004 286.32)
  sidebar-ring: oklch(0.704 0.191 22.216)
  text-primary: oklch(0.4091 0 0)
  text-secondary: oklch(0.9158 0 0)
typography:
  sans:
    fontFamily: Geist
  mono:
    fontFamily: Geist Mono
rounded:
  base: 0.65rem
components:
  body:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
  main-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-secondary}"
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  button-outline-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
  popover-content:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
  tabs-list:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
  sidebar-menu-button-hover:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.sidebar-accent-foreground}"
  nav-main-label:
    textColor: "{colors.text-primary}"
omitted:
  - section: spacing
    reason: The application uses Tailwind spacing utilities and has no separate named spacing scale.
---

## Overview

IVY LMS supports IELTS preparation across Student, Teacher, and Admin workflows. Preserve the IVY IELTS mark and the deep red used for brand emphasis.

## Colors

Pair foreground roles with their corresponding surfaces. Use the primary pair for default actions, the card pair for content panels, and the popover pair for overlays. Use the sidebar roles where the sidebar owns the surface.

## Themes

The shared CSS defines a light default and a class-based dark palette. Resolve semantic roles through the active palette.

| Role | Dark value |
| --- | --- |
| `background` | `oklch(0.141 0.005 285.823)` |
| `foreground` | `oklch(0.985 0 0)` |
| `card` | `oklch(0.21 0.006 285.885)` |
| `card-foreground` | `oklch(0.985 0 0)` |
| `popover` | `oklch(0.21 0.006 285.885)` |
| `popover-foreground` | `oklch(0.985 0 0)` |
| `secondary` | `oklch(0.274 0.006 286.033)` |
| `secondary-foreground` | `oklch(0.985 0 0)` |
| `muted` | `oklch(0.274 0.006 286.033)` |
| `muted-foreground` | `oklch(0.705 0.015 286.067)` |
| `accent` | `oklch(0.274 0.006 286.033)` |
| `accent-foreground` | `oklch(0.985 0 0)` |
| `destructive` | `oklch(0.704 0.191 22.216)` |
| `input` | `oklch(1 0 0 / 15%)` |
| `ring` | `oklch(0.396 0.141 25.723)` |
| `sidebar` | `oklch(0.21 0.006 285.885)` |
| `sidebar-foreground` | `oklch(0.985 0 0)` |
| `sidebar-accent` | `oklch(0.274 0.006 286.033)` |
| `sidebar-accent-foreground` | `oklch(0.985 0 0)` |
| `sidebar-border` | `oklch(1 0 0 / 10%)` |
| `sidebar-ring` | `oklch(0.396 0.141 25.723)` |

## Typography

Use the shared card title and description to distinguish a content section's heading from its supporting text. Use the shared form label and message to distinguish a field's purpose from its feedback. Keep monospaced numerals in the assessment timer displays that use the shared mono role.

## Layout

Compose Student, Teacher, and Admin pages in the shared sidebar and header shell. The sidebar uses an inline navigation region on wider screens and a Sheet on narrow screens. Keep assessment navigation and submission in the dedicated examination layout.

## Elevation & Depth

Use the Card surface and its own shadow for grouped content. Dialogs, sheets, and popovers own their overlay layering.

## Shapes

Use the shared radius family through component variants so controls, cards, and overlays inherit their intended corners.

## Components

Use the shared Button variants for default, secondary, outline, ghost, link, and destructive actions. Use the shared form controls and their focus and invalid states where those controls are already composed. Keep field messages next to their controls.

Use Lucide for interface icons and retain the IVY mark for product identity. Let the Dialog and Sheet components own their opening and closing transitions and modality.
