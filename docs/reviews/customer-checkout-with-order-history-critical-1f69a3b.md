# Critical Review — customer-checkout-with-order-history (PRD, lightweight) — round 1

Reviewed SHA: 1f69a3b0c3b61f7e4a6722cbd73ffc67efa13beb Base: dd6ea25 Date (UTC): 2026-10-20 Reviewer: critical-reviewer (Claude Opus 5.5)
Inputs: PRD docs/requirements/customer-checkout-with-order-history.md@1f69a3b (revision 3), charter docs/project-charter.md@1f69a3b, CLAUDE.md; ADR: none (Phase 4 not started); OpenAPI: none; CI run: n/a (docs-only change); scans: none run (no code in the diff)

## Verdict

BLOCKED — 3 High findings (CR-checkout-001, -002, -003) must be resolved in a PRD revision before HG-1 approval. They are requirement-level defects: as written, the stated requirements cannot all be met together, or they let paid-order data be corrupted.

## Prior findings re-verified

| ID     | Previous status | Result on this SHA | Evidence |
| ------ | --------------- | ------------------ | -------- |
| (none) | First round     | n/a                | n/a      |

## New findings

| ID              | Severity | Category                       | Location                      | Title                                                                              | Blocking |
| --------------- | -------- | ------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------- | -------- |
| CR-checkout-001 | High     | requirements/state-model       | PRD L54, L106-110, L140, L273 | Provider success after expiry/cancel/failure not handled                           | Yes      |
| CR-checkout-002 | High     | requirements/idempotency       | PRD L49, L74-75, L96, L110    | "Checkout attempt" and order creation point undefined                              | Yes      |
| CR-checkout-003 | High     | requirements/data-integrity    | PRD L54, L141, L153, L334     | No snapshot of product data on order lines; re-seeding can alter paid orders       | Yes      |
| CR-checkout-004 | Medium   | requirements/ambiguity         | PRD L77, L178                 | Price-change detection and recovery undefined                                      | No       |
| CR-checkout-005 | Medium   | requirements/ambiguity         | PRD L329                      | OQ-21 line limit garbled, no AC                                                    | No       |
| CR-checkout-006 | Medium   | security/authorization         | PRD L53, L225                 | Auth rule contradicts the provider callback; confirmation page has no ownership AC | No       |
| CR-checkout-007 | Medium   | security/open-redirect         | PRD L161, L203, L206          | Return-to-page has no same-origin restriction                                      | No       |
| CR-checkout-008 | Medium   | security/session-management    | PRD L237, L297                | Session rotation not required                                                      | No       |
| CR-checkout-009 | Medium   | security/authentication        | PRD L205, L238-239            | Lockout reveals accounts / enables lockout DoS / window undefined                  | No       |
| CR-checkout-010 | Medium   | requirements/edge-cases        | PRD L97, L151                 | Amount bounds and amount-mismatch handling unspecified                             | No       |
| CR-checkout-011 | Medium   | requirements/nfr-measurability | PRD L228, L236-240            | Load model undefined; NFR-17 conflicts with NFR-13 and NFR-15                      | No       |
| CR-checkout-012 | Medium   | security/pci                   | PRD L47, L224                 | SAQ A eligibility conditions not specified                                         | No       |
| CR-checkout-013 | Medium   | requirements/failure-modes     | PRD L93, L230                 | No AC for provider timeout at initiation                                           | No       |
| CR-checkout-014 | Medium   | security/rate-limiting         | PRD L227                      | No rate limits on catalogue, cart, history or callback                             | No       |
| CR-checkout-015 | Low      | requirements/ambiguity         | PRD L95                       | Live-credential AC is either/or                                                    | No       |
| CR-checkout-016 | Low      | requirements/traceability      | PRD L344-367                  | Trace table omissions                                                              | No       |
| CR-checkout-017 | Low      | security/authentication        | PRD L191-193, L236            | Password bytes vs characters; hash input limit; DB uniqueness constraint           | No       |
| CR-checkout-018 | Low      | requirements/ambiguity         | PRD L138, L142, L229          | Audit retention, immutability and hashing vague                                    | No       |
| CR-checkout-019 | Low      | requirements/ambiguity         | PRD L237                      | CSRF wording and scope                                                             | No       |
| CR-checkout-020 | Info     | process/evidence               | PRD L5, L12, L305             | Accept-all decisions; HG-1 is the only evidence                                    | No       |

