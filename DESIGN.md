---
name: "AuthPilot"
description: "A charcoal and violet OAuth research workspace with evidence beside the next action."
colors:
  canvas: "#0b0d12"
  surface: "#13161e"
  surface-soft: "#191d28"
  foreground: "#f3f4f6"
  muted: "#a8afbd"
  subtle: "#959eaf"
  border: "#272b36"
  brand: "#a78bfa"
  brand-hover: "#c4b5fd"
  primary: "#7c3aed"
  primary-hover: "#8b4df1"
  accent: "#221b36"
  amber: "#edc486"
  amber-bg: "#2e2518"
  error: "#ffb1b1"
  error-bg: "#322027"
  success: "#7bdda5"
  success-bg: "#142b23"
  page-ground: "#07090e"
  action-ink: "#ffffff"
  canvas-light: "#f8f9fd"
  surface-light: "#ffffff"
  surface-soft-light: "#f0f1f8"
  foreground-light: "#192031"
  muted-light: "#586277"
  subtle-light: "#667188"
  border-light: "#dfe3ed"
  brand-light: "#6d28d9"
  brand-hover-light: "#5b21b6"
  primary-light: "#6d28d9"
  primary-hover-light: "#5b21b6"
  accent-light: "#ede7fb"
  amber-light: "#805314"
  amber-bg-light: "#fbf0dd"
  error-light: "#a12841"
  error-bg-light: "#fce9ed"
  success-light: "#196a41"
  success-bg-light: "#e5f4eb"
  page-ground-light: "#eef0f6"
typography:
  display:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "clamp(34px, 3.7vw, 48px)"
    fontWeight: 680
    lineHeight: 1.17
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  reading:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.55
  action:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "13px"
    fontWeight: 580
    lineHeight: 1.5
rounded:
  badge: "5px"
  control: "7px"
  field: "8px"
  content: "9px"
  panel: "10px"
  feature: "11px"
  dialog: "12px"
  frame: "14px"
  pill: "24px"
spacing:
  four: "4px"
  eight: "8px"
  twelve: "12px"
  sixteen: "16px"
  twenty: "20px"
  twenty-four: "24px"
  thirty-two: "32px"
  forty: "40px"
  forty-eight: "48px"
  sixty-four: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    typography: "{typography.action}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    typography: "{typography.action}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    typography: "{typography.action}"
    padding: "10px 16px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.field}"
    padding: "0 13px"
  research-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 14px"
  launch-path-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  explore-field:
    backgroundColor: "{colors.surface-soft}"
    rounded: "{rounded.panel}"
    padding: "6px 6px 6px 20px"
  navigation-item:
    textColor: "{colors.muted}"
    padding: "0 12px"
    height: "72px"
  navigation-item-active:
    textColor: "{colors.foreground}"
  library-filter-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "10px 11px"
  evidence-confirmed:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  evidence-estimate:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.amber}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  evidence-unknown:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    rounded: "{rounded.badge}"
    padding: "3px 7px"
  checklist-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.content}"
    padding: "24px"
  research-evidence-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.feature}"
---

# Design System: AuthPilot

## Overview

**Creative North Star: "Evidence beside the next action"**

AuthPilot is a focused developer workspace built from deep charcoal, restrained violet, compact navigation, and readable documentation. The user-supplied **AuthPilot OAuth Integration Flow.png** is the visual authority: its four panels become connected Explore, Research, Guide, and Library screens. This approved reference replaces the previous identity. Its example provider policies, verification badges, countdown, and account controls are not product evidence.

The interface balances a compact operating view for finding providers and following research with an open reading view for source-linked requirements. Violet identifies actions and selected states; evidence has its own labelled semantic colors. Flat surfaces and alignment provide structure. Actual source styles and components are authoritative when an earlier screenshot differs from the final code.

The evidence inspector keeps exact claims, conditions, source passages, AI interpretations, source links, retrieval dates, and verification status distinct. New research uses search, structured synthesis, bounded page retrieval, a separate AI support assessment, and deterministic passage matching. Provider-domain association is a heuristic rather than proof of official identity; legacy summaries are never presented as checked quotations. Older generated consequential claims without recorded support appear unknown at read time without overwriting their stored snapshots.

