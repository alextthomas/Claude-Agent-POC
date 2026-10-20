# PRD — Customer checkout with order history

Feature: `customer-checkout-with-order-history` | Phase 2 (Requirements Engineering) | Revision 3
Status: **Revision 3 — submitted for HG-1 (Product Owner). Not approved.**
Author: requirements-analyst agent | Inputs: `docs/project-charter.md` (approved HG-0, PR #1, merge dd6ea25), `CLAUDE.md`, guide Section 7.4, Product Owner answers of 2026-10-20 (given in the orchestrator session; binding only through the HG-1 PR review)
Classification: Greenfield (no `current-state.md`). Expected risk tier: **Tier 3** (payments, personal data and authentication; final tier set in Phase 5).

Convention: decisions in section 11.1 "Resolved questions" are recorded as "Decided by @alextthomas (Product Owner), 2026-10-20, pending HG-1" and are not final until the HG-1 PR is approved. There are no open questions at revision 3 (section 11.2). References such as "OQ-n" in the text are provenance links to the resolved decision in section 11.1, not provisional values. If the HG-1 review changes a decision, the affected AC is revised and re-enters HG-1.

Revision 2 changes: scope widened to include a basic product catalogue, a customer cart, and basic registration/sign-in (OQ-1, OQ-2 answered); OQ-3 to OQ-18 resolved by acceptance of the proposed defaults; new REQ-14 to REQ-20, US-8 to US-14, AC-8.x to AC-14.x, AC-4.6, NFR-13 to NFR-18; new open questions OQ-19 to OQ-30. Existing IDs are unchanged.

Revision 3 changes: Product Owner answered "accept all" on 2026-10-20; OQ-19 to OQ-30 moved to Resolved with the proposed defaults as written; provisional tags removed from ACs and NFRs; NFR-13 to NFR-18 marked Decided; no open questions remain. No REQ, US, AC or NFR IDs were added or changed.

## 1. Problem statement

The Shop Platform has no way for a customer to find products, build a cart, turn it into a paid order, or see what they previously bought. Without checkout the platform earns nothing; without order history customers cannot confirm or review purchases. This feature lets a customer register and sign in, browse a basic product catalogue, keep a cart, check out and pay by card through a payment provider's hosted page (test mode only, so card data never reaches our servers), and view their own order history and order details.

Because the repository is greenfield, no catalogue, cart, customer account or authentication capability exists. The Product Owner has decided that this feature delivers a minimal version of each (OQ-1, OQ-2).

## 2. Personas

| Persona                             | Description                                                                                         | Goals                                                                                     |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| P-1 Customer                        | A registered, signed-in shopper (synthetic data only in this POC).                                  | Find products, fill a cart, pay safely, confirm the order, look up past orders.           |
| P-2 Visitor                         | An unauthenticated user. May browse the catalogue and view products (read-only); no guest checkout. | Browse products; register or sign in before using the cart, checkout or history.          |
| P-3 Product Owner / Operator        | @alextthomas (see role register).                                                                   | Reliable orders and payment outcomes; an audit trail; privacy and PCI scope kept minimal. |
| S-1 Payment provider (system actor) | Third-party provider, test mode only (no business preference, OQ-3).                                | Collects card details on its hosted page; reports the payment outcome to the platform.    |

## 3. Scope statement

- **In scope:**
  - Basic product catalogue: browse/list and view products; products are seeded, no admin UI.
  - Cart: add, remove, change quantity, view; persisted per customer and kept across sign-out/sign-in.
  - Basic customer accounts: register, sign in, sign out with email and password.
  - Checkout from the cart, order summary, hosted card payment (test mode), payment outcome handling, order confirmation.
  - Order history list and order detail.
  - Audit logging, and privacy and retention rules for order and account data.
- **UI in scope: YES.** The customer-facing web app (React) is in scope for catalogue, product, cart, registration, sign-in, checkout, confirmation, history and detail screens, so Phase 3 (UX spec, prototype, HG-2) applies.
- Out of scope: see section 9.

## 4. Requirements

| ID     | Requirement                                                                                                                                                                                                                                          | Priority |
| :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- |
| REQ-1  | A signed-in customer can start checkout from a non-empty cart. Checkout is refused for an empty cart and for visitors.                                                                                                                               | Must     |
| REQ-2  | Before paying, the customer is shown an order summary (line items, quantities, unit prices, total, currency USD). All amounts are computed by the server; client-supplied prices are ignored.                                                        | Must     |
| REQ-3  | Payment is by card on a payment-provider hosted page or provider tokenisation, in test mode only. Card data (PAN, expiry, CVV) never reaches, is never stored by, and is never logged by our servers.                                                | Must     |
| REQ-4  | An order's status changes to paid only after the server has verified the payment outcome with the provider (authenticated callback or server-to-server lookup), never on a browser claim alone.                                                      | Must     |
| REQ-5  | Checkout is idempotent: repeated submissions, double clicks, retried callbacks and browser back/refresh create at most one order and at most one charge per checkout attempt.                                                                        | Must     |
| REQ-6  | After a successful payment the customer sees a confirmation with an order number (no email is sent). After a declined, failed or cancelled payment the customer sees a clear outcome, is not charged, keeps the cart, and can retry.                 | Must     |
| REQ-7  | A signed-in customer can view a paginated list of their own orders (20 per page), newest first (order number, date, status, total). An empty state is shown when there are none.                                                                     | Must     |
| REQ-8  | A signed-in customer can view the detail of one of their own orders (line items, quantities, prices, total, status, payment status, date, and card brand plus last 4 digits only if supplied by the provider).                                       | Must     |
| REQ-9  | Every checkout, payment, cart and order endpoint requires authentication and enforces ownership: a customer can never read or change another customer's cart, order or payment.                                                                      | Must     |
| REQ-10 | Orders have a defined status model (pending_payment, paid, failed, cancelled, expired; permitted transitions in AC-7.3) and an order total that is immutable once paid.                                                                              | Must     |
| REQ-11 | Security-relevant and business-relevant events (including registration, sign-in outcomes and sign-out) are written to an audit log (see NFR-6).                                                                                                      | Must     |
| REQ-12 | Order, cart and account data follow privacy-by-design: minimisation, owner-only access, stated retention and deletion behaviour (see NFR-8).                                                                                                         | Must     |
| REQ-13 | At checkout the cart is validated (items exist and are purchasable, prices current). On a mismatch the customer is told what changed and no payment is started. No inventory is tracked.                                                             | Should   |
| REQ-14 | The system provides a paginated catalogue list of products (name, price in USD, optional image placeholder; 20 per page). Visitors may browse it.                                                                                                    | Must     |
| REQ-15 | A product detail view shows one product's full details (name, description, price, optional image placeholder).                                                                                                                                       | Must     |
| REQ-16 | A signed-in customer has one cart, persisted per customer: they can add a product, change a line's quantity, remove a line, and view the cart with line totals and cart total. The cart is kept across sign-out/sign-in and across sessions/devices. | Must     |
| REQ-17 | A visitor can register an account with email and password (minimal: no social login, MFA, password reset or email verification).                                                                                                                     | Must     |
| REQ-18 | A registered customer can sign in with email and password and sign out; sign-out invalidates the session on the server.                                                                                                                              | Must     |
| REQ-19 | Authentication is protected by: secure password storage, secure session/token handling, brute-force protection, and non-disclosing sign-in failures (account enumeration resistance). Measurable targets in NFR-13 to NFR-16.                        | Must     |
| REQ-20 | Catalogue products are provided by seed data (synthetic, 100 products) via a repeatable, idempotent seed procedure; no admin UI for products is delivered.                                                                                           | Must     |

## 5. User stories and acceptance criteria

All ACs are Given/When/Then. Time targets are server-side or end-to-end as stated, measured in the CI/staging test environment. Money is USD displayed as `$1,234.56`.

### US-1 Start checkout (REQ-1, REQ-13, REQ-9)

As a customer, I want to start checkout from my cart so that I can pay for the items.

- **AC-1.1** Given I am signed in and my cart has at least one item, when I choose "Checkout", then I am shown the order summary and no payment has been started and no order is marked paid.
- **AC-1.2** Given I am signed in and my cart is empty, when I attempt to check out (via UI or API), then checkout is refused with a message stating the cart is empty (API: HTTP 4xx with the error model), and no order record is created.
- **AC-1.3** Given I am not signed in, when I attempt to start checkout (UI or API), then the API returns HTTP 401, no order is created, and the UI directs me to sign in; after I sign in, my cart is intact (see AC-11.6).
- **AC-1.4** Given my cart contains an item that is no longer purchasable or whose price has changed since it was added, when I start checkout, then no payment is started, the message lists each affected item and the change, and I can return to the cart.
- **AC-1.5** Given I send a checkout request referencing a cart owned by another customer, when the API processes it, then it returns HTTP 404 and creates nothing.

### US-2 Review order summary (REQ-2)

As a customer, I want to see exactly what I will pay so that I can confirm before paying.

- **AC-2.1** Given I am at checkout, when the summary loads, then it lists every cart line with name, quantity, unit price and line total, plus the order total, all formatted as USD (`$1,234.56`).
- **AC-2.2** Given a summary is displayed, when I compare amounts, then the order total equals the sum of line totals (no tax, shipping or discounts), with zero rounding discrepancy in 100% of the automated test cases.
- **AC-2.3** Given I submit checkout with client-modified prices or totals, when the server processes it, then the stored order uses server-side prices and the tampered values are ignored (verified by an API test comparing stored total to catalogue prices).
- **AC-2.4** Given the summary cannot be loaded (server error), when the failure occurs, then an error message with a retry action is shown and the cart is unchanged.

### US-3 Pay by card via hosted payment (REQ-3, REQ-4, REQ-5)

As a customer, I want to pay by card on a secure page so that my card details stay protected.

- **AC-3.1** Given I confirm the summary, when I choose "Pay", then I am taken to the provider's hosted payment page (or provider-hosted fields) and the amount shown there equals the order total.
- **AC-3.2** Given I complete a payment in a recorded end-to-end run, when the HTTP traffic to our API and the application logs and database are inspected, then there are 0 occurrences of a PAN, CVV or expiry value, and no card input fields are rendered by our own pages outside provider-hosted content.
- **AC-3.3** Given the application is configured with a non-test (live) provider credential, when the API starts, then it refuses to start (or refuses to initiate payments) and logs a configuration error without printing the credential.
- **AC-3.4** Given I click "Pay" twice within 1 second, or refresh or navigate back and resubmit, when the requests are processed, then exactly 1 order and exactly 1 provider payment/charge exist for that checkout attempt.
- **AC-3.5** Given the provider reports a successful payment, when the server verifies it with the provider, then the order status becomes "paid" and the paid amount equals the order total.
- **AC-3.6** Given the provider's confirmation callback is delivered more than once, when each delivery is processed, then the order is updated once and later deliveries return success without changing the order.
- **AC-3.7** Given a callback or return request that fails authenticity verification (invalid signature or unknown reference), when it is received, then it is rejected with HTTP 4xx, the order is unchanged, and an audit event is written.

### US-4 See the payment outcome (REQ-6, REQ-4)

As a customer, I want a clear result after paying so that I know whether my order went through.

- **AC-4.1** Given my payment succeeded, when I return to the shop, then a confirmation page shows the order number, total and status within 5 seconds of the return, and no email is sent.
- **AC-4.2** Given my card was declined or the payment failed, when I return to the shop, then I see a failure message that does not expose provider internals, no paid order exists, I am not charged, my cart is intact, and I can start payment again.
- **AC-4.3** Given I cancel on the hosted payment page, when I return to the shop, then the order is not paid, I am not charged, my cart is intact, and I can retry or leave.
- **AC-4.4** Given the provider has not yet reported a final result when I return, when the confirmation page loads, then it shows a "payment processing" state, and it shows the final state within 30 seconds of the provider's result; if the provider result never arrives, the page keeps showing "payment processing" with a refresh action, the server reconciles with a provider lookup, and the order is marked expired after 30 minutes (AC-4.5).
- **AC-4.5** Given a payment is never completed, when 30 minutes have elapsed since the order was created, then the pending order is marked "expired", is not shown as paid, and is not shown in order history.
- **AC-4.6** Given my payment is verified as successful, when the order becomes paid, then my cart is emptied; given the payment is not successful, then the cart is not emptied (pending, failed, cancelled and expired orders leave the cart untouched).

### US-5 View my order history (REQ-7, REQ-9)

As a customer, I want to see a list of my orders so that I can review what I bought.

- **AC-5.1** Given I am signed in and have orders, when I open order history, then I see only my own orders with status paid, pending_payment or failed (cancelled and expired orders are not listed), newest first, each with order number, date, status and total.
- **AC-5.2** Given I have more than 20 orders, when I open order history, then 20 are shown with a way to reach the next page, and every order appears exactly once across pages with none missed or repeated.
- **AC-5.3** Given I have no orders, when I open order history, then an empty state with a call to action to continue shopping is shown, not an error.
- **AC-5.4** Given I have just completed a payment, when I open order history, then the new order appears within 5 seconds of the confirmation.
- **AC-5.5** Given I am not signed in, when I request order history (UI or API), then the API returns HTTP 401 and no order data is returned.
- **AC-5.6** Given order history fails to load, when the error occurs, then an error message with a retry action is shown and no partial or stale data of another customer is displayed.
- **AC-5.7** Given two customers each have orders, when customer A requests history, then 0 of customer B's orders appear in any response (verified for list and pagination parameters).

### US-6 View order detail (REQ-8, REQ-9)

As a customer, I want to open one order so that I can see exactly what it contained and its status.

- **AC-6.1** Given I select one of my orders, when the detail loads, then it shows order number, date, status, payment status, each line (name, quantity, unit price, line total) and the total.
- **AC-6.2** Given I request an order id that belongs to another customer, when the API processes it, then it returns HTTP 404 with a response body identical to that for a non-existent order, and an audit event is written.
- **AC-6.3** Given I request a non-existent or malformed order id, when the API processes it, then it returns HTTP 404 (non-existent) or 400 (malformed) using the standard error model.
- **AC-6.4** Given any order detail response, when its payload is inspected, then it contains no PAN, CVV or provider secret, and shows only card brand and last 4 digits if supplied by the provider, otherwise no payment card data.
- **AC-6.5** Given I am not signed in, when I request an order detail, then the API returns HTTP 401.

### US-7 Audit and privacy of order data (REQ-11, REQ-12, REQ-10)

As the product owner, I want an audit trail and privacy controls on order data so that payments are traceable and personal data is protected.

- **AC-7.1** Given any of: checkout started, order created, payment outcome received (success, failure, cancel), callback rejected, ownership-check denial, registration, sign-in success, sign-in failure, lockout, sign-out, when it occurs, then an audit event is recorded with timestamp (UTC), event type, actor id (or attempted email hash for unauthenticated attempts), order id where applicable, outcome and correlation id, and with no card data, passwords or secrets.
- **AC-7.2** Given the audit log and application logs, when sampled across a full end-to-end test run, then 0 entries contain PAN, CVV, passwords, session credentials, provider secret keys, or full customer personal data beyond identifiers.
- **AC-7.3** Given an order status change, when it is attempted, then only these transitions are accepted: pending_payment to paid, failed, cancelled or expired; no transition out of paid, failed, cancelled or expired. Any other transition is rejected and audited.
- **AC-7.4** Given an order is paid, when any request attempts to change its total or line items, then the change is rejected.
- **AC-7.5** Given the data is synthetic, when the POC environment is torn down, then orders, carts, accounts and audit records are deleted with the environment and a record of the teardown is kept; no customer-initiated deletion is offered.

### US-8 Browse the catalogue (REQ-14, REQ-20)

As a shopper, I want to browse the products so that I can find something to buy.

- **AC-8.1** Given the catalogue contains products, when I open the catalogue, then I see products with name, price and optional image placeholder, 20 per page, and every product appears exactly once across pages.
- **AC-8.2** Given the catalogue contains no products, when I open it, then an empty state is shown, not an error.
- **AC-8.3** Given the catalogue fails to load, when the error occurs, then an error message with a retry action is shown.
- **AC-8.4** Given product prices of $0.50, $1,234.56 and $1,000,000.00, when they are displayed anywhere in the UI, then each is shown in exactly that USD format (currency symbol, thousands separator, two decimals).
- **AC-8.5** Given I am not signed in, when I request the catalogue list (UI or API), then I can view it (HTTP 200) and no cart actions are available to me.
- **AC-8.6** Given the seed procedure is run twice on an empty database, when it completes, then the catalogue contains the same 100 products with no duplicates.

### US-9 View a product (REQ-15)

As a shopper, I want to see a product's details so that I can decide whether to buy it.

- **AC-9.1** Given a product exists, when I open it, then I see its name, description, price in USD and an "Add to cart" action (and the optional image placeholder).
- **AC-9.2** Given I request a product id that does not exist, when the page or API is called, then HTTP 404 and a "product not found" state with a link back to the catalogue are shown.
- **AC-9.3** Given I am not signed in, when I choose "Add to cart", then no cart change occurs and I am directed to sign in, after which I return to the product.

### US-10 Add a product to my cart (REQ-16, REQ-9)

As a customer, I want to add products to my cart so that I can buy several things at once.

- **AC-10.1** Given I am signed in, when I add product P with quantity 2, then my cart contains one line for P with quantity 2 and the cart count shown to me is updated.
- **AC-10.2** Given my cart already has a line for P, when I add P again, then the existing line's quantity is increased and no second line for P is created.
- **AC-10.3** Given a line's quantity would exceed 10, or I submit a quantity of 0, a negative number or a non-integer, when the request is processed, then it is rejected (HTTP 400) with a message stating the allowed range and the cart is unchanged.
- **AC-10.4** Given I add a product id that does not exist, when the request is processed, then HTTP 404 is returned and the cart is unchanged.
- **AC-10.5** Given I am not signed in, when I call the add-to-cart API, then HTTP 401 is returned and nothing is stored.
- **AC-10.6** Given the request contains properties not in the contract (for example a client-supplied price), when it is processed, then it is rejected with HTTP 400 and the cart is unchanged.

### US-11 Manage and view my cart (REQ-16, REQ-9)

As a customer, I want to view and change my cart so that it contains exactly what I want to buy.

- **AC-11.1** Given my cart has lines, when I open the cart, then each line shows product name, quantity, unit price and line total, and the cart total equals the sum of line totals in USD format.
- **AC-11.2** Given a cart line, when I change its quantity to a valid value (1 to 10), then the line total and cart total update and the new quantity persists after reload.
- **AC-11.3** Given a cart line, when I change its quantity to an invalid value (0, negative, non-integer, above 10), then the change is rejected with a message stating the allowed range and the quantity is unchanged.
- **AC-11.4** Given a cart line, when I remove it, then it disappears, the totals update, and it stays removed after reload.
- **AC-11.5** Given my cart is empty, when I open it, then an empty state with a link to the catalogue is shown and the checkout action is unavailable.
- **AC-11.6** Given I have a cart with lines, when I sign out and sign in again (or sign in from a second browser), then the cart contents are identical to before.
- **AC-11.7** Given a cart line id that belongs to another customer, when I try to read, change or remove it via the API, then HTTP 404 is returned, nothing changes, and 0 of the other customer's cart data appears in the response.
- **AC-11.8** Given the cart fails to load, when the error occurs, then an error message with a retry action is shown and no other customer's data is displayed.

### US-12 Register an account (REQ-17, REQ-19)

As a visitor, I want to register with my email and a password so that I can shop and see my orders.

- **AC-12.1** Given I provide a valid email and a password meeting the policy (12 to 128 characters, not on a common-password list), when I submit registration, then an account is created, I am signed in automatically, and no password or hash appears in the response.
- **AC-12.2** Given an email that is not a valid address format, when I submit, then the field shows a validation message and no account is created (API: HTTP 400).
- **AC-12.3** Given a password that does not meet the policy (fewer than 12 or more than 128 characters, or on a common-password list; no composition rules), when I submit, then the password field states the rule that failed and no account is created.
- **AC-12.4** Given an account exists for an email, when someone registers with the same email in any letter case (email trimmed, compared case-insensitively, maximum 254 characters), then no second account is created and the response is HTTP 409 with a message that the email is already registered.
- **AC-12.5** Given an account was created, when the database is inspected, then the stored credential is a salted, adaptive one-way hash and 0 plaintext or reversibly encrypted passwords exist (NFR-13).
- **AC-12.6** Given the registration request contains properties not in the contract, when it is processed, then it is rejected with HTTP 400 and no account is created.
- **AC-12.7** Given registration succeeded, when the audit log is read, then a registration event exists without the password (AC-7.1).

### US-13 Sign in (REQ-18, REQ-19)

As a registered customer, I want to sign in so that I can use my cart and see my orders.

- **AC-13.1** Given a registered account, when I submit the correct email and password, then I am signed in, a session is established per NFR-14, and I am taken to the page I originally requested (or the catalogue).
- **AC-13.2** Given a wrong password for an existing email, or an email with no account, when I submit, then the HTTP status, response body and visible message are identical in both cases ("Email or password is incorrect") and reveal nothing about whether the account exists (NFR-16).
- **AC-13.3** Given 5 failed sign-in attempts for one account within 15 minutes, when a sixth attempt is made, then it is rejected (HTTP 429) even with the correct password until the 15-minute lockout ends, the message does not confirm the account exists, and a lockout audit event is written.
- **AC-13.4** Given my session has expired (30 minutes idle or 8 hours absolute), when I make an authenticated request, then HTTP 401 is returned and the UI directs me to sign in and returns me to my previous page afterwards.
- **AC-13.5** Given a sign-in succeeds or fails, when the audit log is read, then an event with outcome exists and contains no password.
- **AC-13.6** Given the sign-in service is unavailable, when I submit, then a generic error with a retry action is shown and no session is created.

### US-14 Sign out (REQ-18)

As a signed-in customer, I want to sign out so that nobody else can use my account on this device.

- **AC-14.1** Given I am signed in, when I choose "Sign out", then my session is invalidated on the server, and replaying the previous session credential returns HTTP 401.
- **AC-14.2** Given I have signed out, when I use the browser's back button or open a protected page, then no cart, order or account data is shown and I am directed to sign in.
- **AC-14.3** Given my session has already expired, when I choose "Sign out", then I am shown the signed-out state without an error.

## 6. Non-functional requirements

Every NFR below was accepted by the Product Owner on 2026-10-20 (pending HG-1): NFR-3 and NFR-5 to NFR-11 via OQ-15, NFR-13 to NFR-18 via OQ-29, others as referenced in the Status column.

| ID     | Category                       | Requirement                                                                                               | Target / measure                                                                                                                                                                                                                                                                                                                                                              | Status                    |
| :----- | :----------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------ |
| NFR-1  | Security (PCI)                 | Card data never touches our systems (SAQ A equivalent).                                                   | 0 PAN/CVV/expiry in requests, logs, DB, backups, traces (automated scan in E2E, AC-3.2, AC-7.2). Test-mode keys only.                                                                                                                                                                                                                                                         | Charter-derived           |
| NFR-2  | Security (AuthN/Z)             | All checkout, payment, cart and order endpoints are authenticated and ownership-checked.                  | 100% of such endpoints have a guard and ownership test; 0 cross-customer reads/writes in the negative test suite.                                                                                                                                                                                                                                                             | Charter/CLAUDE.md-derived |
| NFR-3  | Security (input/transport)     | Input validation and transport security.                                                                  | DTO whitelist + forbidNonWhitelisted on 100% of endpoints; TLS 1.2+ in staging/production; 0 High/Critical findings in dependency audit and SAST at release.                                                                                                                                                                                                                  | Decided (OQ-15)           |
| NFR-4  | Security (abuse)               | Rate limiting on checkout and payment endpoints.                                                          | Max 10 checkout initiations per customer per minute; HTTP 429 beyond the limit.                                                                                                                                                                                                                                                                                               | Decided (OQ-16)           |
| NFR-5  | Performance                    | Server response time excluding provider time.                                                             | Order history list p95 <= 500 ms and order detail p95 <= 300 ms at 50 concurrent users with 1,000 orders per customer; checkout initiation p95 <= 800 ms. Verified with k6 (Tier 3).                                                                                                                                                                                          | Decided (OQ-15)           |
| NFR-6  | Audit                          | Audit trail of events in AC-7.1.                                                                          | 100% of listed events recorded; each record has the fields in AC-7.1; audit records kept for the life of the POC environment and purged on teardown; records cannot be edited or deleted by application users.                                                                                                                                                                | Decided (OQ-13, OQ-15)    |
| NFR-7  | Availability                   | Service availability of checkout, catalogue, cart, history and sign-in.                                   | 99.5% monthly in production, measured via health endpoint; staging best effort. Payment provider outage produces a handled error (AC-4.2 style), not a crash.                                                                                                                                                                                                                 | Decided (OQ-15)           |
| NFR-8  | Privacy                        | Minimisation, owner-only access, retention, synthetic data.                                               | Only data needed for accounts, carts and orders is stored (account: email and password hash only); no real personal data (charter); owner-only access (NFR-2); retention per AC-7.5; personal data and passwords excluded from logs (0 occurrences, AC-7.2).                                                                                                                  | Decided (OQ-13, OQ-27)    |
| NFR-9  | Accessibility                  | Customer-facing UI conforms to WCAG 2.2 AA.                                                               | 0 critical/serious axe violations on catalogue, product, cart, registration, sign-in, checkout, confirmation, history and detail screens; full journeys completable by keyboard only; form errors programmatically associated with fields; manual screen-reader check before HG-5.                                                                                            | Decided (OQ-15)           |
| NFR-10 | Reliability / data integrity   | No duplicate orders or charges; consistent order/payment state.                                           | 0 duplicates in a test of 100 repeated or concurrent submissions per scenario; DB changes reversible with documented rollback.                                                                                                                                                                                                                                                | Decided (OQ-15)           |
| NFR-11 | Observability                  | Traceability of requests.                                                                                 | 100% of API requests carry a correlation id in logs; health endpoint reports DB and provider-reachability status.                                                                                                                                                                                                                                                             | Decided (OQ-15)           |
| NFR-12 | Compatibility                  | Supported browsers/devices/languages.                                                                     | Latest two versions of Chrome, Firefox, Safari and Edge, desktop and mobile widths; English only.                                                                                                                                                                                                                                                                             | Decided (OQ-17)           |
| NFR-13 | Security (password storage)    | Passwords stored only as salted, adaptive, one-way hashes.                                                | 0 plaintext or reversibly encrypted passwords in DB, logs, backups, traces; hashing cost calibrated so one verification takes 100 to 500 ms on staging hardware; algorithm chosen in Phase 4; a stored hash is never returned by any endpoint (0 occurrences in responses). Password policy: 12 to 128 characters, no composition rules, common-password list rejected.       | Decided (OQ-22, OQ-29)    |
| NFR-14 | Security (session/token)       | Session credentials are unguessable, protected in transit and storage, bounded in lifetime and revocable. | Credential has >= 128 bits of entropy; not readable by page scripts and not placed in URLs (0 occurrences in URLs and logs); sent only over TLS in staging/production; idle timeout 30 minutes and absolute lifetime 8 hours; invalidated server-side on sign-out in 100% of cases; state-changing requests rejected (4xx) without CSRF protection in 100% of negative tests. | Decided (OQ-23, OQ-29)    |
| NFR-15 | Security (brute force)         | Sign-in and registration are protected against guessing and automation.                                   | Per account: max 5 failed sign-ins in 15 minutes, then 15-minute lockout; per source IP: max 20 sign-in attempts and max 10 registrations per 15 minutes; HTTP 429 beyond limits; 100% of lockouts audited.                                                                                                                                                                   | Decided (OQ-24, OQ-29)    |
| NFR-16 | Security (account enumeration) | Sign-in failures do not reveal whether an account exists.                                                 | Wrong-password and unknown-email sign-in responses are identical in status code, body and headers (excluding Date and correlation id); median response-time difference <= 50 ms over 200 samples each. Registration discloses an existing email (HTTP 409; no email verification) and is limited by NFR-15.                                                                   | Decided (OQ-25, OQ-29)    |
| NFR-17 | Performance (new capabilities) | Server response time for catalogue, cart and authentication.                                              | Catalogue list and product detail p95 <= 300 ms; cart operations p95 <= 300 ms; sign-in and registration p95 <= 1,000 ms; all at 50 concurrent users with 100 seeded products. Verified with k6.                                                                                                                                                                              | Decided (OQ-20, OQ-29)    |
| NFR-18 | Privacy (accounts)             | Account data is minimal and is never exposed to others.                                                   | Account endpoints return only the caller's own data; stored account fields limited to email and password hash (plus identifiers and timestamps); 0 account data in logs beyond identifier.                                                                                                                                                                                    | Decided (OQ-27, OQ-29)    |

## 7. Assumptions

| ID  | Assumption                                                                                                                            | Basis                                                |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------- |
| A-1 | Only synthetic personal data exists in all environments, including registered emails.                                                 | Charter section 6 [confirmed by HG-0 approval].      |
| A-2 | Payments are test mode only through a provider-hosted page or tokenisation (SAQ A equivalent).                                        | Charter section 6.                                   |
| A-3 | Stack is as stated in `CLAUDE.md`; the API contract will be `docs/design/openapi.yaml` (a Phase 4 design matter, not specified here). | `CLAUDE.md`.                                         |
| A-4 | A single currency (USD) and a single region are used.                                                                                 | Charter scope; OQ-4 decided.                         |
| A-5 | Staging and production exist as in charter section 7.                                                                                 | Charter.                                             |
| A-6 | Products are created only by seeding; there is no inventory tracking, tax, shipping, discount or address.                             | OQ-5, OQ-6, OQ-26 decided.                           |
| A-7 | There is one cart per customer; guests have no cart.                                                                                  | OQ-2 decided (no guest checkout, cart per customer). |

## 8. Dependencies

| ID  | Dependency                                                                              | Note                                                                                 |
| :-- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| D-1 | Customer account and authentication capability                                          | Delivered by this feature (REQ-17 to REQ-19); no external identity provider.         |
| D-2 | Product catalogue and cart capability                                                   | Delivered by this feature (REQ-14 to REQ-16, REQ-20).                                |
| D-3 | Payment provider with a test mode, hosted page/tokenisation and authenticated callbacks | Provider not chosen; no business preference; Solution Architect proposes in Phase 4. |
| D-4 | PostgreSQL 16 / Prisma migrations with rollback                                         | `CLAUDE.md`.                                                                         |
| D-5 | Hosting for staging and production                                                      | Undecided per charter section 7.                                                     |
| D-6 | Seed data (100 synthetic products) and a repeatable, idempotent seed procedure          | OQ-20, OQ-26 decided.                                                                |

Email service is not a dependency (no confirmation email, no email verification, no password reset).

## 9. Out of scope

- Real card payments, real customer traffic, real personal data (charter).
- Multi-tenant or multi-region deployment (charter).
- Storing cards or card data, saved cards, wallets (other than hosted-page methods the provider offers by default) and non-card payment methods.
- Refunds, returns, cancellations after payment, partial payments, invoices, subscription billing.
- Admin or support tooling for viewing other customers' orders.
- Guest checkout (decided: not allowed) and guest carts.
- Social login, multi-factor authentication, password reset or recovery, email verification (all explicitly out of scope per the Product Owner).
- Account profile editing, account deletion, change of email or password, remember-me, session management screens.
- Admin UI for products or catalogue management (products are seeded; OQ-26 decided).
- Product search, filtering, sorting, categories, reviews and wishlists (the catalogue is list and view only).
- Order search, filtering and export (history is a paginated list only).
- Shipping, fulfilment and tracking; tax, discounts and promo codes; delivery address; inventory tracking and reservation.
- Confirmation or any other email.
- Non-USD currencies, languages other than English.

## 10. Risks

| ID   | Risk                                                                                                               | Likelihood / impact | Mitigation proposal                                                                                                           |
| :--- | :----------------------------------------------------------------------------------------------------------------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| R-1  | Scope widened to catalogue, cart and authentication: effort and delivery risk are much larger than checkout alone. | High / High         | Split into tasks by capability in Phase 5; keep each minimal.                                                                 |
| R-2  | Card data leaks into logs, DB or traces.                                                                           | Low / Critical      | NFR-1 automated scans; hosted page only; Tier 3 review.                                                                       |
| R-3  | Duplicate orders or charges from retries and callbacks.                                                            | Medium / High       | REQ-5, AC-3.4, AC-3.6, NFR-10.                                                                                                |
| R-4  | Broken access control exposes other customers' carts or orders.                                                    | Medium / Critical   | REQ-9, AC-5.7, AC-6.2, AC-11.7, NFR-2 negative tests.                                                                         |
| R-5  | Forged payment confirmations mark orders paid.                                                                     | Medium / High       | REQ-4, AC-3.7.                                                                                                                |
| R-6  | Provider test-mode outage or limits stall CI and E2E.                                                              | Medium / Medium     | Provider choice with a sandbox; stubbed provider for CI (design decision).                                                    |
| R-7  | Single human holds all gate roles; weak independence on a Tier 3 feature.                                          | Known / Medium      | Compensating controls in the role register.                                                                                   |
| R-8  | The repository is public: leaked test keys, seed credentials or personal data.                                     | Low / High          | Secrets via env vars only; synthetic data only; no seeded accounts with real-looking passwords committed (charter section 5). |
| R-9  | Hand-built authentication has weaknesses (weak hashing, session fixation, CSRF, enumeration, brute force).         | Medium / Critical   | REQ-19, NFR-13 to NFR-16, Tier 3 security review, negative tests.                                                             |
| R-10 | Registration reveals which emails are registered (no email verification possible).                                 | High / Low          | Accepted (OQ-25); rate limiting (NFR-15); data is synthetic.                                                                  |
| R-11 | Minimal accounts without password reset lock users out permanently after a forgotten password.                     | Medium / Low        | Accepted by Product Owner (out of scope); synthetic accounts only.                                                            |

## 11. Questions

### 11.1 Resolved questions

Each decision below: **Decided by: @alextthomas (Product Owner), 2026-10-20, pending HG-1.** Decisions were given in the orchestrator session; the binding approval is the HG-1 PR review. "Accepted default" means the proposed default recorded in the earlier revision was accepted as written.

| ID    | Question                                                                                                                                                                  | Decision                                                                                                                                                                                                                                        | Affected REQ/AC                                   |
| :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------ |
| OQ-1  | Do a catalogue and cart exist, or must this feature deliver them?                                                                                                         | Overridden default: this feature delivers a basic catalogue (browse/list, view; seeded, no admin UI) and a cart (add, remove, change quantity, view; persisted per customer).                                                                   | REQ-14 to REQ-16, REQ-20, US-8 to US-11           |
| OQ-2  | How are customers identified; guest checkout; cart kept across sign-in?                                                                                                   | Overridden default: basic registration and sign-in with email and password (register, sign in, sign out). Guest checkout not allowed. Cart kept across sign-out/sign-in. Social login, MFA, password reset and email verification out of scope. | REQ-17 to REQ-19, US-12 to US-14, AC-1.3, AC-11.6 |
| OQ-3  | Which payment provider?                                                                                                                                                   | Accepted default: no business preference; Solution Architect proposes, with a stub for CI.                                                                                                                                                      | REQ-3, REQ-4, D-3                                 |
| OQ-4  | Currency and display format?                                                                                                                                              | USD, displayed as `$1,234.56`.                                                                                                                                                                                                                  | REQ-2, AC-2.1, AC-8.4                             |
| OQ-5  | Tax, shipping, discounts, address in scope?                                                                                                                               | Accepted default: none in scope; total is sum of line items; no address collected.                                                                                                                                                              | REQ-2, AC-2.1, AC-2.2                             |
| OQ-6  | Stock or price change between cart and checkout; inventory?                                                                                                               | Accepted default: no inventory tracking; price changes block checkout and are shown to the customer.                                                                                                                                            | REQ-13, AC-1.4                                    |
| OQ-7  | Pending order expiry?                                                                                                                                                     | Accepted default: 30 minutes.                                                                                                                                                                                                                   | AC-4.5                                            |
| OQ-8  | Order status model?                                                                                                                                                       | Accepted default: pending_payment -> paid / failed / cancelled / expired; cancelled and expired orders are hidden from history; pending and failed are shown with their status.                                                                 | REQ-10, AC-4.5, AC-5.1, AC-7.3                    |
| OQ-9  | Payment info shown to customer?                                                                                                                                           | Accepted default: brand and last 4 only if the provider supplies them; otherwise none.                                                                                                                                                          | REQ-8, AC-6.4                                     |
| OQ-10 | Behaviour if provider result never arrives?                                                                                                                               | Accepted default: show "payment processing" with refresh; reconcile with provider lookup; mark expired per OQ-7.                                                                                                                                | AC-4.4                                            |
| OQ-11 | History page size and sort?                                                                                                                                               | Accepted default: 20 per page, newest first, no other sort or filter.                                                                                                                                                                           | REQ-7, AC-5.2                                     |
| OQ-12 | 404 or 403 for another customer's order?                                                                                                                                  | Accepted default: 404 with identical body to "not found".                                                                                                                                                                                       | REQ-9, AC-6.2                                     |
| OQ-13 | Retention and deletion method?                                                                                                                                            | Accepted default: synthetic data; orders and audit records kept for the life of the POC environment, purged on teardown; no customer-initiated deletion.                                                                                        | REQ-12, NFR-6, NFR-8, AC-7.5                      |
| OQ-14 | Confirmation email?                                                                                                                                                       | Accepted default: no email; on-screen confirmation only.                                                                                                                                                                                        | REQ-6, AC-4.1                                     |
| OQ-15 | Revision-1 NFR targets acceptable?                                                                                                                                        | Accepted default: accept NFR-3, NFR-5 to NFR-7, NFR-9 to NFR-11 as proposed.                                                                                                                                                                    | NFR-3, NFR-5 to NFR-11                            |
| OQ-16 | Rate limit for checkout/payment endpoints?                                                                                                                                | Accepted default: 10 checkout initiations per customer per minute.                                                                                                                                                                              | NFR-4                                             |
| OQ-17 | Supported browsers, devices, languages?                                                                                                                                   | Accepted default: latest two versions of Chrome, Firefox, Safari, Edge; desktop and mobile widths; English only.                                                                                                                                | NFR-12                                            |
| OQ-18 | UX Lead for HG-2; approver of HG-1 under single-human register?                                                                                                           | Accepted default: @alextthomas holds both roles per the role register.                                                                                                                                                                          | Phase 3 / HG-1, HG-2                              |
| OQ-19 | May unauthenticated visitors browse the catalogue and view products?                                                                                                      | Accepted default: yes, read-only for visitors; cart actions require sign-in.                                                                                                                                                                    | REQ-14, AC-8.5, AC-9.3, P-2                       |
| OQ-20 | Which product attributes are shown, how many seed products, and what is the catalogue page size?                                                                          | Accepted default: name, description, price (USD), optional image placeholder; 100 seeded products; 20 per page.                                                                                                                                 | REQ-14, REQ-15, REQ-20, AC-8.1, AC-9.1, NFR-17    |
| OQ-21 | What are the cart quantity limits (per line, lines per cart)?                                                                                                             | Accepted default: quantity 1 to 10 per line; no limit on number of lines beyond 50.                                                                                                                                                             | REQ-16, AC-10.3, AC-11.2, AC-11.3                 |
| OQ-22 | What is the password policy?                                                                                                                                              | Accepted default: minimum 12, maximum 128 characters, no composition rules, rejected if on a common-password list.                                                                                                                              | REQ-17, AC-12.3, NFR-13                           |
| OQ-23 | What are the session idle and absolute lifetimes?                                                                                                                         | Accepted default: 30 minutes idle, 8 hours absolute.                                                                                                                                                                                            | REQ-18, AC-13.4, NFR-14                           |
| OQ-24 | What are the brute-force thresholds and lockout behaviour?                                                                                                                | Accepted default: 5 failures per account per 15 minutes then 15-minute lockout; 20 sign-in attempts and 10 registrations per source IP per 15 minutes.                                                                                          | REQ-19, AC-13.3, NFR-15                           |
| OQ-25 | Registration cannot be neutral about existing emails without email verification. Accept that registration discloses that an email is registered (while sign-in does not)? | Accepted default: accept; HTTP 409 "already registered", rate limited per NFR-15.                                                                                                                                                               | REQ-19, AC-12.4, NFR-16                           |
| OQ-26 | Who supplies seed product content, and is any admin or product-management UI essential?                                                                                   | Accepted default: synthetic seed script, repeatable and idempotent; no admin UI; price changes by re-seeding.                                                                                                                                   | REQ-20, AC-8.6, D-6                               |
| OQ-27 | What account fields are collected, and how is the email normalised and validated?                                                                                         | Accepted default: email and password only (no name); email trimmed and compared case-insensitively; maximum 254 characters.                                                                                                                     | REQ-17, REQ-12, AC-12.4, NFR-8, NFR-18            |
| OQ-28 | Is the customer signed in automatically after registering?                                                                                                                | Accepted default: yes, signed in automatically.                                                                                                                                                                                                 | REQ-17, AC-12.1                                   |
| OQ-29 | Are the new NFR targets NFR-13 to NFR-18 acceptable?                                                                                                                      | Accepted default: accept as proposed in section 6.                                                                                                                                                                                              | NFR-13 to NFR-18                                  |
| OQ-30 | What happens to the cart after a successful payment, and while an order is pending payment?                                                                               | Accepted default: cart emptied once payment is verified as paid; cart untouched while pending, failed, cancelled or expired.                                                                                                                    | REQ-6, AC-4.6                                     |

### 11.2 Open questions

No open questions at revision 3.

## 12. Traceability summary (REQ -> US -> AC)

| REQ    | US                             | ACs                                    |
| :----- | :----------------------------- | :------------------------------------- |
| REQ-1  | US-1                           | AC-1.1, 1.2, 1.3, 1.5                  |
| REQ-2  | US-2                           | AC-2.1, 2.2, 2.3, 2.4                  |
| REQ-3  | US-3                           | AC-3.1, 3.2, 3.3                       |
| REQ-4  | US-3, US-4                     | AC-3.5, 3.6, 3.7, 4.1, 4.4             |
| REQ-5  | US-3                           | AC-3.4, 3.6                            |
| REQ-6  | US-4                           | AC-4.1, 4.2, 4.3, 4.4, 4.6             |
| REQ-7  | US-5                           | AC-5.1 to 5.7                          |
| REQ-8  | US-6                           | AC-6.1, 6.4                            |
| REQ-9  | US-1, US-5, US-6, US-10, US-11 | AC-1.5, 5.5, 5.7, 6.2, 6.5, 10.5, 11.7 |
| REQ-10 | US-4, US-7                     | AC-4.5, 7.3, 7.4                       |
| REQ-11 | US-7                           | AC-7.1, 7.2, 12.7, 13.5                |
| REQ-12 | US-7                           | AC-7.2, 7.5                            |
| REQ-13 | US-1                           | AC-1.4                                 |
| REQ-14 | US-8                           | AC-8.1 to 8.5                          |
| REQ-15 | US-9                           | AC-9.1 to 9.3                          |
| REQ-16 | US-10, US-11                   | AC-10.1 to 10.6, AC-11.1 to 11.8       |
| REQ-17 | US-12                          | AC-12.1 to 12.7                        |
| REQ-18 | US-13, US-14                   | AC-13.1, 13.4, 13.6, 14.1 to 14.3      |
| REQ-19 | US-12, US-13                   | AC-12.5, 13.2, 13.3, 13.5              |
| REQ-20 | US-8                           | AC-8.6                                 |

## 13. Approval

HG-1 (MANDATORY): Product Owner approval of the PRD PR titled `[HG-1] PRD: customer-checkout-with-order-history`. A lightweight Critical Review of this PRD for ambiguity is recommended (Tier 3), especially for the new authentication requirements. This document is not approved.
