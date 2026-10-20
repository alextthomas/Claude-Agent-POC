# Critical Review — customer-checkout-with-order-history — round 2

Reviewed SHA: de317a9aea242db2d6157b6791133ed90793be90 Base: dd6ea25 (main); prior round SHA 1f69a3b Date (UTC): 2026-10-20 Reviewer: critical-reviewer (Claude Opus 5.5)
Inputs: PRD docs/requirements/customer-checkout-with-order-history.md@de317a9 (revision 5); diff 1f69a3b..de317a9; docs/project-charter.md; CLAUDE.md; round-1 findings reports/review/customer-checkout-with-order-history-critical-1f69a3b.json. ADR, OpenAPI: none yet (Phase 4). CI run: none (documentation only). Scans: none run (gitleaks, semgrep and trivy are not installed in this environment; a manual keyword search for secrets in docs/ found nothing).

## Verdict

BLOCKED. One new High finding is open (CR-checkout-021, brute-force control can be bypassed with parallel requests). All three round-1 High findings are resolved at PRD level.

## Prior findings re-verified

"Resolved" means the round-1 verification criterion is met at PRD level. Later parts of each criterion (Phase 4 state diagram, integration tests) are still future work. No finding is marked verified-fixed, accepted or invalid; the orchestrator and humans decide status.

