import { DEFAULT_CART_IDS, PRODUCTS, seedOrders } from "./data";
import type { CartLine, Order, Product, Scenarios, State } from "./types";
import {
  ABS_MS,
  IDLE_MS,
  MIN,
  ORDER_EXPIRY_MS,
  ORDER_SESSION_MS,
  warningInfo,
} from "../lib/session";

const KEY = "ccoh-prototype-state-v1";

export function defaultScenarios(): Scenarios {
  return {
    catalogue: "normal",
    product: "normal",
    cart: "normal",
    summary: "normal",
    pay: "normal",
    retryPolicy: "default",
    providerUnreachable: false,
    providerOldPaid: false,
    handoffStall: false,
    orders: "normal",
    orderDetail: "normal",
    outcome: "normal",
    signIn: "success",
    register: "ok",
    signOut: "ok",
    keepAlive: "ok",
  };
}

function lineFor(id: string, qty: number): CartLine {
  const p = PRODUCTS.find((x) => x.id === id);
  return {
    productId: id,
    name: p?.name ?? id,
    qty,
    unitCents: p?.priceCents ?? 0,
    flag: null,
  };
}

function initialState(): State {
  const t = Date.now();
  return {
    clockOffset: 0,
    session: {
      signedIn: false,
      email: null,
      signedInAt: t,
      lastActivity: t,
      absoluteExpiry: t + ABS_MS,
      serverEnded: false,
    },
    scenarios: defaultScenarios(),
    cart: DEFAULT_CART_IDS.map(([id, q]) => lineFor(id, q)),
    priceOverride: {},
    unavailable: [],
    orders: seedOrders(t),
    orderSeq: 100,
    notice: null,
    keepAlive: { error: false, attempt: 0, times: [] },
    signInFails: {},
    rejectUserRequests: false,
  };
}

function parseState(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as State;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.session ||
      !parsed.scenarios
    )
      return null;
    return {
      ...initialState(),
      ...parsed,
      scenarios: { ...defaultScenarios(), ...parsed.scenarios },
    };
  } catch {
    return null;
  }
}

function safeGet(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

let state: State = parseState(safeGet()) ?? initialState();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

/** Mutate a deep copy, persist (mock data only, no secrets) and notify. */
function mutate(fn: (d: State) => void): void {
  const draft = structuredClone(state);
  fn(draft);
  state = draft;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: in-memory only */
  }
  emit();
}

// Cross-tab consistency (AC-13.25, 13.26): other tabs of the prototype share the same mock server state.
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    const next = parseState(e.newValue);
    if (next) {
      state = next;
      emit();
    }
  }
});

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function getState(): State {
  return state;
}
export function now(): number {
  return Date.now() + state.clockOffset;
}
export function resetAll(): void {
  mutate((d) => {
    Object.assign(d, initialState());
  });
}

// ---------- scenarios and clock ----------
export function setScenario<K extends keyof Scenarios>(
  k: K,
  v: Scenarios[K],
): void {
  mutate((d) => {
    d.scenarios[k] = v;
  });
}
export function fastForward(ms: number): void {
  mutate((d) => {
    d.clockOffset += ms;
  });
}
export function resetClock(): void {
  mutate((d) => {
    d.clockOffset = 0;
  });
}
export function setRejectUserRequests(v: boolean): void {
  mutate((d) => {
    d.rejectUserRequests = v;
  });
}

// ---------- session ----------
export type AuthResult = "ok" | "expired" | "visitor" | "rejected";

export function startSession(email: string): void {
  const t = now();
  mutate((d) => {
    d.session = {
      signedIn: true,
      email,
      signedInAt: t,
      lastActivity: t,
      absoluteExpiry: t + ABS_MS,
      serverEnded: false,
    };
    d.keepAlive = { error: false, attempt: 0, times: [] };
    d.notice = null;
  });
}
export function endSession(): void {
  mutate((d) => {
    d.session.signedIn = false;
    d.session.email = null;
    d.session.serverEnded = false;
    d.keepAlive.error = false;
    d.notice = null;
  });
}
export function serverEndSession(): void {
  mutate((d) => {
    d.session.serverEnded = true;
  });
}
export function setAbsoluteIn(ms: number): void {
  mutate((d) => {
    d.session.absoluteExpiry = now() + ms;
  });
}
/** Dev: fast-forward to exactly the idle warning point (28 minutes after the last user activity). */
export function jumpToIdleWarning(): void {
  mutate((d) => {
    const target = d.session.lastActivity + 28 * MIN;
    d.clockOffset = target - Date.now();
  });
}

