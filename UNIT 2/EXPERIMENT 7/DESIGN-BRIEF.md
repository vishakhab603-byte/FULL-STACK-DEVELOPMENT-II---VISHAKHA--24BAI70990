# Experiment 7 — Identity Bastion

## Product philosophy
Make access control legible without exposing or overstating security. The interface distinguishes an authenticated session, the current user role, and the task permissions that the backend actually enforces.

## Audience and personality
For developers exploring authentication, JWT refresh, role-based access, and protected read APIs. Resolute, discreet, precise, and reassuring rather than alarmist.

## Visual identity
A midnight-green identity bastion with a luminous emerald perimeter and faint topology lines: ink `#07110f`, forest `#10221c`, jade `#63d5a5`, pale mint `#c6f4df`, and warm alert `#f0a08c`. An original segmented shield-and-keyhole mark is constructed with inline SVG.

## Typography
Sora for headings and interface copy; JetBrains Mono for token metadata, role codes, and session details; system sans-serif fallbacks. Both Google Fonts families use the SIL Open Font License: [Sora](https://raw.githubusercontent.com/google/fonts/main/ofl/sora/OFL.txt), [JetBrains Mono](https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/OFL.txt). Load with preconnect and `font-display: swap`, never blocking first paint.

## Information architecture and grid
Authentication uses a focused split composition: identity mark and security explanation beside one compact credential form. After sign-in, a full-width access workspace replaces that composition: user/session summary, role-relevant actions, and protected tasks. No persistent app sidebar.

## Components and visualizations
Use defensive geometry, a restrained perimeter motif, and crisp, dark-green surfaces. Render only real session fields and actual task data. The interactive Session access map uses the authenticated response's username, role, and backend-supplied `permissions` array, which mirrors the protected task route rules (`tasks:read`, `tasks:create`, `tasks:update`, and `tasks:delete`). Keyboard-operable DOM buttons select a permission and update its SVG connection and a text explanation of the permission key and endpoint. If an older or incomplete response has no permissions array, all grants are shown as unavailable and no permissions are inferred from the role. A token-inspection disclosure remains an explicit demonstration control. Never imply threat detection, MFA, audit events, or live security scoring that the backend does not provide.

The backend exposes a session permission snapshot but no event stream or spatial security telemetry. Keep this identity topology as a compact, interactive SVG/DOM map; a 3D perimeter would imply unsupported security state.

## Illustration and iconography
Draw an original shield outline with keyway and two guarded paths; keep decorative SVG static. Small line icons use a consistent 1.5px stroke, with visible labels or accessible names.

## Motion and interaction
An 180ms perimeter illumination acknowledges focus and successful sign-in; protected content enters with a short 220ms opacity transition. Session expiry and request errors are announced immediately and offer a clear re-authentication path. No pulsing threat indicators or fabricated timelines. The access-map selection is available without animation; its state transitions and workspace entrance are reduced to effectively no motion under `prefers-reduced-motion`.

## Mobile art direction
Stack the compact identity introduction above credentials. In the authenticated state, place identity and sign-out first, then the task list; keep role and session details readable without a horizontally scrolling dashboard.

## Accessibility
Use real labels, keyboard-operable controls, visible high-contrast focus, accessible password entry, semantic status announcements, WCAG AA contrast, and reduced-motion support. Permission differences are described in text, not color alone.
