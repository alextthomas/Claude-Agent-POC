# Critical Review — customer-checkout-with-order-history — round 3

Reviewed SHA: 7d4107c5ce08bc92bd0be6fa9664f605e6220265 Base: dd6ea25 (main) Date (UTC): 2026-10-20 Reviewer: critical-reviewer (claude-opus-5-5)
Inputs: PRD docs/requirements/customer-checkout-with-order-history.md@7d4107c (revision 7); diff de317a9..7d4107c (stat); prior findings reports/review/customer-checkout-with-order-history-critical-1f69a3b.json and -de317a9.json; docs/project-charter.md (constraint search only); CLAUDE.md; guide Sections 9.3 to 9.6. CI run: none (documentation-only change). Scans: gitleaks not installed (not run); semgrep, npm audit and trivy not applicable (no code or dependency changes).

## Verdict

BLOCKED. One High finding is still open: CR-checkout-021, sign-in guess-rate bound under staggered concurrent attempts.

## Prior findings re-verified

| ID                            | Previous status     | Result on this SHA                         | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :---------------------------- | :------------------ | :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR-checkout-014               | open (Medium)       | Resolved                                   | The NFR-20 table (L316-330) lists every endpoint class named in the ACs with a numeric limit: catalogue, product, cart, summary 30/min, Pay 10/min, confirmation/status 60/min, history, detail, register, sign-in, sign-out 30/min, invalid-signature callback. Valid-signature callbacks are deliberately unlimited, with a reason (L330), which the round-2 fix allowed. NFR-4 (L294) defines checkout initiation as "Pay". Cosmetic: L310 "one 429 test per endpoint class" literally includes the unlimited class. |
| CR-checkout-016               | open (Low)          | Resolved                                   | AC-6.3 is in REQ-8 (L479) and REQ-9 (L480); AC-3.12 and 7.3 in REQ-11 (L482); AC-3.5 and 15.1 in REQ-22 (L493). A manual cross-check of all ACs in US-1 to US-15 against section 12 found no AC without a REQ. A separate US-column problem is new finding CR-checkout-035.                                                                                                                                                                                                                                             |
| CR-checkout-020               | open (Info)         | Partially resolved (resolves only at HG-1) | L8, L457 and L461-466 are reworded, and OQ-35's numbers are superseded by OQ-40 (L443, L448). OQ-40 to OQ-45 were again accepted together in the orchestrator session (L17). There is no HG-1 PR yet.                                                                                                                                                                                                                                                                                                                   |
| CR-checkout-021               | open (High)         | Partially resolved; still open, High       | Fixed: the burst case (arrival-counted f L253, single-flight, AC-13.11 L265, caps AC-13.12 L266). Not fixed: under staggered arrivals the delay limits how long each response waits, not how often passwords are checked. About 283 checks per 15 minutes are possible against the stated 62 (NFR-15 L305, OQ-40 L448), and AC-13.11's own test cannot detect this.                                                                                                                                                     |
| CR-checkout-022               | open (Medium)       | Resolved                                   | Cart version defined and single key rule (REQ-23 L89); AC-1.1 reworded (L101); retry after a terminal order (AC-3.14 L135); NFR-10 scenario "retry after failure with unchanged cart" (L300).                                                                                                                                                                                                                                                                                                                           |
| CR-checkout-023               | open (Medium)       | Resolved                                   | Absolute expiry at order creation plus 25 minutes, and no session after that (REQ-24 L90, AC-4.10 L152). Minute-27 'Pay' on an unchanged cart gives a new payable order with at most 1 pending (AC-3.15 L136). A related edge case is new finding CR-checkout-032.                                                                                                                                                                                                                                                      |
| CR-checkout-024               | open (Medium)       | Resolved                                   | AC-4.6 excludes late success (L148); AC-4.7 takes precedence (L149); duplicate case has an exact outcome (AC-4.11 L153); R-13 updated (L395); REQ-6 and AC-4.2 qualified (L72, L144).                                                                                                                                                                                                                                                                                                                                   |
| CR-checkout-025               | open (Medium)       | Resolved                                   | AC-4.12 (L154: retry every run, 24-hour alert, recovery) and AC-3.16 (L137: new checkout blocked); NFR-7 (L297); R-17 (L399).                                                                                                                                                                                                                                                                                                                                                                                           |
| CR-checkout-026               | open (Medium)       | Resolved                                   | REQ-25 (L91), NFR-22 (L312) and AC-7.6 (L187) name the conditions, thresholds, the 5-minute target and the recipient; AC-3.12 (L133) gives the customer message. Deduplication gap is new finding CR-checkout-031.                                                                                                                                                                                                                                                                                                      |
| CR-checkout-027               | open (Low)          | Resolved                                   | AC-13.7 (L261) defines the decode-and-parse rule and lists the backslash, encoded, %09 and tab examples. The value-used-for-redirect gap is new finding CR-checkout-033.                                                                                                                                                                                                                                                                                                                                                |
| CR-checkout-028               | open (Low)          | Resolved                                   | AC-2.3 (L115) now returns 400 for amount fields, consistent with AC-10.6; REQ-2 (L68) updated.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| CR-checkout-029               | open (Low)          | Resolved                                   | AC-4.4 (L146) now measures from when our server receives the result, with a 90 s bound on the lost-callback path (OQ-44 L452). The page update mechanism is new finding CR-checkout-034.                                                                                                                                                                                                                                                                                                                                |
| Round-1 001-013, 015, 017-019 | resolved in round 2 | No regression (spot-check)                 | 001 AC-4.7; 002 REQ-23; 003 REQ-21 and AC-15.2; 005 AC-10.7 and 10.8; 006 REQ-9 and AC-4.8; 007 AC-13.7; 008 AC-12.8 and 13.8; 009 AC-13.9; 010 AC-1.7 and 3.12; 011 NFR-21 and NFR-17; 012 NFR-19; 013 AC-3.13; 015 AC-3.3; 017 AC-12.10; 018 NFR-6 and AC-7.1; 019 NFR-14. All present at 7d4107c.                                                                                                                                                                                                                    |