function bumpNotice(d: State, text: string): void {
  d.notice = { id: (d.notice?.id ?? 0) + 1, text };
}
export function clearNotice(): void {
  mutate((d) => {
    d.notice = null;
  });
}

/**
 * A request that needs a session. kind 'user' resets the idle timer (and dismisses the idle warning,
 * AC-13.29); kind 'auto' (the 5-second checks on S-09) never does (AC-13.18).
 */
export function authedRequest(kind: "user" | "auto"): AuthResult {
  const s = state.session;
  if (!s.signedIn) return "visitor";
  const t = now();
  if (s.serverEnded || t >= s.lastActivity + IDLE_MS || t >= s.absoluteExpiry) {
    endSession();
    return "expired";
  }
  if (kind === "user") {
    if (state.rejectUserRequests) return "rejected";
    const idleWarningShown = warningInfo(s, t).variant === "idle";
    mutate((d) => {
      d.session.lastActivity = t;
      d.keepAlive.error = false;
      if (idleWarningShown) bumpNotice(d, "You're still signed in.");
    });
  }
  return "ok";
}

export type KeepAliveResult = "ok" | "failed" | "401";
/** One keep-alive request with the (mock) anti-CSRF token (AC-13.16, 13.28). */
export function keepAliveRequest(): KeepAliveResult {
  const t = now();
  const s = state.session;
  if (
    !s.signedIn ||
    s.serverEnded ||
    t >= s.lastActivity + IDLE_MS ||
    t >= s.absoluteExpiry
  ) {
    endSession();
    return "401";
  }
  const recent = state.keepAlive.times.filter((x) => t - x < MIN);
  const outcome = recent.length >= 10 ? "429" : state.scenarios.keepAlive;
  mutate((d) => {
    d.keepAlive.times = [...recent, t];
  });
  if (outcome === "401") {
    endSession();
    return "401";
  }
  if (outcome !== "ok") {
    mutate((d) => {
      d.keepAlive.error = true;
      d.keepAlive.attempt += 1;
    });
    return "failed";
  }
  mutate((d) => {
    d.session.lastActivity = t;
    d.keepAlive.error = false;
    bumpNotice(d, "You're still signed in.");
  });
  return "ok";
}
/** Dev: another tab of the same session did something. */
export function otherTabActivity(): void {
  mutate((d) => {
    d.session.lastActivity = now();
    d.keepAlive.error = false;
    bumpNotice(d, "You're still signed in.");
  });
}

export function recordSignInFailure(email: string): number {
  const t = now();
  const key = email.trim().toLowerCase();
  const recent = (state.signInFails[key] ?? []).filter((x) => t - x < 15 * MIN);
  mutate((d) => {
    d.signInFails[key] = [...recent, t];
  });
  return recent.length + 1;
}
export function recentSignInFailures(email: string): number {
  const t = now();
  return (state.signInFails[email.trim().toLowerCase()] ?? []).filter(
    (x) => t - x < 15 * MIN,
  ).length;
}

// ---------- catalogue ----------
export function productNow(id: string): Product | undefined {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return undefined;
  const override = state.priceOverride[id];
  return {
    ...p,
    priceCents: override ?? p.priceCents,
    purchasable: p.purchasable && !state.unavailable.includes(id),
  };
}
export function visibleProducts(): Product[] {
  return PRODUCTS.map((p) => productNow(p.id)).filter(
    (p): p is Product => !!p && p.purchasable,
  );
}
export function bumpPrice(id: string, deltaCents: number): void {
  mutate((d) => {
    const base =
      d.priceOverride[id] ?? PRODUCTS.find((p) => p.id === id)?.priceCents ?? 0;
    d.priceOverride[id] = Math.max(25, base + deltaCents);
  });
}
export function setUnavailable(id: string, v: boolean): void {
  mutate((d) => {
    d.unavailable = v
      ? Array.from(new Set([...d.unavailable, id]))
      : d.unavailable.filter((x) => x !== id);
  });
}

