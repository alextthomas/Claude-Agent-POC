import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ErrorNotice,
  Loading,
  Money,
  PageHeading,
  StatusBadge,
} from "../components/common";
import { useAuthRedirect, useNow } from "../hooks";
import { getOrderStatus } from "../mock/api";
import { now } from "../mock/store";
import type { Order } from "../mock/types";

type View =
  | { phase: "loading" }
  | { phase: "firstError" }
  | { phase: "notFound" }
  | { phase: "order"; order: Order; trouble: boolean };

type Display =
  | "paid"
  | "processing"
  | "cancelling"
  | "failed"
  | "mismatch"
  | "cancelled"
  | "expired";

function displayOf(o: Order): Display {
  switch (o.status) {
    case "paid":
      return "paid";
    case "failed":
      return o.failure === "mismatch" ? "mismatch" : "failed";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return o.cancelReturn ? "cancelling" : "processing";
  }
}
const isFinal = (d: Display) => d !== "processing" && d !== "cancelling";

const ANNOUNCE: Record<Display, string> = {
  paid: "Payment confirmed. Your order is confirmed.",
  processing: "Payment processing.",
  cancelling: "Confirming that no payment was taken.",
  failed: "Your payment didn't go through.",
  mismatch: "Your payment could not be completed.",
  cancelled: "Payment cancelled.",
  expired: "This payment session has expired.",
};

const HEADING: Record<Display, string> = {
  paid: "Thank you, your order is confirmed",
  processing: "Payment processing",
  cancelling: "Payment processing",
  failed: "Your payment didn't go through",
  mismatch: "Your payment could not be completed",
  cancelled: "Payment cancelled",
  expired: "This payment session has expired",
};

