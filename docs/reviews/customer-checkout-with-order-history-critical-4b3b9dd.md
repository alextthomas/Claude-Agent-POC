# Critical Review: HG-C-1 PRD change, round 2 (lightweight)

- Feature: customer-checkout-with-order-history
- Reviewed SHA: 4b3b9ddc11aa648fbeb0c215feaf926cfb084702 (docs/prd-hgc1-session-keepalive), PRD revision 10
- Approved base: 9927ee5 (revision 8, HG-1, PR #2). Round-1 SHA: 1f6ff05.
- Reviewer: critical-reviewer (read-only)

## Verdict

**No blocking findings, so it can go to HG-1 re-approval.** CR-checkout-041 (High) is resolved. No new Critical or High findings. There is one new Medium (CR-checkout-049) and three new Lows (050 to 052). Partly open: CR-checkout-044 (the UX part, out of scope here) and CR-checkout-046 (one changelog omission). Under Section 9.4 the Medium needs a fix or an owner and due date before release.

## 1. Re-check of prior findings (results only; no status changes made)

Line numbers refer to head 4b3b9dd.

| ID              | Sev    | Result                           | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR-checkout-039 | Low    | Unchanged (fix-proposed)         | Revision 10 does not change AC-13.18 or AC-13.19 (L309-310). AC-4.4 L179 only adds "they are marked as automatic requests (AC-13.27)". The executable test is still pending implementation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| CR-checkout-041 | High   | **Resolved**                     | Base L321 Verification: "...CSRF negative tests; log/URL scan". Head L358: "...CSRF negative tests (AC-13.20); log/URL scan; idle, warning, ... (AC-13.14 to 13.19, 13.21 to 13.29)". The normalised word diff only adds text. Section 12 L562 also says "the log/URL scan retained from revision 8". Revision 9 changelog L19 now declares the earlier removal.                                                                                                                                                                                                                                                                                                                                         |
| CR-checkout-042 | Medium | **Resolved** (requirement level) | Preamble L290: the server exposes the idle and absolute expiry, and the UI derives warning times from them; the warning state is consistent across tabs. AC-13.24 (L315) covers the expiry source. AC-13.25 (L316) is exactly the two-tab criterion (activity in tab B at 27 minutes, no warning in tab A at 28 minutes). AC-13.26 (L317) covers "Stay signed in" across tabs. A new, separate gap is raised as CR-checkout-049 (clock skew).                                                                                                                                                                                                                                                            |
| CR-checkout-043 | Medium | **Resolved** (PRD part)          | L290: the client marks automatic requests (client-asserted, mechanism decided in Phase 4); the timer resets only on successful (2xx/3xx) unmarked requests; rejected requests leave the expiry unchanged. AC-13.27 (L318) and OQ-51 (L514, SPA navigation) back this. The Phase 4 ADR and integration test parts of the criterion come later. The wording inconsistency left over is CR-checkout-051 (Low).                                                                                                                                                                                                                                                                                              |
| CR-checkout-044 | Medium | **Partially resolved**           | PRD part met: AC-13.28 (L319) covers 403, 429, 5xx and network errors (warning stays, error message, retry, expiry unchanged; 401 goes to AC-13.4). AC-13.29 (L320) covers dismissal by other activity. UX part ("S-01 states the matching UI for 403, 429 and 5xx") is on the UX branch, out of scope for this SHA, so it is not verified. Follow-on gaps: CR-checkout-050 and 052.                                                                                                                                                                                                                                                                                                                     |
| CR-checkout-045 | Low    | **Resolved**                     | AC-13.23 (L314) states min(W, L - 2 minutes), or immediately if fewer than 2 minutes remain. The example matches the criterion: last activity at 7 h 31 min gives the warning at 7 h 58 min, plus or minus 5 seconds. Both worked examples check out arithmetically. The preamble L290 and NFR-14 L358 agree. A minor boundary wording slip is in CR-checkout-050.                                                                                                                                                                                                                                                                                                                                       |
| CR-checkout-046 | Low    | **Partially resolved**           | The two wrong items are corrected (L19 now reads "AC-13.15 to 13.23 new" and "(no other row of that table changed)"), and the NFR-14 removal is declared. The criterion "every hunk is listed" is still not met: the revision 9 diff against 9927ee5 changed the section 11.1 introduction (base L422 → 1f6ff05 L444, added "OQ-48 and OQ-49 (revision 9, HG-C-1) are decided 'pending HG-1 re-approval'"), and the revision 9 entry lists only "section 11.1 (OQ-48 and OQ-49 added as decided)". The revision 10 entries (L20-21) match the 1f6ff05..4b3b9dd hunks. The 11.1 introduction change is listed in the L21 addendum. Separator-row dash changes (L344, L463, L535) are declared as padding. |
| CR-checkout-047 | Info   | **Resolved** (PRD part)          | NFR-9 L353: "The 8-hour absolute session limit (NFR-14, OQ-49) is treated as essential under WCAG 2.2.1 (security control) (OQ-50)". OQ-50 (L513) is decided by the PO, pending HG-1, and listed in 11.3 L526. The HG-1 approver still has to confirm it.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| CR-checkout-048 | Info   | Out of scope for this SHA        | It concerns docs/ux/ on another branch. The PRD records "no PRD change" (L35).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## 2. Scope and integrity of the whole change against 9927ee5

- Changed lines in the PRD: header (L3-5, L8), changelog (L19-21), the new finding map (L23-35), REQ-18 (L115), AC-4.4 (L179), the US-13 heading, story, preamble and AC-13.14 to 13.29 (L282-320), NFR-2, NFR-9, NFR-14 and NFR-20 (L346, 353, 358, 364), the keep-alive row of the NFR-20 table (L383), and sections 11.1, 11.2, 11.3 and 12 (L460-562).
- Every change concerns session activity, the keep-alive action, the absolute-limit warning and its accessibility basis. That is within HG-C-1 (issue #3, UX section 9 and S-01).
- **No approved text was removed or weakened.** I extracted every token the `-w` word diff removes. Each one is either a revision or status token, or is replaced by a superset: "(AC-3.7)." → "(AC-3.7); keep-alive ...", "11.7)" → "11.7, 13.21)", "OQ-39)" → "OQ-39, OQ-50)", "OQ-29)" → "OQ-29, OQ-48, OQ-49)", "OQ-45)" → "OQ-45, OQ-48)", "US-4" → "US-4, US-13", "4.9" → "4.9, 13.18, ...", "table;" → "table, the keep-alive row ...". The NFR-14 requirement, target and verification text is kept word for word and only extended.
- The only purely visual changes are table separator dash counts, which are padding.
- Other files in the diff (.sdlc/findings, .sdlc/state, the round-1 review report and JSON) are SDLC records, not approved artifacts. I did not review them for content.

## 3. New findings

| ID              | Sev    | Title                                                                                                                                                     |
| --------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CR-checkout-049 | Medium | Warning timing from server expiry times does not address client clock skew (L290, L315, L358)                                                             |
| CR-checkout-050 | Low    | Effect of user activity on a displayed absolute-limit warning is unspecified; the AC-13.23 boundary says 7 h 59 min, but the real threshold is 7 h 58 min |
| CR-checkout-051 | Low    | User activity definition still says every user-initiated request resets the timer, which contradicts AC-13.27 and OQ-51                                   |
| CR-checkout-052 | Low    | Keep-alive retry after 403 or 429 cannot succeed as specified (no token refresh, no Retry-After)                                                          |

Product Owner decisions were not challenged: OQ-50, OQ-51, the 2xx/3xx-only reset rule, and the 5-second tolerance. In CR-051 only the wording is in question, not the rule. Fingerprints are written in the "sha1(category|file|normalised title)" format because no hashing was done.

## Security scan

gitleaks, semgrep and trivy are not installed in this environment, so none was run. npm audit does not apply to a documentation-only diff. A manual grep of the diff for secret patterns found nothing. Requirement-level security checks on the new text:

- Keep-alive needs authentication, CSRF protection and a rate limit (NFR-2, NFR-14, AC-13.20 to 13.22).
- Exposing session expiry times reveals no credential.
- Marking a request as automatic is client-asserted, so a tampered client can keep its own session alive, but never past the 8-hour cap (AC-13.17). Already accepted as low risk under CR-043.

This is not a penetration test, a security or compliance assessment, or a WCAG conformance audit. A conformance check of the warning behaviour is still needed at HG-3.

## Coverage statement

**Reviewed:**

- `git diff -w 9927ee5 4b3b9dd` and `git diff -w 1f6ff05 4b3b9dd` of docs/requirements/customer-checkout-with-order-history.md, using a normalised word diff and a full token-removal extraction.
- Head lines 1-40, 286-321, 344-383 (the changed NFR rows) and 455-566.
- The base text of every changed row.
- The revision 9 hunk list, checked against the changelog.
- The prior findings file reports/review/customer-checkout-with-order-history-critical-1f6ff05.json.

**Not reviewed:**

- PRD sections the change does not touch, apart from checking them for contradictions with the new text.
- The UX spec (c441580, other branch), so CR-048 and the UX part of CR-044 were not checked.
- The content of .sdlc/* and the round-1 review files.
- The guide sections were not re-read in this round; severity follows Section 9.4 as given in the review-findings skill.
- No tests or CI exist for a PRD-only change, so none were run. Every result is document evidence only.

## Relevant paths

- c:\Users\alext\Innovation Incubator\Projects\Claude Agent POC\docs\requirements\customer-checkout-with-order-history.md
- c:\Users\alext\Innovation Incubator\Projects\Claude Agent POC\reports\review\customer-checkout-with-order-history-critical-1f6ff05.json
