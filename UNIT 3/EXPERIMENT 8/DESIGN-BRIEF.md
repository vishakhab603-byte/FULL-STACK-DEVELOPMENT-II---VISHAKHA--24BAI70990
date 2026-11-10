# Experiment 8 — Creative Dispatch Laboratory

## Product philosophy
Scheduling is a deliberate act of composition: create an event, choose its time, and watch its real lifecycle move through an event-driven system.

## Audience and personality
For developers learning scheduled publishing through Kafka, retries, and dead-letter handling. Exploratory, warm, tactile, and clear about what is queued versus published.

## Visual identity
A paper-and-ink research desk with electric cobalt as its working accent: warm ivory `#f5f0e5`, chalk `#fffdf7`, graphite `#25272a`, cobalt `#3158eb`, muted ochre `#c98b46`, and sage `#4f8065`. The brand mark is a simple cobalt dispatch pin enclosing a small orbit.

## Typography
Manrope for interface copy; Instrument Serif for expressive product headings; system sans-serif fallbacks. Both Google Fonts families use the SIL Open Font License: [Manrope](https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt), [Instrument Serif](https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/OFL.txt). Load with preconnect and `font-display: swap` to retain readable fallback text.

## Information architecture and grid
An asymmetric laboratory bench rather than a dashboard: a generous scheduling work surface on the left and a vertically flowing event ledger on the right. Use a 7/5 desktop split, compact tablet columns, and compose-first stacking on mobile.

## Components and visualizations
Ivory panels on a graphite foundation, notebook-like hairlines, clear date/time controls, and tactile cobalt primary actions. A post appears in the queue only after the backend returns it. The live schedule timeline reads the same `GET /api/posts` records as the event ledger: horizontal position comes from each returned `scheduledTime`, and marker shape/color plus text come from its returned `status`. It refreshes with the ledger and makes no claims about broker acknowledgement, delivery confirmation, or unreported lifecycle transitions. Selecting a timeline mark reveals that returned record; the ledger’s native “Show on timeline” buttons provide the keyboard-operable DOM alternative. Records without a valid returned schedule time remain available in the ledger but are not plotted. Empty responses say that no records were returned; API failures say the timeline is unavailable, or explicitly identify the last successful response when one remains visible. No placeholder records or statuses are invented.

The assignment centers on timestamped event records and lifecycle states, which a 2D schedule timeline represents directly. A spatial 3D scene would not add domain information beyond that returned data.

## Illustration and iconography
An original two-dimensional event path—schedule point, event envelope, consumer endpoint—drawn in inline SVG. Status markers use distinct geometric shapes as well as color. No stock photography or unrelated lab imagery.

## Motion and interaction
A 240ms card insertion follows a confirmed schedule; the event path draws once when reduced motion permits, not as a loop. The timeline does not animate statuses or imply transitions; its selectable SVG marks support pointer, Enter, and Space, and matching native buttons are available in the ledger. Button press has a subtle 1px tactile response; loading is tied to actual requests; invalid scheduling remains native and accessible. Respect `prefers-reduced-motion` for all motion, including the existing event-path and ledger effects.

## Mobile art direction
Turn the workbench into a full-width composition sheet followed by a chronological dispatch list. Give date/time inputs the full viewport width and avoid side-by-side controls on narrow screens.

## Accessibility
Use semantic form labels, keyboard-accessible controls, visible cobalt focus against ivory, WCAG AA text contrast, status text and icons in addition to color, `aria-live` request feedback, and reduced-motion support.

## Favicon
Use the scalable `frontend/public/dispatch-lab.svg` cobalt dispatch pin and orbit on graphite, wired through the frontend document head. Keep the existing in-page brand mark unchanged.
