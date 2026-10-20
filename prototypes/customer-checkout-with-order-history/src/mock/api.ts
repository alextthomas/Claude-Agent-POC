// Mock "server". No network calls anywhere in this prototype: every function resolves from the
// in-memory/localStorage mock store after a short delay and honours the dev-panel scenarios.
import {
  addToCart as storeAdd,
  authedRequest,
  cartTotal,
  evaluateCheckout,
  findOrder,
  getState,
  keepAliveRequest,
  now,
  payNow,
  productNow,
  recentSignInFailures,
  recordSignInFailure,
  removeCartLine,
  setCartQty,
  settleOrders,
  startSession,
  endSession,
  visibleOrders,
  visibleProducts,
  type AddResult,
  type AuthResult,
  type CheckoutEval,
  type KeepAliveResult,
  type PayResult,
} from "./store";
import type { CartLine, Order, Product } from "./types";

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));
/** A request that never completes (to hold a screen in its loading state). */
const never = (): Promise<never> => new Promise<never>(() => undefined);

export type Guarded<T> =
  { kind: "auth"; reason: Exclude<AuthResult, "ok"> } | T;

async function guard(
  kind: "user" | "auto" = "user",
): Promise<Exclude<AuthResult, "ok"> | null> {
  const r = authedRequest(kind);
  return r === "ok" ? null : r;
}

// ---------- catalogue ----------
export type ListProducts =
  | { kind: "ok"; items: Product[]; page: number; pages: number }
  | { kind: "empty" }
  | { kind: "outOfRange" }
  | { kind: "error" };
export async function listProducts(page: number): Promise<ListProducts> {
  const sc = getState().scenarios.catalogue;
  if (sc === "loading") return never();
  await sleep(350);
  if (sc === "error" || sc === "rate") return { kind: "error" };
  if (sc === "empty") return { kind: "empty" };
  const all = visibleProducts();
  const pages = Math.max(1, Math.ceil(all.length / 20));
  if (!Number.isInteger(page) || page < 1 || page > pages)
    return { kind: "outOfRange" };
  return {
    kind: "ok",
    items: all.slice((page - 1) * 20, page * 20),
    page,
    pages,
  };
}

export type GetProduct =
  { kind: "ok"; product: Product } | { kind: "notFound" } | { kind: "error" };
export async function getProduct(id: string): Promise<GetProduct> {
  const sc = getState().scenarios.product;
  if (sc === "loading") return never();
  await sleep(300);
  if (sc === "error") return { kind: "error" };
  const p = productNow(id);
  return p ? { kind: "ok", product: p } : { kind: "notFound" };
}

// ---------- cart ----------
export type AddToCart = Guarded<AddResult | { kind: "fail" }>;
export async function addToCart(id: string, qty: number): Promise<AddToCart> {
  const g = await guard();
  await sleep(450);
  if (g) return { kind: "auth", reason: g };
  const sc = getState().scenarios.product;
  if (sc === "addFail") return { kind: "fail" };
  if (sc === "addUnavailable") return { kind: "unavailable" };
  return storeAdd(id, qty);
}

export type GetCart = Guarded<
  { kind: "ok"; lines: CartLine[]; totalCents: number } | { kind: "error" }
>;
export async function getCart(): Promise<GetCart> {
  const g = await guard();
  const sc = getState().scenarios.cart;
  if (sc === "loading") return never();
  await sleep(350);
  if (g) return { kind: "auth", reason: g };
  if (sc === "error") return { kind: "error" };
  const lines = getState().cart;
  return { kind: "ok", lines, totalCents: cartTotal(lines) };
}

export type CartWrite = Guarded<{ kind: "ok" } | { kind: "fail" }>;
export async function updateQty(id: string, qty: number): Promise<CartWrite> {
  const g = await guard();
  await sleep(250);
  if (g) return { kind: "auth", reason: g };
  if (getState().scenarios.cart === "updateFail") return { kind: "fail" };
  setCartQty(id, qty);
  return { kind: "ok" };
}
export async function removeLine(id: string): Promise<CartWrite> {
  const g = await guard();
  await sleep(200);
  if (g) return { kind: "auth", reason: g };
  if (getState().scenarios.cart === "updateFail") return { kind: "fail" };
  removeCartLine(id);
  return { kind: "ok" };
}

// ---------- checkout ----------
export type Summary = Guarded<
  CheckoutEval | { kind: "error" } | { kind: "rate" }
>;
export async function getSummary(): Promise<Summary> {
  const g = await guard();
  const sc = getState().scenarios.summary;
  if (sc === "loading") return never();
  await sleep(450);
  if (g) return { kind: "auth", reason: g };
  if (sc === "error") return { kind: "error" };
  if (sc === "rate") return { kind: "rate" };
  return evaluateCheckout();
}

export type Pay = Guarded<PayResult | { kind: "emptyOrChanged" }>;
export async function pay(): Promise<Pay> {
  const g = await guard();
  await sleep(700);
  if (g) return { kind: "auth", reason: g };
  if (evaluateCheckout().kind !== "ok") return { kind: "emptyOrChanged" };
  return payNow();
}