| ID                     | Previous status | Result on this SHA                         | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :--------------------- | :-------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR-checkout-001 (High) | open            | Resolved                                   | REQ-24 L96 (25-minute session < 30-minute expiry, provider cancel on expiry, reconcile every 60 s, 10 s timeout); AC-4.7 L151 (late success: expired/cancelled/failed -> paid, audit, integration test named); AC-7.3 L183 transition table; AC-4.3 L147 cancel verified with the provider; retry creates a new order (REQ-23 L95, AC-4.2 L146); AC-4.9 L153 covers the idle-timeout case. Residual issues raised as new CR-023, -024, -025, -029. |
| CR-checkout-002 (High) | open            | Resolved                                   | REQ-23 L95 defines attempt and creation point; AC-3.8 L134 (two tabs: 1 order, 1 payment), AC-3.9 L135 (edit then re-checkout), AC-3.10 L136 (edit while pending), AC-3.11 L137; NFR-10 L296 states the key. Residual key inconsistency raised as new CR-022.                                                                                                                                                                                      |
| CR-checkout-003 (High) | open            | Resolved                                   | REQ-21 L93; AC-15.1 L276 (snapshot, detail reads stored values); AC-15.2 L277 (re-seed of non-empty DB, byte-for-byte unchanged, sum == total); AC-15.3 L278 (no hard delete); REQ-20 L92.                                                                                                                                                                                                                                                         |
| CR-checkout-004        | open            | Resolved                                   | AC-1.4 L109 (cart updated to current price, not-purchasable lines flagged); AC-1.6 L111 (second checkout succeeds at new price); AC-11.1 L223; OQ-38 L420 defines the purchasable flag.                                                                                                                                                                                                                                                            |
| CR-checkout-005        | open            | Resolved                                   | REQ-16 L88 "at most 50 distinct lines"; OQ-21 L403 restated (re-confirm at HG-1); AC-10.7 L216 (51st -> 409), AC-10.8 L217 (50th accepted).                                                                                                                                                                                                                                                                                                        |
| CR-checkout-006        | open            | Resolved                                   | REQ-9 L81 and NFR-2 L288 name the callback as the only exemption, authenticated by signature; AC-4.8 L152 confirmation/status ownership -> 404 identical body plus audit; REQ-9 trace L439 includes 4.8.                                                                                                                                                                                                                                           |
| CR-checkout-007        | open            | Resolved                                   | AC-13.7 L259 with the https://, // and javascript: negative examples; referenced from AC-9.3 L204, AC-13.4 L256, AC-4.9 L153. Hardening gap raised as new CR-027 (Low).                                                                                                                                                                                                                                                                            |
| CR-checkout-008        | open            | Resolved                                   | NFR-14 L300 "a new credential is issued on every successful sign-in and registration"; AC-12.8 L243 and AC-13.8 L260 (old credential replayed -> 401).                                                                                                                                                                                                                                                                                             |
| CR-checkout-009        | open            | Resolved                                   | Hard lockout replaced by progressive delay (OQ-35 L417); AC-13.9 L261 identical status, body and headers for unknown vs existing email over 8 attempts; window, reset and ageing in AC-13.10 L262; R-12 L370. The new design has its own weakness: new CR-021 (High).                                                                                                                                                                              |
| CR-checkout-010        | open            | Resolved                                   | REQ-22 L94 (integer cents, $0.50 to $999,999.99, mismatch not paid); AC-1.7 L112 (min-1, min, max, max+1); AC-3.12 L138 mismatch -> failed plus audit; AC-15.4 L279. Charged-but-failed alerting gap raised as new CR-026.                                                                                                                                                                                                                         |
| CR-checkout-011        | open            | Resolved                                   | NFR-21 L307 load model (50 VUs, 1 to 3 s think time, ramp, duration, mix, instance size recorded, load source allow-listed in staging as a recorded deviation, 50 distinct accounts with f <= 2); NFR-17 L303 throttled sign-ins excluded. Rough check: about 3 hashes per second at the stated mix needs about 1.5 cores at 500 ms per hash, which is feasible.                                                                                   |
| CR-checkout-012        | open            | Resolved                                   | REQ-3 L75 narrowed to full redirect or provider iframe; NFR-19 L305 CSP plus script inventory with a measurable check; NFR-1 L287 and R-14 L372 human SAQ A confirmation at HG-3/HG-5. Not a PCI assessment.                                                                                                                                                                                                                                       |
| CR-checkout-013        | open            | Resolved                                   | AC-3.13 L139 (timeout or outage at Pay: retryable error, order pending, cart unchanged, same provider key on retry, at most 1 payment); NFR-7 L293; 10 s timeout in REQ-24 L96.                                                                                                                                                                                                                                                                    |
| CR-checkout-014        | open            | Partially resolved                         | NFR-20 L306 adds numeric limits, but the confirmation/payment-status, order-summary and sign-out classes and valid-signature callbacks are not listed, although the NFR claims "every endpoint class".                                                                                                                                                                                                                                             |
| CR-checkout-015        | open            | Resolved                                   | AC-3.3 L129 has a single behaviour (refuse to start); detection method deferred to Phase 4.                                                                                                                                                                                                                                                                                                                                                        |
| CR-checkout-016        | open            | Partially resolved                         | All round-1 gaps fixed (L431, 439, 441, 449; verification column in section 6). Still missing: AC-6.3 L173 has no REQ; the REQ-11 row omits AC-3.12 and 7.3; the REQ-22 row omits AC-3.5 and 15.1.                                                                                                                                                                                                                                                 |
| CR-checkout-017        | open            | Resolved                                   | NFR-13 L299 (full input, no truncation, case-insensitive unique email constraint); AC-12.9 L244 (concurrent registration); AC-12.10 L245 (NFC code points, 72-byte test).                                                                                                                                                                                                                                                                          |
| CR-checkout-018        | open            | Resolved                                   | AC-7.1 L181 HMAC with a secret from the environment; AC-7.5 L185 teardown record kept outside the environment (location fixed in Phase 4); NFR-6 L292 insert-only DB role with an UPDATE/DELETE-denied check.                                                                                                                                                                                                                                      |
| CR-checkout-019        | open            | Resolved                                   | NFR-14 L300 reworded: every state-changing request including sign-in, registration and sign-out without a valid token -> 403.                                                                                                                                                                                                                                                                                                                      |
| CR-checkout-020 (Info) | open            | Not resolved (can only be checked at HG-1) | L15: OQ-31 to -39 "All others accepted as proposed"; OQ-35 numbers still "confirm at HG-1" (L301, L417) while L8 and L425 say "No open questions". L460 asks for row-by-row confirmation; the HG-1 PR does not exist yet.                                                                                                                                                                                                                          |

## New findings

