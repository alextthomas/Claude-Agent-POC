// Mock-only types. Nothing here comes from apps/** or packages/**.

export type OrderStatus = 'pending_payment' | 'paid' | 'failed' | 'cancelled' | 'expired';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  purchasable: boolean;
}

export type CartFlag =
  | { kind: 'price'; fromCents: number; toCents: number }
  | { kind: 'gone' }
  | null;

export interface CartLine {
  productId: string;
  name: string;
  qty: number;
  unitCents: number;
  flag: CartFlag;
}

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  unitCents: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: number;
  status: OrderStatus;
  lines: OrderLine[];
  totalCents: number;
  cartSignature: string;
  hasSession: boolean;
  card: { brand: string; last4: string } | null;
  failure: 'declined' | 'mismatch' | null;
  /** Customer came back from the hosted page after pressing cancel (AC-4.3). */
  cancelReturn: boolean;
  resolveAt: number | null;
  resolveTo: 'paid' | 'failed' | 'cancelled' | null;
}

export interface Session {
  signedIn: boolean;
  email: string | null;
  signedInAt: number;
  lastActivity: number;
  absoluteExpiry: number;
  /** Set by the dev panel: the server has ended the session; next authed request is 401. */
  serverEnded: boolean;
}

export interface Scenarios {
  catalogue: 'normal' | 'loading' | 'empty' | 'error' | 'rate';
  product: 'normal' | 'loading' | 'error' | 'addFail' | 'addUnavailable';
  cart: 'normal' | 'loading' | 'error' | 'updateFail';
  summary: 'normal' | 'loading' | 'error' | 'rate';
  pay: 'normal' | 'timeoutOnce' | 'rateOnce';
  retryPolicy: 'default' | 'A' | 'B';
  providerUnreachable: boolean;
  providerOldPaid: boolean;
  handoffStall: boolean;
  orders: 'normal' | 'loading' | 'empty' | 'error' | 'rate';
  orderDetail: 'normal' | 'loading' | 'error';
  outcome: 'normal' | 'loading' | 'firstFails' | 'checkFails' | 'rate';
  signIn: 'success' | 'realistic' | 'wrong' | 'slowSuccess' | 'slowFail' | 'cap' | 'ip429' | 'unavailable';
  register: 'ok' | 'taken' | 'rate' | 'error';
  signOut: 'ok' | 'fail';
  keepAlive: 'ok' | '403' | '429' | '500' | 'network' | '401';
}

export interface State {
  clockOffset: number;
  session: Session;
  scenarios: Scenarios;
  cart: CartLine[];
  priceOverride: Record<string, number>;
  unavailable: string[];
  orders: Order[];
  orderSeq: number;
  notice: { id: number; text: string } | null;
  keepAlive: { error: boolean; attempt: number; times: number[] };
  signInFails: Record<string, number[]>;
  rejectUserRequests: boolean;
}
