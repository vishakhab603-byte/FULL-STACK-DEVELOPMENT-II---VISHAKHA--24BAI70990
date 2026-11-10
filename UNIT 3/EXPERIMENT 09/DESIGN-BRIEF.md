# Experiment 9 — Operations Concourse

## Product philosophy
Show the difference between a reference release workflow and API-returned canary configuration and accumulated routing counters. Backend state is in-memory demo data, not live deployment telemetry; an illustrative CI/CD sequence is never presented as a running GitHub Actions job.

## Audience and personality
For engineers exploring CI, contract verification, automated tests, containers, and staged traffic routing. Focused, industrial, decisive, and operationally honest.

## Visual identity
Carbon black and machined graphite with molten amber for a canary route, cool blue for stable traffic, and mint only for verified positive outcomes: `#0b0d0f`, `#171a1d`, `#f2b34d`, `#7fa7f8`, `#82d1ad`. A custom two-rail pipeline mark connects six square station nodes.

## Typography
Rajdhani for station headings and large operational labels; IBM Plex Mono for route weights, API values, code, and log timestamps; system sans-serif fallbacks. Both Google Fonts families use the SIL Open Font License: [Rajdhani](https://raw.githubusercontent.com/google/fonts/main/ofl/rajdhani/OFL.txt), [IBM Plex Mono](https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt). Load with preconnect and `font-display: swap`.

## Information architecture and grid
No generic sidebar. A broad release-topology strip spans the top; the main workspace pairs a canary route workbench with contract and calculator tools; real traffic logs and post/API tools follow as full-width operational lanes. Collapse station tracks to a clearly ordered vertical flow on mobile.

## Components and visualizations
Angular machined surfaces, fine alignment ticks, monospaced telemetry, and amber only for the canary route. The interactive traffic-split SVG reads its configured target from the API-returned canary percentage or its observed share from API-returned routing counters; the adjacent semantic table is the keyboard- and screen-reader-accessible DOM equivalent. Configured and observed modes are explicitly distinguished, and counters are presented as accumulated in-memory demo state rather than live telemetry. The release-stage strip is explicitly titled as a reference workflow and is never presented as a running deployment.

The actual backend signal is a pair of route ratios and counters, which the interactive SVG already communicates with precise proportions. A 3D deployment scene would suggest job-level states that this backend does not provide, so no WebGL layer is added.

## Illustration and iconography
Build a bespoke SVG route splitter with stable and canary paths; its selectable configured and observed views use only backend-returned values. Keep the release-stage pipeline separate and reference-only. The scalable SVG favicon echoes the concourse rail mark without replacing the primary wordmark.

## Motion and interaction
The traffic-split view switch changes the SVG between the API-returned configured target and accumulated observed routing share. Existing route actions append only returned responses to the log. A changed canary percentage updates after the API response; reset clears visible metrics only after a successful reset response. No autonomous, fabricated status cycling. Keep the SVG static; honor `prefers-reduced-motion` for the rest of the interface.

## Mobile art direction
Show the current configured canary percentage first, its slider and quick presets second, followed by routing snapshots and request actions. Stack station stages in a vertical numbered line. Keep all control targets reachable and prevent code/log panels from overflowing the screen.

## Accessibility and failure fallback
Semantic headings, labelled numeric/range inputs, keyboard-operable controls, visible amber/blue-compatible focus, textual stable-versus-canary labels, high-contrast logs, accessible error messages, and reduced-motion support. The mode buttons and adjacent data table provide keyboard access and a non-visual equivalent to the SVG. On an API failure, retain the last successful values and warn that they may be stale; before the first successful response, show unavailable values and an empty diagram rather than a fixture or fabricated split. The diagram reflows to a vertical route layout on narrow screens and has no motion-dependent information.

## Visualization source and interaction
Configured mode uses `GET /api/canary/config` fields `canaryPercentage` and `enabled`; observed mode uses `GET /api/canary/metrics` fields `stableRequests`, `canaryRequests`, `totalRequests`, and `actualCanaryPercentage`. The Configured/Observed buttons are standard keyboard-operable DOM controls, and an adjacent table provides configured targets, observed shares, and counts without requiring sight or SVG support. No pipeline fixture stage is used as a deployment state; the separate release topology remains labeled reference-only. If either endpoint fails, a warning marks displayed values as potentially stale; before any successful response, unavailable values and an empty diagram are shown. Reduced-motion mode retains the same static SVG and data equivalent.
