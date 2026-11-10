# Experiment 6 — Precision Observatory

## Product philosophy
Read APIs should feel inspectable: every visible number comes from the current API page, every control exposes a real query or task operation, and no response is implied before it arrives.

## Audience and personality
For developers learning pagination, sorting, fetch joins, cache eviction, and database-backed reads. Exact, calm, analytical, and never theatrical about unmeasured performance.

## Visual identity
An observatory instrument made from graphite, paper-white text, and a single ultraviolet measurement accent. Obsidian `#101116`, graphite `#1a1b22`, lavender `#ae9bff`, verified green `#73cba3`, and soft red `#dc8585`. The mark is a four-point reticle surrounding a small query dot, drawn as inline SVG.

## Typography
Space Grotesk for headings and controls; IBM Plex Mono for identifiers, counts, query parameters, and metadata; system sans-serif fallbacks. Both Google Fonts families use the SIL Open Font License: [Space Grotesk](https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt), [IBM Plex Mono](https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt). Load with preconnect and `font-display: swap`, with usable local fallbacks when fonts are unavailable.

## Information architecture and grid
No side navigation. A narrow instrument masthead introduces a full-width query strip; results occupy a dense editorial table below. Use a twelve-column desktop grid with aligned numeric columns, an eight-column tablet grid, and a single-column mobile query-to-results flow.

## Components and visualizations
Square-edged, hairline-bordered surfaces with restrained depth. Query and page controls are real controls, not decoration. The paginated response is a table with row actions; summary counts derive only from loaded tasks. A completion ring visualizes the completed/open split of the records currently returned by the selected read view. Its source is the response's task `completed` field and returned record count, not a separate request or an all-database aggregate. Native “All,” “Complete,” and “Open” buttons filter the displayed rows; their counts, selected states, and live shown-row total remain available to keyboard and assistive-technology users. The summary and ring describe the unfiltered returned set. During loading or error, the chart shows an unavailable state rather than treating missing data as zero; a genuinely empty response is shown as zero, with the filters disabled. Optional comment and top-five views use their existing backend endpoints and are labeled by provenance. Do not invent timing, cache-hit, or load metrics.

The read API exposes records and paging, not spatial telemetry. A WebGL scene would add no useful meaning to these exact counts, so the interactive completion ring stays in lightweight SVG/DOM.

## Illustration and iconography
Original reticle and query-flow line art in inline SVG; the response composition ring is inline SVG, with its underlying status counts and filtering controls in conventional DOM controls. Icons are one-color, 1.5px-stroke technical glyphs with accessible names when interactive. The product reticle SVG is also the scalable favicon linked from `index.html`. Empty states draw a quiet disconnected query node rather than use stock imagery.

## Motion and interaction
Fast instrument-like feedback: 120–180ms focus and hover transitions, 220ms result-row entrance after a successful response, and an indeterminate progress line only during real requests. Animate changed values only when the returned value changes. The completion ring updates without animated segment transitions, so its status changes remain stable under `prefers-reduced-motion`; the shared reduced-motion rule also suppresses existing motion. Errors remain visible with a direct retry action, and unavailable/empty chart states are distinguished.

## Mobile art direction
Prioritize the query, current-page summary, then task rows; move secondary view controls into a compact labelled selector. Preserve comfortable row action targets and horizontal-scroll only for inherently tabular content.

## Accessibility
Meet WCAG AA contrast, semantic table markup, associated labels, keyboard-operable controls, visible focus, live announcements for request status, and reduced-motion support. Color is never the sole indicator of task state.
