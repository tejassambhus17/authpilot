---
name: AuthPilot
description: An integration field guide inside a precise developer workspace.
colors:
  canvas: "#fafbf8"
  surface: "#fff"
  surface-soft: "#f3f5f0"
  foreground: "#1c2923"
  muted: "#627068"
  subtle: "#667369"
  border: "#e3e8e0"
  brand: "#245c45"
  brand-hover: "#194c37"
  accent: "#edf3e9"
  amber: "#83561a"
  amber-bg: "#fcf6e9"
  error: "#a33c34"
  error-bg: "#fff1ee"
  brand-mark-ink: "#fff"
  canvas-dark: "#141a17"
  surface-dark: "#1b231e"
  surface-soft-dark: "#212b24"
  foreground-dark: "#e8eee8"
  muted-dark: "#a6b3a9"
  subtle-dark: "#9caaa0"
  border-dark: "#303b33"
  brand-dark: "#a8d9b7"
  brand-hover-dark: "#c2e7cb"
  accent-dark: "#253a2c"
  amber-dark: "#ebc081"
  amber-bg-dark: "#342c1c"
  error-dark: "#ffafa4"
  error-bg-dark: "#3b2420"
  brand-mark-ink-dark: "#17271c"
typography:
  display:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "42px"
    fontWeight: 560
    lineHeight: 1.14
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.03em"
  title:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  reading:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  action:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "12px"
    fontWeight: 550
    lineHeight: 1.5
rounded:
  badge: "4px"
  select: "5px"
  chip: "6px"
  control: "7px"
  notice: "8px"
  progress: "10px"
  table: "11px"
  research: "12px"
  panel: "14px"
spacing:
  four: "4px"
  eight: "8px"
  twelve: "12px"
  sixteen: "16px"
  twenty-four: "24px"
  thirty-two: "32px"
  forty-eight: "48px"
  sixty-four: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.canvas}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "41px"
  research-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 13px"
  navigation-item:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  navigation-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.brand}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    padding: "6px 10px"
  filter-chip-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
  evidence-confirmed:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.brand}"
    rounded: "{rounded.badge}"
    padding: "2px 6px"
  evidence-estimate:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.amber}"
    rounded: "{rounded.badge}"
    padding: "2px 6px"
  evidence-unknown:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.badge}"
    padding: "2px 6px"
  research-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.research}"
    padding: "28px"
  provider-table:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.table}"
---

# Design System: AuthPilot

## Overview

**Creative North Star: "Integration field guide"**

AuthPilot is an integration field guide inside a precise developer workspace. Forest ink, off-white paper, generous reading space, and quiet navigation give documentation a dependable place beside a code editor. The user confirmed a searchable workspace, a prominent research action, and visible evidence; premium craft and a distinct AuthPilot identity remain the direction.

The interface has two densities: an operating view for finding providers and conducting research, and a reading view for a guide. Both use the same restrained surfaces and evidence vocabulary. Confidence comes from legible requirements, attached sources, honest unknowns, and clear human handoffs.

**Key Characteristics:**

- Quiet forest and paper palette, with corresponding light and dark themes.
- Searchable rows for scanning; generous line height for guide claims.
- Evidence labels and sources next to the facts they qualify.
- Flat, gently rounded surfaces with visible keyboard states.
- Motion tied to a real interaction, loading state, or local checklist change.

## Colors

The palette uses a single forest accent against warm neutral surfaces; amber and red carry specific evidence and error meanings.

### Primary

- **Forest ink (`brand`)** marks the research action, active navigation, confirmed evidence, source links, and progress. Its hover token deepens the action; in dark mode the same semantic role becomes pale forest.
- **Forest wash (`accent`)** gives selected navigation, confirmed evidence, and the research invitation a quiet tonal surface.

### Secondary

- **Amber (`amber`, `amber-bg`)** identifies planning estimates and caution notices. It does not imply a measured confidence score.
- **Error (`error`, `error-bg`)** identifies failures and blocked states, accompanied by text or an icon.

### Neutral