Next-step guidance respects blocked tasks and unmet dependencies. Explicitly independent tasks may proceed, while older guides use checklist order conservatively. Recovery instructions and documentation links distinguish step-specific evidence from related section guidance. These checks do not execute provider setup or obtain approval.

Launch-path controls extend the existing form language. Original research assumptions remain distinct from the current reader's preferences; estimates separate registration, implementation, and provider waiting. Required, conditional, omitted, and blocked work retain visible explanations rather than relying on completion color alone.

**Key Characteristics:**

- Dark by default, with an equivalent working light theme.
- One top navigation and separate connected screens.
- Restrained violet actions against charcoal surfaces and fine borders.
- Evidence labels and citations beside the claims they qualify.
- Actual research events and personal checklist progress with distinct meanings.

Documented on 3 November 2026 from `src/app/globals.css`, the shell and brand components, and the Explore, Library, Research, and Guide components and styles. Visual evidence is recorded under `.impeccable/review/redesign/`: `desktop-explore.png`, `desktop-research-active.png`, `desktop-guide.png`, `desktop-library.png`, and `comparison-reference-implementation.png`, alongside light and mobile captures. These document appearance and observed UI state, not OAuth setup verification.

The same-day desktop polish is reconciled here from the current source: shared action sizing, guide spacing and narrative facts, evidence-inspector reading order, library hierarchy and category labels, and local provider marks. The earlier redesign captures precede this polish; source values below describe the current implementation.

## Colors

The primary palette is charcoal and violet. Green, amber, and rose have specific evidence or failure meanings.

### Primary

- **Action violet (`primary`, `primary-hover`)** fills primary actions and the AuthPilot symbol. Primary action text remains white in both themes.
- **Readable violet (`brand`, `brand-hover`)** carries source links, focus rings, selected indicators, icons, and checklist completion. It is lighter than the filled action in dark mode.
- **Violet wash (`accent`)** marks selected tabs, saved controls, the current research stage, library views, and the next-step panel.

### Secondary

- **Evidence green (`success`, `success-bg`)** marks source-confirmed claims and curated source-check status. It does not certify provider setup or approval.
- **Planning amber (`amber`, `amber-bg`)** identifies estimates and caution notices.
- **Failure rose (`error`, `error-bg`)** identifies errors and interrupted states, always with explanatory text.

### Neutral

- **Outer ground (`page-ground`)** surrounds the application frame. **Canvas** is the page inside it; **surface** and **surface-soft** separate panels, fields, and supporting material.
- **Foreground** carries principal text, **muted** supporting prose, and **subtle** lower-emphasis metadata. **Border** separates controls and content without heavy shadows.
- Unsuffixed frontmatter tokens are the dark `:root` values. Each `-light` token is the corresponding `[data-theme="light"]` override. `action-ink` records the shared literal white used for primary actions. The theme provider defaults to dark; the working toggle persists the reader's choice.

### Named Rules

**The Named Evidence Rule.** Pair evidence color with its text label and icon; retain explicit uncertainty and attached citations.

**The Useful Violet Rule.** Reserve violet for actions, links, focus, selection, and actual progress; use semantic evidence colors for evidence.

## Typography

**Display Font:** Self-hosted DM Sans Variable, with sans-serif fallback.
**Body Font:** The same family, using weight, scale, tracking, and spacing for hierarchy.

**Character:** Precise and approachable, with tightened sentence-case headings and open technical reading lines. Shared Lucide icons have a consistent stroke (1.7px). The brand is a violet hexagon with a white shield/check. Provider marks use local or inline assets, including local Notion, Asana, Dropbox, and Linear assets, with a globe fallback for unfamiliar providers.

### Hierarchy

- **Display:** The recorded role is Explore's responsive headline. Its contextual overrides are 39px below the compact-desktop boundary, 36px below the navigation boundary, and 34px on narrow mobile. The general page-heading default is 36px/1.17 at weight 650; Library uses 31px, while Guide and Research use smaller contextual clamps.
- **Headline:** General sections use the recorded role; Guide sections use 21px, then 20px on narrow screens. Dense panel headings use 14–15px.
- **Title:** General third-level headings use the recorded role. Library record titles use 16px, then 14px below the navigation boundary and 13px on narrow mobile.
- **Body:** The recorded role is the application default. Supporting copy uses contextual 12–15px sizes with more open line height.
- **Reading:** Requirement claims use the recorded role inside a maximum measure of 75ch, retained on mobile. Narrative overview facts use 14px/1.7 across their full fact-column width. Section summaries use 14px/1.85.
- **Label and action:** Research labels and shared actions use the recorded roles. Library metadata uses 12px and origin badges 11px. Other source classification and metadata are compact (9–12px), secondary to readable claims.

