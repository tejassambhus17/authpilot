# Desktop UI refinement

Completed on **3 November 2026**, directly on the existing `main` branch. This is a desktop-focused refinement of the established charcoal/violet interface, not a redesign or a new feature surface. No branch, worktree, pull request, push, deployment, or paid research request was made during this pass.

## Implemented changes

| Area | Change | Actual browser measurement |
| --- | --- | --- |
| Toolbar actions | Unified labels, padding, icons and spacing | All four guide actions: **44px high**, **13px labels**, **10px 16px padding**, **8px gaps** |
| Primary-action hierarchy | Research again is secondary; the next-step documentation action remains violet | Research submissions are **48px**; guide utility actions use the secondary surface |
| Guide header | Removed visual space from the empty live-feedback node while retaining accessible feedback | Empty node **0px high**; metadata-to-tabs gap **24px**, previously 46px |
| Guide facts | Long effort/approval labels stack above full-width prose; complete text, conditions and evidence retained | Narrative values approximately **400px wide** at 1440px, previously approximately 222px; **14px/23.8px** reading text |
| Library | Larger title/metadata/status hierarchy and consistent controls | **16px titles**, **12px metadata**, **11px provenance badges**; 232px desktop filter rail and 24px grid gap |
| Category presentation | Grouped synonymous generated categories into concise display labels | Counts/filtering derive from actual guides; original category text remains stored, searchable and available in the record tooltip |
| Evidence inspector | Compact status/date/caveat before passages; full assessment after the passages | Supporting-passages heading at **y606** and first quotation at **y708–767**, fully visible in the 1440×900 initial viewport |
| Research alignment | Shared heading-row treatment, aligned input/action and compact pending-stage spacing | Heading vertical difference **0.5px**, previously 20px; pending rows have a 76px minimum |
| Explore | Removed redundant bottom library prompt; tightened form gap and improved supporting text | Existing navigation, example links and Browse all guides remain working |
| Provider recognition | Added unchanged official Asana, Dropbox and Linear favicons | All new icons and the existing Notion icon decoded and were visibly recognizable in dark/light themes |

Spacing now has shared 8/12/16/24/32px tokens for related controls, compact metadata, content, panels and sections. Existing context-specific reading layouts and responsive behavior remain intact. No source requirements, approval wording, verification data, checklist storage keys, API contracts, research orchestration or database content were changed by the visual refinement. Category grouping is a presentation rule, not a provider-policy assertion.

## Verification actually performed

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: **195 tests across 13 files passed**. The three added tests cover category grouping, unfamiliar-category retention and original-text preservation; cosmetic-only tests were not added.
- `npm run build`: passed with Next.js 16.4.4, Webpack and the supported local Node runtime.
- `npm run test:e2e` using installed Edge: **20/20 passed**. Existing evidence, checklist, bookmark, share, export, research-fixture/error, keyboard, theme and mobile-regression journeys remain functional. The new journey checks category filtering and clearing.
- **12 rendered desktop screenshots** opened and inspected: five principal dark 1440×900 states, Guide/Library at 1280px and 1920px, and light Guide/Library/Inspector at 1440px.
- Same-viewport before/after comparison opened alongside native screenshots. No horizontal page overflow, page errors, console errors, or research POST attempts occurred during capture.
- Official icon images decoded with natural dimensions Asana 48×48, Dropbox 32×32, Linear 48×48, and Notion 64×64; library display size 29px. Assets were downloaded unchanged and provenance is in `public/provider-icons/README.md`.

Ignored local artifacts: `.impeccable/review/desktop-polish/measurements.json`, the twelve named screenshots, and `before-after.png`/`before-after.html`. The comparison displays unchanged 1440×900 captures at equal normalized sizes; it is not a pixel-perfect claim against the original user collage.

## Scope and limits

This pass did not rerun paid unfamiliar-provider generation because the server/retrieval/evidence/storage implementation is unchanged. The genuine earlier research results, failures and corrections remain in [final engineering validation](final-validation.md). Existing narrow-screen behavior was regression-tested without adding a mobile-focused redesign. No full assistive-technology certification or production-hosted test is claimed. Push/deployment still require owner confirmation and the remote configuration described in [deployment readiness](deployment-readiness.md).