- **Paper (`canvas`)** is the page ground; **surface** is the sidebar, row, and panel ground; **surface-soft** separates secondary material.
- **Foreground** carries principal text. **Muted** carries supporting copy. **Subtle** carries lower-emphasis metadata and dividers' accompanying labels; it remains a text color, not a disabled-opacity recipe.
- **Border** separates rows, controls, and panels with a fine stroke. **Brand mark ink** keeps the custom vector mark legible in both themes.
- Every `-dark` token is the corresponding `[data-theme="dark"]` override of the same source CSS property. Component semantics do not change with the theme. Initial appearance follows the system; the theme control persists the reader's choice.

### Named Rules

**The Evidence Has a Name Rule.** Pair evidence color with its text label and icon; unknown facts retain their neutral treatment and explicit uncertainty.

**The Useful Accent Rule.** Reserve forest emphasis for actions, navigation state, evidence, links, and progress rather than decorative metrics.

## Typography

**Display Font:** Self-hosted DM Sans Variable, with sans-serif fallback.
**Body Font:** The same family; weight, size, tracking, and space establish hierarchy.

**Character:** Precise and approachable. Slightly tightened headings provide identity while ordinary sentence case and open reading lines keep technical material calm. Lucide icons use a consistent stroke (1.7px); the AuthPilot mark is explicit vector geometry.

### Hierarchy

- **Display:** The frontmatter records the base page heading. The directory heading grows to 49px at wide desktop, is 36px at the compact-desktop and mobile overrides, and 35px at the intermediate and narrowest overrides. Research and methodology titles use 36px, then 32px and 30px on smaller screens. Guide titles use 34px with contextual overrides down to 27px.
- **Headline:** Base section headings use the recorded headline role. Guide section headings use 20px, then 19px at the narrowest breakpoint.
- **Title:** The base title role is for third-level headings; dense panels use contextual 12–16px titles.
- **Body:** The recorded body role is the application default. Introductory and explanatory copy often uses a more open line height (1.8–1.95).
- **Reading:** Guide summaries and requirement claims use the recorded reading role. The content column is capped at 75ch. This reading size remains 15px on mobile.
- **Label and action:** Field labels use the label role; shared buttons use the action role. Supporting navigation, metadata, and evidence use contextual 8–12px sizes, without introducing decorative heading eyebrows.

### Named Rules

**The Reading Measure Rule.** Keep guide requirement claims at 15px with 1.75 line height inside the 75ch content measure; reduce columns before shrinking reading text.

## Layout

The desktop shell has a fixed sidebar (232px) and a top bar (69px). Main content is centered within a maximum width (1280px), including horizontal padding (48px). At the compact desktop breakpoint, the sidebar becomes 210px and horizontal padding becomes 32px. Wide desktop uses 64px horizontal padding.

The directory pairs an introduction with the research invitation above a scan-friendly provider table. Its default row grid is `minmax(250px, 1fr) 135px 115px 18px`. Rows grow with content and use a minimum height (105px). The table progressively drops secondary columns rather than creating horizontal overflow. The approved searchable workspace and prominent research action are the first surface's expression of this system, not a required composition for every future page.

Guides use a flexible reading column and a progress rail (230px), separated by 40px. The rail narrows with available space and becomes a compact panel above the content on mobile. Research and methodology have narrower maximum containers (1000px and 960px). Spacing uses the recorded recurring rhythm, with contextual intermediate values for control geometry and editorial gaps.

Responsive boundaries are 1550px (wide desktop), 1190px (compact desktop), 980px (stacked introduction and reduced metadata), 760px (mobile shell and single-column guide), and 480px (narrowest content). At mobile width, a 280px modal navigation sheet replaces the sidebar, the top bar becomes 58px, and page padding becomes 24px. Research fields and actions stack from 980px downward. Preserve the semantic reading order, wrapping actions, and accessible names while adapting the layout.

## Elevation & Depth

The implemented workspace is flat: surface tone, fine borders, spacing, and text hierarchy establish depth. The modal navigation sheet has a translucent scrim. The stylesheet declares an ambient shadow (`0 12px 35px rgba(28, 41, 35, 0.1)`), but no shipped component applies it; it is not a default card treatment. The confirmed direction reserves elevation for menus rather than ordinary content panels.

### Named Rules