### Named Rules

**The Reading Measure Rule.** Keep requirement claims at 15px with 1.8 line height inside the 75ch reading measure; collapse columns before shrinking claims.

## Layout

The desktop application is a centered frame (maximum width 1480px), with an outer gutter (22px), a fine border, and rounded corners. The top bar (minimum height 72px) uses a three-column grid: brand, centered navigation, and working theme action. General content is centered within 1240px, including horizontal padding (42px). Explore uses a 1210px maximum with 44px padding; Research uses `min(1160px, calc(100% - 72px))`.

Explore centers its headline, supporting copy, prominent research field (maximum width 850px), and genuine example-guide links. Three feature summaries form one desktop row. Library view/category filters occupy a local rail (232px), with a 24px gap and rail padding beside actual records; this rail belongs only to the library. Records separate their open link from save and share controls. Display category labels group related stored categories without changing their original searchable text.

The Guide overview has three desktop columns: integration facts, setup checklist, and next-action/approval panels, separated by 24px. Compact facts retain label/value columns; narrative hands-on effort and approval/wait facts stack label above text within the full fact-column width. Below 1199px the overview becomes two columns with the next-action rail across both. At 800px it becomes one reading column, with supporting panels in a two-column row until 480px. Detailed sections use a flexible reading column and supporting rail (260px), stacking below 800px. Six tabs scroll inside their own strip instead of widening the page.

Research places its actual-event timeline beside the returned-source panel in equal flexible columns, with a form above and collapsible event journal below. It becomes one column at 760px, preserving timeline-before-evidence reading order. Source lists scroll within their panel; long URLs wrap or truncate inside their own controls.

Launch-path fields use two equal columns with 16px row gaps and 24px column gaps, stacking below 600px. Guide disclosures retain the established flat container treatment and 24px inner padding; original research-context facts use a compact two-column definition list, also stacking below 600px. The Research form opens its launch disclosure before the first attempt and collapses it after submission so observed progress can occupy the reading area.

Spacing uses the recorded rhythm with contextual intermediate values for individual controls. Shared CSS spacing properties name the recurring control (8px), compact (12px), content (16px), panel (24px), and section (32px) steps. The guide's desktop tabs sit 24px below metadata; empty clipboard feedback adds no margin. Responsive boundaries are wide desktop (1600px), compact frame (1160px), mobile navigation/library rail (820px), narrow frame/Explore (560px), Guide (1199px, 800px, 480px), and Research (1100px, 760px, 420px). At 1160px the outer gutter is 14px and general page padding is 30px; the library rail is 193px with a 23px gap. At 820px desktop navigation becomes a modal menu and library filters wrap above records. At 560px the frame is edge-to-edge without an outer border or radius, the top bar is 65px, content has 20px side padding, feature summaries stack, and the Explore action spans the field width. Library record actions move beneath provider identity.

## Elevation & Depth

Resting content is flat. Tonal surfaces, fine borders, gaps, and text hierarchy establish depth. Mobile navigation and the evidence inspector use a dark scrim and contained ambient shadow. Navigation's theme-specific shared shadow values and motion details are recorded in the sidecar; the inspector's local treatment is defined in its CSS module. No glow, glass, or heavy gradient is part of this system.

### Named Rules

**The Flat Workspace Rule.** Keep resting content panels flat; reserve ambient shadows for modal navigation and evidence inspection.

## Shapes

Controls use modest corners (7px); search fields and notices use 8px. Evidence badges and native status selects use 5px. Guide content panels use 9px, general panels and library records 10px, and feature/evidence containers 11px. Modal navigation uses 12px; the desktop frame uses 14px. Example-guide links are pills (24px). Fine borders are normally 1px. Checklist and research markers retain functional circular or native-checkbox geometry.

## Components

### Buttons

