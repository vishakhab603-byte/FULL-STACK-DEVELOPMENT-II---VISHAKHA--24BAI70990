# Full-Stack Experiments

Five independent full-stack learning projects, Experiments 06–10. Experiments 06–07 are in `UNIT 2`; Experiments 08–10 are in `UNIT 3`. Each project has its own run guide.

| Experiment | Product | Focus | Evidence status |
|---|---|---|---|
| 06 | [Experiment 6](<UNIT 2/EXPERIMENT 6/README.md>) | Pagination, fetch joins, cache, native SQL | ZIP instructions |
| 07 | [Experiment 7](<UNIT 2/EXPERIMENT 7/README.md>) | JWT/RBAC/AES plus secure, optimized read APIs | User approved both numbered sources |
| 08 | [Experiment 8](<UNIT 3/EXPERIMENT 8/README.md>) | Kafka scheduled publishing, retries, DLQ, idempotency | ZIP instructions |
| 09 | [Experiment 9](<UNIT 3/EXPERIMENT 9/README.md>) | CI/CD, automated tests, containers, canary | ZIP instructions |
| 10 | [Experiment 10](<UNIT 3/EXPERIMENT 10/README.md>) | Social publishing calendar, scheduling, analytics | Provisional prior-thread description; PDF scan has no text layer and no ZIP |

## Independent design directions

Each application has its own product philosophy, typography, visual system, motion, and responsive art direction:

- [Experiment 6 precision observatory](<UNIT 2/EXPERIMENT 6/DESIGN-BRIEF.md>)
- [Experiment 7 identity bastion](<UNIT 2/EXPERIMENT 7/DESIGN-BRIEF.md>)
- [Experiment 8 creative dispatch laboratory](<UNIT 3/EXPERIMENT 8/DESIGN-BRIEF.md>)
- [Experiment 9 operations concourse](<UNIT 3/EXPERIMENT 9/DESIGN-BRIEF.md>)
- [Experiment 10 social editorial](<UNIT 3/EXPERIMENT 10/DESIGN-BRIEF.md>)

The chosen typefaces were checked against their [Google Fonts SIL Open Font License texts](https://github.com/google/fonts/tree/main/ofl). They are loaded with system fallbacks and `display=swap`.

Start with [`SOURCE-INVENTORY.md`](SOURCE-INVENTORY.md) for attachment-level evidence and known limits. See [`VERIFICATION.md`](VERIFICATION.md) for build/test results. Social publishing in Experiment 10 is a local simulation, not a real external-platform integration.

## Collection verification

From the repository root, enter the linked project directory under its unit, then run `npm install` and `npm run build` in `frontend`. For example: `cd "UNIT 2/EXPERIMENT 6/frontend"`. Run backend tests from that project's `backend` directory with `mvnw.cmd test` on Windows or `./mvnw test` on Unix. Experiment 8 also needs Kafka (`docker compose up -d`). Use Java 17+ and Node 18+.