/** S-09 Payment outcome (US-4). Shows the server-verified result, never a browser claim (REQ-4). */
export function OutcomePage() {
  const { id = "" } = useParams();
  const redirect = useAuthRedirect();
  const clock = useNow();
  const [view, setView] = useState<View>({ phase: "loading" });
  const [note, setNote] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [manualBusy, setManualBusy] = useState(false);
  const inflight = useRef(false);
  const lastCheck = useRef(0);
  const prev = useRef<Display | null>(null);
  const stopped = useRef(false);

  const check = useCallback(
    async (auto: boolean, first: boolean) => {
      if (inflight.current || stopped.current) return;
      inflight.current = true;
      lastCheck.current = now();
      const r = await getOrderStatus(id, auto, first);
      inflight.current = false;
      if (r.kind === "auth") {
        if (r.reason !== "rejected") {
          stopped.current = true; // no further automatic requests after a 401 (AC-13.19)
          redirect(r.reason);
        } else if (first) setView({ phase: "firstError" });
        else setNote(true);
        return;
      }
      if (r.kind === "notFound") {
        stopped.current = true;
        setView({ phase: "notFound" });
        return;
      }
      if (r.kind === "error" || r.kind === "rate") {
        if (first) setView({ phase: "firstError" });
        else setNote(true);
        return;
      }
      setNote(false);
      const d = displayOf(r.order);
      if (prev.current !== d) setAnnounce(ANNOUNCE[d]);
      prev.current = d;
      if (isFinal(d)) stopped.current = true; // checking stops at a final state (UX-OQ-7)
      setView({
        phase: "order",
        order: { ...r.order },
        trouble: r.providerTrouble,
      });
    },
    [id, redirect],
  );

  useEffect(() => {
    stopped.current = false;
    prev.current = null;
    setView({ phase: "loading" });
    void check(false, true);
  }, [check]);

  // Automatic 5-second check, paused while the tab is hidden (UX-OQ-6). Uses the simulated clock tick.
  useEffect(() => {
    if (view.phase !== "order" || stopped.current) return;
    if (document.visibilityState !== "visible") return;
    if (clock - lastCheck.current >= 5000) void check(true, false);
  }, [clock, view, check]);

  useEffect(() => {
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        !stopped.current &&
        view.phase === "order"
      )
        void check(true, false);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [check, view.phase]);

  const checkNow = async () => {
    if (manualBusy) return;
    setManualBusy(true);
    stopped.current = false;
    inflight.current = false;
    await check(false, false); // a user action: counts as activity (AC-13.29)
    setManualBusy(false);
  };

  const live = (
    <div role="status" aria-live="polite" className="sr-only">
      {announce}
    </div>
  );

  if (view.phase === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Payment outcome" focusKey="outcome-loading" />
        <Loading label="Checking your payment..." />
      </section>
    );
  }
  if (view.phase === "firstError") {
    return (
      <section>
        <PageHeading
          title="Payment status unavailable"
          focusKey="outcome-error"
        />
        <ErrorNotice
          message="We couldn't check your payment. Try again."
          onRetry={() => {
            stopped.current = false;
            setView({ phase: "loading" });
            void check(false, true);
          }}
        />
      </section>
    );
  }
  if (view.phase === "notFound") {
    return (
      <section>
        <PageHeading title="Payment not found" focusKey="outcome-nf" />
        <p>We couldn't find this payment.</p>
        <p>
          <Link to="/orders">View order history</Link>
        </p>
      </section>
    );
  }

  const o = view.order;
  const d = displayOf(o);
  return (
    <section>
      <PageHeading
        title={HEADING[d]}
        docTitle="Payment outcome"
        focusKey="outcome-order"
      />
      {live}
      {d === "paid" ? (
        <>
          <dl className="facts">
            <dt>Order number</dt>
            <dd>{o.number}</dd>
            <dt>Total</dt>
            <dd>
              <Money cents={o.totalCents} />
            </dd>
            <dt>Status</dt>
            <dd>
              <StatusBadge status="paid" />
            </dd>
          </dl>
          <p>
            No email is sent. You can see this order any time in your order
            history.
          </p>
          <p className="actions">
            <Link to={`/orders/${o.id}`}>View order</Link>{" "}
            <Link to="/orders">View order history</Link>{" "}
            <Link to="/">Continue shopping</Link>
          </p>
        </>
      ) : null}
      {d === "processing" || d === "cancelling" ? (
        <>
          <p>
            <span className="spinner" aria-hidden="true" />{" "}
            {d === "cancelling"
              ? "We're confirming that no payment was taken."
              : "We're waiting for confirmation from the payment provider. You can stay on this page. We check automatically every 5 seconds."}
          </p>
          {view.trouble ? (
            <p>
              We're having trouble reaching the payment provider. We'll keep
              trying.
            </p>
          ) : null}
          {note ? (
            <p className="hint">We couldn't check just now. We'll try again.</p>
          ) : null}
          <p>
            <button
              type="button"
              aria-busy={manualBusy}
              aria-disabled={manualBusy}
              onClick={() => void checkNow()}
            >
              Check now
            </button>
          </p>
        </>
      ) : null}
      {d === "failed" ? (
        <>
          <div role="alert">
            <p>You have not been charged.</p>
            <p>Your cart is unchanged.</p>
          </div>
          <p className="actions">
            <Link to="/cart" className="button-link primary">
              Try paying again
            </Link>{" "}
            <Link to="/orders">View order history</Link>
          </p>
        </>
      ) : null}
      {d === "mismatch" ? (
        <>
          <div role="alert">
            <p>
              The payment could not be completed. If you were charged, contact
              support and quote order number {o.number}. The shop will review
              this.
            </p>
          </div>
          <p className="actions">
            <Link to="/orders">View order history</Link>{" "}
            <Link to="/cart" className="button-link primary">
              Try paying again
            </Link>
          </p>
        </>
      ) : null}
      {d === "cancelled" || d === "expired" ? (
        <>
          <div role="alert">
            <p>You have not been charged. Your cart is unchanged.</p>
          </div>
          <p className="actions">
            <Link to="/cart" className="button-link primary">
              Try paying again
            </Link>{" "}
            <Link to="/">Continue shopping</Link>
          </p>
        </>
      ) : null}
    </section>
  );
}
