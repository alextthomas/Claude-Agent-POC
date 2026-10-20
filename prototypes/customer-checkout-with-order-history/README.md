# Prototype: customer checkout with order history (Phase 3)

**Throwaway, never shipped.** This is a clickable UX prototype built from
`docs/ux/customer-checkout-with-order-history.md` (revision 3, submitted for HG-2). It exists so the Product
Owner / UX Lead can review the screens, copy and states. Nothing in `apps/**` or `packages/**` may import from
this folder, and this folder imports nothing from them.

- Mocked data only: 100 synthetic products, a synthetic cart and 50 synthetic orders.
- No backend calls, no real authentication, no secrets, no payment provider SDK. The provider hosted page
  (E-1) is a mock screen.
- Mock "server" state lives in this browser's `localStorage` (key `ccoh-prototype-state-v1`) so reloads
  keep the scenario and so two tabs behave like two tabs of one session (AC-13.25, 13.26). Use
  "Reset all mock data and scenarios" in the controls panel to start over.
- Not a workspace member and has no root `package.json`. Install and build inside this folder only.

## How to run

```
cd prototypes/customer-checkout-with-order-history
npm install
npm run dev        # http://localhost:5199
npm run build      # type-checks (tsc --noEmit) then builds to dist/
npm run preview    # serves the built app on http://localhost:5199
```

Node 22 or later. Dependencies are pinned: react, react-dom, react-router-dom, vite,
@vitejs/plugin-react, typescript (plus the two `@types/react*` packages). `node_modules` and `dist` are
git-ignored.

## Screen to spec map

| Screen                                  | Route                      | Spec section                       | Source file                |
| :-------------------------------------- | :------------------------- | :--------------------------------- | :------------------------- |
| S-01 Application shell, session warning | all pages                  | section 3 S-01, J-26               | `src/components/Shell.tsx` |
| S-02 Catalogue list                     | `/` , `/products`          | S-02, J-8                          | `src/pages/Catalogue.tsx`  |
| S-03 Product detail                     | `/products/:id`            | S-03, J-9, J-10, J-23              | `src/pages/Product.tsx`    |
| S-04 Cart                               | `/cart`                    | S-04, J-11, J-16                   | `src/pages/Cart.tsx`       |
| S-05 Register                           | `/register`                | S-05, J-12                         | `src/pages/Register.tsx`   |
| S-06 Sign in                            | `/sign-in`                 | S-06, J-13, J-20 to J-22           | `src/pages/SignIn.tsx`     |
| S-07 Checkout summary and Pay           | `/checkout`                | S-07, J-1 to J-3, J-16, J-19, J-24 | `src/pages/Checkout.tsx`   |
| S-08 Payment handoff                    | `/checkout/payment?order=` | S-08, J-3                          | `src/pages/Payment.tsx`    |
| E-1 Provider hosted page (mock)         | `/provider/:orderId`       | E-1 (external)                     | `src/pages/Payment.tsx`    |
| S-09 Payment outcome                    | `/orders/:id/outcome`      | S-09, J-4, J-17, J-18, J-25        | `src/pages/Outcome.tsx`    |
| S-10 Order history                      | `/orders`                  | S-10, J-5                          | `src/pages/Orders.tsx`     |
| S-11 Order detail                       | `/orders/:id`              | S-11, J-6, J-15                    | `src/pages/Orders.tsx`     |
| S-12 Signed out                         | `/signed-out`              | S-12, J-14                         | `src/pages/SignedOut.tsx`  |

Mock server rules (reuse, supersede, expiry, session timers, throttling) are in `src/mock/store.ts` and
`src/mock/api.ts`. Session warning times are computed from the mock server's idle and absolute expiry in
`src/lib/session.ts`, not from a browser-only timer (AC-13.24).

## Scenario switcher ("Prototype controls")

Open the black **Prototype controls** button at the bottom right. The panel is not part of the product.

1. **Simulated time and session.** Shows simulated now, idle expiry, the 8-hour limit and the warning
   state. Fast-forward buttons (+5 s to +1 h) move the simulated clock. Everything timer-based follows it:
   the S-09 5-second checks, order expiry (30 minutes), order reuse windows (minutes 20 to 27), the
   session warning (28 minutes) and the 8-hour limit. "Jump to idle warning" goes to exactly 28 minutes after
   the last user activity. "Server ends session" makes the next authenticated request return 401.
2. **Session warning, keep-alive, other tabs (J-26).** Choose the result of "Stay signed in" (success, 403,
   429, 500, network error, 401). "User requests are rejected" shows that a rejected request does not
   dismiss the warning. "Other tab" buttons simulate activity or "Stay signed in" in another tab; opening a
   real second tab also works.