## Details

Full evidence, rationale, recommended fix and verification criteria for each finding are in the findings JSON. Key points:

- **CR-checkout-001 (High):** AC-4.5 expires the order at 30 minutes and AC-7.3 makes expired, cancelled and failed terminal, while refunds are out of scope. A customer who pays at minute 29, with the callback arriving at minute 31, is charged for an order that is hidden and can never be paid. This contradicts REQ-6. Cancellation also relies on a browser claim alone, unlike REQ-4. Fix: the provider session must expire before the order does, the outcome of a late success must be defined, cancellation must be verified with the provider, and the reconciliation interval must be set.
- **CR-checkout-002 (High):** REQ-5's "per checkout attempt" has no definition. Two tabs, or editing the cart during a pending payment, can produce two charges, or empty the cart of unpaid lines when payment succeeds (AC-4.6). Fix: define the key (one active pending order per customer, tied to a cart snapshot), when the order is created, and what happens to the cart while payment is pending.
- **CR-checkout-003 (High):** prices change only by re-seeding (OQ-26). Nothing requires order lines to keep their own copy of name and unit price, and AC-8.6 only tests seeding an empty database. Re-seeding with paid orders present can rewrite or cascade-delete paid order data. Fix: snapshot product data on order lines, never hard-delete products, and add a re-seed AC with existing orders.
- **Medium security group (006–009, 012, 014):** the provider callback cannot have customer auth, so its exemption must be stated explicitly, and the confirmation and payment-status endpoints need ownership ACs. There is an open redirect in the return-to-page ACs. Session rotation is claimed as a mitigation in R-9 but absent from NFR-14. Lockout responses may reveal accounts, contradicting NFR-16, and allow lockout DoS. PCI SAQ A script-integrity conditions are missing, and this needs a qualified assessor. Rate limits leave most endpoints unprotected.
- **CR-checkout-011:** NFR-15's 20-per-IP sign-in limit would rate-limit a single-source k6 test, so NFR-17 cannot be verified as written.

## Coverage statement

**Reviewed:**

- The whole PRD at 1f69a3b (sections 1–13): every REQ, US, AC, NFR, assumption, dependency, out-of-scope item, risk and resolved question.
- Each item cross-checked against the charter (sections 2, 5, 6, 7, 9) and the CLAUDE.md rules (DTO whitelist, auth guard, ownership, migrations with rollback).
- The traceability table checked row by row against the ACs.
- Guide sections 9.3–9.6 used for the criteria and formats.

**Not reviewed:**

- `docs/governance/role-register.md`: not opened. It was approved at HG-0 and only R-7 refers to it.
- The other file changed in this diff (a ~22-line edit to `customer-checkout-with-order-history.json`, path not resolved in this review; likely an SDLC state or status file): not inspected.
- Other guide sections, including section 7.4.
- No ADR, OpenAPI, data model, code or tests exist yet (Phase 4 not started), so implementation, contract conformance and test quality were out of scope.
- No security scanners were run: the change is documentation only, with no code, dependencies or IaC to scan.

The PRD's statement that the Product Owner's decisions were given in the orchestrator session cannot be verified from the repository (see CR-checkout-020).

**Limits:** this is a lightweight requirements review. It is not a penetration test, a formal threat model, or a PCI DSS or privacy compliance assessment. SAQ A eligibility (CR-checkout-012) and the authentication design (R-9) need confirmation by a qualified human at HG-3/HG-5.
