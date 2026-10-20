# Gate Role Register

Status: Submitted for HG-0 | Owner: @alextthomas (Engineering Lead) | Date: 2026-10-20

Authority is enforced by GitHub (CODEOWNERS, branch protection, environment reviewers),
not by this file. This file records who holds each role and why.

## 1. Role holders

| Role               | Holder                     | Deputy | Gates                                  |
| :----------------- | :------------------------- | :----- | :------------------------------------- |
| Engineering Lead   | @alextthomas               | none   | HG-0, HG-4, HG-5, HG-E, HG-X (Medium)  |
| Product Owner      | @alextthomas               | none   | HG-1, HG-2, HG-X scope decisions       |
| UX Lead            | @alextthomas               | none   | HG-2                                   |
| Solution Architect | @alextthomas               | none   | HG-3, HG-E (design loops), HG-X (High) |
| QA Lead            | @alextthomas               | none   | HG-5                                   |
| Security Lead      | @alextthomas               | none   | HG-3 and HG-5 for Tier 3, HG-X (High)  |
| Release Manager    | @alextthomas               | none   | HG-6                                   |
| Change control     | Owner of the affected gate | none   | HG-C                                   |

**Agent identity:** @alextthomasagent authors all agent branches, commits, PRs and
issues. It has the Write role, is never listed in CODEOWNERS, never approves, and cannot
change branch protection or environments.

## 2. Deviations from the guide (single-human team)

| #   | Guide expectation                                                  | Deviation                                       | Compensating control                                                                                               |
| :-- | :----------------------------------------------------------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| D-1 | Every gate has a named deputy (Section 7.4, Phase 1)               | No deputies                                     | SLA reminders (Section 8.5) go to the holder only; a timeout never approves; work waits                            |
| D-2 | HG-5 needs Engineering Lead + QA Lead (+ Security Lead for Tier 3) | One approval from @alextthomas covers all roles | The PR approval comment must state each role being exercised; evidence pack lists all role checklists              |
| D-3 | Separation between authoring and approving roles                   | All human roles held by one person              | Humans never author gated artifacts; agents author as @alextthomasagent; GitHub blocks self-approval               |
| D-4 | Organisation audit log (Section 8.4)                               | Personal account, no org audit log              | PR reviews and environment approvals are the record; orchestrator mirrors to `reports/<date>-<version>/gates.json` |

## 3. Platform controls (configured by @alextthomas, not by agents)

Branch protection for `main` (Settings → Branches → Add rule, or Rulesets):

- Require a pull request before merging; 1 required approval
- Require review from Code Owners
- Dismiss stale pull request approvals when new commits are pushed
- Require approval of the most recent reviewable push
- Require status checks to pass (add CI checks once Phase 6 creates them)
- Require conversation resolution before merging
- Do not allow bypassing the above settings (applies to administrators)
- Block force pushes and deletions

Environment `production` (created in Phase 9): required reviewer @alextthomas,
"Prevent self-review" on, deployment branches limited to `main`.

CODEOWNERS: `.github/CODEOWNERS` (committed by @alextthomas in 7c81c04); agents are denied
write access to that path.
