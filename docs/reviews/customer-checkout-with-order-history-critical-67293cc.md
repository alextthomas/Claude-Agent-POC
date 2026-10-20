# Critical Review — customer-checkout-with-order-history — round 4 (final budgeted round, PRD)

Reviewed SHA: 67293ccc76f0589f80360a48567a5210ad0f81f6 Base: dd6ea25 (main); delta reviewed against round-3 SHA 7d4107c Date (UTC): 2026-10-20 Reviewer: critical-reviewer (Claude Opus 5.5, claude-opus-5-5)
Inputs: PRD docs/requirements/customer-checkout-with-order-history.md@67293cc (revision 8); docs/project-charter.md and CLAUDE.md (HG-0 context); prior findings reports/review/...-critical-1f69a3b.json, -de317a9.json, -7d4107c.json; .sdlc/state/customer-checkout-with-order-history.json@67293cc; guide Sections 9.3 to 9.6. No ADR, OpenAPI or CI run exists (Phase 2). Scans: none run (gitleaks not installed; semgrep, npm audit and trivy do not apply to a documentation-only diff).

## Verdict

PASS WITH NON-BLOCKING FINDINGS

The only blocking finding, CR-checkout-021, is resolved at PRD level; its integration-test part is traced to Phase 6/7. No new Critical or High findings. Open and non-blocking: 2 Medium (CR-036, CR-037), 4 Low (CR-031 partial, CR-033 partial, CR-038, CR-039) and 3 Info (CR-020, CR-030, CR-040). The Medium findings must be fixed before release or tracked with an owner and due date (guide 9.4). Fixing CR-036 and CR-037 in the PRD before HG-1 is recommended, because both are short wording changes on the payment idempotency path.

## Prior findings re-verified

| ID              | Previous status       | Result on this SHA                                                        | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| :-------------- | :-------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CR-checkout-020 | open (Info)           | Partially resolved (still open; resolves only at HG-1)                    | 11.3 L480-485 lists OQ-40, OQ-46, OQ-47 and the risks as checkboxes. OQ-46 L471 says "Decided by the Product Owner", but .sdlc/state at the same SHA says "awaiting:PO-decision:CR-checkout-021" (head_sha 7d4107c). OQ-47 L472 turns reviewer suggestions into Product Owner decisions. No HG-1 PR yet.                                                                                                                                                                                                                                          |
| CR-checkout-021 | open (High, blocking) | Resolved (PRD level)                                                      | US-13 preamble L269: the per-email slot covers "waiting or being checked" and is released only when the check ends. My own check of the bound in any 900-s window gives n <= 62, which matches NFR-15 L322 and OQ-46 L471. AC-13.13 L283 is the staggered scenario (every 3 s, 15 IPs, at most 24 checks, identical responses), and it tells the designs apart (about 21 checks if correct, about 90 if broken). AC-13.11 L281 now expects exactly 1 check. The per-email 429 is removed (L282). The integration tests are pending for Phase 6/7. |
| CR-checkout-030 | open (Info)           | Partially resolved (wording resolved; Product Owner confirmation pending) | R-12 L411 describes targeted denial that lasts as long as the attack, through the slot, with about 3 IPs. Listed in 11.3 L484.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| CR-checkout-031 | open (Low)            | Partially resolved                                                        | Cap aggregation and the per-IP audit-only rule are in NFR-22 L329 and AC-7.6 L203 (the 100-events test is present). No grouping for rejected callbacks (triggerable by anyone, L346) or for long-running conditions.                                                                                                                                                                                                                                                                                                                              |
| CR-checkout-032 | open (Low)            | Resolved                                                                  | AC-3.17 L152 (minute 26) and AC-3.18 L153 (minutes 24 and 20) give exact order and session outcomes. The boundary is consistent with REQ-23 L103, REQ-24 L104, AC-3.13 L148 and AC-4.10 L168. Side effects are raised as CR-036 and CR-037.                                                                                                                                                                                                                                                                                                       |
| CR-checkout-033 | open (Low)            | Partially resolved                                                        | AC-13.7 L277 states which value is used and includes `/%252F%252Fevil.example`. But under the stated rule that input passes every check and goes to the same-origin path `/%2F%2Fevil.example`, not the catalogue.                                                                                                                                                                                                                                                                                                                                |
| CR-checkout-034 | open (Low)            | Resolved                                                                  | AC-4.4 L162: automatic check every 5 s, 12 per minute within 60 (L340), and the working 60 + 10 + 5 = 75 s <= 90 s with a 10-s stub. REQ-24 L104 bounds a pass at 60 s.                                                                                                                                                                                                                                                                                                                                                                           |
| CR-checkout-035 | open (Low)            | Resolved                                                                  | All 25 REQ rows (L491-515) checked against all 15 US headings in both directions; every AC is traced.                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Regression spot-checks of findings resolved earlier (no regression found):

- CR-009/CR-021 enumeration: NFR-16 L323 and AC-13.9 L279 are unchanged. The rejected-without-check path is the same for existing and unknown emails.
- CR-014 rate limits: the NFR-20 table L333-347 is intact, and the sign-in row is updated for OQ-46.
- CR-022 cart version: REQ-23 L103 still has it.
- CR-024 duplicate payment: AC-4.11 L169 is unchanged, but see CR-036.
- CR-027 redirect: the AC-13.7 base rule is intact.
- R-15 L414 and R-16 L415 match the removed per-email cap (200 / 5 = 40 IPs, correct).

## New findings

