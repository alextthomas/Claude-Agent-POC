---
name: evidence-pack
description: Use when assembling the gate evidence pack for a release, tied to a commit SHA.
---

- Assemble `reports/<YYYY-MM-DD>-<version>/` bound to the release SHA.
- Include: diff summary, CI results, findings register (all rounds), active
  exceptions with expiry, test summary, coverage, traceability, security scans,
  SBOM, release notes, rollback plan.
- Every artifact must reference the release SHA. Do not include artifacts from a
  different SHA.
- The pack is a convenience mirror; the system of record is GitHub (PR reviews,
  environment approvals, audit log).
- Confirm the release-readiness checklist (guide Section 15.4) is complete,
  with an evidence link per item, before the pack is presented at HG-5:
  - [ ] All required CI checks green on the release SHA
  - [ ] Findings gate passed; active exceptions listed with expiry
  - [ ] Traceability: 100% of ACs mapped to passing tests
  - [ ] Performance results vs NFR targets attached (Tier 2/3)
  - [ ] Security scans, SBOM and licence report attached
  - [ ] Migration plan reviewed; rollback documented (rehearsed in staging for
        Tier 3)
  - [ ] Configuration per environment reviewed; secrets referenced, not embedded
  - [ ] Dashboards and alerts exist for new endpoints/jobs
  - [ ] Runbooks updated (deploy, rollback, incident)
  - [ ] Release notes and release summary written from report data only
  - [ ] Evidence pack references the release SHA