| ID              | Severity | Category                       | Location                    | Title                                                                                                                      | Blocking |
| :-------------- | :------- | :----------------------------- | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------- | :------- |
| CR-checkout-021 | High     | security/authentication        | PRD L251, 255, 301, 373     | Progressive delay does not bound password guessing under concurrent requests and the stated maximum guess rate is unproven | Yes      |
| CR-checkout-022 | Medium   | requirements/idempotency       | PRD L77, 95, 139, 146, 296  | Checkout attempt idempotency key is inconsistent between REQ-23, NFR-10 and AC-3.13 and cart version is undefined          | No       |
| CR-checkout-023 | Medium   | requirements/state-model       | PRD L96, 134, 139, 149      | Provider session lifetime is ambiguous and reuse of a pending order after its provider session has closed is undefined     | No       |
| CR-checkout-024 | Medium   | requirements/contradiction     | PRD L78, 146, 150, 151, 371 | Late success recovery contradicts cart handling in AC-4.6 and can produce two paid orders for the same cart                | No       |
| CR-checkout-025 | Medium   | requirements/failure-modes     | PRD L135, 147, 149, 293     | Order transitions that require provider confirmation have no defined behaviour when the provider is unreachable            | No       |
| CR-checkout-026 | Medium   | operations/alerting            | PRD L138, 151, 297, 333     | No alerting requirement for charged-but-not-paid outcomes and payment job failures                                         | No       |
| CR-checkout-027 | Low      | security/open-redirect         | PRD L259                    | Same-origin relative path rule does not cover backslash and encoded variants                                               | No       |
| CR-checkout-028 | Low      | requirements/contradiction     | PRD L120, 215, 289          | AC-2.3 ignoring tampered fields contradicts forbidNonWhitelisted validation                                                | No       |
| CR-checkout-029 | Low      | requirements/nfr-measurability | PRD L96, 148                | AC-4.4 30-second final-state target is inconsistent with 60-second reconciliation interval                                 | No       |

## Details

### CR-checkout-021 (High, blocking)

- **Evidence:** f is counted "before the current attempt" (L251), and only the response is delayed. No 429 is allowed from the per-email count (L255, L301). Nothing requires attempts for one email to be checked one at a time. N parallel attempts are all checked, so the "about 56 attempts per 15 minutes" figure (L301) holds only for sequential attempts. The per-IP limit (20 per 15 minutes) can be avoided by using many IPs. Responses held open for up to 16 s (R-15, A-9) are limited only per IP.
- **Rationale:** REQ-19 brute-force protection is a mandatory Tier 3 control, and its replacement can be bypassed with parallel requests. The Product Owner would accept R-12 based on a wrong figure.
- **Fix:** At most one attempt per email checked at a time; delay enforced before the password check; f increased when an attempt arrives; correct the claim; cap on responses held open at once; Product Owner re-confirms OQ-35 and R-12.
- **Verification:** AC: 20 parallel wrong attempts for one email (from several IPs) produce no more password checks than the sequential schedule allows, and existing and unknown emails behave identically.

### CR-checkout-022 (Medium)

- **Evidence:** The key is "customer plus cart version" (REQ-23, NFR-10), but a retry with an unchanged cart after failure creates a new order with the same key (REQ-23, AC-4.2). The provider key is per order (AC-3.13). Cart version is not defined: it is unclear whether the AC-1.4 price refresh or the AC-4.6 reduction changes it. AC-1.1 says "no order record exists yet", which is false when a pending order already exists.
- **Fix:** Define cart version. The key rule applies only to _active_ pending orders. Relate the two keys. Add an AC for paying again after a failure with an unchanged cart.
- **Verification:** A single key rule in the PRD, plus that AC.

### CR-checkout-023 (Medium)

- **Evidence:** REQ-24 "last 25 minutes" vs AC-4.5 "25 minutes after order creation". A session created on retry (AC-3.13) could outlive the order. If the customer pays between minutes 25 and 30 with an unchanged cart, REQ-23 reuses a closed session, which is a dead end.
- **Fix:** Absolute session expiry at order creation plus 25 minutes, and no session created after minute 25. 'Pay' on an order whose session has closed closes that order early and creates a new one.
- **Verification:** ACs for a session created on retry at minute 10, and for 'Pay' at minute 27.

### CR-checkout-024 (Medium)

