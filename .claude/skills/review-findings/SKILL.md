---
name: review-findings
description: Use when producing, re-verifying or consolidating Architect Review or Critical Review findings.
---

- Output a JSON array matching `schema.json` in this folder (fields: id,
  fingerprint, reviewer, reviewed_sha, severity, category, title,
  location{file,lines}, evidence, requirement_refs, rationale, recommended_fix,
  verification, blocking, status).
- Severity (guide Section 9.4):
  - Critical: exploitable security flaw, data loss/corruption, legal or
    regulatory breach, or failure of a mandatory control. Blocks merge,
    release and deployment.
  - High: significant defect or design violation likely to cause incidents,
    a security weakness, or an undeclared deviation from the approved design.
    Blocks merge and release.
  - Medium: quality/robustness issue with limited impact. Fix before release
    or track with owner and due date.
  - Low: minor improvement (advisory). Info: observation.
    Critical and High are blocking. Weakened tests are High. Undeclared design
    deviation is High. Never downgrade a finding raised by the other reviewer.
- Fingerprint = sha1(category | file | normalised title). Reuse the ID of a
  prior finding with the same fingerprint; never re-raise an existing issue as
  new.
- Re-review: for each prior finding report verified-fixed, still-open or
  regressed WITH evidence (file:line, test name and result). A developer
  statement is not evidence.
- Always include a coverage statement: what you reviewed and what you did not.
