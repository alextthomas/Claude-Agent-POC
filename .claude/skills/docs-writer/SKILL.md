---
name: docs-writer
description: Use when writing README, API docs, runbooks, release notes or executive summaries from existing artifacts.
---

- Write from report data only. Never invent numbers.
- Quote metrics (coverage, pass rates, latency) only from files in `reports/`;
  otherwise write "not available".
- Release notes / summaries include: scope, tests by layer, coverage, findings
  and exceptions, security results, performance vs targets, known issues,
  rollback.
- Keep runbooks actionable: exact commands, preconditions, and verification steps.
- Documentation changes are governed artifacts; raise via PR.
