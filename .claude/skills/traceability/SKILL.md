---
name: traceability
description: Use when establishing or checking the mapping from requirements to design, code, tests and releases.
---

- ID conventions: REQ-n (requirement), US-n (user story), AC-n.m (acceptance
  criterion, Given/When/Then), T-n (task).
- Maintain `reports/traceability.csv` with columns:
  REQ, US, AC, component/endpoint, test file, test name, status.
- Coverage check: 100% of ACs must map to at least one test (Tier 2/3).
- Every AC appears in at least one implementation task and one planned test.
- Report any AC with no mapped test or no mapped task as a gap.
