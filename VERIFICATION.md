# Verification record

Latest full verification run: 2026-11-10 with Node 24.22.1, Microsoft OpenJDK 17.0.17, and Maven Wrapper 3.9.16.

## Frontend production builds

| Project | Result |
|---|---|
| Experiment 6 | PASS — Vite 8.3.0 |
| Experiment 7 | PASS — Vite 5.4.21 |
| Experiment 8 | PASS — Vite 5.4.21 |
| Experiment 9 | PASS — Vite 5.4.21 |
| Experiment 10 | PASS — Vite 5.4.21 |

All five frontends now provide an Oxlint command and their configured lint checks pass without warnings.

## Backend Maven tests

| Project | Passed | Failed | Skipped | Notes |
|---|---:|---:|---:|---|
| Experiment 6 | 2 | 0 | 0 | Task service unit tests |
| Experiment 7 | 5 | 0 | 0 | Task service and AES-GCM round-trip, tamper, and key-size tests |
| Experiment 8 | 2 | 0 | 0 | Retry/DLQ and duplicate-event tests; Kafka is not required for this unit suite |
| Experiment 9 | 17 | 0 | 1 | Unit, MockMvc, contract and canary tests; Docker-dependent Testcontainers test skipped |
| Experiment 10 | 2 | 0 | 0 | Future schedule validation and due-post publication tests |

Totals: 28 passed, 0 failed, 1 skipped. The Testcontainers test needs Docker. No performance benchmark, live Kafka-broker run, or external social-platform integration was performed.

## Data-driven interactions and responsive checks

Inspected the five running frontends in a browser at a 390 px viewport using browser-only intercepted API fixtures. Fixtures were not added to the applications and do not represent live backend data:

- Experiment 6: the completion ring matched a three-record response (two complete, one open); selecting “Complete” displayed two rows.
- Experiment 7: the session access map reflected permissions from the sign-in response, including an ungranted delete action.
- Experiment 8: schedule markers used two returned records; Enter and Space updated the selected record, and the ledger provided native-button alternatives.
- Experiment 9: configured and observed canary modes matched the fixture's 25% configuration and 3/1 routing counts, with a matching data table.
- Experiment 10: the timestamp-ordered schedule linked to its post, status filters worked, and reduced-motion mode used automatic scrolling.

All five inspected at 390 px without document-width overflow. The browser checks used fixtures, not the live Java services; actual backend success flows for Experiments 6, 8, 9, and 10 were not run. No WebGL/3D dependency was added: the available data—records, permissions, timestamps, and route proportions—is represented directly by product-specific SVG/DOM views. Each design brief explains why decorative 3D would add unsupported or misleading state.