**The Flat Workspace Rule.** Keep resting content surfaces flat and use their border or tonal ground to separate them.

## Shapes

Controls and navigation have a gentle corner (7px). Smaller badges, filters, and selects use their recorded compact radii. Panels use contextual corners: progress and overview surfaces (10px), provider tables (11px), research panels (12px), and the invitation and large guide icon container (14px). Fine borders are normally 1px. Circular status dots, checklist markers, and the AuthPilot symbol retain their functional geometry.

## Components

### Buttons

Restrained, compact, and unmistakably actionable. Shared buttons have a minimum height (44px), the control radius, a 1px border, and recorded padding. Primary actions use forest against canvas; secondary actions use a surface and border. The small variant changes type and padding (11px; 7px 11px) while preserving the 44px target. Hover changes the surface or brand tone over 0.15s; primary press moves down 1px. Disabled buttons use a not-allowed cursor and opacity (0.55), with a reason supplied by the surrounding interface.

### Inputs / Fields

Search is a compact surface field (41px high, maximum width 385px) with an icon, accessible input name, and keyboard hint. Research uses a canvas-ground field with a 44px-high input and a visible label and help text. Both use a 1px border, the control radius, and a wrapper focus outline (2px, offset 2px). Native controls keep their normal keyboard behavior; error messages name the problem.

### Navigation

Desktop navigation uses icon-and-text rows with a minimum height (42px), muted default text, soft hover fill, and forest-wash active fill. The active link exposes `aria-current`. The mobile menu is a labelled modal dialog with a scrim; both its open and close controls are at least 44px in each dimension. Focus trapping, Escape, and focus return come from the dialog primitive.

### Chips

Category filters use compact text and the chip radius. The selected filter gains a surface fill, a border, and a stronger weight, and exposes `aria-pressed`. Evidence chips are distinct: an icon and a named status on a smaller tinted ground. Their labels are **Source confirmed**, **Planning estimate**, and **Not verified**. The component vocabulary includes **Agent tested**, but this documentation-only build rejects that status for saved guides and must not display it as a claim of performed setup.

### Cards / Containers

Provider rows are whole-row links inside one bordered table, with provider identity, supporting copy, contextual metadata, and a chevron. Hover uses the soft surface. Research form and journal panels use a surface, a 1px border, and the research radius; form padding changes from 28px to 22px and then 18px on smaller screens. The invitation uses the accent wash without a shadow. Avoid adding a separate floating card around every claim.

### Guide reading and progress

Guide sections use plain dividers and balanced headings. Evidence and underlined source references stay next to each claim. Semantic tabs have a forest underline for the selected state and support arrow, Home, and End keys. A focused tab panel receives a 3px brand outline with an 8px offset; other keyboard controls use a 3px outline with a 4px offset.

The progress rail reports the current browser's checklist count and next step. Its 4px track reflects the real completed fraction using `scaleX`, with a left origin and a 0.2s ease-out transform transition. This is checklist completion, never research certainty. Shared guides do not share progress.

### Research journal and motion

The journal is an event list with observed messages, source links when present, and actual timestamps. It announces new entries politely. A running request can show a 1.2s linear loading spinner; route skeletons use a 1.4s alternating opacity change. These indicate loading rather than invented research work. Reduced-motion preferences remove animations, transitions, and smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** preserve the forest-and-paper semantic roles in light and dark themes.
- **Do** attach labelled evidence, sources, and honest uncertainty to the relevant requirement.
- **Do** preserve the 15px/1.75 guide reading measure and collapse supporting columns on small screens.
- **Do** keep shared buttons and both mobile navigation controls at least 44px tall, with visible keyboard focus.
- **Do** show actual loading, journal events, and browser-local checklist progress, respecting reduced motion.

### Don't:

- **Don't** add decorative metrics, charts, heading eyebrows, or invented setup activity.
- **Don't** use a numeric confidence score in place of evidence labels and uncertainties.
- **Don't** claim provider setup, authorization, or approval was tested by this build.
- **Don't** apply the unused ambient shadow to resting content panels.
- **Don't** load provider logos from untrusted remote URLs or replace the custom mark with a text glyph.