// ---------- orders ----------
export type OrderStatusResult =
  | { kind: "ok"; order: Order; providerTrouble: boolean }
  | { kind: "notFound" }
  | { kind: "error" }
  | { kind: "rate" };
/** S-09 status check. `auto` checks never reset the idle timer (AC-4.4, AC-13.18). */
export async function getOrderStatus(
  id: string,
  auto: boolean,
  first: boolean,
): Promise<Guarded<OrderStatusResult>> {
  const g = await guard(auto ? "auto" : "user");
  const sc = getState().scenarios.outcome;
  if (sc === "loading" && first) return never();
  await sleep(first ? 500 : 250);
  if (g) return { kind: "auth", reason: g };
  if (sc === "firstFails" && first) return { kind: "error" };
  if (sc === "checkFails" && !first) return { kind: "error" };
  if (sc === "rate" && !first) return { kind: "rate" };
  settleOrders();
  const o = findOrder(id);
  if (!o) return { kind: "notFound" };
  const trouble =
    getState().scenarios.providerUnreachable && o.status === "pending_payment";
  return { kind: "ok", order: o, providerTrouble: trouble };
}

export type OrdersPage =
  | { kind: "ok"; items: Order[]; page: number; pages: number }
  | { kind: "empty" }
  | { kind: "outOfRange" }
  | { kind: "error" };
export async function listOrders(page: number): Promise<Guarded<OrdersPage>> {
  const g = await guard();
  const sc = getState().scenarios.orders;
  if (sc === "loading") return never();
  await sleep(350);
  if (g) return { kind: "auth", reason: g };
  if (sc === "error" || sc === "rate") return { kind: "error" };
  settleOrders();
  const all = visibleOrders();
  if (sc === "empty" || all.length === 0) return { kind: "empty" };
  const pages = Math.ceil(all.length / 20);
  if (!Number.isInteger(page) || page < 1 || page > pages)
    return { kind: "outOfRange" };
  return {
    kind: "ok",
    items: all.slice((page - 1) * 20, page * 20),
    page,
    pages,
  };
}

export type OrderDetail =
  { kind: "ok"; order: Order } | { kind: "notFound" } | { kind: "error" };
export async function getOrder(id: string): Promise<Guarded<OrderDetail>> {
  const g = await guard();
  const sc = getState().scenarios.orderDetail;
  if (sc === "loading") return never();
  await sleep(300);
  if (g) return { kind: "auth", reason: g };
  if (sc === "error") return { kind: "error" };
  settleOrders();
  const o = findOrder(id);
  // Cancelled and expired orders are not customer-visible (AC-5.1); malformed and foreign ids look identical.
  if (
    !o ||
    (o.status !== "paid" &&
      o.status !== "pending_payment" &&
      o.status !== "failed")
  )
    return { kind: "notFound" };
  return { kind: "ok", order: o };
}

// ---------- accounts ----------
export type SignInResult =
  | { kind: "ok" }
  | { kind: "wrong" }
  | { kind: "cap" }
  | { kind: "ip429" }
  | { kind: "unavailable" };
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const sc = getState().scenarios.signIn;
  const succeed = (): SignInResult => {
    startSession(email.trim());
    return { kind: "ok" };
  };
  switch (sc) {
    case "success":
      await sleep(500);
      return succeed();
    case "wrong":
      await sleep(500);
      return { kind: "wrong" };
    case "slowSuccess":
      await sleep(8000);
      return succeed();
    case "slowFail":
      await sleep(8000);
      return { kind: "wrong" };
    case "cap":
      await sleep(200);
      return { kind: "cap" };
    case "ip429":
      await sleep(200);
      return { kind: "ip429" };
    case "unavailable":
      await sleep(500);
      return { kind: "unavailable" };
    case "realistic": {
      // 3 failures in a sliding 15 minutes, then 1, 2, 4, 8, 16 s delays before the password check (AC-13.9).
      const n = recentSignInFailures(email);
      const delays = [1000, 2000, 4000, 8000, 16000];
      await sleep(n >= 3 ? (delays[Math.min(n - 3, 4)] ?? 16000) : 400);
      if (
        email.trim().toLowerCase() === "demo@example.com" &&
        password === "correct-horse-battery"
      )
        return succeed();
      recordSignInFailure(email);
      return { kind: "wrong" };
    }
  }
}

export type RegisterResult =
  { kind: "ok" } | { kind: "taken" } | { kind: "rate" } | { kind: "error" };
export async function register(email: string): Promise<RegisterResult> {
  const sc = getState().scenarios.register;
  await sleep(700);
  if (sc === "taken" || email.trim().toLowerCase() === "taken@example.com")
    return { kind: "taken" };
  if (sc === "rate") return { kind: "rate" };
  if (sc === "error") return { kind: "error" };
  startSession(email.trim());
  return { kind: "ok" };
}

export async function signOut(): Promise<"ok" | "fail"> {
  await sleep(400);
  if (getState().scenarios.signOut === "fail") return "fail";
  endSession();
  return "ok";
}

export async function keepAlive(): Promise<KeepAliveResult> {
  await sleep(500);
  return keepAliveRequest();
}

export { now };
