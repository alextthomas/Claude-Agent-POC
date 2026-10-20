# Critical Review — customer-checkout-with-order-history — PRD revision 9 (HG-C-1) — round 1

Reviewed SHA: 1f6ff05ee216d39bc52eb85d1246e1ded226070b Base: 9927ee5 (rev 8, approved HG-1, PR #2) Date (UTC): 2026-10-20 Reviewer: critical-reviewer (Claude Opus 5.5)
Inputs: PRD docs/requirements/customer-checkout-with-order-history.md @1f6ff05 (diff vs 9927ee5); UX spec docs/ux/customer-checkout-with-order-history.md @c441580 (section 9 HG-C-1, S-01, J-20, UX-OQ-15); prior findings reports/review/customer-checkout-with-order-history-critical-67293cc.json; guide Sections 9.3 to 9.6; CLAUDE.md. CI run: n/a (docs-only). Scans: none (gitleaks, semgrep and trivy are not installed).

## Verdict

BLOCKED: one High finding, CR-checkout-041, an undeclared removal of the NFR-14 "log/URL scan" verification. It is a one-line fix. Otherwise the change fully implements HG-C-1 and is close to PASS WITH NON-BLOCKING FINDINGS.

## HG-C-1 conformance (task 1)

| HG-C-1 / UX item | PRD rev 9 evidence | Result |
| (a) Definition of idle activity | US-13 preamble L280; NFR-14 L342; AC-13.14 L295 | Implemented (see CR-043 for gaps) |
| Polling does not reset idle | AC-4.4 L169; L280; NFR-14 L342; AC-13.18 L299 | Implemented |
| Polling stops at final state / 401 | L280; AC-13.19 L300 | Implemented |
| (b) Keep-alive extends idle only, never past 8 h | L280; AC-13.16 L297; AC-13.17 L298 (1 s after limit returns 401; repeated actions) | Implemented |
| Warning 2 min before idle expiry, non-modal | AC-13.15 L296 (28 min, ±5 s tolerance) | Implemented; matches UX S-01 |
| Keep-alive auth | NFR-2 L330; AC-13.21 L302 | Implemented |
| Keep-alive CSRF | NFR-14 L342; AC-13.20 L301 | Implemented |
| Keep-alive rate limit (NFR-20) | NFR-20 table L365-367 (10/min/session, OQ-48); AC-13.22 L303 | Implemented |
| (c) Given/When/Then ACs, testable | AC-13.14 to 13.23 L295-304 | Testable for a single tab; multi-tab untestable (CR-042) |
| Absolute-limit-first behaviour | OQ-49 L496; AC-13.23 L304 | Added by PO decision; differs from UX S-01 (CR-048, Info); timing (CR-045) |
| Traceability | Section 12 REQ-6, REQ-9, REQ-18 rows; NFR verification paragraph L542 | Updated |

## Prior findings re-verified

| ID | Previous status | Result on this SHA | Evidence |
| CR-checkout-039 | open (Low) | Resolved at requirement level, so status fix-proposed (not verified-fixed: no test exists yet) | AC-4.4 L169 states polling is not activity and when it stops; AC-13.18 L299 is the 30-minute idle-tab test; AC-13.19 L300 gives 0 requests after a final state or 401; NFR-14 L342 |

CR-checkout-040 (Info, Phase 4 ADR) is outside this change and was not re-verified.

## Scope check (task 3)

I compared base and head after normalising whitespace and table-padding dashes. Changed lines are limited to: header (revision, status, convention), rev 9 changelog, the new HG-C-1 finding map, REQ-18, AC-4.4 (one added sentence), the US-13 heading, user story and preamble, AC-13.14 to 13.23, NFR-2, NFR-14, NFR-20 (row and new table row), sections 11.1, 11.2 and 11.3, and section 12 (REQ-6, REQ-9, REQ-18, NFR paragraph). No text outside these sections changed; all other diffs are padding. AC-13.1 to 13.13 and all other ACs are unchanged. One substantive change in scope is undeclared and out of HG-C-1 intent: the "log/URL scan" removal (CR-041).

## New findings

| ID | Severity | Category | Location | Title | Blocking |
| CR-checkout-041 | High | requirements/traceability | PRD L342, L19 | NFR-14 log/URL scan verification method removed without declaration | Yes |
| CR-checkout-042 | Medium | requirements/ambiguity | PRD L280, 296, 297, 304 | Warning timing source and multi-tab behaviour undefined | No |
| CR-checkout-043 | Medium | requirements/ambiguity | PRD L280, 342, 360 | User activity classification on shared endpoints and for rejected requests unspecified | No |
| CR-checkout-044 | Medium | requirements/completeness | PRD L297, 301, 303 | Keep-alive failure handling and warning dismissal by other activity unspecified | No |
| CR-checkout-045 | Low | accessibility/wcag | PRD L304, 507 | Absolute-limit warning can give less than 2 minutes notice | No |
| CR-checkout-046 | Low | documentation/accuracy | PRD L19 | Rev 9 changelog misdescribes AC-13.15 and NFR-20 table changes | No |
| CR-checkout-047 | Info | accessibility/wcag | PRD L337, 496 | 8-hour absolute limit has no recorded WCAG 2.2.1 exception basis (PO decision OQ-49) | No |
| CR-checkout-048 | Info | design/consistency | UX spec @c441580 L212, 474 | UX S-01 contradicts PRD OQ-49 absolute-limit warning | No |

## Details

Full evidence, rationale, recommended fix and verification for each finding are in the JSON. Summary:

- CR-041: the base NFR-14 Verification read "...; CSRF negative tests; log/URL scan". The head replaced "log/URL scan" with AC references. AC-7.2 still covers logs, but "0 credentials in URLs" now has no verification. Fix: restore "; log/URL scan".
- CR-042: the server holds the expiry times. The PRD does not say how the UI learns them (needed for the 28-minute warning and the "<local time>" in AC-13.23), or how several tabs on one session behave. Add the expiry source and a two-tab AC.
- CR-043: manual refresh and automatic checks use the same endpoint class, so the server needs a client marker, which is unstated. The rule for whether rejected requests (403, 429) reset the idle timer is also unstated.
- CR-044: no UI behaviour for a keep-alive that returns 403, 429, 5xx or a network error. No rule that other activity dismisses the warning.
- CR-045: in the within-2-minutes band the warning shows at the idle warning point, leaving L-W (2 minutes or less) of notice. Use min(W, L-2 min). The timing is declared for confirmation in section 11.3.
- CR-046: the changelog lists an "AC-13.15 cross-reference" (AC-13.15 is new) and a "Status column" change that did not happen, and omits CR-041.
- CR-047 (Info): the 8-hour limit is a WCAG 2.2.1 time limit shorter than 20 hours with no extension. Record the "essential" or exception basis.
- CR-048 (Info): UX S-01 still says no warning is shown for the 8-hour limit. Update the UX spec before HG-2.

Observation, not raised: the keep-alive rate limit is keyed by session, so requests without a valid session (AC-13.21, 401) have no per-session key. The sign-out row approved in rev 8 uses the same pattern, so I am not re-raising it.

## Coverage statement

Reviewed:

- The full whitespace-normalised diff 9927ee5..1f6ff05 of the PRD, the only file changed.
- Unchanged PRD text that the change touches or could contradict: AC-4.4, 4.9 and 4.12, AC-13.4, AC-7.2, NFR-9, NFR-14 and NFR-20, the endpoint table, sections 11 and 12.
- UX spec @c441580: section 9 HG-C-1, S-01, J-20, UX-OQ-15 and the copy list.
- Prior finding CR-checkout-039.
- Guide Sections 9.3 to 9.6.

Arithmetic checked: the AC-13.17 and AC-13.23 examples (7 h 35 min, giving a limit 25 minutes away; 7 h 31 min, giving a limit 1 minute after W).

Not reviewed:

- Code, tests, the OpenAPI contract and ADRs: none exist or changed for this PRD-only change.
- The rest of the UX spec, which is on a separate unmerged branch.
- PRD sections the change does not touch.
- Prior findings other than CR-039.
- GitHub issue #3 itself: I took its acceptance from the PRD and orchestrator statements and did not check it independently.

Scanners: gitleaks, semgrep and trivy are not installed, so no scan was run; npm audit does not apply to a docs-only diff. A manual check of the diff found no secrets.

Fingerprints are given as sha1(<input>) strings because hashing was not run (Bash is restricted to lint, test, scanner and git commands).

This review is not a penetration test, threat model, or accessibility/compliance assessment. WCAG 2.2.1 conformance of the session limits needs a qualified accessibility review at HG-3.
