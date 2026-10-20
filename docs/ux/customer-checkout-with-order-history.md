# UX specification — Customer checkout with order history

Feature: `customer-checkout-with-order-history` | Phase 3 (UX and Prototype) | Revision 3
Status: **Submitted for HG-2 (UX Lead and Product Owner). Not approved.**
Author: requirements-analyst agent (ux-spec skill) | Input: PRD `docs/requirements/customer-checkout-with-order-history.md` revision 10 (re-approved at HG-1 in PR #4, merge f87d5eb, for HG-C-1 accepted in issue #3; treated as fixed and not changed here), `docs/project-charter.md`, `CLAUDE.md`, guide Section 7.4 Phase 3, Product Owner / UX Lead answer "accept all" of 2026-10-20 (given in the orchestrator session; binding only through the HG-2 PR review).

Revision history:

- Revision 1: first draft with 18 open UX questions (UX-OQ-1 to UX-OQ-18).
- Revision 2: all 18 UX questions decided ("accept all", 2026-10-20, pending HG-2) and the screen specs updated to state the decided behaviour; UX-OQ-15 (session-expiry warning with "Stay signed in") recorded as the design and raised as HG-C-1 because it is not clearly covered by NFR-14; journey count corrected to 24; "To confirm at HG-2" list added (section 7.2); status set to submitted for HG-2.
- Revision 3: aligned with PRD revision 10 (HG-C-1 resolved: keep-alive, AC-13.14 to AC-13.29, AC-4.4, NFR-9, NFR-14, NFR-20, OQ-48 to OQ-51). S-01 now specifies the 8-hour absolute-limit warning (CR-checkout-048; removes the earlier "no warning is shown for it"), the failed keep-alive states and dismissal by other user activity (CR-checkout-044, UX part), server-provided expiry times and cross-tab consistency; S-09 and J-17 state that automatic checks do not reset the idle timer and stop at a final state or on 401; new edge-case journey J-26; section 9 records HG-C-1 as resolved (no new HG-C request); coverage table extended to 130 ACs; "To confirm at HG-2" list extended; new UX question UX-OQ-19 (copy for the new S-01 states) raised and then decided by @alextthomas on 2026-10-20 (pending HG-2): the defaults proposed in the draft of this revision were accepted as written. Status stays "Submitted for HG-2".

## 0. How to read this document

- **Source tags.** "PRD" means the text or behaviour is fixed by the PRD. "UX copy" means the wording is written by the analyst, consistent with the PRD but not dictated by it, and covered by decision UX-OQ-1 (the Product Owner / UX Lead approves the copy at HG-2). No business rule is added: every behaviour the PRD does not define is a decision in section 7.1 and is listed for confirmation in section 7.2.
- **Accessibility target.** WCAG 2.2 AA (PRD NFR-9: 0 critical/serious axe violations on catalogue, product, cart, registration, sign-in, checkout, confirmation, history and detail screens; keyboard-only completable journeys; form errors programmatically associated; manual screen-reader check before HG-5). NFR-9 also records that the 8-hour absolute limit is treated as essential under WCAG 2.2.1 (OQ-50); this spec does not reopen it. Supported browsers and widths: NFR-12 (latest two versions of Chrome, Firefox, Safari, Edge; desktop and mobile widths; English only).
- **Money format.** Always USD as `$1,234.56` (AC-2.1, AC-8.4). Amounts are shown from server values; the UI never computes a total that is sent back (REQ-2, AC-2.3).
- **Hosted payment page.** The provider's page (or provider-hosted iframe fields) is external content, not specified here (REQ-3, D-3). Our pages never render card inputs (AC-3.2).
- **UI-facing stories.** US-1 to US-6 and US-8 to US-15 reach a screen. US-7 (audit, alerts, privacy of order data) has no customer screen: its outputs go to the audit log and the operator alert channel (Phase 4/9). It is listed as "not UI-facing" in the coverage table, not as a gap.
- **Dependencies on open review findings.** CR-checkout-036 and CR-checkout-037 concern order-retry rules around minutes 20 to 25 (AC-3.15, 3.17, 3.18, 4.10). See section 6.3; the screens are designed so either resolution can be shown.
- **Decision convention.** Decisions in section 7.1 are recorded as "Decided by: @alextthomas (Product Owner / UX Lead), 2026-10-20, pending HG-2" and are not final until the HG-2 PR is approved. References such as "UX-OQ-n" in the text point to the decision in section 7.1.

## 1. Screen inventory

| ID   | Screen                                            | Route (illustrative; routing design is Phase 4) | Access                    |
| :--- | :------------------------------------------------ | :---------------------------------------------- | :------------------------ |
| S-01 | Application shell (header, navigation, banners)   | all pages                                       | visitor and customer      |
| S-02 | Catalogue list                                    | `/` or `/products`                              | visitor and customer      |
| S-03 | Product detail                                    | `/products/:id`                                 | visitor and customer      |
| S-04 | Cart                                              | `/cart`                                         | customer                  |
| S-05 | Register                                          | `/register`                                     | visitor                   |
| S-06 | Sign in                                           | `/sign-in`                                      | visitor                   |
| S-07 | Checkout: order summary and Pay                   | `/checkout`                                     | customer                  |
| S-08 | Payment handoff (leaving for the hosted page)     | `/checkout/payment`                             | customer                  |
| S-09 | Payment outcome (confirmation and status)         | `/orders/:id/outcome`                           | customer, owner only      |
| S-10 | Order history                                     | `/orders`                                       | customer                  |
| S-11 | Order detail                                      | `/orders/:id`                                   | customer, owner only      |
| S-12 | Signed-out state                                  | `/signed-out`                                   | visitor                   |
| E-1  | Provider hosted payment page (external, not ours) | provider origin                                 | out of scope of this spec |

Routes are illustrative so that return-to-page rules (AC-13.7) can be described; the API and routing design is Phase 4. Only same-origin relative paths are ever used as return targets. URLs use the order id; the customer-facing order number is a separate identifier supplied by the API (UX-OQ-18).

## 2. User journeys

Notation: Entry -> Steps -> Exit. "Err" lists error branches. Each user story has one journey (J-1 to J-6 and J-8 to J-15; J-7 is unused so that journey numbers equal story numbers, and US-7 has none); edge-case journeys (J-16 to J-26) cover the situations the PRD calls out. Screen state names are defined in section 3.

### 2.1 One journey per user story

**J-1 (US-1) Start checkout.**
Entry: S-04 Cart, choose "Checkout" (cart has at least one line).
Steps: S-04 -> (Checkout) -> S-07 loading -> S-07 summary shown. No order is created and no payment started (AC-1.1).
Exit: S-07 summary ready to Pay (J-3).
Err: cart empty -> "Checkout" is unavailable on S-04 and, if reached directly, S-07 shows the empty-cart message (AC-1.2, AC-11.5). Visitor -> sign-in (J-22, AC-1.3). Mismatch -> J-16. Total out of range -> S-07 blocked state with range message (AC-1.7). Summary load error -> S-07 error with retry (AC-2.4). Pay-rate limit or pending-order conditions -> J-19, J-24.

**J-2 (US-2) Review order summary.**
Entry: S-07 after "Checkout".
Steps: S-07 loading -> lines (name, quantity, unit price, line total) and order total in USD (AC-2.1, AC-2.2).
Exit: customer chooses "Pay" (J-3) or "Back to cart" (S-04).
Err: load failure -> S-07 error state with "Try again"; cart unchanged (AC-2.4).

**J-3 (US-3) Pay by card via hosted payment.**
Entry: S-07 summary, choose "Pay".
Steps: S-07 "Pay" pressed (button disabled and busy, AC-3.4) -> S-08 handoff -> full redirect to E-1 (the design is the redirect; the provider-hosted iframe variant is an alternative state of S-08 and is decided in Phase 4, UX-OQ-2) -> customer pays on E-1 -> provider returns customer to S-09.
Exit: S-09 outcome (J-4).
Err: provider unavailable or timeout at "Pay" -> S-07 retryable error (J-19). Previous order cannot be closed -> S-07 blocked state (J-19). Superseded or reused order -> J-24. Amount or currency mismatch -> J-25. Double click or two tabs -> exactly one order and payment (AC-3.4, 3.8); both tabs lead to the same payment session.

**J-4 (US-4) See the payment outcome.**
Entry: return from E-1 (success, decline, cancel or no result yet) to S-09; or reopening `/orders/:id/outcome`.
Steps: S-09 loading -> one of: paid (AC-4.1), failed (AC-4.2), cancelling (processing variant, then cancelled, AC-4.3), processing (J-17), expired (AC-4.5). On paid the cart is reduced by the paid lines (AC-4.6), so S-04 shows the remaining lines or the empty state.
Exit: "View order" (S-11), "View order history" (S-10), "Continue shopping" (S-02), or "Try paying again" (S-04 then S-07, creates a new order).
Err: not found or other customer's order -> S-09 not-found state, identical for both (AC-4.8); session expired -> J-20; status load error -> S-09 error state with retry (checking continues quietly, UX-OQ-6).

**J-5 (US-5) View my order history.**
Entry: header link "Orders" (S-01).
Steps: S-10 loading -> list (20 per page, newest first; paid, pending_payment and failed only) -> next/previous page.
Exit: select an order (S-11) or leave.
Err: none yet -> empty state with "Continue shopping" (AC-5.3). Load error -> error with retry (AC-5.6). Not signed in -> S-06 (AC-5.5). Page number out of range -> empty list with "Go to first page" (UX-OQ-12).

**J-6 (US-6) View order detail.**
Entry: select a row on S-10, or "View order" on S-09.
Steps: S-11 loading -> detail with snapshotted lines.
Exit: back to S-10.
Err: not found, other customer's order or malformed id -> S-11 not-found state (identical, AC-6.2, 6.3). Not signed in -> S-06 (AC-6.5).

**J-8 (US-8) Browse the catalogue.**
Entry: shop home (visitor or customer).
Steps: S-02 loading -> grid/list of 20 products (name, price, optional image placeholder) -> pagination.
Exit: open a product (S-03).
Err: empty catalogue -> empty state (AC-8.2); load error -> error with retry (AC-8.3); page number out of range -> empty list with "Go to first page" (UX-OQ-12). Visitors see no cart actions (AC-8.5).

**J-9 (US-9) View a product.**
Entry: select a product on S-02, or direct link.
Steps: S-03 loading -> name, description, price, image placeholder, "Add to cart" (customer) or "Sign in to add this to your cart" note with the same button leading to sign-in (visitor).
Exit: add to cart (J-10) or back to S-02.
Err: unknown product -> "Product not found" state with link to S-02 (AC-9.2). Product flagged not purchasable (direct link) -> "This product is no longer available." with no "Add to cart" (UX-OQ-9). Visitor chooses "Add to cart" -> no cart change, go to S-06, return to this product after sign-in (AC-9.3, J-22).

**J-10 (US-10) Add a product to my cart.**
Entry: S-03 "Add to cart" with quantity (add-to-cart exists only on S-03, UX-OQ-11).
Steps: choose quantity (1 to 10; numeric text input with +/- buttons, UX-OQ-17) -> "Add to cart" -> success message in a status region and cart count (sum of line quantities, UX-OQ-10) updates in S-01 (AC-10.1). Adding the same product again increases the existing line (AC-10.2).
Exit: "View cart" (S-04) or continue browsing.
Err: invalid quantity or quantity that would exceed 10 -> inline message, cart unchanged (AC-10.3). 51st distinct product -> J-23. Session expired -> J-20/J-22.

**J-11 (US-11) Manage and view my cart.**
Entry: header "Cart" (S-01).
Steps: S-04 loading -> lines with name, quantity, unit price, line total, cart total -> change quantity or remove a line -> totals update; state persists after reload.
Exit: "Checkout" (J-1) or continue shopping.
Err: invalid quantity -> inline message and quantity reverts (AC-11.3); empty cart -> empty state, "Checkout" unavailable (AC-11.5); load error -> error with retry (AC-11.8). Cart kept across sign-out/sign-in and second browser (AC-11.6).

**J-12 (US-12) Register an account.**
Entry: S-01 "Register", or link from S-06. A customer who is already signed in is redirected to the validated return target or S-02 (UX-OQ-13).
Steps: S-05 -> enter email and password -> "Register" -> account created, signed in automatically (AC-12.1) -> land on the return target if valid, else S-02.
Exit: S-02 (or return target).
Err: invalid email, invalid password, already registered (AC-12.2 to 12.4); rate limit 429; server error; CSRF failure (403) shown as the generic error.

**J-13 (US-13) Sign in.**
Entry: S-01 "Sign in", a redirect from a protected page, or a banner after session expiry. A customer who is already signed in is redirected to the validated return target or S-02 (UX-OQ-13).
Steps: S-06 -> enter email and password -> "Sign in" -> busy state for the length of any server delay (J-21) -> success -> return target if valid, else S-02 (AC-13.1, 13.7). While signed in, the session-expiry warning, "Stay signed in" and the absolute-limit warning of AC-13.14 to AC-13.29 are part of this story and are described in J-26.
Exit: target page.
Err: wrong password or unknown email -> identical generic failure (AC-13.2); delay or held generic failure (J-21); 429 cap (J-21); service unavailable -> retryable error (AC-13.6).

**J-14 (US-14) Sign out.**
Entry: S-01 "Sign out".
Steps: choose "Sign out" -> S-12 signed-out state. Back button or protected URL -> S-06, no data shown (AC-14.2).
Exit: S-12 with links to "Sign in" and "Browse products".
Err: session already expired -> S-12 shown without an error (AC-14.3).

**J-15 (US-15) Paid order data stays unchanged.**
Entry: S-10 -> S-11 for an order made before a re-seed or product change.
Steps: S-11 shows the name and unit price copied at order creation, not live product data (AC-15.1); after a re-seed with changed price or name the same values remain (AC-15.2). A product that became not purchasable is hidden from the catalogue and not offered on new carts or checkout; by direct link S-03 shows "This product is no longer available." (AC-15.3, UX-OQ-9).
Exit: back to S-10.
Err: as J-6.

### 2.2 Edge-case journeys

**J-16 Price or purchasability change at checkout (US-1; AC-1.4, 1.6, 1.7, 11.1; REQ-13).**
Entry: S-04 "Checkout" with a line whose price changed or that is no longer purchasable.
Steps: S-07 loading -> no order, no payment -> S-07 "cart changed" state lists each affected item and the change ("was $x, now $y" or "no longer available"); price-changed lines in S-04 now show the current price; not-purchasable lines are flagged and must be removed by me -> "Back to cart" (S-04) -> review -> "Checkout" again.
Exit: price changes only: second "Checkout" shows the summary at the new price and I can Pay (AC-1.6). Not-purchasable lines: after I remove them, checkout proceeds.
Err: if not-purchasable lines remain, the same notice is shown again. Total outside $0.50 to $999,999.99 -> blocked state with range message (AC-1.7).

**J-17 Payment pending or processing, 5-second automatic status check (US-4; AC-4.1, 4.4, 4.5, 13.18, 13.19).**
Entry: return from E-1 with no final result yet.
Steps: S-09 shows "payment processing" and checks the order status automatically every 5 seconds without reloading; a "Check now" action is an extra option. Checking pauses while the browser tab is hidden and resumes (with an immediate check) when the tab is visible again (UX-OQ-6). The final state appears within 30 seconds of our server receiving the result (callback or reconciliation), or within 90 seconds of the provider's decision on the lost-callback path (AC-4.4). The change is announced in a polite live region. If no result ever arrives, "payment processing" stays on screen until the order is expired (30 minutes after creation), then the expired state is shown (AC-4.5). Checking stops at paid, failed, cancelled and expired (UX-OQ-7, AC-13.19).
Session activity: the automatic checks (including the immediate check when the tab becomes visible again) are not user activity and never reset the 30-minute idle timer (AC-4.4, AC-13.18). A customer who stays on this page without doing anything therefore sees the S-01 session-expiry warning at 28 minutes (J-26), and the first automatic check after 30 minutes without user activity returns HTTP 401. "Check now" is a user action (manual refresh) and does reset the idle timer.
Exit: paid (J-4), failed, cancelled or expired.
Err: status request fails or is rate limited -> keep the last state, show an unobtrusive "We couldn't check just now. We'll try again." note and retry quietly (UX-OQ-6). Provider unreachable while the server must close the order -> processing or retryable message (AC-4.12). A check that returns HTTP 401 -> automatic checks stop at once (0 further requests, AC-13.19) and the customer goes to S-06 with the session-expired banner (J-20; after sign-in S-09 shows the outcome, AC-4.9, AC-13.18).

**J-18 Late success (US-4; AC-4.7, 4.11).**
Entry: an order I saw as failed, cancelled or expired is later verified as paid by the provider.
Steps: no push notification exists (no email, PRD out of scope). Because checking stops at a terminal state (UX-OQ-7), the customer sees the change when they next load S-09, S-10 or S-11: the order now shows status "Paid" and appears in order history (AC-4.7); the cart is not changed. If a replacement order for the same lines was also paid, both orders appear as paid; the operator flag `duplicate_payment_review` is not shown to the customer (AC-4.11).
Exit: S-10 / S-11.
Err: none specific.

**J-19 Provider unreachable; new checkout blocked (US-3, US-4; AC-3.13, 3.16, 4.12; NFR-7).**
Entry: choose "Pay" while the provider is down or a call exceeds 10 seconds, or choose "Pay" while an earlier pending order cannot be closed because the provider is unreachable.
Steps (a, timeout at Pay): S-07 error "We couldn't start your payment. Please try again." The order stays pending_payment, the cart is unchanged, and "Pay" remains available; a retry uses the same order if at least 5 minutes of the 25-minute session lifetime remain, otherwise a new order (AC-3.13, 3.17; see J-24).
Steps (b, blocked): S-07 shows "Your previous payment is still being confirmed. Please try again in a moment." No new order is created and the customer cannot pass this point until the old order is closed (AC-3.16). "Pay" stays enabled so the customer can retry.
Exit: successful Pay (S-08) or leave (S-04, S-10).
Err: repeated failure leaves the order pending; the customer sees the same messages (operator alert after 24 hours is not a customer screen).

**J-20 Expired session on return from the hosted page (US-4, US-13; AC-4.9, 13.4).**
Entry: customer returns from E-1 after the 30-minute idle or 8-hour absolute session limit. S-01 shows the idle session-expiry warning 2 minutes before expiry with "Stay signed in", or, when the 8-hour limit comes first, the absolute-limit warning without that button (J-26). The customer is typically on E-1 while paying, so a warning may not be seen there; the warning times come from the server-provided expiry times (AC-13.24), so they stay correct on return.
Steps: S-09 request returns 401 -> redirect to S-06 with banner "Your session has expired. Sign in to continue." -> sign in -> S-09 for my order (same-origin relative path only, AC-13.7) shows the outcome.
Exit: S-09 outcome.
Err: wrong credentials -> S-06 generic failure and throttling (J-21). The same pattern applies to any protected page (cart, checkout, history, detail): the customer returns to the previous page afterwards (AC-13.4).

**J-21 Sign-in throttling and slowdown (US-13; AC-13.2, 13.3, 13.9 to 13.13; NFR-15, NFR-16).**
Entry: repeated failed sign-ins for one email (existing or not), or many concurrent attempts from one IP or the service.
Steps: after 3 failures within the sliding 15-minute window each attempt is delayed before the password check: 1, 2, 4, 8, then 16 seconds. S-06 shows a busy state ("Signing in...") at once, and after 5 seconds of waiting the text "Still working. This can take up to 20 seconds." (UX-OQ-3); no failure count or delay length is shown. After the wait one of: success (a correct password that holds the slot still signs in, AC-13.3), or the generic failure "Email or password is incorrect" (identical for existing and unknown emails, and identical for the delayed generic failures that did not get a password check, AC-13.11). There is no lockout message and no message that says the account is locked or exists.
Cap branch: when more than 5 responses are held for my IP, or 200 service-wide, the attempt is answered immediately with HTTP 429 and `Retry-After: 16`; S-06 shows one identical message, independent of the email, telling the customer to wait 16 seconds (AC-13.12). The per-IP rate limit (20 attempts per 15 minutes) also yields a 429; S-06 shows "Too many sign-in attempts. Please try again later." No countdown is shown (UX-OQ-5).
Exit: signed in (return target) or retry later.
Err: client timeout while waiting (A-9, up to 16 seconds plus server time) -> retryable generic error (AC-13.6). UX never reveals the delay length, the failure count or whether an account exists.

**J-22 Return to the page after sign-in (US-9, US-13, US-1; AC-1.3, 9.3, 13.1, 13.4, 13.7, 4.9).**
Entry: a visitor or expired session reaches a protected action or page (add to cart, checkout, cart, history, detail, outcome).
Steps: redirect to S-06 carrying a return target (same-origin relative path only) -> sign in (or register via S-05, which also honours the target) -> land on the validated target, otherwise on S-02. For "Add to cart" as a visitor no cart change occurs; after sign-in the customer returns to the product and adds again (AC-9.3). Cart contents are intact after sign-in (AC-1.3, AC-11.6).
Invalid targets (examples in AC-13.7: `https://evil.example`, `//evil.example`, `javascript:alert(1)`, `/\evil.example`, `/%2F%2Fevil.example`, `/%5Cevil.example`, `/%09/evil.example`, `/\t/evil.example`, `/%252F%252Fevil.example`) are ignored silently and the customer lands on S-02. No error message is shown for an ignored target.
Exit: target page or S-02.

**J-23 50-line cart limit (US-10; AC-10.7, 10.8).**
Entry: S-03 "Add to cart" for a product not yet in a cart that has 50 distinct lines.
Steps: rejected; message "Your cart can hold at most 50 different products. Remove a product to add another." (names the 50-line maximum) with a link to S-04; cart unchanged. Adding more of a product already in the cart is still allowed within quantity 10. The 50th distinct product (cart at 49) is accepted (AC-10.8).
Exit: S-04 to remove a line, or continue.
Err: quantity above 10 on an existing line -> quantity message (AC-10.3).

**J-24 Retry, reuse and superseding an order (US-3, US-4; AC-3.4, 3.8, 3.9, 3.11, 3.14, 3.15, 3.17, 3.18, 4.2, 4.3, 4.10; REQ-23, REQ-24).**
Entry: customer chooses "Pay" with an existing pending order, or after a failed, cancelled or expired order.
Steps: from the customer's point of view "Pay" always ends in one of: (1) redirect to a payment session (same order reused, or a new order created), (2) retryable error (J-19), (3) "already paid" message, or (4) blocked message (J-19b). The customer is never asked to choose between old and new orders.

- Unchanged cart with an open session and at least 5 minutes remaining (for example minute 20, AC-3.18): reuse, redirect to the same session. Two tabs: both reach the same session (AC-3.8). Double click: one order (AC-3.4).
- Changed cart, no open session, or less than 5 minutes remaining (for example minutes 24 to 27, AC-3.9, 3.15, 3.17, 3.18): the old order is closed early (status "cancelled", hidden from history, AC-3.15) and a new order and session are created; the customer sees the same redirect and is not told that the old order was closed (silent, UX-OQ-4).
- Provider reports the old order already paid (AC-3.9, 3.15, 3.18): S-07 shows "Your earlier payment has been received. View your order." with a link to S-11/S-09; no new order is created.
- After failed, cancelled or expired: "Pay" creates one new order (AC-3.14); the failed order stays in history with status failed (AC-4.2); cancelled and expired orders are not listed.

Exit: S-08 or the messages above.

**J-25 Amount or currency mismatch (US-3; AC-3.12).**
Entry: return from E-1 where the verified payment amount or currency differs from the order.
Steps: S-09 shows the failure message in the "payment could not be completed" state: that the payment could not be completed, that if the customer was charged they should contact support quoting the order number (shown), and that the shop will review it. The order is failed. No provider details are shown.
Exit: "View order history" or "Try paying again" (creates a new order).
Err: as J-4.

**J-26 Session-expiry warning, "Stay signed in" and absolute limit (US-13; AC-13.4, 13.14 to 13.19, 13.23 to 13.29; NFR-14, NFR-20).**
Entry: a signed-in customer on any page (S-01 is on every page) with no user activity. The warning times are derived from the idle expiry and absolute expiry that the server exposes to the UI (AC-13.24); the UI has no timer of its own that decides them.
Steps:

- (a) Idle warning. Customer is signed in and has had no user activity for 28 minutes, and the 8-hour limit does not come first (AC-13.15). S-01 shows the non-modal session-expiry warning with "Stay signed in"; the rest of the page stays usable. Choosing "Stay signed in" sends one keep-alive request with the anti-CSRF token; on success the warning is dismissed, the status message "You're still signed in." is shown, the idle expiry becomes 30 minutes after the action, and the 8-hour absolute expiry is unchanged (AC-13.16, AC-13.17: near the 8-hour limit the session still ends at the limit). With no action the next authenticated request after 30 minutes without user activity returns 401 and the customer goes to S-06 with the session-expired banner (AC-13.4, J-20).
- (b) Keep-alive fails. "Stay signed in" returns 403, 429, 5xx or fails with a network error: the warning stays, an error message says the session was not extended, and a "Try again" action is offered (AC-13.28); the idle expiry is unchanged; a later successful retry behaves as in (a). 401: the customer goes to S-06 with the session-expired banner (AC-13.4, AC-13.28).
- (c) Other activity. While the warning is shown the customer does something that sends a successful authenticated request (for example opens the cart): the warning is dismissed within 5 seconds and returns only after a further 28 minutes without user activity (AC-13.29, AC-13.14). If that request is rejected the warning stays (AC-13.27, AC-13.29). Navigation inside the page that sends no authenticated request is not activity (OQ-51), so the warning stays. Automatic requests (the 5-second checks on S-09) do not dismiss the warning (AC-13.18).
- (d) Absolute limit first. When the 8-hour limit falls before the idle warning point, or within 2 minutes after it, the same non-modal warning is shown without "Stay signed in", with the message "Your session ends at <local time>; please sign in again". It is shown at min(idle warning point, 8 hours minus 2 minutes), and immediately if fewer than 2 minutes remain until the limit (AC-13.23). No keep-alive request is sent from it. At the 8-hour limit the session ends: the next authenticated request returns 401 and the customer goes to S-06 with the session-expired banner (AC-13.4, AC-13.17).
- (e) Several tabs. The warning state is the same in all tabs of the session. A successful user activity in tab B means tab A shows no warning at the earlier 28-minute point (AC-13.25). "Stay signed in" in tab A dismisses the warning in tab B within 5 seconds and reschedules the next warning for 28 minutes after the action (AC-13.26).

Exit: warning dismissed (session extended or activity), or S-06 after the session ends.
Err: as listed in (b). Rate limit of keep-alive: 10 per minute per session (NFR-20, OQ-48); the 11th returns 429 and is handled as (b).

## 3. Screen specifications

Common to all screens (S-01 applies it): language English; sentence case; page `<title>` unique per screen; one `h1` per screen; route changes move focus to the `h1` (or the first heading) and update the document title; focus never lands on a hidden element; skip link to the main content is the first focusable element. Common error banner pattern: an inline message with `role="alert"` and a retry action. Loading uses `aria-busy="true"` on the region plus a visible text label ("Loading..."); skeletons alone are not sufficient. Interactive targets at least 24 by 24 CSS px (WCAG 2.5.8), 44 by 44 recommended on mobile. Layout reflows to 320 CSS px width without horizontal scrolling (WCAG 1.4.10). Visual styling: neutral default component styling that meets the contrast rules, with a minimal token set in the prototype; brand styling is outside this feature (UX-OQ-16). Dates and times: browser-local time zone, format `Oct 20, 2026, 3:45 PM`, with the UTC value in the `time` element's `datetime` attribute (UX-OQ-14).

### S-01 Application shell (header, navigation, banners)

- **Purpose.** Persistent navigation, session state, cart count, global banners.
- **Components.** Skip link; brand link to S-02; "Products" link; for visitors: "Sign in", "Register"; for customers: "Cart" with count, "Orders", "Sign out"; banner region for session-expired, session-expiry-warning (idle and absolute-limit variants) and signed-out notices.
- **Data shown.** Cart count = the sum of line quantities (UX-OQ-10, AC-10.1); signed-in state; for the session warning, the idle expiry and the 8-hour absolute expiry provided by the server (AC-13.24), from which the warning time and the local time in the absolute-limit message are derived.
- **Actions.** Navigate; "Sign out" (AC-14.1); "Stay signed in" (idle variant of the session-expiry warning only, UX-OQ-15); "Try again" (after a failed keep-alive).
- **States.** Visitor (no cart, no orders links; AC-8.5). Customer. Cart count loading (hidden until known, no `0` flash); cart count error (count omitted, link still works). Session expired (banner "Your session has expired. Sign in to continue." on S-06, AC-13.4). Sign-out in progress (button busy, then S-12); sign-out when session already expired: S-12 without error (AC-14.3); sign-out request failure: S-12 is shown only after the server confirms; otherwise error "We couldn't sign you out. Try again." with retry (UX copy; AC-14.1 requires server-side invalidation).
  - **Session-warning source of times (AC-13.24).** The server holds the idle expiry and the absolute expiry and exposes both to the UI; the warning and the local time are computed from those server times, not from a browser-only timer. Example: if the server idle expiry is 5 minutes away, the idle warning is shown 3 minutes from now (tolerance plus or minus 5 seconds) whatever this tab has seen. The form of exposure is a Phase 4 decision.
  - **Idle warning (UX-OQ-15; PRD AC-13.15, 13.16).** After 28 minutes without user activity (automatic requests excluded), two minutes before the 30-minute idle timeout would expire, and when the 8-hour limit does not come first, a non-modal notice appears at the top of the page: "Your session will expire in 2 minutes because of inactivity. Stay signed in?" with a "Stay signed in" button (UX copy). The rest of the page remains usable. Choosing it sends one authenticated keep-alive request with the anti-CSRF token (busy state on the button while it runs); on success the notice is replaced by a status message "You're still signed in." (UX copy), the idle expiry becomes 30 minutes after the action and the 8-hour absolute lifetime is unchanged (AC-13.16, 13.17). If the customer does nothing, the session expires and the next action leads to S-06 with the session-expired banner (J-20).
  - **Absolute-limit warning (PRD AC-13.23, OQ-49; CR-checkout-048).** When the 8-hour absolute limit would end the session before the idle warning point, or no more than 2 minutes after it, the same non-modal notice is shown **without** the "Stay signed in" button, with the message "Your session ends at <local time>; please sign in again". <local time> is the 8-hour limit in the customer's local time zone, shown in the format of UX-OQ-14 (decided in UX-OQ-19). It is shown at min(idle warning point, 8 hours minus 2 minutes), where the idle warning point is 28 minutes after the last user activity; if fewer than 2 minutes remain until the limit it is shown immediately. No keep-alive request is sent from it. At the 8-hour limit the customer is signed out: the next authenticated request returns 401 and leads to S-06 with the session-expired banner (AC-13.4). This replaces the earlier statement that no warning is shown for the absolute limit.
  - **Keep-alive failed (PRD AC-13.28; CR-checkout-044).** If "Stay signed in" returns HTTP 403, 429 or a 5xx status, or fails with a network error, the idle warning stays visible, an error message in the notice says that the session was not extended ("Your session was not extended. Try again.", decided in UX-OQ-19) and a "Try again" button repeats the request; the page remains usable and the idle expiry is unchanged. A successful retry follows the success state above. If the keep-alive returns HTTP 401, the customer goes to S-06 with the session-expired banner (AC-13.4). The 429 case (more than 10 keep-alive requests a minute, NFR-20) uses the same message; no countdown is shown (decided in UX-OQ-19).
  - **Dismissed by other activity (PRD AC-13.29; CR-checkout-044).** While the idle warning is shown, any other user activity that results in a successful authenticated request (for example opening the cart) dismisses it within 5 seconds; it is shown again only after a further 28 minutes without user activity. If that request is rejected the warning stays. A page change that sends no authenticated request is not activity and does not dismiss the warning (OQ-51). The 5-second automatic status checks on S-09 are not activity and do not dismiss it (AC-13.18). The absolute-limit warning cannot be dismissed by activity, because activity does not move the 8-hour limit.
  - **Several tabs (PRD AC-13.25, 13.26).** The warning state is consistent across all tabs of one session: user activity or a successful "Stay signed in" in one tab dismisses or reschedules the warning in the other tabs within 5 seconds, and the next warning is due 28 minutes after the action. A tab never shows a warning that the server times do not support.
  - **Session ended in another tab or elsewhere.** The next authenticated request returns 401 and leads to S-06 with the session-expired banner (AC-13.4).
- **Accessibility.** `nav` landmark with a label; current page marked `aria-current="page"`; cart count in the accessible name ("Cart, 3 items"); count change announced in the S-03 add-to-cart status region, not by moving focus; "Sign out" is a button; visible focus indicator not obscured by sticky header (WCAG 2.4.11), so the header must not cover focused elements (use scroll-padding); contrast: text 4.5:1, UI components and focus ring 3:1. The session warning (both variants) is announced once via `role="alert"`, does not take focus, is placed directly after the skip link in the DOM so that it is the first control reachable by keyboard (idle variant: the "Stay signed in" button), gives at least 2 minutes of notice (WCAG 2.2.1 time adjustable; for the absolute limit the 2-minute notice is the mitigation, because the limit itself is treated as essential, OQ-50), is not a timed toast, and does not disappear until the customer acts, the session expires, or other activity dismisses it. The absolute-limit variant states the time as text and contains no button. The keep-alive error is announced via `role="alert"` once per failed attempt, and the busy state of the button is conveyed with `aria-busy` and an accessible name that does not change; focus stays where it is, or on the "Try again" button if the customer was using the notice. A dismissal caused by activity in this or another tab is announced politely ("You're still signed in.") without moving focus (UX-OQ-19). The notice does not rely on colour alone (icon plus text).

### S-02 Catalogue list (US-8)

- **Purpose.** Browse 100 seeded products, 20 per page (REQ-14, OQ-20).
- **Components.** Heading "Products"; list of product cards (image placeholder, name link, price); pagination (Previous, page "n of m", Next); retry and empty/error regions.
- **Data shown (field -> source).** Name -> REQ-14; price in USD -> REQ-14, AC-8.4; image placeholder -> REQ-14 (optional, decorative: empty `alt`); page position -> AC-8.1.
- **Actions.** Open product (S-03); change page. There is no "Add to cart" on the list for anyone (UX-OQ-11); visitors see no cart actions (AC-8.5).
- **States.** Loading (skeleton plus "Loading products..."). Success (20 cards; every product appears once across pages, AC-8.1). Empty: "There are no products to show yet." (AC-8.2, not an error). Error: "We couldn't load the products. Try again." with a "Try again" button (AC-8.3). Page number out of range: empty list with the link "Go to first page" (UX-OQ-12). Products flagged not purchasable are not listed (UX-OQ-9). Rate limited (429): same error message.
- **Accessibility.** Product list as a `ul`; each card has one link (the name) whose accessible name includes the price via `aria-describedby`; price formatting identical across screens (AC-8.4) and read as "$1,234.56"; pagination in a `nav` with label "Pagination", current page `aria-current="page"`, Previous/Next disabled at the ends with `aria-disabled` and still focusable or removed consistently; after page change focus moves to the list heading and a status region announces "Page 2 of 5"; image placeholders do not rely on colour alone; contrast of placeholder text 4.5:1.

### S-03 Product detail (US-9, US-10)

- **Purpose.** Show one product and let a signed-in customer add it to the cart. This is the only place where a product is added to the cart (UX-OQ-11).
- **Components.** Back link to S-02; image placeholder; name (`h1`); description; price; quantity control (numeric text input with "-" and "+" buttons, 1 to 10, UX-OQ-17); "Add to cart" button; status/message region; for visitors a note "Sign in to add this to your cart" with the button leading to S-06.
- **Data shown.** Name, description, price, image placeholder -> REQ-15, AC-9.1.
- **Actions.** "Add to cart" (AC-10.1, 10.2); quantity entry.
- **States.**
  - Loading: "Loading product...".
  - Success (view): details as above.
  - Not found (AC-9.2): heading "Product not found" with link "Back to products".
  - Not purchasable (direct link, AC-15.3, UX-OQ-9): details are shown with the message "This product is no longer available." and no "Add to cart" button. The same message is shown if a product becomes unavailable at the moment of adding (AC-10.4 race, API 404 or not purchasable); the cart is unchanged.
  - Add in progress: button busy and disabled to prevent double submission.
  - Add success: status message "Added to cart: {name}, quantity {n}." and header count updated; link "View cart".
  - Visitor presses "Add to cart": no cart change; go to S-06 with return target of this product (AC-9.3).
  - Validation error (below).
  - 50-line limit (J-23).
  - Add failed (server/network): "We couldn't add this to your cart. Try again." Cart unchanged.
  - Session expired: S-06 with banner, return to this product (AC-13.4).
  - Error loading: "We couldn't load this product. Try again."
- **Validation messages.**

| Field / rule                                                                                                         | Message                                                                              | Source / AC                                              |
| :------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------- |
| Quantity not a whole number, 0, negative, or above 10 (including quantity that would push an existing line above 10) | "Quantity must be a whole number from 1 to 10."                                      | UX copy; states the allowed range as required by AC-10.3 |
| Cart already has 50 distinct lines and product is new                                                                | "Your cart can hold at most 50 different products. Remove a product to add another." | UX copy; names the 50 maximum as required by AC-10.7     |

- **Accessibility.** Quantity has a visible `label` ("Quantity"), `inputmode="numeric"`, hint "1 to 10" linked by `aria-describedby`; the "-" and "+" buttons have text names ("Decrease quantity", "Increase quantity") and do not stop the field from accepting typed values; error text is linked with `aria-describedby`, `aria-invalid="true"`, and announced via `role="alert"`; focus stays on the input after an error; the add-to-cart result is announced with a polite `role="status"` region (does not steal focus); disabled-while-busy button keeps its accessible name and `aria-busy`; the visitor path uses a link/button with a text label that states what will happen; image placeholder `alt=""` (decorative) or a meaningful alt when images exist.

### S-04 Cart (US-11, US-10, US-1)

- **Purpose.** View and change the cart; entry to checkout.
- **Components.** Heading "Your cart"; table or list of lines (name link to S-03, unit price, quantity control as in S-03 with "Update", line total, "Remove"); cart total; "Checkout" button; "Continue shopping" link; region for changed-price and not-purchasable notices; status region.
- **Data shown.** Name, quantity, unit price (price last shown to me, AC-11.1), line total, cart total in USD (AC-11.1, AC-2.2 arithmetic is server-side); line flags (price changed, not purchasable) -> AC-1.4.
- **Actions.** Change quantity (AC-11.2); remove (AC-11.4); "Checkout" (J-1).
- **States.**
  - Loading: "Loading your cart...".
  - Success: lines and totals.
  - Empty (AC-11.5): "Your cart is empty." with a link "Browse products"; "Checkout" is not rendered.
  - Error (AC-11.8): "We couldn't load your cart. Try again." with "Try again"; no other customer's data is shown.
  - Line updated: totals update, status announcement "Quantity updated. Cart total $x."
  - Line removed: row disappears, status "Removed {name} from your cart.", focus moves to the next row's first control or the heading if none.
  - Changed after checkout rejection (AC-1.4): affected rows show "Price changed from $x to $y" (updated to the current price) or "No longer available. Remove this item to continue." (not purchasable; "Checkout" starts again and shows the notice until removed).
  - After paid: lines paid for are gone, lines added after Pay remain (AC-4.6, 3.10); full payment empties the cart (empty state).
  - Update failed (server error): "We couldn't update your cart. Try again." and the previous quantity is restored.
  - Over 50 lines cannot occur here (AC-10.7 blocks at add).
  - Session expired: S-06 with return to S-04.
  - Opening this page while the session-expiry warning is shown is user activity and dismisses the idle warning (S-01, AC-13.29).
- **Validation messages.**

| Field / rule                                     | Message                                                                                   | Source / AC                                |
| :----------------------------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------------------- |
| Quantity 0, negative, non-integer, above 10      | "Quantity must be a whole number from 1 to 10." Quantity reverts to the last valid value. | AC-11.3, AC-10.3 (range stated)            |
| Empty cart and "Checkout" attempted (direct URL) | "Your cart is empty. Add a product before checking out."                                  | AC-1.2 (states the cart is empty); UX copy |

- **Accessibility.** Use a real `table` with column headers or a list with grouped labels; each row's controls carry the product name in their accessible names ("Quantity for {name}", "Remove {name}"); errors beside the field with `aria-describedby`, `role="alert"` for the first error; keyboard path: Tab through rows (name, quantity, "-", "+", remove), Enter on "Update" or on Enter in the field; do not trigger updates on every keystroke; destructive "Remove" has no confirmation dialog (reversible by adding again), so success is announced; price-change notice in a persistent, non-modal region (not a toast that disappears); colour is never the only signal for flags (icon plus text); contrast 4.5:1; totals region marked `aria-live="polite"` for updates.

### S-05 Register (US-12)

- **Purpose.** Create an account with email and password and sign in automatically (AC-12.1).
- **Components.** Heading "Create an account"; Email field; Password field with show/hide toggle; character guidance; "Register" button; link "Already have an account? Sign in"; form-level error region.
- **Data shown.** Email (<= 254 characters, trimmed, case-insensitive, AC-12.4), password (12 to 128 Unicode code points after NFC, no composition rules, common passwords rejected, AC-12.3, AC-12.10). Helper text: "Use 12 to 128 characters. You don't need numbers or symbols." (UX copy; no composition rules).
- **Actions.** Register; navigate to S-06.
- **States.**
  - Idle.
  - Submitting (button busy, fields read-only, "Creating your account...").
  - Success: signed in; navigate to return target (valid) or S-02; the shell shows the signed-in state (AC-12.1, AC-13.7).
  - Field errors (below).
  - Already registered (409, AC-12.4): error on the email field with link "Sign in".
  - Rate limited (429, NFR-15 10 per 15 minutes per IP): form-level "Too many attempts. Please wait a few minutes and try again." (UX copy).
  - Server or network error: "We couldn't create your account. Try again." (form-level, retry by resubmitting).
  - CSRF rejection (403): same generic error.
  - Rejected unknown properties (AC-12.6): not reachable from the UI.
  - Already signed in visiting S-05: redirect to the validated return target or S-02 (UX-OQ-13).
- **Validation messages.**

| Field / rule                               | Message                                                      | Source / AC                                                                           |
| :----------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| Email empty                                | "Enter your email address."                                  | UX copy (supports AC-12.2)                                                            |
| Email not a valid format                   | "Enter a valid email address, for example name@example.com." | AC-12.2 (field shows a validation message); UX copy                                   |
| Email longer than 254 characters           | "Email must be 254 characters or fewer."                     | AC-12.4 limit; UX copy                                                                |
| Email already registered (any letter case) | "This email is already registered. Sign in instead."         | AC-12.4 (message that the email is already registered; PRD accepts disclosure, OQ-25) |
| Password empty                             | "Enter a password."                                          | UX copy                                                                               |
| Password under 12 characters               | "Password must be at least 12 characters."                   | AC-12.3 (states the rule that failed)                                                 |
| Password over 128 characters               | "Password must be 128 characters or fewer."                  | AC-12.3                                                                               |
| Password on common-password list           | "This password is too common. Choose a different password."  | AC-12.3                                                                               |

Note: S-05 is the only screen that discloses that an email is registered (PRD NFR-16, OQ-25). S-06 never does.

- **Accessibility.** Each field has a visible, persistent `label`; `autocomplete="email"` and `autocomplete="new-password"`; password paste is allowed and no cognitive-test or character-retyping is required (WCAG 3.3.8, 3.3.7: no confirm-password field); show/hide toggle is a button with `aria-pressed` and a text label; length counter is not announced on every keystroke (announce only at the limit); on submit with errors an error summary at the top (`role="alert"`, heading "There is a problem", links to each field) receives focus, each field also has inline `aria-describedby` text and `aria-invalid`; error text never relies on colour alone (icon and text); required fields marked in text ("required") and with `aria-required`; the 128 code-point input must not be silently truncated; submit by Enter key; contrast 4.5:1 for text, 3:1 for field borders and focus ring.

### S-06 Sign in (US-13, US-14 re-entry, US-5/6 gate)

- **Purpose.** Authenticate; restore the user to the page they wanted.
- **Components.** Heading "Sign in"; optional banner (session expired, or "Sign in to continue"); Email field; Password field with show/hide; "Sign in" button; link "Create an account"; live status region; form-level error region.
- **Data shown.** Email, password. Return target is taken from the request and validated (AC-13.7); it is never displayed.
- **Actions.** Sign in; go to S-05.
- **States.**
  - Idle.
  - Session-expired banner: "Your session has expired. Sign in to continue." (AC-13.4, AC-4.9). Shown for every end of session: idle timeout, the 8-hour absolute limit, and a 401 from a keep-alive or an automatic status check (AC-13.17, 13.19, 13.28).
  - Gate banner: "Sign in to continue." when redirected from a protected action (AC-1.3, 5.5, 6.5, 9.3, 10.5).
  - Submitting / waiting (J-21): button busy and disabled, `aria-busy`; visible text "Signing in..." immediately; after 5 seconds still waiting the text becomes "Still working. This can take up to 20 seconds." (UX copy, UX-OQ-3); no failure count or delay length is shown; the form cannot be submitted twice; fields read-only.
  - Success: navigate to the validated return target, else S-02 (AC-13.1). Invalid return targets are ignored silently (AC-13.7).
  - Generic failure (AC-13.2, 13.9, 13.11): form-level "Email or password is incorrect" (exact text from the PRD, no trailing period added). Identical for wrong password, unknown email, delayed generic failures and the held attempt that did not get a password check. Password field is cleared; email is kept; focus returns to the error summary.
  - Cap reached (HTTP 429 with `Retry-After: 16`, AC-13.12): form-level "Too many sign-in attempts right now. Wait 16 seconds and try again." (UX copy; identical regardless of email; no countdown, UX-OQ-5).
  - Per-IP rate limit reached (HTTP 429, 20 attempts per 15 minutes, NFR-15): form-level "Too many sign-in attempts. Please try again later." (UX copy, UX-OQ-5).
  - Service unavailable / network error (AC-13.6): "Sign-in is unavailable right now. Try again." with "Try again"; no session created.
  - CSRF rejection (403): same as service error.
  - Already signed in visiting S-06: redirect to the validated return target or S-02 (UX-OQ-13).
- **Validation messages.**

| Field / rule                                                                                        | Message                                                                                                                                   | Source / AC                                                                         |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| Email empty                                                                                         | "Enter your email address."                                                                                                               | UX copy; client-side only, no server call                                           |
| Password empty                                                                                      | "Enter your password."                                                                                                                    | UX copy; client-side only                                                           |
| Any server-side failure caused by credentials (wrong password, no account, delayed generic failure) | "Email or password is incorrect"                                                                                                          | PRD AC-13.2 exact text                                                              |
| Email format                                                                                        | No format validation on this screen (so no message can differ between inputs); a malformed email gets the generic failure from the server | Design to preserve NFR-16 non-disclosure; PRD defines no format message for sign-in |

- **Accessibility.** Labels visible and persistent; `autocomplete="username"` / `"email"` and `autocomplete="current-password"`, paste and password managers allowed (WCAG 3.3.8); the busy state is announced once via `role="status"` ("Signing in") and the result via `role="alert"`; the long wait (up to 16 seconds plus server time) must not time out the client and must not require the user to re-enter anything; the 5-second hint is a single polite update, not repeated; focus after a failure goes to the error summary which names both fields (not only one, so the message does not reveal which was wrong); error banner contrast 4.5:1; fields keep `aria-invalid` only for client-side empty-field errors; keyboard: Tab order email, password, show/hide, Sign in, Create an account; Enter submits.

### S-07 Checkout: order summary and Pay (US-1, US-2, US-3)

- **Purpose.** Show exactly what will be paid; start payment. Checkout (summary) creates no order; "Pay" creates or reuses the order (REQ-23, AC-1.1).
- **Components.** Heading "Order summary"; table of lines (name, quantity, unit price, line total); order total; currency note "All prices in USD"; "Pay" button (label states the amount: "Pay $x"); "Back to cart" link; notice region (changes, blocked, errors); note "You'll be taken to our payment provider's secure page to enter your card details. We never see your card number." (UX copy; supports REQ-3).
- **Data shown (field -> source).** Lines (name, quantity, unit price, line total) -> AC-2.1; order total -> AC-2.1, AC-2.2; all from the server; no price is an editable field (AC-2.3). No tax, shipping or discounts (OQ-5).
- **Actions.** "Pay" (J-3, J-24); "Back to cart".
- **States.**
  - Loading: "Loading your order summary..." ("Pay" not shown or disabled).
  - Success: summary and "Pay".
  - Empty cart (AC-1.2): message "Your cart is empty. Add a product before checking out." with link "Browse products"; no "Pay".
  - Visitor / session expired (AC-1.3): redirect to S-06 (J-22).
  - Cart changed (AC-1.4, J-16): heading "Your cart changed", list one line per affected item: "{name}: price changed from {old} to {new}." or "{name}: no longer available. Remove it from your cart to continue."; "Back to cart" is the primary action; no "Pay".
  - Total out of range (AC-1.7): "Order total must be between $0.50 and $999,999.99." with "Back to cart"; no "Pay".
  - Summary error (AC-2.4): "We couldn't load your order summary. Try again." with "Try again"; cart unchanged.
  - Pay submitting (AC-3.4): button disabled and busy "Starting payment..."; double click or Enter repeat is ignored; then S-08.
  - Pay retryable error (AC-3.13, J-19a): "We couldn't start your payment. Please try again." "Pay" re-enabled; cart unchanged.
  - Pay blocked (AC-3.16, J-19b): "Your previous payment is still being confirmed. Please try again in a moment." "Pay" re-enabled.
  - Earlier payment already received (AC-3.9, 3.15, 3.18): "Your earlier payment has been received. View your order." with link to S-09/S-11; no "Pay".
  - Pay rate limited (NFR-4, HTTP 429): "You're trying to pay too often. Wait a minute and try again."
  - Summary rate limited (30 per minute, NFR-20): "Too many requests. Try again in a moment."
  - Notice slot for the CR-checkout-036/037 outcome (section 6.3): an optional info message above "Pay"; by decision UX-OQ-4 it is not rendered (the customer is not told when an old order is closed early).
- **Validation messages.** No user-entered fields. All messages above are display messages; their linked ACs are in the coverage table.
- **Accessibility.** Summary uses a `table` with `caption` ("Order summary") and column headers; total in a `tfoot` or a labelled row; "Pay" is a `button` (not a link) with the amount in its name; changes and errors in a `role="alert"` region at the top, receiving focus on arrival so keyboard and screen-reader users see why "Pay" is missing; busy state announced via `role="status"`; focus is not lost when the button is disabled (use `aria-disabled` with the busy text, or move focus to the status); no timers or auto-redirect on this page; the statement about leaving the site is plain text before the button (WCAG 3.2.2 on request/predictable); contrast and target size as common rules; no card input is rendered (AC-3.2); CSP applies (NFR-19) so no third-party scripts are loaded on this page.

### S-08 Payment handoff (US-3)

- **Purpose.** Transitional screen between "Pay" and the provider's hosted page (full redirect, the design per UX-OQ-2). The provider-hosted iframe variant is an alternative state, decided in Phase 4 with the provider choice.
- **Components.** Heading "Taking you to secure payment"; text "Do not close this window. You'll return here when the payment is finished."; spinner with text; fallback link "Continue to payment" if the redirect has not happened after 10 seconds (UX copy); order total repeated ("Total $x").
- **Data shown.** Order total (server value) so the customer can compare with the amount on E-1 (AC-3.1).
- **Actions.** Fallback "Continue to payment"; "Back to cart" is available.
- **States.** Loading/redirecting (default). Success: the browser leaves for E-1. Error: if the server returns no payment session, return to S-07 with the retryable error (AC-3.13). Iframe variant (alternative state): provider-hosted fields displayed inside the page; our page renders no card input of its own (REQ-3, AC-3.2). Session expired: S-06. Refresh/back: re-posting is safe (AC-3.4): the customer lands on S-07 or the same session.
- **Accessibility.** Status text in `role="status"`; the fallback link is focusable and has a visible name; no automatic content change that traps focus; if the iframe variant is used, the iframe has a `title` ("Secure card payment, provided by {provider}") and the surrounding page keeps heading structure; the redirect must not occur before the announcement has been made (WCAG 3.2.1/3.2.2: user was told in S-07).

### S-09 Payment outcome (confirmation and status) (US-4, US-3)

- **Purpose.** After returning from the hosted page, show the result of the payment as verified by the server, never from a browser claim alone (REQ-4).
- **Components.** Heading reflecting the state; outcome message; order number; total; status label; actions; live status region; "Check now" button (processing state only).
- **Data shown.** Order number (the customer-facing identifier supplied by the API, UX-OQ-18), total, status -> AC-4.1; failure message without provider internals -> AC-4.2; order number in the mismatch message -> AC-3.12.
- **Actions.** "View order" (S-11), "View order history" (S-10), "Continue shopping" (S-02), "Try paying again" (to S-04 then S-07; failed, cancelled, expired states), "Check now" (processing).
- **Automatic checking (UX-OQ-6, UX-OQ-7).** In the processing state the page checks the status every 5 seconds (AC-4.4). Checking pauses while the browser tab is hidden and resumes with an immediate check when the tab is visible again. If a check fails, the page keeps the last state, shows the note below and retries quietly. Checking stops when the status is paid, failed, cancelled or expired; a late success (AC-4.7) therefore appears on reload and in S-10/S-11.
- **Automatic checks and the session (AC-4.4, AC-13.18, AC-13.19, AC-13.27).** The automatic checks (including the immediate check on tab resume) are marked as automatic requests by the client and do not reset the 30-minute idle timer, so a customer who waits on this page without acting still receives the S-01 session-expiry warning at 28 minutes and is signed out after 30 minutes without user activity. The checks send no further requests (0) once a final state is displayed, and none after a check returns HTTP 401. "Check now" is a user action: it counts as user activity, resets the idle timer and dismisses the idle warning (AC-13.29), unlike the automatic checks. On HTTP 401 from any check the page does not keep the last state: it goes to S-06 with the session-expired banner (AC-13.4), and after sign-in S-09 shows the outcome of this order (AC-4.9, AC-13.18).
- **States.**
  - Loading (initial): "Checking your payment..." in `role="status"`; the paid page appears within 5 seconds of return (AC-4.1).
  - Paid (success, AC-4.1): heading "Thank you, your order is confirmed"; "Order number: {n}", "Total: $x", status "Paid"; text "No email is sent. You can see this order any time in your order history." (UX copy; no email per OQ-14). Cart reduced (AC-4.6). Automatic checking has stopped (AC-13.19).
  - Processing (AC-4.4, J-17): heading "Payment processing"; text "We're waiting for confirmation from the payment provider. You can stay on this page. We check automatically every 5 seconds." (UX copy); spinner; "Check now" button; transitions announced politely.
  - Failed (declined or failed, AC-4.2): heading "Your payment didn't go through"; "You have not been charged." plus "Your cart is unchanged."; no provider internals; action "Try paying again" (creates a new order, AC-3.14). The order shows in history as failed.
  - Failed, amount or currency mismatch (AC-3.12, J-25): heading "Your payment could not be completed"; text "The payment could not be completed. If you were charged, contact support and quote order number {n}. The shop will review this." (UX copy built from the three required elements of AC-3.12). No amounts or provider details.
  - Cancelled on the hosted page, confirming (AC-4.3): initially processing variant "We're confirming that no payment was taken." (the order is not changed to cancelled by the browser return alone); then Cancelled: heading "Payment cancelled"; "You have not been charged. Your cart is unchanged."; actions "Try paying again", "Continue shopping". If the provider reports a payment instead, the Paid state is shown.
  - Expired (AC-4.5): heading "This payment session has expired"; "You have not been charged. Your cart is unchanged." plus "Try paying again" (UX copy, UX-OQ-6).
  - Provider unreachable while closing (AC-4.12): stays in processing, plus polite note "We're having trouble reaching the payment provider. We'll keep trying." (UX copy).
  - Late success shown on reload (AC-4.7): Paid state (see J-18).
  - Status check failed/network error (not 401): keep the last state, note "We couldn't check just now. We'll try again." and continue checking quietly; show "Try again" if the first load fails (no state yet).
  - Not found, other customer's order, or unverifiable return reference (AC-4.8, 3.7): heading "Payment not found"; text "We couldn't find this payment." with link "View order history"; identical for non-existent and other customers' references.
  - Session expired (AC-4.9, a check returns 401): checking stops; redirect to S-06 and back to this outcome page.
  - Rate limited (60 per minute): keep state; slow checks per `Retry-After`.
- **Validation messages.** None (no user input).
- **Accessibility.** Heading receives focus on arrival; status changes (processing to paid/failed/cancelled/expired) are announced once in a persistent `role="status"` (polite) region; the individual 5-second checks are not announced; terminal failure messages use `role="alert"` only on first appearance; the spinner has a text alternative; "Check now" is a button with a busy state; do not auto-redirect away from the page on terminal states (WCAG 2.2.1, 3.2.2), except the sign-in redirect on HTTP 401 which is required by AC-13.4; no countdown text that changes every second; order number is plain text selectable and copyable; contrast 4.5:1 and status is conveyed by text and icon, not colour alone; pausing and resuming the checks needs no announcement. The S-01 session warning remains reachable by keyboard while this page polls (it is the first control after the skip link).

### S-10 Order history (US-5)

- **Purpose.** List my past orders (REQ-7).
- **Components.** Heading "Your orders"; list/table of orders: order number (link to S-11), date, status, total; pagination; empty and error regions.
- **Data shown.** Order number (UX-OQ-18), date (format per UX-OQ-14), status label (UX-OQ-8), total -> AC-5.1. Only paid, pending_payment and failed orders (cancelled and expired are hidden, AC-5.1); newest first; 20 per page (AC-5.2).
- **Status labels (UX-OQ-8).** pending_payment is shown as "Awaiting payment", paid as "Paid", failed as "Failed".
- **Actions.** Open detail (S-11); change page; "Continue shopping" in the empty state. There is no resume-payment action (UX-OQ-8).
- **States.**
  - Loading: "Loading your orders...".
  - Success: list; newly paid order is visible within 5 seconds of confirmation (AC-5.4); a late-recovered order appears as paid (AC-4.7).
  - Empty (AC-5.3): "You haven't placed any orders yet." with a "Continue shopping" action; not an error.
  - Error (AC-5.6): "We couldn't load your orders. Try again." with "Try again"; no other customer's data and no stale data is shown.
  - Not signed in (AC-5.5): redirect to S-06 (J-22).
  - Pagination: every order appears exactly once across pages (AC-5.2).
  - Page number out of range: empty list with the link "Go to first page" (UX-OQ-12).
  - Rate limited (120 per minute shared with detail): error message above.
- **Validation messages.** None.
- **Accessibility.** `table` with caption "Order history" or a list with consistent labelling; status text with an icon, not colour alone; date in a `time` element with a full machine-readable value; amounts right-aligned for sighted users but read in order; pagination as S-02; after page change focus moves to the table caption/heading and the page position is announced; the order-number link has an unambiguous name ("Order {n}, {status}, {total}") using `aria-label` or visually hidden text; rows are not made clickable via mouse-only handlers.

### S-11 Order detail (US-6, US-15)

- **Purpose.** Show one of my orders exactly as it was bought and paid (REQ-8, REQ-21).
- **Components.** Back link "Back to orders"; heading "Order {n}"; summary (date, status, payment status); lines table; total; card brand and last 4 (only if supplied); for an order in "Awaiting payment" a link "Check payment status" to S-09 (UX-OQ-8).
- **Data shown.** Order number, date (UX-OQ-14), status and payment status (same labels as S-10, UX-OQ-8), lines (name, quantity, unit price, line total, as snapshotted at creation), total -> AC-6.1, AC-15.1; card brand and last 4 digits only if supplied by the provider, otherwise no payment card data row at all (AC-6.4). Never PAN, CVV or provider secrets (AC-6.4). Values do not change after a re-seed or product change (AC-15.1, 15.2).
- **Actions.** Back; (Awaiting payment) "Check payment status" link. There is no resume-payment action (UX-OQ-8).
- **States.**
  - Loading: "Loading order...".
  - Success: detail. Failed: shows status "Failed". Paid via late success shows "Paid".
  - Not found (AC-6.2, 6.3, 4.8): heading "Order not found"; "We couldn't find this order." with link "Back to orders"; identical for a non-existent id, a malformed id and another customer's order.
  - Error: "We couldn't load this order. Try again." with "Try again".
  - Not signed in (AC-6.5): redirect to S-06 with return to this order.
  - Card info absent: no placeholder shown.
- **Validation messages.** None.
- **Accessibility.** Lines in a `table` with caption and headers; description list (`dl`) for date, status, payment status; status with text; focus moves to the `h1` on load; back link first in reading order after the heading; "Last 4" read as "ending in 4242" (accessible name "Visa ending in 4242"); contrast and target size as common rules.

### S-12 Signed-out state (US-14)

- **Purpose.** Confirm sign-out, including when the session had already expired (AC-14.3).
- **Components.** Heading "You've been signed out"; links "Sign in" and "Browse products".
- **Data shown.** None (no cart, order or account data, AC-14.2).
- **States.** Success (default; same view whether the sign-out was performed now or the session had already expired, no error). Back button or protected URL afterwards: S-06, no protected data rendered (AC-14.2; the browser must not show cached protected pages, which is a Phase 4 cache-control concern).
- **Accessibility.** Heading receives focus on arrival; the message is plain text (not a toast); links have text names; sufficient contrast; no auto-redirect.

## 4. Cross-cutting UX rules

- **Currency and number formatting.** `$1,234.56` everywhere (AC-8.4), including `$0.50`, `$1,234.56` and `$1,000,000.00` formats; integer cents converted for display only.
- **Status labels.** The statuses pending_payment, paid, failed are shown to customers as "Awaiting payment", "Paid" and "Failed"; cancelled and expired never appear in history (AC-5.1) (UX-OQ-8).
- **Date and time.** Browser-local time zone, `Oct 20, 2026, 3:45 PM`, UTC in the `time` element (UX-OQ-14).
- **Order number.** A customer-facing identifier supplied by the API; URLs use the order id; Phase 4 decides the format (UX-OQ-18).
- **Non-disclosure.** Every sign-in failure and cap response looks the same regardless of whether the email has an account (NFR-16). The only place an email's existence is disclosed is S-05 (OQ-25).
- **No card data.** No card field exists in any of our pages. Card data is never put in URLs, logs or analytics (NFR-1).
- **Session handling.** Every 401 on a protected route redirects to S-06 with the previous page as a validated return target (AC-13.4, 13.7). State-changing requests carry the anti-CSRF token (NFR-14); a 403 is shown as the generic error for that screen (for the keep-alive, as the failed keep-alive state in S-01).
- **User activity versus automatic requests.** Only requests started by a user action reset the idle timer; automatic requests (the 5-second checks on S-09) do not, and a page change with no authenticated request is not activity (US-13 preamble, AC-13.27, OQ-51). Screens therefore must not send hidden automatic authenticated requests that are not marked as automatic (Phase 4 decides the marking).
- **Time limits (WCAG 2.2.1).** The session idle timeout (30 minutes) is a time limit. The design is a non-modal warning 2 minutes before expiry with a "Stay signed in" button (S-01, UX-OQ-15; PRD AC-13.15 to 13.17). The 8-hour absolute limit is treated as essential (OQ-50, NFR-9) and gets a non-modal warning without a button at 2 minutes before the limit (AC-13.23). Warning times come from server-provided expiry times and are consistent across tabs (AC-13.24 to 13.26).
- **Visual design.** Neutral default component styling that meets the contrast rules; the prototype uses a minimal token set; brand styling is out of this feature (UX-OQ-16).
- **Motion.** Spinners respect `prefers-reduced-motion`.
- **Responsive.** Desktop and mobile widths (NFR-12); tables become stacked rows at narrow widths but keep header associations.

## 5. Accessibility checklist for HG-2 and the prototype

- axe: 0 critical or serious on S-02 to S-11 in all listed states (NFR-9). S-01 (including both variants of the session warning and the failed keep-alive state) and S-12 are included.
- Keyboard only: complete J-1 to J-6, J-8 to J-14, and J-16 to J-26 without a mouse (including "Stay signed in" and "Try again" in the warning).
- Focus: moves to the page heading on route change; to the error summary after failed submit; to the notice region when "Pay" is withheld; never trapped; the session warning never takes focus on its own.
- Live regions: S-01 session warning and keep-alive error (alert, once per appearance), S-01 "You're still signed in." (status), S-03 add result (status), S-04 quantity/removal (status), S-06 busy and result, S-07 errors (alert), S-09 state changes (status; once per change).
- Contrast: text 4.5:1, large text 3:1, UI components and focus indicators 3:1; flagged states use icon plus text.
- Screen-reader pass (manual) before HG-5: S-05, S-06, S-07, S-09, and the S-01 session warning (both variants).
- Reflow to 320 px, text spacing, 200% zoom without loss.

## 6. Notes on the PRD and dependencies

### 6.1 PRD behaviours with no customer notification

No email, push or toast is sent for late success (AC-4.7), duplicate payment review (AC-4.11), cancelled or expired orders, or early closure of an order (AC-3.15). The UI reflects the new state when pages are next loaded. This follows the PRD (OQ-14) and decisions UX-OQ-4 and UX-OQ-7. The session warning of S-01 is the only proactive notice, and it is a page notice, not a push.

### 6.2 Customer-visible PRD figures used in copy

5-second automatic status check (AC-4.4), 50-line and 1 to 10 quantity limits (AC-10.3, 10.7), $0.50 to $999,999.99 total range (AC-1.7), 12 to 128 password characters (AC-12.3), `Retry-After: 16` (AC-13.12), 30-minute idle timeout, 28-minute warning point and 2-minute notice (NFR-14, AC-13.15, UX-OQ-15), 8-hour absolute limit (AC-13.23), keep-alive limit of 10 per minute (NFR-20, not shown to customers). Copy that quotes a figure must be updated if the PRD value changes (HG-C).

### 6.3 Dependency on CR-checkout-036 and CR-checkout-037

These open findings concern order-retry rules around minutes 20 to 25 (AC-3.15, 3.17, 3.18, 4.10). The screens depend on the resolution only in these places, and each works for either outcome:

| Situation                                              | Screen                    | Resolution A: reuse the existing order and session                              | Resolution B: close early and create a new order                                                                    |
| :----------------------------------------------------- | :------------------------ | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| "Pay" with an unchanged cart between minutes 20 and 25 | S-07, S-08                | Redirect to the same payment session; S-09 shows the same order number          | Redirect to a new session; S-09 shows a new order number; the old order is cancelled and hidden from history (S-10) |
| Retry after a timeout at minute 26                     | S-07                      | As B (no session to reuse)                                                      | Same                                                                                                                |
| Old order already paid at the provider                 | S-07                      | "Your earlier payment has been received. View your order."                      | Same                                                                                                                |
| Provider cannot confirm the old order is closed        | S-07                      | "Your previous payment is still being confirmed. Please try again in a moment." | Same                                                                                                                |
| Customer-facing explanation of the change              | S-07 reserved notice slot | Not rendered                                                                    | Not rendered by decision UX-OQ-4 (silent); the slot stays reserved                                                  |

Because the customer sees only a redirect either way, no screen layout changes between resolutions; only the order number shown on S-09/S-10/S-11 differs. The prototype should expose both paths as scenarios. If either finding changes copy or states beyond this table, that is rework in Phase 3 (and HG-C if a requirement changes).

## 7. UX questions

### 7.1 Resolved UX questions

Each decision below (UX-OQ-1 to UX-OQ-19): **Decided by: @alextthomas (Product Owner / UX Lead), 2026-10-20, pending HG-2.** For UX-OQ-1 to UX-OQ-18 the decision is "accept all": every default proposed in revision 1 was accepted as written. UX-OQ-19 (added in revision 3) was raised with proposed defaults and the Product Owner / UX Lead accepted them as written on the same date. The binding approval is the HG-2 PR review (see 7.2). There are no open UX questions at revision 3.

| ID       | Question                                                                                                                                                                                                                  | Decision                                                                                                                                                                                                                                                                                                                                                                                                                         | Applied in                      |
| :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| UX-OQ-1  | Who approves customer-facing copy that the PRD does not fix?                                                                                                                                                              | The Product Owner/UX Lead approves the copy at HG-2; English only; sentence case.                                                                                                                                                                                                                                                                                                                                                | Section 0, section 3 (all copy) |
| UX-OQ-2  | Full redirect or provider-hosted iframe fields on S-08?                                                                                                                                                                   | Design for full redirect (S-08 as a transitional screen) and keep the iframe variant as an alternative state; decided in Phase 4.                                                                                                                                                                                                                                                                                                | J-3, S-08                       |
| UX-OQ-3  | Feedback during a sign-in delay of up to 16 seconds plus server time.                                                                                                                                                     | "Signing in..." at once; after 5 seconds "Still working. This can take up to 20 seconds."; no failure count or delay length is shown.                                                                                                                                                                                                                                                                                            | J-21, S-06                      |
| UX-OQ-4  | Is the customer told when "Pay" closes an older pending order early and creates a new one (CR-checkout-036/037)?                                                                                                          | No message (silent); the reserved notice slot on S-07 stays empty.                                                                                                                                                                                                                                                                                                                                                               | J-24, S-07, section 6.3         |
| UX-OQ-5  | 429 wording for the sign-in per-IP limit and the held-response cap; countdown?                                                                                                                                            | One identical message; "wait 16 seconds" for the cap (from Retry-After); "try again later" for the per-IP limit; no countdown.                                                                                                                                                                                                                                                                                                   | J-21, S-06                      |
| UX-OQ-6  | S-09 details not in the PRD: expired-state wording; checking while the tab is hidden; behaviour when a status check fails.                                                                                                | Wording as in S-09; checking pauses while the tab is hidden and resumes on focus; keep the last state and retry quietly.                                                                                                                                                                                                                                                                                                         | J-17, S-09                      |
| UX-OQ-7  | Does S-09 keep checking after a terminal state (failed, cancelled, expired) for a late success (AC-4.7)?                                                                                                                  | No; checks stop at paid, failed, cancelled and expired. A late success is visible on reload and in S-10/S-11.                                                                                                                                                                                                                                                                                                                    | J-17, J-18, S-09                |
| UX-OQ-8  | Customer-facing status labels; resume payment for a pending order?                                                                                                                                                        | Labels "Awaiting payment", "Paid", "Failed"; S-11 offers a link "Check payment status" to S-09 only; no resume-payment action (not defined in the PRD).                                                                                                                                                                                                                                                                          | S-10, S-11, section 4           |
| UX-OQ-9  | How are products flagged not purchasable (AC-15.3) shown?                                                                                                                                                                 | Hidden from S-02; S-03 by direct link shows "This product is no longer available." with no "Add to cart".                                                                                                                                                                                                                                                                                                                        | J-9, J-15, S-02, S-03           |
| UX-OQ-10 | Does the header cart count show distinct lines or total quantity?                                                                                                                                                         | Total quantity of items (the sum of line quantities).                                                                                                                                                                                                                                                                                                                                                                            | J-10, S-01                      |
| UX-OQ-11 | Can customers add to cart from the catalogue list or only from S-03?                                                                                                                                                      | Only from S-03 (the PRD describes "Add to cart" on the product view, AC-9.1).                                                                                                                                                                                                                                                                                                                                                    | J-10, S-02, S-03                |
| UX-OQ-12 | Behaviour for a page number outside the range in S-02/S-10.                                                                                                                                                               | Show the empty list with a "Go to first page" link.                                                                                                                                                                                                                                                                                                                                                                              | J-5, J-8, S-02, S-10            |
| UX-OQ-13 | Should S-05/S-06 redirect an already signed-in customer?                                                                                                                                                                  | Yes, to the validated return target or S-02.                                                                                                                                                                                                                                                                                                                                                                                     | J-12, J-13, S-05, S-06          |
| UX-OQ-14 | Date and time format and time zone (AC-5.1 says "date").                                                                                                                                                                  | Browser-local time zone, `Oct 20, 2026, 3:45 PM`; machine-readable UTC in the `time` element.                                                                                                                                                                                                                                                                                                                                    | Section 3, S-10, S-11           |
| UX-OQ-15 | The 30-minute idle timeout is a WCAG 2.2.1 time limit; is a warning with a way to continue acceptable?                                                                                                                    | Design: a non-modal warning 2 minutes before idle expiry with a "Stay signed in" button. Revision 3: now fixed by the PRD (HG-C-1 accepted in issue #3, PRD revision 10 re-approved in PR #4); the 8-hour variant and failure states are added (J-26, S-01).                                                                                                                                                                     | J-20, J-26, S-01, section 4     |
| UX-OQ-16 | The PRD sets no visual design system, brand colours or typography.                                                                                                                                                        | Neutral default component styling meeting the contrast rules; the prototype uses a minimal token set; brand styling is out of this feature.                                                                                                                                                                                                                                                                                      | Section 3, section 4            |
| UX-OQ-17 | Quantity entry control.                                                                                                                                                                                                   | Numeric text input with +/- buttons so invalid values can be entered and the range message shown.                                                                                                                                                                                                                                                                                                                                | J-10, S-03, S-04                |
| UX-OQ-18 | The PRD uses "order number" without defining its format or whether it differs from the order id.                                                                                                                          | The order number is a customer-facing identifier supplied by the API (Phase 4 decides the format); URLs use the order id.                                                                                                                                                                                                                                                                                                        | Section 1, S-09, S-10, S-11     |
| UX-OQ-19 | The PRD fixes only the absolute-limit message and that the failed keep-alive shows "an error message" with a retry action (AC-13.23, 13.28, 13.29). What exact copy and announcements apply to the other new S-01 states? | Accepted as written: (a) failed keep-alive (403, 429, 5xx, network): "Your session was not extended. Try again." with a "Try again" button, same text for 429, no countdown; (b) "<local time>" in the absolute-limit message uses the UX-OQ-14 format (for example `Oct 20, 2026, 3:45 PM`); (c) when the idle warning is dismissed by activity in this or another tab, a polite status "You're still signed in." is announced. | J-26, S-01                      |

### 7.2 To confirm at HG-2

These decisions are recorded as decided but still need explicit confirmation by @alextthomas (Product Owner / UX Lead) in the HG-2 review. The HG-2 PR description should list each as a checkbox.

- [ ] UX-OQ-1: customer copy not fixed by the PRD is approved by the Product Owner/UX Lead at HG-2 (English, sentence case).
- [ ] UX-OQ-2: full-redirect design for payment handoff; iframe variant kept as an alternative, decided in Phase 4.
- [ ] UX-OQ-3: sign-in wait feedback ("Signing in...", then "Still working. This can take up to 20 seconds." after 5 seconds; no failure count or delay shown).
- [ ] UX-OQ-4: the customer is not told when an old pending order is closed early (silent).
- [ ] UX-OQ-5: 429 wording: one identical message, "wait 16 seconds" for the held-response cap, "try again later" for the per-IP limit, no countdown.
- [ ] UX-OQ-6: payment status page: expired-state wording, checks pause while the tab is hidden and resume on focus, quiet retry after a failed check.
- [ ] UX-OQ-7: payment status page stops checking at paid, failed, cancelled and expired.
- [ ] UX-OQ-8: status labels "Awaiting payment", "Paid", "Failed"; "Check payment status" link on order detail; no resume-payment action.
- [ ] UX-OQ-9: non-purchasable products hidden from the catalogue; "This product is no longer available." by direct link with no "Add to cart".
- [ ] UX-OQ-10: header cart count is the total quantity of items.
- [ ] UX-OQ-11: "Add to cart" only on the product page.
- [ ] UX-OQ-12: out-of-range page shows an empty list with "Go to first page".
- [ ] UX-OQ-13: signed-in customers visiting register or sign-in are redirected to the validated return target or the catalogue.
- [ ] UX-OQ-14: dates in the browser-local time zone, `Oct 20, 2026, 3:45 PM`, UTC in the `time` element.
- [ ] UX-OQ-15: 2-minute session-expiry warning with "Stay signed in" on S-01 (idle variant), as now specified by PRD AC-13.15 to 13.17.
- [ ] UX-OQ-16: neutral default styling meeting contrast rules; no brand styling in this feature.
- [ ] UX-OQ-17: quantity entry is a numeric text input with +/- buttons.
- [ ] UX-OQ-18: order number is an API-supplied customer-facing identifier; URLs use the order id; format decided in Phase 4.
- [ ] S-01 absolute-limit warning (CR-checkout-048; AC-13.23, OQ-49): same non-modal warning without "Stay signed in", copy "Your session ends at <local time>; please sign in again", shown at min(idle warning point, 8 hours minus 2 minutes) and immediately if under 2 minutes remain; the earlier "no warning is shown for it" is removed.
- [ ] S-01 failed keep-alive (CR-checkout-044; AC-13.28): warning stays, error message, retry action for 403, 429, 5xx and network errors; 401 goes to sign-in (AC-13.4); copy per UX-OQ-19(a).
- [ ] S-01 dismissal by other user activity (AC-13.29): a successful authenticated request dismisses the idle warning within 5 seconds; a page change with no authenticated request and the automatic S-09 checks do not.
- [ ] S-01 and J-26 server-provided expiry times and cross-tab consistency (AC-13.24 to 13.26): warning times come from the server; the warning is dismissed or rescheduled in all tabs within 5 seconds.
- [ ] S-09 / J-17 automatic checks (AC-4.4, AC-13.18, AC-13.19): they do not reset the idle timer, stop at a final state or on 401, and "Check now" counts as user activity.
- [ ] UX-OQ-19: copy and announcements for the new S-01 states: failed keep-alive text "Your session was not extended. Try again." (same for 429, no countdown); <local time> in the UX-OQ-14 format in the absolute-limit message; polite "You're still signed in." announcement when the warning is dismissed by activity in this or another tab.

## 8. Coverage tables

### 8.1 User story -> journey -> screens

| US                              | Journey                                 | Screens                                                  | UI-facing          |
| :------------------------------ | :-------------------------------------- | :------------------------------------------------------- | :----------------- |
| US-1 Start checkout             | J-1, J-16, J-22, J-24                   | S-04, S-07, S-06                                         | Yes                |
| US-2 Review order summary       | J-2                                     | S-07                                                     | Yes                |
| US-3 Pay by card                | J-3, J-19, J-24, J-25                   | S-07, S-08, E-1 (external), S-09                         | Yes                |
| US-4 See the payment outcome    | J-4, J-17, J-18, J-19, J-20, J-24, J-25 | S-09, S-06, S-10, S-11, S-04, S-01                       | Yes                |
| US-5 View my order history      | J-5                                     | S-10, S-06                                               | Yes                |
| US-6 View order detail          | J-6                                     | S-11, S-06                                               | Yes                |
| US-7 Audit, alerts, privacy     | none                                    | none (audit log and operator alerts; no customer screen) | No (not UI-facing) |
| US-8 Browse the catalogue       | J-8                                     | S-02                                                     | Yes                |
| US-9 View a product             | J-9, J-22                               | S-03, S-06                                               | Yes                |
| US-10 Add to cart               | J-10, J-23                              | S-03, S-01, S-04                                         | Yes                |
| US-11 Manage and view cart      | J-11                                    | S-04, S-01                                               | Yes                |
| US-12 Register                  | J-12, J-22                              | S-05                                                     | Yes                |
| US-13 Sign in                   | J-13, J-20, J-21, J-22, J-26            | S-06, S-01, S-09                                         | Yes                |
| US-14 Sign out                  | J-14                                    | S-01, S-12, S-06                                         | Yes                |
| US-15 Paid order data unchanged | J-15                                    | S-11, S-10 (and S-03/S-02 for UX-OQ-9)                   | Yes                |

Result: UI-facing user stories covered 14 of 14 (US-7 is not UI-facing and has no journey). Journeys: 25 (J-1 to J-6 and J-8 to J-26; J-7 is intentionally unused so that journey numbers equal story numbers and US-7 has none): 14 story journeys plus 11 edge-case journeys (J-16 to J-26 are 11; J-1 to J-6 and J-8 to J-15 are 14). Screens: 12 (S-01 to S-12) plus one external page (E-1).

### 8.2 Acceptance criterion -> screen and state

"NU" = not UI-observable (API, data or operator-only behaviour). A UI-observable AC lists the screen and state where it can be seen. Of 130 ACs, 98 are UI-observable and mapped (98 of 98); 32 are NU. Revision 3 adds AC-13.14 to AC-13.29 (16 ACs: 11 UI-observable, 5 NU).

| AC       | UI            | Screen / state                                                                                                                                   |
| :------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1.1   | Yes           | S-07 success; no order created at Checkout                                                                                                       |
| AC-1.2   | Yes           | S-04 empty (Checkout unavailable); S-07 empty-cart message                                                                                       |
| AC-1.3   | Yes           | S-06 gate banner; S-04 intact after sign-in                                                                                                      |
| AC-1.4   | Yes           | S-07 cart-changed; S-04 flagged lines                                                                                                            |
| AC-1.5   | NU            | API ownership check; no UI path                                                                                                                  |
| AC-1.6   | Yes           | S-07 success at new price after second Checkout                                                                                                  |
| AC-1.7   | Yes           | S-07 total-out-of-range                                                                                                                          |
| AC-2.1   | Yes           | S-07 success                                                                                                                                     |
| AC-2.2   | Yes           | S-07 success (totals consistent)                                                                                                                 |
| AC-2.3   | NU            | API rejection of client amounts; UI has no price inputs                                                                                          |
| AC-2.4   | Yes           | S-07 summary error                                                                                                                               |
| AC-3.1   | Yes           | S-07 Pay submitting; S-08                                                                                                                        |
| AC-3.2   | Yes           | S-07, S-08 (no card inputs on our pages)                                                                                                         |
| AC-3.3   | NU            | Start-up configuration                                                                                                                           |
| AC-3.4   | Yes           | S-07 Pay submitting (single submission)                                                                                                          |
| AC-3.5   | Yes           | S-09 paid                                                                                                                                        |
| AC-3.6   | NU            | Callback processing                                                                                                                              |
| AC-3.7   | Yes           | S-09 not-found (unverifiable return); callback part NU                                                                                           |
| AC-3.8   | Yes           | S-07 / S-08 in two tabs (same session)                                                                                                           |
| AC-3.9   | Yes           | S-07 Pay; S-07 earlier-payment-received; S-10 (old hidden)                                                                                       |
| AC-3.10  | Yes           | S-04 (later changes remain); S-11 (original lines)                                                                                               |
| AC-3.11  | Yes           | S-07 / S-09 (one order active); S-10                                                                                                             |
| AC-3.12  | Yes           | S-09 failed (mismatch)                                                                                                                           |
| AC-3.13  | Yes           | S-07 Pay retryable error                                                                                                                         |
| AC-3.14  | Yes           | S-07 Pay after failed; S-09                                                                                                                      |
| AC-3.15  | Yes           | S-07; S-10 (old order hidden)                                                                                                                    |
| AC-3.16  | Yes           | S-07 Pay blocked                                                                                                                                 |
| AC-3.17  | Yes           | S-07 retry after timeout (J-24)                                                                                                                  |
| AC-3.18  | Yes           | S-07 Pay at minute 20 (reuse) and minute 24 (new order)                                                                                          |
| AC-4.1   | Yes           | S-09 paid                                                                                                                                        |
| AC-4.2   | Yes           | S-09 failed; S-10 failed row; S-04 intact                                                                                                        |
| AC-4.3   | Yes           | S-09 cancelled (confirming, then cancelled)                                                                                                      |
| AC-4.4   | Yes           | S-09 processing (5-second automatic check, Check now); automatic checks do not reset idle, stop at final state or 401 (J-17)                     |
| AC-4.5   | Yes           | S-09 expired; S-10 (expired not listed)                                                                                                          |
| AC-4.6   | Yes           | S-04 after payment (lines reduced)                                                                                                               |
| AC-4.7   | Yes           | S-09 / S-10 / S-11 paid after late success                                                                                                       |
| AC-4.8   | Yes           | S-09 not-found (identical)                                                                                                                       |
| AC-4.9   | Yes           | S-06 session-expired banner; S-09 after sign-in                                                                                                  |
| AC-4.10  | NU            | Provider session expiry time (server)                                                                                                            |
| AC-4.11  | Yes (partial) | S-10 / S-11 both orders paid; flag not shown                                                                                                     |
| AC-4.12  | Yes           | S-09 processing / retryable note                                                                                                                 |
| AC-5.1   | Yes           | S-10 success                                                                                                                                     |
| AC-5.2   | Yes           | S-10 pagination                                                                                                                                  |
| AC-5.3   | Yes           | S-10 empty                                                                                                                                       |
| AC-5.4   | Yes           | S-10 success (new order within 5 seconds)                                                                                                        |
| AC-5.5   | Yes           | S-06 gate banner (API 401 NU)                                                                                                                    |
| AC-5.6   | Yes           | S-10 error                                                                                                                                       |
| AC-5.7   | NU            | API isolation test                                                                                                                               |
| AC-6.1   | Yes           | S-11 success                                                                                                                                     |
| AC-6.2   | Yes           | S-11 not found (identical)                                                                                                                       |
| AC-6.3   | Yes           | S-11 not found (malformed or missing id)                                                                                                         |
| AC-6.4   | Yes           | S-11 success (card brand and last 4 only if supplied)                                                                                            |
| AC-6.5   | Yes           | S-06 gate banner (API 401 NU)                                                                                                                    |
| AC-7.1   | NU            | Audit log                                                                                                                                        |
| AC-7.2   | NU            | Log scan                                                                                                                                         |
| AC-7.3   | NU            | Status transitions (server)                                                                                                                      |
| AC-7.4   | NU            | Server rejection                                                                                                                                 |
| AC-7.5   | NU            | Environment teardown                                                                                                                             |
| AC-7.6   | NU            | Operator alerts                                                                                                                                  |
| AC-8.1   | Yes           | S-02 success, pagination                                                                                                                         |
| AC-8.2   | Yes           | S-02 empty                                                                                                                                       |
| AC-8.3   | Yes           | S-02 error                                                                                                                                       |
| AC-8.4   | Yes           | All price displays (S-02, S-03, S-04, S-07, S-09, S-10, S-11)                                                                                    |
| AC-8.5   | Yes           | S-02 visitor (no cart actions); S-01 visitor                                                                                                     |
| AC-8.6   | NU            | Seed procedure                                                                                                                                   |
| AC-9.1   | Yes           | S-03 success                                                                                                                                     |
| AC-9.2   | Yes           | S-03 not found                                                                                                                                   |
| AC-9.3   | Yes           | S-03 visitor path; S-06 return to product                                                                                                        |
| AC-10.1  | Yes           | S-03 add success; S-01 count                                                                                                                     |
| AC-10.2  | Yes           | S-03 add (same product again); S-04 single line                                                                                                  |
| AC-10.3  | Yes           | S-03 quantity validation                                                                                                                         |
| AC-10.4  | NU            | API 404 (UI fallback: S-03 "no longer available" per UX-OQ-9)                                                                                    |
| AC-10.5  | NU            | API 401 (UI path is AC-9.3)                                                                                                                      |
| AC-10.6  | NU            | API property whitelist                                                                                                                           |
| AC-10.7  | Yes           | S-03 50-line message                                                                                                                             |
| AC-10.8  | Yes           | S-03 add success at 49 lines                                                                                                                     |
| AC-11.1  | Yes           | S-04 success                                                                                                                                     |
| AC-11.2  | Yes           | S-04 quantity update                                                                                                                             |
| AC-11.3  | Yes           | S-04 quantity validation                                                                                                                         |
| AC-11.4  | Yes           | S-04 remove                                                                                                                                      |
| AC-11.5  | Yes           | S-04 empty                                                                                                                                       |
| AC-11.6  | Yes           | S-04 after sign-out and sign-in                                                                                                                  |
| AC-11.7  | NU            | API ownership check                                                                                                                              |
| AC-11.8  | Yes           | S-04 error                                                                                                                                       |
| AC-12.1  | Yes           | S-05 success                                                                                                                                     |
| AC-12.2  | Yes           | S-05 email validation                                                                                                                            |
| AC-12.3  | Yes           | S-05 password validation                                                                                                                         |
| AC-12.4  | Yes           | S-05 already registered                                                                                                                          |
| AC-12.5  | NU            | Database inspection                                                                                                                              |
| AC-12.6  | NU            | API property whitelist                                                                                                                           |
| AC-12.7  | NU            | Audit log                                                                                                                                        |
| AC-12.8  | NU            | Session credential rotation                                                                                                                      |
| AC-12.9  | NU            | Concurrency / database constraint                                                                                                                |
| AC-12.10 | Yes (partial) | S-05 accepts 128 characters; hashing part NU                                                                                                     |
| AC-13.1  | Yes           | S-06 success, return target                                                                                                                      |
| AC-13.2  | Yes           | S-06 generic failure                                                                                                                             |
| AC-13.3  | Yes           | S-06 submitting/waiting, then success or generic failure                                                                                         |
| AC-13.4  | Yes           | S-06 session-expired banner (idle, 8-hour limit, 401 from keep-alive or automatic check); return to previous page; S-01 warning                  |
| AC-13.5  | NU            | Audit log                                                                                                                                        |
| AC-13.6  | Yes           | S-06 service unavailable                                                                                                                         |
| AC-13.7  | Yes           | S-06 return-target handling (invalid target ignored, lands on S-02)                                                                              |
| AC-13.8  | NU            | Session credential rotation                                                                                                                      |
| AC-13.9  | NU            | Response/timing comparison (visible message covered by AC-13.2)                                                                                  |
| AC-13.10 | Yes (partial) | S-06 no delay after success or after 15 minutes without failure                                                                                  |
| AC-13.11 | Yes (partial) | S-06 generic failure after delay; password check NU                                                                                              |
| AC-13.12 | Yes           | S-06 cap/rate-limited message                                                                                                                    |
| AC-13.13 | NU            | Load/timing behaviour                                                                                                                            |
| AC-13.14 | NU            | Server idle-expiry reset on a user-initiated request; its visible effect is the warning being dismissed or not shown (AC-13.25, 13.29)           |
| AC-13.15 | Yes           | S-01 idle warning with "Stay signed in" at 28 minutes, non-modal (J-26a)                                                                         |
| AC-13.16 | Yes           | S-01 "Stay signed in" success: warning dismissed, "You're still signed in." (J-26a)                                                              |
| AC-13.17 | Yes (partial) | S-01 near the 8-hour limit; S-06 session-expired banner at the limit; server cut-off and 401 timing NU                                           |
| AC-13.18 | Yes           | S-09 processing without user action: S-01 warning at 28 minutes, then S-06 banner and return to S-09 (J-17)                                      |
| AC-13.19 | Yes (partial) | S-09 checks stop at a final state or on 401, then S-06; request counts NU                                                                        |
| AC-13.20 | NU            | API 403 for keep-alive without a valid CSRF token (visible effect covered by AC-13.28)                                                           |
| AC-13.21 | NU            | API 401 for keep-alive without a session (visible effect covered by AC-13.28 and AC-13.4)                                                        |
| AC-13.22 | NU            | API 429 for the 11th keep-alive in a minute (visible effect covered by AC-13.28)                                                                 |
| AC-13.23 | Yes           | S-01 absolute-limit warning without "Stay signed in"; S-06 banner at the limit (J-26d)                                                           |
| AC-13.24 | Yes (partial) | S-01 warning and local time derived from server times; the server exposure of the times is NU                                                    |
| AC-13.25 | Yes           | S-01 in two tabs: no warning after activity in the other tab (J-26e)                                                                             |
| AC-13.26 | Yes           | S-01 in two tabs: "Stay signed in" in one tab dismisses the other within 5 seconds (J-26e)                                                       |
| AC-13.27 | NU            | Server rule for which requests reset the idle timer (marking of automatic requests is Phase 4); visible effects covered by AC-13.18 and AC-13.29 |
| AC-13.28 | Yes           | S-01 failed keep-alive: warning stays, error message, "Try again"; 401 to S-06 (J-26b)                                                           |
| AC-13.29 | Yes           | S-01 warning dismissed by other successful user activity, stays if rejected (J-26c)                                                              |
| AC-14.1  | Yes (partial) | S-01 Sign out; S-12; replay NU                                                                                                                   |
| AC-14.2  | Yes           | S-06 / S-12 after back button                                                                                                                    |
| AC-14.3  | Yes           | S-12 (no error)                                                                                                                                  |
| AC-15.1  | Yes           | S-11 success (stored values)                                                                                                                     |
| AC-15.2  | Yes           | S-11 unchanged after re-seed                                                                                                                     |
| AC-15.3  | Yes (partial) | S-02 (hidden), S-03 (no longer available) per UX-OQ-9                                                                                            |
| AC-15.4  | NU            | Contract test                                                                                                                                    |

AC counts: 130 total; NU = AC-1.5, 2.3, 3.3, 3.6, 4.10, 5.7, 7.1 to 7.6 (6), 8.6, 10.4, 10.5, 10.6, 11.7, 12.5 to 12.9 (5), 13.5, 13.8, 13.9, 13.13, 13.14, 13.20, 13.21, 13.22, 13.27, 15.4 = 32; UI-observable = 98, all mapped. Of the 16 new ACs (AC-13.14 to AC-13.29): UI-observable 11 (13.15, 13.16, 13.17, 13.18, 13.19, 13.23, 13.24, 13.25, 13.26, 13.28, 13.29), NU 5 (13.14, 13.20, 13.21, 13.22, 13.27). Rows marked "partial" are mapped for their visible part; the remaining part is listed as NU in the Screen/state column. The new ACs AC-13.20 to AC-13.22 and AC-13.27 are not reachable from a screen by themselves; their customer-visible effects are the S-01 failed keep-alive state and the dismissal rules, mapped under AC-13.28 and AC-13.29.

Gaps: none for UI-observable ACs. The decided behaviours that touch ACs (UX-OQ-4 for AC-3.15, UX-OQ-9 for AC-15.3 and AC-10.4, UX-OQ-19 for the copy of the new S-01 states) are in section 7.1.

## 9. Requirement change requests (HG-C)

**HG-C-1 — "Stay signed in" session-expiry warning (UX-OQ-15). Resolved: accepted in issue #3; PRD re-approved in PR #4, merge f87d5eb.**

The keep-alive, the definition of user activity, the idle warning, the 8-hour absolute-limit warning, the failed-keep-alive and dismissal behaviour, server-provided expiry times, tab consistency and the keep-alive rate limit are now in the approved PRD revision 10 (US-13 preamble "Session activity and keep-alive", AC-13.14 to AC-13.29, AC-4.4, NFR-9, NFR-14, NFR-20, OQ-48 to OQ-51). The four points raised in revision 2 (activity definition, new endpoint class with its rate limit, missing ACs, whether the 5-second status checks reset the idle timer) are all answered there. This spec was updated to match in revision 3 (S-01, S-09, J-17, J-20, J-26, section 4). The earlier contingency (remove the warning and record a WCAG 2.2.1 exception) no longer applies.

New HG-C requests: none. I checked the UX decisions against PRD revision 10 and found no conflict: UX-OQ-6 (checks pause while the tab is hidden and resume with an immediate check) is consistent because the resume check is an automatic, marked request that does not reset the idle timer; UX-OQ-7 (stop checking at paid, failed, cancelled, expired) matches AC-13.19; the S-09 "Check now" action is a user action and resets the idle timer, as the preamble lists the manual refresh action as user activity. The remaining new items (copy of the failed-keep-alive message, local time format, polite announcement on dismissal) add no behaviour that the PRD forbids; they are UX copy decisions (UX-OQ-19), not requirement changes. If the HG-2 review changes any UX decision in a way that adds behaviour the PRD does not define, that change becomes an HG-C request at that time.

Open dependencies carried from the PRD, not UX changes: the form in which the server exposes the expiry times and the way automatic requests are marked are Phase 4 design decisions (AC-13.24, AC-13.27); the 5-second tolerance for dismissal and tab consistency is confirmed in the PRD.

## 10. Approval

HG-2 (MANDATORY, Tier 3 with UI): UX Lead and Product Owner (@alextthomas holds both roles, OQ-18). This document is submitted for HG-2 and is not approved. The Product Owner is asked to confirm the items in section 7.2 in the HG-2 review. The clickable prototype (Developer, ux-prototype) is a separate output; every journey above should be reachable in it, including the scenario switches for J-16 to J-26 (for the session warning: idle warning, stay signed in success, keep-alive failure with each of 403/429/5xx/network, 401, dismissal by activity, absolute-limit warning, and two tabs).