Compact, explicit actions. Shared buttons have a minimum height (44px), a fine border, the control radius, recorded padding, and 13px labels. Direct SVG icons are 16px with an 8px gap. Primary uses action violet and white; secondary uses a soft surface and foreground; ghost uses a transparent ground and muted text. The shared small variant retains the same size and padding. Desktop Explore and Research form primary actions have a minimum height (48px); Explore uses contextual horizontal padding (22px) and a 45px minimum on narrow mobile. Narrow Guide toolbar actions retain their contextual 11px labels and 10px horizontal padding. Hover adjusts background and border over 0.15s ease-out. Disabled controls use a not-allowed cursor and opacity (0.55). Saved controls use violet wash and readable violet.

### Inputs / Fields

Explore's main field uses a soft surface, violet-mixed border, provider name/URL input, and embedded primary button. The input is 44px high and the desktop form has a minimum height (62px). Narrow mobile places the button on its own full-width row. A programmatic label, associated help/error text, and `aria-invalid` communicate purpose and validation.

Research uses a visible label and canvas-ground field (minimum height 48px) with a minimum-height input (46px), contextual help, and actual readiness feedback. Library search uses a surface field (minimum height 43px, width up to 360px) and 13px input text. Field wrappers have a 2px readable-violet focus outline with 3px offset. Preserve native input, Enter submission, select, checkbox, and disclosure behavior.

### Navigation

Desktop links are text-first, muted by default, with foreground hover/current text and a thin violet active underline. The current route exposes `aria-current`. Routes connect Explore, Guides, Saved, and How it works; Research belongs to Explore and individual guides belong to Guides.

The mobile menu is a labelled Radix modal dialog with focus trapping, Escape dismissal, focus return, a scrim, and close action. Active links use violet wash instead of the desktop underline. Open/close and theme controls are at least 44px in both dimensions. There is no avatar, notification system, or invented account menu.

### Chips

Evidence chips combine an icon, explicit label, and compact tinted ground. Labels are **Source confirmed**, **Planning estimate**, and **Not verified**. The schema vocabulary includes **Agent tested**, but this documentation-only build rejects that status for saved guides. Library origin labels distinguish **Source checked** curated snapshots from **Agent researched** generated guides; neither means setup was performed. Category filters use native buttons and `aria-pressed`; counts derive from actual records.

### Cards / Containers

Feature summaries, library records, checklist, and evidence panels share a flat surface, fine border, and modest radius. Typical internal padding is 16–24px, reduced on narrow screens. Checklist and next-action panels use the 24px panel step on desktop. Use a tinted surface for the next-action panel and current research stage. Reading claims use whitespace and dividers instead of a card around every sentence.

### Guide tabs and personal progress

The six semantic tabs are Overview, Setup steps, Scopes, Approval & review, Common issues, and Sources. The selected tab has violet-wash fill, foreground text, and a readable-violet underline. Arrow, Home, and End keys move focus and selection. Tabs have a minimum height (48px); the panel has a visible 3px focus outline with 8px offset.

The checklist shows this browser's applicable completed count, native checkboxes and status selects, and links to relevant guidance. Statuses are Not started, In progress, Blocked, Completed, and Not applicable. Explicit audience exclusions and manual omissions have separate explanations and counts; manually omitting a required prerequisite does not satisfy a dependent step. Only explicitly optional listing work can be excluded by the optional-listing preference. Conflicting internal/listing preferences keep both audience branches visible with an amber explanation.

The next-action panel recommends only unblocked steps whose dependencies are satisfied for the selected path. When a task is blocked or dependency-locked, it presents recovery guidance instead; other blockers and genuinely independent work remain visible. Expanded blocked steps expose a local reason field and responsible-person/role field beside recovery and documentation. These fields use the canvas ground, control corners, 44px minimum height, 13px input text, and 10px/12px padding; the reason textarea has an 82px minimum and resizes vertically. Legacy steps without explicit dependencies use checklist order conservatively. Direct step source IDs take precedence, and fallback links are labelled related documentation. The 4px progress track reflects the applicable completed fraction via `scaleX`, with a 0.2s ease-out transform transition. Bookmarks, checklist status, edited launch preferences, and blocker notes are browser-local; public guide URLs share content. A guide distinguishes documentation research from unperformed provider setup.

The audited snapshot with a manually amended publication plan shows a dated Overview notice in the existing notice treatment. Its Read the corrected plan action opens Setup steps. The notice distinguishes audience choice, review preparation, submission, and provider decision while stating that the original snapshot is retained; it does not imply a new retrieval or setup test.

