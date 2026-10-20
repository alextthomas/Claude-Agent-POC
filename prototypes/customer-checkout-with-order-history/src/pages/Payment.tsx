import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Money, PageHeading } from "../components/common";
import { useMock, useNow } from "../hooks";
import {
  findOrder,
  now,
  providerOutcome,
  type ProviderResult,
} from "../mock/store";

/** S-08 Payment handoff (US-3). Full redirect design (UX-OQ-2); the redirect goes to the mock E-1. */
export function HandoffPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order") ?? "";
  const s = useMock();
  const nav = useNavigate();
  const clock = useNow();
  const [startedAt] = useState(() => now());
  const order = findOrder(orderId);

  useEffect(() => {
    if (!order || s.scenarios.handoffStall) return;
    const id = window.setTimeout(() => nav(`/provider/${orderId}`), 2500);
    return () => window.clearTimeout(id);
  }, [order, orderId, s.scenarios.handoffStall, nav]);

  if (!s.session.signedIn)
    return (
      <Navigate
        to={`/sign-in?returnTo=${encodeURIComponent("/checkout")}`}
        replace
        state={{ banner: "gate" }}
      />
    );
  if (!order || !order.hasSession) {
    // No payment session came back: return to S-07 with the retryable error (AC-3.13).
    return <Navigate to="/checkout" replace state={{ payError: true }} />;
  }
  const showFallback = clock - startedAt >= 10_000;
  return (
    <section>
      <PageHeading title="Taking you to secure payment" focusKey="handoff" />
      <div role="status" aria-live="polite">
        <p>
          Do not close this window. You'll return here when the payment is
          finished.
        </p>
        <p>
          <span className="spinner" aria-hidden="true" /> Redirecting to our
          payment provider...
        </p>
      </div>
      <p>
        Total <Money cents={order.totalCents} />
      </p>
      {showFallback ? (
        <p>
          <Link to={`/provider/${orderId}`}>Continue to payment</Link>
        </p>
      ) : null}
      <p>
        <Link to="/cart">Back to cart</Link>
      </p>
    </section>
  );
}

/**
 * E-1: simulated provider hosted payment page. NOT part of the shop and not specified by the UX spec.
 * It never renders card inputs. The buttons stand in for what the provider would decide.
 */
export function ProviderPage() {
  const { orderId = "" } = useParams();
  const nav = useNavigate();
  const order = findOrder(orderId);
  const back = (r: ProviderResult) => {
    providerOutcome(orderId, r);
    nav(`/orders/${orderId}/outcome`);
  };
  return (
    <div className="provider">
      <p className="provider-banner" role="note">
        Simulated payment provider page (E-1). It is outside the shop and
        outside the UX spec. No card is collected.
      </p>
      <h1 tabIndex={-1} ref={(el) => el?.focus()}>
        Provider secure payment (mock)
      </h1>
      {order ? (
        <p>
          Amount to pay: <Money cents={order.totalCents} />
        </p>
      ) : (
        <p>Unknown payment session.</p>
      )}
      <h2>Choose what the provider does</h2>
      <ul className="stack">
        <li>
          <button type="button" onClick={() => back("paid")}>
            Pay successfully and return
          </button>
        </li>
        <li>
          <button type="button" onClick={() => back("slowPaid")}>
            Return now, result arrives about 12 seconds later
          </button>
        </li>
        <li>
          <button type="button" onClick={() => back("none")}>
            Return with no result yet (stays processing)
          </button>
        </li>
        <li>
          <button type="button" onClick={() => back("declined")}>
            Card declined and return
          </button>
        </li>
        <li>
          <button type="button" onClick={() => back("cancel")}>
            Cancel on the hosted page and return
          </button>
        </li>
        <li>
          <button type="button" onClick={() => back("mismatch")}>
            Amount or currency mismatch and return
          </button>
        </li>
      </ul>
    </div>
  );
}