| ID              | Severity | Category                 | Location                     | Title                                                                                                                                                 | Blocking |
| :-------------- | :------- | :----------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| CR-checkout-036 | Medium   | data-integrity/payments  | PRD L103, 150, 152, 153, 169 | Early close of a pending order with an open provider session does not require cancelling the session, and duplicate review covers only expired orders | No       |
| CR-checkout-037 | Medium   | requirements/state-model | PRD L103, 148, 150, 168      | REQ-23 and AC-3.15 require a new order for a never-confirmed session, contradicting the same-order retry of AC-3.13 and AC-4.10                       | No       |
| CR-checkout-038 | Low      | security/authentication  | PRD L269, 361, 374           | Per-email sign-in slot has no release rule for crashed instances or abandoned requests                                                                | No       |
| CR-checkout-039 | Low      | security/session         | PRD L162, 274, 321           | Automatic payment status checks may extend the 30-minute idle session timeout                                                                         | No       |
| CR-checkout-040 | Info     | operations/jobs          | PRD L104, 170, 329           | Reconciliation pass bound of 60 s is unachievable sequentially during a provider outage and may trigger job-missed alerts                             | No       |

## Details

### CR-checkout-036 (Medium)

- **Evidence:** AC-3.18 (L153, new) closes an order whose session is still open at minute 24 "after the provider confirms no payment was taken". AC-3.15 and AC-3.17 and the REQ-23 rule use the same wording. None of them requires cancelling the session first, unlike AC-3.9 L144 and AC-4.3 L161. The old hosted page stays payable until minute 25 while a new order and session exist, so a double charge is possible. AC-4.11 L169 flags duplicates only when order A "expired".
- **Recommended fix:** require the old session to be cancelled and confirmed closed before the new order is created, and widen AC-4.11 to expired, cancelled or failed.
- **Verification:** an AC for the old tab paid after 'Pay' at minute 24 is rejected, with at most 1 charge; AC-4.11 covers a cancelled order A.

### CR-checkout-037 (Medium)

- **Evidence:** revision 8 added "or none was ever confirmed" (AC-3.15 L150) and "never-confirmed" (REQ-23 L103), with no time condition. That contradicts AC-3.13 L148 (same order and key while at least 5 minutes remain) and AC-4.10 L168 (the minute-10 retry example). For one scenario the documents give two different expected order counts.
- **Recommended fix:** apply the never-confirmed branch only when less than 5 minutes remain.
- **Verification:** retries at minutes 10, 20 and 21 each map to exactly one AC, and all the rules agree.

### CR-checkout-038 (Low; architect note)

- **Evidence:** the slot is "free again only when the holder's check has ended" (L269), held in a shared store (D-8). There is no lease for a crashed instance or a client disconnect, so the slot could stay taken forever, which is a hard lockout and contradicts REQ-19.
- **Recommended fix:** state a lease bound (for example 20 s).
- **Verification:** a kill-the-holder test.

### CR-checkout-039 (Low)

- **Evidence:** 5-second automatic checks (L162) versus the 30-minute idle timeout (NFR-14 L321). Nothing says whether polling counts as activity, when it stops, or how a 401 is handled.
- **Recommended fix:** polling does not reset the idle timer and stops at a final state or a 401, or the Product Owner accepts the extension.
- **Verification:** an idle-tab expiry test.

### CR-checkout-040 (Info; architect note)

- **Evidence:** a 60-s pass bound with 10-s timeouts (L104) is broken by more than 6 sequential lookups during an outage. "Missed run" (L329) is undefined.
- **Recommended fix and verification:** the D-7 ADR sets parallelism or a circuit breaker and defines a missed run.

### CR-checkout-031 and CR-checkout-033 (partially resolved, Low)

Details are in the findings JSON: grouping for rejected-callback and long-running alerts; the AC-13.7 double-encoded example's expected result does not follow from the rule.

## Coverage statement

Reviewed:

- The full revision-8 PRD (L1-522), with focus on the diff `git diff 7d4107c 67293cc -- docs/requirements/`, read in full and with word-diff for the session-rule text.
- The round-3 findings file. Titles and severities of round-1 and round-2 findings, to avoid re-raising them and for regression spot-checks.
- The `.sdlc/state` diff at this SHA.
- Guide Sections 9.3 to 9.6.

Checked by hand:

- The NFR-15 guess-rate bound (any-window argument) and the AC-13.13 limit, against both the correct and the broken mechanism.
- The AC-4.4 timing arithmetic.
- Section 12 traceability, all rows in both directions.
- Each AC-13.7 negative example against the stated rule (assuming WHATWG URL parsing).

Not reviewed:

- docs/reviews/*-7d4107c.md and the .sdlc/findings JSON in detail (only finding statuses checked; none were changed to fixed by the author).
- docs/project-charter.md, beyond relying on the HG-0 approval.
- Any code, OpenAPI, ADR or data model, because none exists in Phase 2.
- CI results, because this is a documentation-only PR.

Not performed:

- Security scans. gitleaks is not installed; semgrep, npm audit and trivy do not apply to a documentation-only diff.
- Whether the HG-1 PR exists. gh was not used, because my Bash access is limited to git, lint, test and scanner commands.
- Computing sha1 fingerprints, for the same reason. The input strings are given for the orchestrator to hash; CR-020 and CR-021 reuse their existing hashes.

This review is not a penetration test, threat model or PCI/compliance assessment. SAQ A eligibility (NFR-1, R-14), the authentication design (R-9) and the sign-in denial and resource-exhaustion residual risks (R-12, R-15, R-16) need confirmation by a qualified human at HG-3/HG-5, as the PRD itself requires. No suspicious instructions were found in the reviewed content.
