import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErrorNotice, Loading, Money, PageHeading } from "../components/common";
import { useAuthRedirect, useLoad, useMock } from "../hooks";
import { formatMoney } from "../lib/format";
import { pay } from "../mock/api";
import { getSummary } from "../mock/api";

type PayUi =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "timeout" }
  | { kind: "blocked" }
  | { kind: "rate" }
  | { kind: "alreadyPaid"; orderId: string };

/** Alert region that receives focus on arrival so keyboard and screen-reader users learn why "Pay" is missing. */
function FocusNotice({ children, k }: { children: ReactNode; k: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [k]);
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="notice notice-warn">
      <span aria-hidden="true" className="icon">
        ⚠
      </span>
      <div>{children}</div>
    </div>
  );
}

/** S-07 Checkout: order summary and Pay (US-1, US-2, US-3). */
export function CheckoutPage() {
  const s = useMock();
  const nav = useNavigate();
  const loc = useLocation();
  const redirect = useAuthRedirect();
  const [res, reload] = useLoad(() => getSummary(), [s.scenarios.summary]);
  const [ui, setUi] = useState<PayUi>(
    (loc.state as { payError?: boolean } | null)?.payError
      ? { kind: "timeout" }
      : { kind: "idle" },
  );
  const busyRef = useRef(false);

  useEffect(() => {
    if (
      res.status === "done" &&
      res.value.kind === "auth" &&
      res.value.reason !== "rejected"
    ) {
      redirect(res.value.reason);
    }
  }, [res, redirect]);

  const doPay = async () => {
    if (busyRef.current) return; // double click or repeated Enter is ignored (AC-3.4)
    busyRef.current = true;
    setUi({ kind: "busy" });
    const r = await pay();
    busyRef.current = false;
    if (r.kind === "auth") {
      if (r.reason === "rejected") setUi({ kind: "timeout" });
      else redirect(r.reason);
      return;
    }
    if (r.kind === "redirect") nav(`/checkout/payment?order=${r.orderId}`);
    else if (r.kind === "emptyOrChanged") {
      setUi({ kind: "idle" });
      reload();
    } else if (r.kind === "alreadyPaid")
      setUi({ kind: "alreadyPaid", orderId: r.orderId });
    else setUi({ kind: r.kind });
  };

  if (res.status === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Order summary" focusKey="co-loading" />
        <Loading label="Loading your order summary..." />
      </section>
    );
  }
  const v = res.value;
  const head = <PageHeading title="Order summary" focusKey={`co-${v.kind}`} />;
  if (v.kind === "auth") {
    return (
      <section>
        {head}
        {v.reason === "rejected" ? (
          <ErrorNotice
            message="We couldn't load your order summary. Try again."
            onRetry={reload}
          />
        ) : (
          <Loading label="Loading your order summary..." />
        )}
      </section>
    );
  }
  if (v.kind === "error") {
    return (
      <section>
        {head}
        <ErrorNotice
          message="We couldn't load your order summary. Try again."
          onRetry={reload}
        />
      </section>
    );
  }
  if (v.kind === "rate") {
    return (
      <section>
        {head}
        <ErrorNotice
          message="Too many requests. Try again in a moment."
          onRetry={reload}
        />
      </section>
    );
  }
  if (v.kind === "empty") {
    return (
      <section>
        {head}
        <p>Your cart is empty. Add a product before checking out.</p>
        <p>
          <Link to="/">Browse products</Link>
        </p>
      </section>
    );
  }
  if (v.kind === "changed") {
    return (
      <section>
        {head}
        <FocusNotice k="changed">
          <h2>Your cart changed</h2>
          <ul>
            {v.items.map((i) => (
              <li key={i.name}>
                {i.kind === "price"
                  ? `${i.name}: price changed from ${formatMoney(i.fromCents ?? 0)} to ${formatMoney(i.toCents ?? 0)}.`
                  : `${i.name}: no longer available. Remove it from your cart to continue.`}
              </li>
            ))}
          </ul>
        </FocusNotice>
        <p>
          <Link to="/cart" className="button-link primary">
            Back to cart
          </Link>
        </p>
      </section>
    );
  }
  if (v.kind === "range") {
    return (
      <section>
        {head}
        <FocusNotice k="range">
          <p>Order total must be between $0.50 and $999,999.99.</p>
        </FocusNotice>
        <p>
          <Link to="/cart" className="button-link primary">
            Back to cart
          </Link>
        </p>
      </section>
    );
  }

  const busy = ui.kind === "busy";
  return (
    <section>
      {head}
      {ui.kind === "timeout" ? (
        <FocusNotice k="timeout">
          <p>We couldn't start your payment. Please try again.</p>
        </FocusNotice>
      ) : null}
      {ui.kind === "blocked" ? (
        <FocusNotice k="blocked">
          <p>
            Your previous payment is still being confirmed. Please try again in
            a moment.
          </p>
        </FocusNotice>
      ) : null}
      {ui.kind === "rate" ? (
        <FocusNotice k="rate">
          <p>You're trying to pay too often. Wait a minute and try again.</p>
        </FocusNotice>
      ) : null}
      {ui.kind === "alreadyPaid" ? (
        <FocusNotice k="paid">
          <p>
            Your earlier payment has been received.{" "}
            <Link to={`/orders/${ui.orderId}`}>View your order.</Link>
          </p>
        </FocusNotice>
      ) : null}
      {/* Reserved notice slot for the CR-checkout-036/037 outcome: intentionally not rendered (UX-OQ-4). */}
      <table>
        <caption>Order summary</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Quantity</th>
            <th scope="col">Unit price</th>
            <th scope="col">Line total</th>
          </tr>
        </thead>
        <tbody>
          {v.lines.map((l) => (
            <tr key={l.productId}>
              <th scope="row">{l.name}</th>
              <td>{l.qty}</td>
              <td>
                <Money cents={l.unitCents} />
              </td>
              <td>
                <Money cents={l.qty * l.unitCents} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Order total
            </th>
            <td>
              <Money cents={v.totalCents} />
            </td>
          </tr>
        </tfoot>
      </table>
      <p>All prices in USD</p>
      {ui.kind !== "alreadyPaid" ? (
        <>
          <p>
            You'll be taken to our payment provider's secure page to enter your
            card details. We never see your card number.
          </p>
          <p className="actions">
            <button
              type="button"
              className="primary"
              aria-disabled={busy}
              aria-busy={busy}
              onClick={() => void doPay()}
            >
              {busy
                ? "Starting payment..."
                : `Pay ${formatMoney(v.totalCents)}`}
            </button>{" "}
            <Link to="/cart">Back to cart</Link>
          </p>
        </>
      ) : (
        <p>
          <Link to="/cart">Back to cart</Link>
        </p>
      )}
      <div role="status" className="sr-only">
        {busy ? "Starting payment" : ""}
      </div>
    </section>
  );
}
