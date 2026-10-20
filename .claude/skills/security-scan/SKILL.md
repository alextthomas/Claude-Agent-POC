---
name: security-scan
description: Use when running or triaging security scanners, or checking code against OWASP Top 10 and OWASP API Security Top 10.
---

- Run when available: `gitleaks detect`; `semgrep --config auto` (or project
  ruleset); `npm audit --omit=dev`; `trivy fs --severity CRITICAL,HIGH .`.
- Triage each result: true/false positive, reachable?, severity per review-findings (guide Section 9.4),
  file:line evidence, concrete fix.
- Checklist: BOLA/ownership, broken auth, injection (incl. `$queryRawUnsafe`),
  mass assignment, SSRF, rate limiting, security misconfiguration, sensitive
  data in logs, vulnerable dependencies.
- State clearly that this is not a penetration test or compliance assessment.
