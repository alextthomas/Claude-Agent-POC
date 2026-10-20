import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useMock, useNow } from "../hooks";
import { formatClock, formatDateTime, formatDuration } from "../lib/format";
import { MIN, warningInfo } from "../lib/session";
import {
  bumpPrice,
  devCreateOrder,
  devDeliver,
  devPendingOrder,
  endSession,
  fastForward,
  jumpToIdleWarning,
  otherTabActivity,
  presetCart,
  resetAll,
  resetClock,
  serverEndSession,
  setAbsoluteIn,
  setRejectUserRequests,
  setScenario,
  setUnavailable,
  startSession,
  getState,
  keepAliveRequest,
  type DevOrderKind,
} from "../mock/store";
import type { Scenarios } from "../mock/types";

type StringKeys = {
  [K in keyof Scenarios]: Scenarios[K] extends string ? K : never;
}[keyof Scenarios];
type BoolKeys = {
  [K in keyof Scenarios]: Scenarios[K] extends boolean ? K : never;
}[keyof Scenarios];

function Sel<K extends StringKeys>({
  k,
  label,
  options,
}: {
  k: K;
  label: string;
  options: ReadonlyArray<readonly [Scenarios[K], string]>;
}) {
  const s = useMock();
  const cur = String(s.scenarios[k]);
  return (
    <div className="dev-field">
      <label>
        {label}
        {" "}
        <select
          value={cur}
          onChange={(e) => {
            const o = options.find((x) => String(x[0]) === e.target.value);
            if (o) setScenario(k, o[0]);
          }}
        >
          {options.map(([v, t]) => (
            <option key={String(v)} value={String(v)}>
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Toggle({ k, label }: { k: BoolKeys; label: string }) {
  const s = useMock();
  return (
    <div className="dev-field">
      <label>
        <input
          type="checkbox"
          checked={s.scenarios[k]}
          onChange={(e) => setScenario(k, e.target.checked)}
        />{" "}
        {label}
      </label>
    </div>
  );
}

function Btn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="dev-btn" onClick={onClick}>
      {children}
    </button>
  );
}

function Group({
  title,
  children,
  open,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="dev-group">
      <summary>{title}</summary>
      <div className="dev-body">{children}</div>
    </details>
  );
}

const INVALID_TARGETS = [
  "https://evil.example",
  "//evil.example",
  "javascript:alert(1)",
  "/\\evil.example",
  "/%2F%2Fevil.example",
  "/%5Cevil.example",
  "/%09/evil.example",
  "/\t/evil.example",
  "/%252F%252Fevil.example",
];

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const s = useMock();
  const now = useNow();
  const nav = useNavigate();
  const w = warningInfo(s.session, now);

  const signedIn = () => {
    if (!getState().session.signedIn) startSession("demo@example.com");
  };
  const fresh = () => {
    startSession("demo@example.com");
  };
  const go = (path: string) => nav(path);
  const orderGo = (kind: DevOrderKind) => {
    signedIn();
    const id = devCreateOrder(kind);
    go(`/orders/${id}/outcome`);
  };
  const ff = (ms: number) => fastForward(ms);

  const recent = s.orders
    .filter((o) => Number(o.id.slice(2)) > 100)
    .slice(0, 8);

  return (
    <>
      <button
        type="button"
        className="dev-toggle"
        aria-expanded={open}
        aria-controls="dev-panel"
        onClick={() => setOpen((o) => !o)}
      >
        Prototype controls
      </button>
      {open ? (
        <aside
          id="dev-panel"
          className="dev-panel"
          aria-label="Prototype controls, not part of the product"
        >
          <p className="dev-note">
            Throwaway prototype. Mock data only. Everything here is for
            reviewers, not customers.
          </p>

          <Group title="Simulated time and session" open>
            <p>
              Simulated now: <strong>{formatClock(now)}</strong> (offset{" "}
              {formatDuration(s.clockOffset)})
            </p>
            <p>
              Session:{" "}
              {s.session.signedIn
                ? `signed in as ${s.session.email}`
                : "visitor"}
              {s.session.signedIn ? (
                <>
                  <br />
                  Idle expiry in {formatDuration(w.idleExpiry - now)}; 8-hour
                  limit in {formatDuration(w.absoluteExpiry - now)}
                  <br />
                  Warning now: {w.variant ?? "none"} (shown at{" "}
                  {formatDateTime(w.shownAt)}, variant{" "}
                  {w.absoluteFirst ? "absolute" : "idle"})
                </>
              ) : null}
            </p>
            <p className="dev-row">
              <Btn onClick={() => ff(5_000)}>+5 s</Btn>
              <Btn onClick={() => ff(30_000)}>+30 s</Btn>
              <Btn onClick={() => ff(MIN)}>+1 min</Btn>
              <Btn onClick={() => ff(2 * MIN)}>+2 min</Btn>
              <Btn onClick={() => ff(5 * MIN)}>+5 min</Btn>
              <Btn onClick={() => ff(10 * MIN)}>+10 min</Btn>
              <Btn onClick={() => ff(25 * MIN)}>+25 min</Btn>
              <Btn onClick={() => ff(30 * MIN)}>+30 min</Btn>
              <Btn onClick={() => ff(60 * MIN)}>+1 h</Btn>
              <Btn onClick={jumpToIdleWarning}>
                Jump to idle warning (28 min)
              </Btn>
              <Btn onClick={resetClock}>Reset clock</Btn>
            </p>
            <p className="dev-row">
              <Btn onClick={fresh}>Sign in now</Btn>
              <Btn onClick={endSession}>Become visitor</Btn>
              <Btn onClick={serverEndSession}>
                Server ends session (401 next)
              </Btn>
              <Btn onClick={() => setAbsoluteIn(10 * MIN)}>
                8-hour limit in 10 min
              </Btn>
              <Btn onClick={() => setAbsoluteIn(29 * MIN)}>
                8-hour limit in 29 min
              </Btn>
              <Btn onClick={() => setAbsoluteIn(90_000)}>
                8-hour limit in 90 s
              </Btn>
              <Btn onClick={() => setAbsoluteIn(8 * 60 * MIN)}>
                8-hour limit reset
              </Btn>
            </p>
          </Group>

          <Group title="Session warning, keep-alive, other tabs (J-26)">
            <Sel
              k="keepAlive"
              label="Stay signed in result"
              options={[
                ["ok", "Success"],
                ["403", "403 (CSRF)"],
                ["429", "429 (rate limit)"],
                ["500", "500"],
                ["network", "Network error"],
                ["401", "401 (session ended)"],
              ]}
            />
            <p className="dev-note">
              UX-OQ-19 copy (keep-alive failure text, absolute-limit time
              format, polite "You're still signed in." on dismissal) is decided.
            </p>
            <p className="dev-row">
              <Btn onClick={otherTabActivity}>
                Other tab: user activity or Stay signed in
              </Btn>
              <Btn onClick={() => keepAliveRequest()}>
                Send a keep-alive request (11th in a minute gives 429)
              </Btn>
            </p>
            <div className="dev-field">
              <label>
                <input
                  type="checkbox"
                  checked={s.rejectUserRequests}
                  onChange={(e) => setRejectUserRequests(e.target.checked)}
                />{" "}
                User requests are rejected (warning must stay, AC-13.29)
              </label>
            </div>
            <p className="dev-note">
              Real second tab: open this URL in another tab; mock server state
              is shared through localStorage and both tabs show the same warning
              state.
            </p>
          </Group>

          <Group title="Quick scenarios for edge-case journeys J-16 to J-26">
            <ul className="dev-list">
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("standard");
                    bumpPrice("p3", 200);
                    go("/cart");
                  }}
                >
                  J-16 price changed, then press Checkout
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("standard");
                    setUnavailable("p12", true);
                    go("/cart");
                  }}
                >
                  J-16 item not purchasable, then Checkout
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("low");
                    go("/cart");
                  }}
                >
                  J-16 total below $0.50
                </Btn>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("high");
                    go("/cart");
                  }}
                >
                  above $999,999.99
                </Btn>
              </li>
              <li>
                <Btn onClick={() => orderGo("processing")}>
                  J-17 processing (auto-check every 5 s)
                </Btn>
                <Btn
                  onClick={() => {
                    orderGo("processing");
                    jumpToIdleWarning();
                  }}
                >
                  J-17 + idle warning (then +2 min: 401)
                </Btn>
              </li>
              <li>
                <Btn onClick={() => orderGo("failed")}>
                  J-18 failed order, then deliver "paid" below and reload
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    setScenario("pay", "timeoutOnce");
                    go("/checkout");
                  }}
                >
                  J-19a Pay times out once
                </Btn>
                <Btn
                  onClick={() => {
                    signedIn();
                    devPendingOrder(22);
                    setScenario("providerUnreachable", true);
                    go("/checkout");
                  }}
                >
                  J-19b blocked by unreachable provider
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    const id = devCreateOrder("processing");
                    serverEndSession();
                    go(`/orders/${id}/outcome`);
                  }}
                >
                  J-20 return after session expired
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    endSession();
                    setScenario("signIn", "realistic");
                    go("/sign-in");
                  }}
                >
                  J-21 realistic slowdown (demo@example.com /
                  correct-horse-battery)
                </Btn>
                <Btn
                  onClick={() => {
                    endSession();
                    setScenario("signIn", "cap");
                    go("/sign-in");
                  }}
                >
                  J-21 cap 429
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("lines50");
                    go("/products/p99");
                  }}
                >
                  J-23 cart at 50 lines
                </Btn>
                <Btn
                  onClick={() => {
                    signedIn();
                    presetCart("lines49");
                    go("/products/p99");
                  }}
                >
                  at 49 lines
                </Btn>
              </li>
              {[20, 24, 27].map((m) => (
                <li key={m}>
                  <Btn
                    onClick={() => {
                      signedIn();
                      devPendingOrder(m);
                      go("/checkout");
                    }}
                  >
                    J-24 unchanged cart, pending order {m} min old, then Pay
                  </Btn>
                </li>
              ))}
              <li>
                <Btn
                  onClick={() => {
                    signedIn();
                    devPendingOrder(22);
                    setScenario("providerOldPaid", true);
                    go("/checkout");
                  }}
                >
                  J-24 provider says old order already paid
                </Btn>
              </li>
              <li>
                <Btn onClick={() => orderGo("mismatch")}>
                  J-25 amount or currency mismatch
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    fresh();
                    jumpToIdleWarning();
                    go("/");
                  }}
                >
                  J-26a idle warning
                </Btn>
                <Btn
                  onClick={() => {
                    fresh();
                    setScenario("keepAlive", "500");
                    jumpToIdleWarning();
                    go("/");
                  }}
                >
                  J-26b keep-alive fails
                </Btn>
              </li>
              <li>
                <Btn
                  onClick={() => {
                    fresh();
                    setAbsoluteIn(10 * MIN);
                    ff(8 * MIN + 5000);
                    go("/");
                  }}
                >
                  J-26d absolute limit first
                </Btn>
                <Btn
                  onClick={() => {
                    fresh();
                    setAbsoluteIn(29 * MIN);
                    ff(27 * MIN + 5000);
                    go("/");
                  }}
                >
                  J-26d limit 1 min after idle point
                </Btn>
                <Btn
                  onClick={() => {
                    fresh();
                    setAbsoluteIn(90_000);
                    go("/");
                  }}
                >
                  J-26d under 2 min left: immediate
                </Btn>
              </li>
            </ul>
            <p>
              J-22 return-target tests (become a visitor, open sign-in with this
              target):
            </p>
            <ul className="dev-list">
              {INVALID_TARGETS.map((t) => (
                <li key={t}>
                  <Btn
                    onClick={() => {
                      endSession();
                      go(`/sign-in?returnTo=${encodeURIComponent(t)}`);
                    }}
                  >
                    <code>{JSON.stringify(t)}</code>
                  </Btn>
                </li>
              ))}
              <li>
                <Btn
                  onClick={() => {
                    endSession();
                    go(`/sign-in?returnTo=${encodeURIComponent("/orders")}`);
                  }}
                >
                  valid: <code>/orders</code>
                </Btn>
              </li>
            </ul>
          </Group>

          <Group title="Orders created in this session and provider actions">
            <Toggle
              k="providerUnreachable"
              label="Provider unreachable (timeouts, cannot close old order)"
            />
            <Toggle
              k="providerOldPaid"
              label="Provider reports the old pending order already paid"
            />
            <Toggle
              k="handoffStall"
              label="S-08: redirect stalls (fallback link after 10 s, use +30 s)"
            />
            <Sel
              k="retryPolicy"
              label="CR-checkout-036/037 resolution"
              options={[
                ["default", "Spec J-24 (reuse up to minute 20)"],
                ["A", "A: reuse until the 25-minute session ends"],
                ["B", "B: close early from minute 20"],
              ]}
            />
            <Sel
              k="pay"
              label="Next Pay"
              options={[
                ["normal", "Normal"],
                ["timeoutOnce", "Times out once (J-19a)"],
                ["rateOnce", "429 once"],
              ]}
            />
            <p className="dev-row">
              <Btn onClick={() => orderGo("cancelling")}>S-09 cancelling</Btn>
              <Btn onClick={() => orderGo("paid")}>S-09 paid</Btn>
              <Btn onClick={() => orderGo("failed")}>S-09 failed</Btn>
              <Btn onClick={() => orderGo("expired")}>S-09 expired</Btn>
              <Btn onClick={() => go("/orders/o-nope/outcome")}>
                S-09 not found
              </Btn>
              <Btn
                onClick={() => {
                  signedIn();
                  devCreateOrder("awaiting");
                  go("/orders");
                }}
              >
                Add "Awaiting payment" order
              </Btn>
            </p>
            <ul className="dev-list">
              {recent.length === 0 ? <li>No orders created yet.</li> : null}
              {recent.map((o) => (
                <li key={o.id}>
                  <strong>{o.number}</strong> {o.status}
                  {o.hasSession ? "" : " (no session)"}, age{" "}
                  {formatDuration(now - o.createdAt)}
                  <br />
                  <Btn onClick={() => go(`/orders/${o.id}/outcome`)}>
                    Open outcome
                  </Btn>
                  <Btn onClick={() => devDeliver(o.id, "paid")}>
                    Provider: paid
                  </Btn>
                  <Btn onClick={() => devDeliver(o.id, "failed")}>
                    Provider: failed
                  </Btn>
                  <Btn onClick={() => devDeliver(o.id, "cancelled")}>
                    Provider: cancelled
                  </Btn>
                </li>
              ))}
            </ul>
          </Group>

          <Group title="Data states per screen">
            <Sel
              k="catalogue"
              label="S-02 catalogue"
              options={[
                ["normal", "Normal"],
                ["loading", "Loading (stuck)"],
                ["empty", "Empty"],
                ["error", "Error"],
                ["rate", "429"],
              ]}
            />
            <p className="dev-row">
              <Btn onClick={() => go("/?page=99")}>S-02 page out of range</Btn>
              <Btn onClick={() => go("/products/p100")}>
                S-03 not purchasable
              </Btn>
              <Btn onClick={() => go("/products/p-missing")}>
                S-03 not found
              </Btn>
            </p>
            <Sel
              k="product"
              label="S-03 product"
              options={[
                ["normal", "Normal"],
                ["loading", "Loading (stuck)"],
                ["error", "Load error"],
                ["addFail", "Add fails"],
                ["addUnavailable", "Add: product unavailable (race)"],
              ]}
            />
            <Sel
              k="cart"
              label="S-04 cart"
              options={[
                ["normal", "Normal"],
                ["loading", "Loading (stuck)"],
                ["error", "Load error"],
                ["updateFail", "Update or remove fails"],
              ]}
            />
            <p className="dev-row">
              <Btn onClick={() => presetCart("standard")}>Cart: 3 lines</Btn>
              <Btn onClick={() => presetCart("empty")}>Cart: empty</Btn>
              <Btn onClick={() => presetCart("lines49")}>Cart: 49 lines</Btn>
              <Btn onClick={() => presetCart("lines50")}>Cart: 50 lines</Btn>
              <Btn onClick={() => bumpPrice("p3", 200)}>Raise p3 price $2</Btn>
              <Btn onClick={() => setUnavailable("p12", true)}>
                Make p12 unavailable
              </Btn>
            </p>
            <Sel
              k="summary"
              label="S-07 summary"
              options={[
                ["normal", "Normal"],
                ["loading", "Loading (stuck)"],
                ["error", "Error"],
                ["rate", "429"],
              ]}
            />
            <Sel
              k="outcome"
              label="S-09 status checks"
              options={[
                ["normal", "Normal"],
                ["loading", "First load stuck"],
                ["firstFails", "First load fails"],
                ["checkFails", "Later checks fail (quiet note)"],
                ["rate", "Later checks rate limited"],
              ]}
            />
            <Sel
              k="orders"
              label="S-10 history"
              options={[
                ["normal", "Normal (45 orders)"],
                ["loading", "Loading (stuck)"],
                ["empty", "Empty"],
                ["error", "Error"],
                ["rate", "429"],
              ]}
            />
            <p className="dev-row">
              <Btn onClick={() => go("/orders?page=99")}>
                S-10 page out of range
              </Btn>
              <Btn onClick={() => go("/orders/o-12")}>
                S-11 changed since purchase (J-15)
              </Btn>
              <Btn onClick={() => go("/orders/o-3")}>S-11 no card row</Btn>
              <Btn onClick={() => go("/orders/o-47")}>
                S-11 hidden order: not found
              </Btn>
            </p>
            <Sel
              k="orderDetail"
              label="S-11 detail"
              options={[
                ["normal", "Normal"],
                ["loading", "Loading (stuck)"],
                ["error", "Error"],
              ]}
            />
          </Group>

          <Group title="Accounts">
            <Sel
              k="signIn"
              label="S-06 sign-in result"
              options={[
                ["success", "Any credentials succeed"],
                [
                  "realistic",
                  "Realistic throttling (demo@example.com / correct-horse-battery)",
                ],
                ["wrong", "Always generic failure"],
                ["slowSuccess", "Slow (8 s) then success"],
                ["slowFail", "Slow (8 s) then generic failure"],
                ["cap", "429 held-response cap"],
                ["ip429", "429 per-IP limit"],
                ["unavailable", "Service unavailable"],
              ]}
            />
            <Sel
              k="register"
              label="S-05 register result"
              options={[
                ["ok", "Success"],
                ["taken", "Email already registered"],
                ["rate", "429"],
                ["error", "Server error"],
              ]}
            />
            <Sel
              k="signOut"
              label="S-01 sign-out"
              options={[
                ["ok", "Success"],
                ["fail", "Fails"],
              ]}
            />
            <p className="dev-note">
              Register with taken@example.com to see the already-registered
              error.
            </p>
          </Group>

          <p>
            <Btn
              onClick={() => {
                resetAll();
                go("/");
              }}
            >
              Reset all mock data and scenarios
            </Btn>
          </p>
        </aside>
      ) : null}
    </>
  );
}