## New findings

| ID              | Severity | Category                  | Location                | Title                                                                                                                    | Blocking |
| :-------------- | :------- | :------------------------ | :---------------------- | :----------------------------------------------------------------------------------------------------------------------- | :------- |
| CR-checkout-030 | Info     | security/authentication   | PRD L253, 266, 394, 443 | R-12 states lockout denial of service no longer exists but per-email cap and single-flight allow targeted sign-in denial | No       |
| CR-checkout-031 | Low      | operations/alerting       | PRD L187, 266, 312, 451 | Alert conditions have no deduplication and the sign-in cap alert can be triggered by any client                          | No       |
| CR-checkout-032 | Low      | requirements/state-model  | PRD L90, 134, 136, 152  | Retry after minute 25 under AC-3.13 and minimum remaining provider session lifetime are undefined                        | No       |
| CR-checkout-033 | Low      | security/open-redirect    | PRD L151, 206, 258, 261 | Return target rule does not require redirecting to the validated normalised value                                        | No       |
| CR-checkout-034 | Low      | requirements/testability  | PRD L146, 323           | AC-4.4 does not state whether the payment processing page updates automatically                                          | No       |
| CR-checkout-035 | Low      | requirements/traceability | PRD L118, 139, 482, 496 | Section 12 US column and US headings disagree for REQ-11 and REQ-25                                                      | No       |

## Details

### CR-checkout-021 (High, blocking, persisting)

Evidence. The US-13 preamble (L253) applies a delay of up to 16 s to each attempt before its password check. It allows only one check in flight per email, and an attempt whose delay ends while a check is running gets the generic failure without a check. The per-email cap is 5 waiting responses (AC-13.12, L266).

How it fails. Once f is 7 or more, an attacker sends attempts for one email about 3.2 s apart and keeps 5 waiting. Each attempt finishes waiting about 3.2 s after the previous one, when the previous check (100-500 ms) has finished, so each one gets a password check. That gives about 5 checks per 16 s, roughly 283 per 15 minutes, from about 15 IPs at 20 attempts per IP per 15 minutes.

NFR-15 (L305) and OQ-40 (L448) say "at most about 62 ... independent of the number of source IPs". AC-13.11's expected result ("at most one per 16 seconds") contradicts the mechanism. Its scenario (20 attempts at the same moment, so they all finish waiting together) would still pass against an implementation that allows the higher rate.

Rationale. REQ-19 (L85) requires protection "that holds under concurrent requests", and the residual risk would be accepted on a figure about 4.5 times too low.

Fix. Enforce minimum spacing between password checks per email (a check starts no earlier than the end of the previous check plus delay(f)), or cap waiting responses per email at 1. Correct the figure, add a staggered-arrival AC, and have the Product Owner re-confirm OQ-40 and R-12.

Verification. A staggered-arrival AC exists (attempts every 3 s for at least 5 minutes from 15 or more IPs, no more checks than the sequential schedule allows), and NFR-15's figure matches the mechanism.