// ---------- cart ----------
export function cartCount(): number {
  return state.cart.reduce((a, l) => a + l.qty, 0);
}
export function cartTotal(lines: CartLine[] = state.cart): number {
  return lines.reduce((a, l) => a + l.qty * l.unitCents, 0);
}
export function presetCart(
  kind: "standard" | "empty" | "lines49" | "lines50" | "low" | "high",
): void {
  mutate((d) => {
    d.unavailable = [];
    d.priceOverride = {};
    if (kind === "empty") d.cart = [];
    else if (kind === "standard")
      d.cart = DEFAULT_CART_IDS.map(([id, q]) => lineFor(id, q));
    else if (kind === "low") d.cart = [lineFor("p98", 1)];
    else if (kind === "high") d.cart = [lineFor("p97", 2)];
    else {
      const n = kind === "lines49" ? 49 : 50;
      d.cart = Array.from({ length: n }, (_, i) => lineFor(`p${i + 1}`, 1));
    }
  });
}
export type AddResult =
  | { kind: "ok"; qty: number }
  | { kind: "invalidQty" }
  | { kind: "limit50" }
  | { kind: "unavailable" };
export function addToCart(id: string, qty: number): AddResult {
  const p = productNow(id);
  if (!p || !p.purchasable) return { kind: "unavailable" };
  const existing = state.cart.find((l) => l.productId === id);
  if (existing && existing.qty + qty > 10) return { kind: "invalidQty" };
  if (!existing && state.cart.length >= 50) return { kind: "limit50" };
  mutate((d) => {
    const line = d.cart.find((l) => l.productId === id);
    if (line) line.qty += qty;
    else
      d.cart.push({
        productId: id,
        name: p.name,
        qty,
        unitCents: p.priceCents,
        flag: null,
      });
  });
  return { kind: "ok", qty };
}
export function setCartQty(id: string, qty: number): void {
  mutate((d) => {
    const line = d.cart.find((l) => l.productId === id);
    if (line) line.qty = qty;
  });
}
export function removeCartLine(id: string): void {
  mutate((d) => {
    d.cart = d.cart.filter((l) => l.productId !== id);
  });
}

// ---------- checkout ----------
export interface ChangedItem {
  name: string;
  kind: "price" | "gone";
  fromCents?: number;
  toCents?: number;
}
export type CheckoutEval =
  | { kind: "empty" }
  | { kind: "changed"; items: ChangedItem[] }
  | { kind: "range"; totalCents: number }
  | { kind: "ok"; lines: CartLine[]; totalCents: number };

function signatureOf(lines: CartLine[]): string {
  return lines
    .map(
      (l) =>
        `${l.productId}:${l.qty}:${productNow(l.productId)?.priceCents ?? l.unitCents}`,
    )
    .join("|");
}

/** Checkout creates no order and starts no payment (AC-1.1). On a change, cart lines are updated/flagged (AC-1.4, 1.6). */
export function evaluateCheckout(): CheckoutEval {
  const cart = state.cart;
  if (cart.length === 0) return { kind: "empty" };
  const items: ChangedItem[] = [];
  for (const l of cart) {
    const p = productNow(l.productId);
    if (!p || !p.purchasable) items.push({ name: l.name, kind: "gone" });
    else if (p.priceCents !== l.unitCents) {
      items.push({
        name: l.name,
        kind: "price",
        fromCents: l.unitCents,
        toCents: p.priceCents,
      });
    }
  }
  if (items.length > 0) {
    mutate((d) => {
      for (const l of d.cart) {
        const p = productNow(l.productId);
        if (!p || !p.purchasable) l.flag = { kind: "gone" };
        else if (p.priceCents !== l.unitCents) {
          l.flag = {
            kind: "price",
            fromCents: l.unitCents,
            toCents: p.priceCents,
          };
          l.unitCents = p.priceCents;
        }
      }
    });
    return { kind: "changed", items };
  }
  const total = cartTotal(cart);
  if (total < 50 || total > 99_999_999)
    return { kind: "range", totalCents: total };
  if (cart.some((l) => l.flag)) {
    mutate((d) => {
      d.cart.forEach((l) => {
        l.flag = null;
      });
    });
  }
  return { kind: "ok", lines: state.cart, totalCents: total };
}