- **Evidence:** AC-4.6 says the cart is reduced whenever an order becomes paid; AC-4.7 says the cart is unchanged on a late success. Paying again after expiry (order B paid) followed by a late success for order A gives two paid orders for one cart, with no refund and no alert. REQ-6 and AC-4.2 say "not charged".
- **Fix:** State which rule applies; add an AC, an operator flag and an alert for the double-paid case; record the residual risk under R-13; reword REQ-6 and AC-4.2.
- **Verification:** An AC with an exact expected outcome for that scenario.

### CR-checkout-025 (Medium)

- **Evidence:** Cancel, supersede and expiry all need provider confirmation (AC-3.9, 4.3, 4.5). Provider failure is defined only at 'Pay' (AC-3.13, NFR-7). An order could stay pending forever, and a customer who changed the cart could be blocked from a new checkout.
- **Fix:** ACs for provider outage during these transitions: retry behaviour, what the customer sees, an alert after a stated limit, and whether a new checkout is allowed.
- **Verification:** ACs, then an integration test with a failing provider stub.

### CR-checkout-026 (Medium)

- **Evidence:** An amount mismatch (AC-3.12) charges the customer and fails the order with only an audit event; a late recovery (AC-4.7) is audit only; NFR-11 and NFR-7 cover only correlation ids, the health endpoint and uptime; job health (D-7) is not monitored.
- **Fix:** An NFR with named alert conditions and thresholds and a named recipient.
- **Verification:** The NFR exists; a stub test fires the alerts.

### CR-checkout-027 (Low)

- **Evidence:** AC-13.7's examples can pass with a naive check; `/\evil.example` and percent-encoded variants are not covered.
- **Fix:** A rule based on parse-and-compare-origin, plus extra negative examples.
- **Verification:** AC lists the variants.

### CR-checkout-028 (Low)

- **Evidence:** AC-2.3 says tampered values are "ignored", while NFR-3 and AC-10.6 reject unknown fields with 400.
- **Fix:** Reword AC-2.3 so such requests are rejected with 400.
- **Verification:** AC-2.3 and AC-10.6 agree.

### CR-checkout-029 (Low)

- **Evidence:** The 30-second target is measured from the "provider's result", but without a callback our server learns the result only at the next 60-second reconciliation.
- **Fix:** Measure from receipt by our server, or relax the target for the reconciliation path.
- **Verification:** The AC can be met on both paths.

### CR-checkout-014, -016, -020

These persist. Updated evidence is in the JSON.

## Coverage statement

**Reviewed:**

- The full PRD at de317a9 (revision 5, L1-460), including the finding map, REQ-1 to REQ-24, US-1 to US-15 and all their ACs, NFR-1 to NFR-21, assumptions, dependencies, out of scope, risks R-1 to R-15, decisions OQ-1 to OQ-39, the section 12 traceability table (cross-checked mechanically against the US headings) and the approval section.
- Each of the 20 round-1 findings against its verification criterion.
- The approved charter (sections 1-9) for conflicts. None found: REQ-3 is narrower than the charter's "hosted page or tokenisation", which is allowed.
- CLAUDE.md rules: found the forbidNonWhitelisted conflict (CR-028).
- The .sdlc findings register and state file changed in de317a9, to check that no finding status had been changed by the author. All 20 are still "open".
- Fingerprints for new findings computed as sha1(category|file|title, lowercased with punctuation removed), the same method as round 1 (reproduced for CR-checkout-001).

**Not reviewed:**

- The round-1 report markdown (my own prior output; I used the JSON).
- The SDLC guide outside Sections 9.3-9.6.
- Any code, ADR, OpenAPI or data model; none exist yet (Phase 4).
- UX: Phase 3 has not started.
- CI results: none for a documentation-only change.

**Scanners:** gitleaks, semgrep, trivy and npm audit were not run. They are not installed, and there is no package manifest to audit. A manual keyword search for secrets under docs/ returned no matches.

This review is not a penetration test, a formal threat model or a PCI DSS / SAQ A compliance assessment. SAQ A eligibility (NFR-1, NFR-19, R-14) and the residual authentication risks (R-12, R-15, CR-021) need confirmation by qualified humans at HG-1, HG-3 and HG-5.
