# Experiment source inventory and specification map

Inventory date: 2026-11-10 (Asia/Calcutta). Uploaded attachments are authoritative. The PDFs supplied here are image-only scans: PyPDF text extraction returned no text for every page, so no PDF wording is claimed as transcribed. Four ZIPs contain readable Markdown and source trees.

## Source attachments

| Attachment | Evidence | Result |
|---|---|---|
| `Exp 6(1).zip` | `INSTRUCTIONS.md`, `explanation.md`, source | Experiment 6: read APIs, pagination/sorting, JPA/H2, caching, N+1 mitigation with JPQL `JOIN FETCH`, native SQL. |
| `experiment_6(2).pdf` | 6 scanned pages | No text extracted; numbering/topic must be cross-checked against the archive. |
| `EXP-7.zip` | `INSTRUCTIONS.md`, `explanation.md`, source | Secure Auth Portal: Spring Security, JWT, RBAC, access/refresh token lifecycle, AES credential encryption, H2. The instruction file itself says “Experiment 7” but calls its focus a change from scalable read APIs. |
| `experiment_7.pdf` | 8 scanned pages | No text extracted. Prior conversation preview says this copy's title refers to scalable read APIs, which conflicts with the ZIP. |
| `experiment_7 (1).pdf` | 8 scanned pages | No text extracted. It is a duplicate-numbered but distinct attachment; topic cannot be confirmed from the binary text layer. |
| `EXP-8.zip` | `INSTRUCTIONS.md`, `explanation.md`, source | Kafka KRaft scheduled-post publishing: scheduler, producer/consumer, retry, DLQ, idempotency. |
| `Exp -9 .zip` | `INSTRUCTIONS.md`, `instruction.md`, `explanation.md`, source | CI/CD: JUnit, MockMvc, contract verification, Testcontainers, Docker, GitHub Actions, canary traffic and telemetry. |
| `experiment_9.pdf` | 10 scanned pages | No text extracted; archive indicates CI/CD. |
| `experiment_10.pdf` | 7 scanned pages | No text extracted; no Experiment 10 ZIP was attached. Earlier conversation preview calls it a Full-Stack Social Media Management System, while noting its page heading says Experiment 9. Treat the mapping as provisional. |

## Ambiguities preserved

1. **Experiment 7:** archive says secure authentication; the earlier conversation describes one PDF copy as scalable read APIs. Experiment 6 already covers scalable read APIs. Neither PDF is searchable in this environment. Both topics are combined in `UNIT 2/EXPERIMENT 7`; the read API classes and UI are added beside the archive security path.
2. **Experiment 10:** only a scanned PDF is present; the prior thread calls it Social Media Management, but its own page heading reportedly says Experiment 9. The project proceeds with the prior Social Media Management description. The mapping remains provisional because the page-level details remain unreadable.
3. **Product mapping:** Experiment 8 is clearly a Kafka publishing pipeline from its ZIP, while Experiment 9 is CI/CD. Names are assigned to match those specs; there is no source evidence for the earlier “WORKBENCH” label.

## Build limitations discovered

The checkout uses branch `main`, with `origin` set to the project GitHub repository. Node 24.22.1, Microsoft OpenJDK 17.0.17, and Maven Wrapper 3.9.16 were used for the latest verification. All five Vite production builds pass. Backend suites report 28 passes, 0 failures, and 1 Docker-dependent skip. See `VERIFICATION.md`.