### Launch path and effort

The reusable launch fieldset has a visible 15px/600 legend, 12px labels, and native 13px controls. It asks for audience, account permissions, optional API/scope names, and optional listing investigation. Controls have a 44px minimum height, use the recorded launch-field tokens, and retain shared focus treatment. Help and conflict copy are 12px/1.7; the optional-listing checkbox is 16px with action-violet accent. Research disables the fieldset during a request. In the guide, disclosure summaries distinguish current browser preferences from a read-only Research snapshot context; declared permissions are user input, not verified access, and a preference change does not research missing requirements.

Hands-on effort displays separate registration and implementation/test ranges with 12px muted labels and 13px/550 values. An 11px amber planning label identifies either a generic baseline or an AI assessment and excludes approval waiting. Expandable assumptions use 12px/1.7 text. Approval remains its own evidence-backed or unknown narrative fact; unsupported OAuth receives no executable effort estimate.

### Claim evidence inspector

“Why this requirement?” opens a labelled Radix modal inspection panel with focus trapping, Escape dismissal, focus return, and a 44px close control. The panel fits within mobile viewports and scrolls its own reading area. It presents the exact claim and applicable conditions, then compact verification status, its exact check date, and a caveat before supporting passages. Extended assessment details follow the passages; documentation links, retained summaries, retrieval metadata, and their original dates remain available below. Source summaries are explicitly not quotations; missing or conflicting support and provider-domain uncertainty stay visible. A matched passage proves text presence, not factual entailment or a completed OAuth setup.

Dated manual amendments to an audited historical snapshot use Documentation correction, Manual documentation audit, and Documentation audit summary labels. They do not inherit the AI-interpretation or matched-passage labels, and their caveat states that no server-checked quotation or executed setup is recorded.

### Research timeline and evidence

The timeline maps observed backend phases to Request accepted, Find documentation, Build the integration guide, Check the evidence, and Save your guide. Stage labels distinguish pending, in progress, completed, and interrupted. Do not invent separate approval-investigation events that the backend has not emitted.

The evidence panel shows actual returned titles, domains, canonical URLs, and classification. Known campaign parameters are removed before duplicate candidates are counted. **Documentation candidate** and **Retrieved source** classify links without certifying a claim. Source counts reflect distinct returned links. The journal retains observed events and actual timestamps, including an automatic retry only when a retry actually occurs. A completed request links to the persisted guide; failures and cancellation retain explanatory recovery actions. While a request is active, a 12px muted line shows actual elapsed time and the request limit; safe request references use 11px code text and wrap within their container. Elapsed time is not an invented completion estimate, and error references remain available for troubleshooting.

Loading spinners indicate an active request, never a completion estimate: shared loaders rotate over 1.2s and the Research spinner over 1s. Route skeletons alternate opacity over 1.4s. Reduced-motion preferences remove animations, transitions, and smooth scrolling throughout the app. Status meaning remains visible in text without motion or color.

### Keyboard and feedback

A skip link moves to main content. General interactive focus is a 3px readable-violet outline with 4px offset. Live status and clipboard feedback use polite announcements; validation errors identify the problem and return focus to the field. Preserve semantic links, descriptive accessible names, and native keyboard behavior.

## Do's and Don'ts

### Do:

- **Do** preserve charcoal/violet semantic roles and the equivalent light-theme overrides.
- **Do** keep evidence labels, source links, estimates, and explicit unknowns beside relevant claims.
- **Do** retain 15px/1.8 requirement text and collapse supporting columns on small screens.
- **Do** preserve visible focus, labelled controls, functional navigation, and reduced motion.
- **Do** derive guide counts, source lists, dates, and checklist progress from actual state.
- **Do** keep public OAuth distribution, optional directory listing, and workspace approval distinct in the guide presentation.

### Don't:

- **Don't** restore a global sidebar or use the four-screen reference as a collage inside one page.
- **Don't** add neon glows, glass effects, heavy gradients, decorative analytics, pricing, or upgrade widgets.
- **Don't** label a whole guide Verified or setup verified because documentation was retrieved.
- **Don't** invent research percentages, countdowns, sources, events, or provider approval timelines.
- **Don't** add avatars, account controls, Shared with me, or collaborative progress without working features.
- **Don't** use untrusted remote provider images or text glyphs as icon substitutes.