// ---------- orders ----------
function makeOrder(d: State, over: Partial<Order> = {}): Order {
  d.orderSeq += 1;
  const n = d.orderSeq;
  const lines = d.cart.map((l) => ({
    productId: l.productId,
    name: l.name,
    qty: l.qty,
    unitCents: l.unitCents,
  }));
  const o: Order = {
    id: `o-${n}`,
    number: `SH-${10000 + n}`,
    createdAt: now(),
    status: "pending_payment",
    lines,
    totalCents: lines.reduce((a, l) => a + l.qty * l.unitCents, 0),
    cartSignature: signatureOf(d.cart),
    hasSession: true,
    card: null,
    failure: null,
    cancelReturn: false,
    resolveAt: null,
    resolveTo: null,
    ...over,
  };
  d.orders.unshift(o);
  return o;
}
function reduceCart(d: State, o: Order): void {
  for (const l of o.lines) {
    const c = d.cart.find((x) => x.productId === l.productId);
    if (c) c.qty -= l.qty;
  }
  d.cart = d.cart.filter((c) => c.qty > 0);
}
function applyStatus(
  d: State,
  o: Order,
  to: "paid" | "failed" | "cancelled",
): void {
  o.resolveAt = null;
  o.resolveTo = null;
  if (to === "paid") {
    o.status = "paid";
    o.failure = null;
    o.card = { brand: "Visa", last4: "4242" };
    reduceCart(d, o);
  } else if (to === "failed") {
    o.status = "failed";
    o.failure = o.failure ?? "declined";
  } else {
    o.status = "cancelled";
  }
}
/** Apply scheduled provider results and the 30-minute expiry (AC-4.5). */
export function settleOrders(): void {
  const t = now();
  const needs = state.orders.some(
    (o) =>
      o.status === "pending_payment" &&
      ((o.resolveAt !== null && t >= o.resolveAt) ||
        t - o.createdAt >= ORDER_EXPIRY_MS),
  );
  if (!needs) return;
  mutate((d) => {
    for (const o of d.orders) {
      if (o.status !== "pending_payment") continue;
      if (o.resolveAt !== null && o.resolveTo && t >= o.resolveAt)
        applyStatus(d, o, o.resolveTo);
      else if (t - o.createdAt >= ORDER_EXPIRY_MS) o.status = "expired";
    }
  });
}
export function findOrder(id: string): Order | undefined {
  return state.orders.find((o) => o.id === id);
}
export function visibleOrders(): Order[] {
  return state.orders
    .filter(
      (o) =>
        o.status === "paid" ||
        o.status === "pending_payment" ||
        o.status === "failed",
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

export type PayResult =
  | { kind: "redirect"; orderId: string }
  | { kind: "timeout" }
  | { kind: "blocked" }
  | { kind: "alreadyPaid"; orderId: string }
  | { kind: "rate" };

/** "Pay": reuse, supersede or create (J-24, AC-3.4, 3.8, 3.9, 3.13 to 3.18). */
export function payNow(): PayResult {
  settleOrders();
  const sc = state.scenarios;
  if (sc.pay === "rateOnce") {
    setScenario("pay", "normal");
    return { kind: "rate" };
  }
  const t = now();
  const sig = signatureOf(state.cart);
  const pending = state.orders.find((o) => o.status === "pending_payment");
  if (pending) {
    const age = t - pending.createdAt;
    const same = pending.cartSignature === sig;
    const reuse =
      same &&
      (sc.retryPolicy === "A"
        ? age < ORDER_SESSION_MS
        : sc.retryPolicy === "B"
          ? age < 20 * MIN
          : age <= 20 * MIN);
    if (sc.providerOldPaid) {
      mutate((d) => {
        const o = d.orders.find((x) => x.id === pending.id);
        if (o) applyStatus(d, o, "paid");
      });
      return { kind: "alreadyPaid", orderId: pending.id };
    }
    if (sc.providerUnreachable && !reuse) return { kind: "blocked" };
    if (reuse) {
      if (
        (sc.providerUnreachable && !pending.hasSession) ||
        sc.pay === "timeoutOnce"
      ) {
        if (sc.pay === "timeoutOnce") setScenario("pay", "normal");
        return { kind: "timeout" };
      }
      mutate((d) => {
        const o = d.orders.find((x) => x.id === pending.id);
        if (o) o.hasSession = true;
      });
      return { kind: "redirect", orderId: pending.id };
    }
    // Close the old order early; silent to the customer (UX-OQ-4).
    mutate((d) => {
      const o = d.orders.find((x) => x.id === pending.id);
      if (o) o.status = "cancelled";
    });
  }
  if (sc.providerUnreachable || sc.pay === "timeoutOnce") {
    if (sc.pay === "timeoutOnce") setScenario("pay", "normal");
    // The order exists and stays pending_payment without a payment session (AC-3.13).
    mutate((d) => {
      makeOrder(d, { hasSession: false });
    });
    return { kind: "timeout" };
  }
  let orderId = "";
  mutate((d) => {
    orderId = makeOrder(d).id;
  });
  return { kind: "redirect", orderId };
}

export type ProviderResult =
  "paid" | "declined" | "cancel" | "none" | "slowPaid" | "mismatch";
/** The mock hosted page (E-1) decides; the shop only learns it through S-09 status checks (REQ-4). */
export function providerOutcome(orderId: string, r: ProviderResult): void {
  const t = now();
  mutate((d) => {
    const o = d.orders.find((x) => x.id === orderId);
    if (!o || o.status !== "pending_payment") return;
    if (r === "paid") applyStatus(d, o, "paid");
    else if (r === "declined") {
      o.failure = "declined";
      applyStatus(d, o, "failed");
    } else if (r === "mismatch") {
      o.failure = "mismatch";
      applyStatus(d, o, "failed");
    } else if (r === "cancel") {
      o.cancelReturn = true;
      o.resolveAt = t + 10_000;
      o.resolveTo = "cancelled";
    } else if (r === "slowPaid") {
      o.resolveAt = t + 12_000;
      o.resolveTo = "paid";
    }
  });
}
/** Dev: a provider result arrives now for an order in any state (also late success, AC-4.7). */
export function devDeliver(
  orderId: string,
  to: "paid" | "failed" | "cancelled",
): void {
  mutate((d) => {
    const o = d.orders.find((x) => x.id === orderId);
    if (!o) return;
    if (to === "failed") o.failure = "declined";
    applyStatus(d, o, to);
  });
}
export type DevOrderKind =
  | "processing"
  | "cancelling"
  | "failed"
  | "mismatch"
  | "paid"
  | "expired"
  | "awaiting";
export function devCreateOrder(kind: DevOrderKind): string {
  let id = "";
  const t = now();
  mutate((d) => {
    if (d.cart.length === 0)
      d.cart = DEFAULT_CART_IDS.map(([pid, q]) => lineFor(pid, q));
    if (kind === "expired")
      id = makeOrder(d, { createdAt: t - 31 * MIN, status: "expired" }).id;
    else if (kind === "paid") {
      const o = makeOrder(d, {});
      applyStatus(d, o, "paid");
      id = o.id;
    } else if (kind === "failed" || kind === "mismatch") {
      const o = makeOrder(d, {
        failure: kind === "failed" ? "declined" : "mismatch",
      });
      applyStatus(d, o, "failed");
      id = o.id;
    } else if (kind === "cancelling") {
      id = makeOrder(d, { cancelReturn: true }).id;
    } else id = makeOrder(d, {}).id;
  });
  return id;
}
/** Dev: a pending order for the current cart that is `ageMin` minutes old (J-24). */
export function devPendingOrder(ageMin: number): string {
  let id = "";
  mutate((d) => {
    d.orders.forEach((o) => {
      if (o.status === "pending_payment") o.status = "cancelled";
    });
    if (d.cart.length === 0)
      d.cart = DEFAULT_CART_IDS.map(([pid, q]) => lineFor(pid, q));
    id = makeOrder(d, { createdAt: now() - ageMin * MIN }).id;
  });
  return id;
}