Severity note. This is not a Product Owner-accepted residual risk: OQ-40 accepted 62, not about 283. If the Product Owner knowingly accepts the higher rate in writing, this would become Info.

### CR-checkout-020 (Info, persisting)

Evidence and fix as in the JSON. This can only be resolved at HG-1 with a checkbox per section 11.3 item. OQ-40 must be re-presented with the corrected figure.

### CR-checkout-030 (Info)

R-12 (L394) says lockout denial of service no longer exists. But an attacker who keeps 5 attempts waiting for a victim's email gets the victim immediate 429s (L266). An attacker who keeps one attempt in flight gets the victim generic failures without a password check (L253). Kept up, this blocks the account indefinitely. This is a Product Owner-accepted risk, so Info. Fix: reword R-12 to describe targeted denial and re-confirm at HG-1.

### CR-checkout-031 (Low)

Any client can trigger the per-IP cap (6 sign-in requests), and every cap event raises an alert (L266, L312), with no deduplication or aggregation. Alert flooding can hide the money alerts. Fix: aggregate the cap alert (one per cap type per 15 minutes with a count), keep per-event alerts for money conditions, and separate them by severity.

### CR-checkout-032 (Low)

A retry at minute 26 after an AC-3.13 timeout must use the same order (L134), but no session may be created after minute 25 (L152), and AC-3.15 (L136) only covers a session that "has closed". There is also no minimum remaining session lifetime. Fix: extend AC-3.15 to cover this case, set a minimum remaining lifetime, and add ACs for minute 26 and minute 24.

### CR-checkout-033 (Low)

AC-13.7 (L261) defines how the return target is checked, not which value is used for the redirect. A double-encoded `/%252F%252Fevil.example` passes the single-decode check and becomes `//evil.example` if it is decoded again when used. Fix: redirect only to the path, query and fragment of the parsed, validated URL, with no further decoding; add the double-encoded negative example.

### CR-checkout-034 (Low)

AC-4.4 (L146) has 30 s and 90 s targets but only a "refresh action"; it does not say whether the page checks for updates automatically. The 90 s figure also ignores the length of a reconciliation pass when provider calls take up to 10 s. Fix: state automatic checking at a fixed interval within the 60-per-minute limit, and bound the reconciliation pass.

### CR-checkout-035 (Low)

The REQ-11 row (L482) lists only US-7, although its ACs come from US-3, 4, 6, 12 and 13. The REQ-25 row (L496) omits US-13. The US-3 and US-4 headings omit REQ-11 and REQ-25. Fix: align the US column and the headings with the AC column.

### Resolved without a new finding: CR-checkout-022, 024, 025, 028

Line evidence is in the table above. I found no new contradictions in REQ-23, AC-3.9, 3.14, 3.15, 3.16, 4.6, 4.7, 4.11 or 4.12. At most one active pending order per customer is a data-integrity rule. Phase 4 should back it with a database constraint (for example a partial unique index) and not rely only on application logic; this is noted for the architect and not raised as a finding.

## Coverage statement

Reviewed:

- The whole PRD at 7d4107c (L1-503): all REQs, US-1 to US-15 ACs, NFR-1 to NFR-22, the NFR-20 table, assumptions, dependencies, out of scope, risks R-1 to R-17, section 11 (OQ-1 to OQ-45), and traceability in section 12.
- The diff file list for de317a9..7d4107c.
- Round-1 and round-2 findings JSON.
- Guide Sections 9.3 to 9.6, the review-findings schema, and CLAUDE.md.
- docs/project-charter.md, for its constraints on synthetic data, test-mode payments and PCI scope, and tier expectations. No charter conflicts found.

Not reviewed:

- Contents of .sdlc/findings/_.json, .sdlc/state/_.json and docs/reviews/*-critical-de317a9.md changed in this commit. These are process records, not the artifact; I did not check whether the register matches this report.
- The rest of the guide.
- No code, OpenAPI, ADR or UX artifacts exist yet; they are out of scope for Phase 2.

Not done:

- No secrets scan: gitleaks is not installed. semgrep, npm audit and trivy are not applicable to a documentation-only change.
- Fingerprints for new findings are given as their sha1 input string; I could not compute sha1 under my Bash limits.

This is an adversarial requirements review. It is not a penetration test, formal threat model or PCI/SAQ A compliance assessment; those need qualified humans at HG-3 and HG-5, as R-14 and NFR-1 already state. I marked no finding verified-fixed, accepted or invalid; resolution status is for the orchestrator and gate owners to record.
