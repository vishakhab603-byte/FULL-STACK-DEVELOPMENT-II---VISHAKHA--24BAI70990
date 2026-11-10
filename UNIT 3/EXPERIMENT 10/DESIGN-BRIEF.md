# Experiment 10 — Social Editorial

## Product philosophy
Publishing is about thoughtful communication and timing. Make drafting, selecting a channel, scheduling, and reviewing actual post states feel calm and editorial—not like an engineering console.

## Audience and personality
For creators and teams learning full-stack social scheduling and simple analytics. Human, warm, expressive, contemporary, and transparent that publication is simulated locally.

## Visual identity
A deep-plum publishing room with blush paper, rose ink, and coral calls to action: plum `#342632`, paper `#fffaf5`, rose `#d98c9d`, coral `#e57666`, and muted lavender. A custom rosette speech-mark combines a simple post bubble with one human-centered orbit.

## Typography
Plus Jakarta Sans for readable interface and post copy; Playfair Display for editorial display headlines; system sans-serif fallbacks. Both Google Fonts families use the SIL Open Font License: [Plus Jakarta Sans](https://raw.githubusercontent.com/google/fonts/main/ofl/plusjakartasans/OFL.txt), [Playfair Display](https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/OFL.txt). Load with preconnect and `font-display: swap`; prioritize post readability over decorative type.

## Information architecture and grid
No left rail, admin sidebar, or engineering metric band. The opening is a typographic editorial masthead, followed by a compact schedule overview, a quiet ledger of actual service totals, an asymmetric composer with channel distribution, and a spacious chronological editorial feed.

## Components and visualizations
Paper-like post surfaces hold the actual post copy, selected platform, backend status, and scheduled/published timestamp. Channel selectors are clear, accessible pills. Totals and counts come from the analytics API; empty, loading, and service-error states differ. An editorial timeline orders the currently filtered posts by each record's scheduled time, or its returned publication time when available. Selecting a timeline marker focuses and scrolls to the corresponding post; the list remains available as a keyboard-operable DOM control. Stale API records are labeled after refresh failure, and invalid timestamps remain visible as undated markers. The publishing simulation is stated explicitly; no invented engagement or follower analytics.

## Illustration and iconography
Original speech-rosette and calendar-day SVG marks, with light editorial dividers and small platform text labels. Use hand-drawn accents sparingly; do not imply real platform logos or add fake post imagery.

## Motion and interaction
A new post joins the feed only after a successful API response; use one quiet 260ms entrance. Channel changes get immediate selected-state feedback. The live schedule updates on successful refresh only. Timeline selection follows the platform's reduced-motion scroll behavior; no animated engagement charts or perpetual motion. Respect `prefers-reduced-motion`.

## Brand and interactive schedule
The header rosette remains the primary inline logo; `frontend/public/publication-mark.svg` is its product-specific, scalable favicon companion. The schedule timeline is a light DOM/SVG-era visualization of API records, not external publishing telemetry. It degrades to the same status-filtered post list when there are no records and retains an explicit stale-data note when a background refresh fails. Native buttons and article focus provide keyboard access without relying on a canvas.

This product's real data is editorial copy, channels, statuses, and timestamps; the responsive schedule timeline makes those relationships legible without spatial ornament. No 3D scene is used because the local publishing simulation provides no audience or platform telemetry to animate meaningfully.

## Mobile art direction
Remove the desktop navigation column entirely; use a compact masthead and a single content column. Keep the next scheduled post and composer in the primary reading flow, preserve readable post text, and let channel controls wrap.

## Accessibility
AA contrast on paper and plum, readable post text, semantic time elements and labels, keyboard-visible states, text labels alongside platform/status color, live announcements for request errors, and reduced-motion support.
