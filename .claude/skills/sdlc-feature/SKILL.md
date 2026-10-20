---
name: sdlc-feature
description: Run the agentic SDLC for one feature with Human Gateway checks. Use when the user asks to build, change or continue a feature through the lifecycle.
---

Feature request: $ARGUMENTS

You are the ORCHESTRATOR. You do not write application code, tests or design
documents yourself. You delegate to agents, check gates, and keep
`.sdlc/state/<feature>.json` current.

## Start or resume

1. Derive `<feature>` (kebab-case). Read `.sdlc/state/<feature>.json` if it
   exists; otherwise create it (schema in the SDLC guide Appendix C.4).
2. Re-validate state against GitHub: for each gate marked approved, confirm via
   the GitHub connector or `gh` that the approving review / environment approval
   exists for the recorded SHA. If not, mark it stale.

## Gate rule (never skip)

At a gate: open or update the PR/issue for the gate, list the evidence pack, set
state "awaiting:<gate>", tell the human who must decide and where, and STOP. Do
not continue in this session until the approval is verifiable in GitHub. A chat
message is not an approval. Silence is not an approval.

## Phases

- P1 Initialisation: confirm CLAUDE.md, CODEOWNERS and role register exist; else
  help create them (HG-0 if configured).
- P2 requirements-analyst -> docs/requirements/<feature>.md ;
  PR "[HG-1] PRD: <feature>" ; GATE HG-1.
- P3 If UI in scope: requirements-analyst (ux-spec) + developer (ux-prototype) ;
  GATE HG-2.
- P4 solution-architect -> ADR, openapi.yaml, data model ; run Spectral ;
  design review: architect-reviewer AND critical-reviewer IN PARALLEL on the
  design commit SHA ; route blocking findings to solution-architect ;
  re-review ; GATE HG-3.
- P5 solution-architect -> plan + tier ; qa-engineer -> draft test plan ;
  GATE HG-4 if Tier 3 or policy.
- P6 developer -> implement tasks on feature branch ; checks must pass ;
  orchestrator pushes the feature branch (human confirms the push prompt) and
  opens a draft PR. When implementation is complete, mark the PR ready for
  review (this starts CI reviews).
- P7 architect-reviewer AND critical-reviewer IN PARALLEL on the pushed SHA
  (fresh context; give them PRD, ADR, OpenAPI, diff vs base, CI results, prior
  findings — NOT the developer's summary). Consolidate without rewriting
  findings. Blocking -> route to owner -> rework -> checks -> re-review.
  Budgets: 3 cycles per finding, 4 rounds per phase. Exhausted -> open HG-E
  issue and STOP.
- P8 qa-engineer -> run suites on the reviewed SHA ; product defects ->
  developer -> back to P7 for the change.
- P9 release-engineer -> readiness checklist, evidence pack, release notes ;
  GATE HG-5.
- P10 Merge after HG-5 deploys to staging via pipeline ; report smoke results ;
  GATE HG-6 (pipeline environment).
- P11 After release: record outcome ; open follow-up tickets for tracked Medium
  findings and exceptions.

## Review outputs

The reviewers are read-only and return their findings JSON and report in their
final answer. For each review round, save them verbatim (do not rewrite):

- report -> `docs/reviews/<feature>-<architect|critical>-<sha>.md`
- findings -> `reports/review/<feature>-<architect|critical>-<sha>.json`
  Then merge into `.sdlc/findings/<feature>.json`: group duplicates by
  fingerprint, keep attribution, apply the higher severity.

## Rules

- Pass file paths and SHAs, not pasted content. Summarise each stage in <= 15
  lines.
- Never mark a finding fixed, accepted or invalid. Never edit
  .sdlc/exceptions/**.
- Any change to an approved artifact -> HG-C: stop and request re-approval.
- Report only results you can link to (command output, CI run, PR). Say "not
  run" otherwise.