3. **Quick scenarios for J-16 to J-26.** One button each sets up the state and navigates (see table below).
   It also lists the J-22 return-target tests (valid and the nine invalid examples from AC-13.7).
4. **Orders created and provider actions.** Provider unreachable, "old order already paid", S-08 redirect
   stall, the CR-checkout-036/037 resolution switch (spec rule, Resolution A, Resolution B), "next Pay" outcome,
   and a list of orders you created with provider actions (paid, failed, cancelled) for late success (J-18).
5. **Data states per screen.** Loading (stuck), empty, error, 429 and other states for S-02 to S-11, plus cart
   presets (3 lines, empty, 49, 50 lines), a price increase and an unavailable product.
6. **Accounts.** Sign-in result (any credentials, realistic throttling, generic failure, slow 8 s, 429 cap,
   429 per-IP, service unavailable), register result, sign-out failure. With "realistic throttling" the
   valid demo credentials are `demo@example.com` / `correct-horse-battery`; `taken@example.com` is always
   "already registered" on S-05.

UX-OQ-19 is decided (spec commit c318075, still subject to HG-2 approval). The prototype uses that copy: the failed keep-alive copy "Your session was not extended. Try again.", the local-time format in the
absolute-limit message, and the polite "You're still signed in." announcement when activity dismisses the
warning.

Switch a "Loading (stuck)" state back to "Normal" to see the loaded state without reloading.

### Journey recipes

| Journey                             | How to reach it                                                                                                                                                                                       |
| :---------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J-1 to J-6, J-8 to J-15             | Normal browsing: sign in (any credentials), add, check out, "Pay successfully" on E-1. J-15: panel "S-11 changed since purchase".                                                                     |
| J-16 price / purchasability / range | Quick scenarios "J-16 ..." then press Checkout; Back to cart; Checkout again.                                                                                                                         |
| J-17 processing, 5 s checks         | Quick scenario "J-17 processing" or E-1 "Return with no result yet". Use "Check now", provider actions, +30 min for expiry. "+ idle warning" then +2 min shows the 401 on the next automatic check.   |
| J-18 late success                   | "J-18 failed order", then in the orders list press "Provider: paid", then reload S-09 or open S-10/S-11.                                                                                              |
| J-19 provider unreachable / blocked | "J-19a Pay times out once" and "J-19b blocked by unreachable provider".                                                                                                                               |
| J-20 expired session on return      | "J-20 return after session expired", then sign in with anything.                                                                                                                                      |
| J-21 slowdown and 429               | "J-21 realistic slowdown" (fail 3 times, then 1, 2, 4, 8, 16 s delays), "J-21 cap 429", or the sign-in selector (slow, per-IP 429).                                                                   |
| J-22 return to page                 | Visit `/orders` as a visitor, or use the return-target tests.                                                                                                                                         |
| J-23 50-line limit                  | "J-23 cart at 50 lines" or "at 49 lines", then Add to cart.                                                                                                                                           |
| J-24 retry, reuse, supersede        | "J-24 ... N min old, then Pay" for 20, 24, 27 minutes; "provider says old order already paid"; the CR-036/037 switch. The orders list shows the old order becoming `cancelled` (hidden from history). |
| J-25 mismatch                       | "J-25 amount or currency mismatch" or E-1 mismatch button.                                                                                                                                            |
| J-26 a to e                         | "J-26a idle", "J-26b keep-alive fails", "J-26d absolute limit first / 1 min after / under 2 min", "Other tab" buttons, "User requests are rejected".                                                  |

## Accessibility implemented

Skip link first; session warning directly after it (`role="alert"`, never takes focus); landmarks and labelled
`nav`; one `h1` per screen that receives focus on route change; unique document titles; `aria-busy` plus
visible text for loading; `role="alert"` error patterns; polite status regions for add-to-cart, cart updates,
S-09 state changes, sign-in progress and "You're still signed in."; error summaries that receive focus; visible
focus ring and `scroll-padding`; icon plus text for all flags and statuses; `prefers-reduced-motion`; tables
stack at 320 px with `data-label`. Automated axe and a screen-reader pass are not part of this prototype.

## Known limits of the prototype

- The iframe variant of S-08 (UX-OQ-2 alternative) is not built; it is a Phase 4 decision.
- The tab-hidden pause for the S-09 checks is implemented with the Page Visibility API but cannot be toggled from
  the panel (hide the browser tab to test it).
- Dismissal and cross-tab rescheduling are immediate, not "within 5 seconds".
- Rate-limit `Retry-After` pacing for S-09 is not simulated; a rate-limited check shows the quiet note.

**Throwaway, never shipped.**
