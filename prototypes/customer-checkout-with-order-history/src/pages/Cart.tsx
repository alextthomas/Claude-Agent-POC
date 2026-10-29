import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ErrorNotice,
  Loading,
  Money,
  PageHeading,
  QTY_MESSAGE,
  QuantityControl,
  parseQuantity,
} from "../components/common";
import { useAuthRedirect, useLoad, useMock } from "../hooks";
import { getCart, removeLine, updateQty } from "../mock/api";
import { formatMoney } from "../lib/format";
import type { CartLine } from "../mock/types";

function Row({
  line,
  onStatus,
  onAuth,
}: {
  line: CartLine;
  onStatus: (m: string) => void;
  onAuth: (r: "expired" | "visitor" | "rejected") => void;
}) {
  const [val, setVal] = useState(String(line.qty));
  const [err, setErr] = useState<string | null>(null);
  const [rowErr, setRowErr] = useState(false);
  useEffect(() => setVal(String(line.qty)), [line.qty]);

  const update = async () => {
    const n = parseQuantity(val);
    if (n === null) {
      setErr(QTY_MESSAGE);
      setVal(String(line.qty)); // reverts to the last valid value (AC-11.3)
      return;
    }
    setErr(null);
    setRowErr(false);
    const r = await updateQty(line.productId, n);
    if (r.kind === "auth") {
      if (r.reason === "rejected") setRowErr(true);
      else onAuth(r.reason);
      return;
    }
    if (r.kind === "fail") {
      setRowErr(true);
      setVal(String(line.qty));
      return;
    }
    onStatus(`Quantity updated. Cart total ${formatMoney(totalAfter())}.`);
  };

  const remove = async () => {
    const r = await removeLine(line.productId);
    if (r.kind === "auth") {
      if (r.reason === "rejected") setRowErr(true);
      else onAuth(r.reason);
      return;
    }
    if (r.kind === "fail") {
      setRowErr(true);
      return;
    }
    onStatus(`Removed ${line.name} from your cart.`);
  };

  return (
    <tr data-row>
      <th scope="row">
        <Link to={`/products/${line.productId}`}>{line.name}</Link>
        {line.flag?.kind === "price" ? (
          <p className="flag">
            <span aria-hidden="true">⚠ </span>Price changed from{" "}
            {formatMoney(line.flag.fromCents)} to{" "}
            {formatMoney(line.flag.toCents)}
          </p>
        ) : null}
        {line.flag?.kind === "gone" ? (
          <p className="flag">
            <span aria-hidden="true">⚠ </span>No longer available. Remove this
            item to continue.
          </p>
        ) : null}
      </th>
      <td data-label="Unit price">
        <Money cents={line.unitCents} />
      </td>
      <td data-label="Quantity">
        <QuantityControl
          label={`Quantity for ${line.name}`}
          hideLabel
          value={val}
          onChange={setVal}
          error={err}
          onEnter={update}
        />
        <button
          type="button"
          onClick={update}
          aria-label={`Update quantity for ${line.name}`}
        >
          Update
        </button>
        {rowErr ? (
          <p role="alert" className="field-error">
            We couldn't update your cart. Try again.
          </p>
        ) : null}
      </td>
      <td data-label="Line total">
        <Money cents={line.qty * line.unitCents} />
      </td>
      <td>
        <button
          type="button"
          onClick={remove}
          aria-label={`Remove ${line.name}`}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

// Used only to word the status message from the freshly written store value.
import { getState } from "../mock/store";
function totalAfter(): number {
  return getState().cart.reduce((a, l) => a + l.qty * l.unitCents, 0);
}

/** S-04 Cart (US-11, US-10, US-1). */
export function CartPage() {
  const s = useMock();
  const nav = useNavigate();
  const redirect = useAuthRedirect();
  const [res, reload] = useLoad(
    () => getCart(),
    [s.scenarios.cart === "loading", s.scenarios.cart === "error"],
  );
  const [status, setStatus] = useState("");
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (res.status === "done" && res.value.kind === "auth") {
      if (res.value.reason !== "rejected") redirect(res.value.reason);
    }
  }, [res, redirect]);

  const lines = s.cart;
  const total = lines.reduce((a, l) => a + l.qty * l.unitCents, 0);

  const afterRemove = (idx: number) => {
    window.setTimeout(() => {
      const rows =
        bodyRef.current?.querySelectorAll<HTMLElement>("tr[data-row]");
      const target =
        rows?.[
          Math.min(idx, (rows?.length ?? 1) - 1)
        ]?.querySelector<HTMLElement>("a, input, button");
      if (target) target.focus();
      else document.querySelector<HTMLElement>("h1")?.focus();
    }, 0);
  };

  if (res.status === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Your cart" focusKey="cart-l" />
        <Loading label="Loading your cart..." />
      </section>
    );
  }
  const v = res.value;
  if (v.kind === "auth") {
    return (
      <section>
        <PageHeading title="Your cart" focusKey="cart-auth" />
        {v.reason === "rejected" ? (
          <ErrorNotice
            message="We couldn't load your cart. Try again."
            onRetry={reload}
          />
        ) : (
          <Loading label="Loading your cart..." />
        )}
      </section>
    );
  }
  if (v.kind === "error") {
    return (
      <section>
        <PageHeading title="Your cart" focusKey="cart-err" />
        <ErrorNotice
          message="We couldn't load your cart. Try again."
          onRetry={reload}
        />
      </section>
    );
  }
  if (lines.length === 0) {
    return (
      <section>
        <PageHeading title="Your cart" focusKey="cart-empty" />
        <div role="status" className="sr-only">
          {status}
        </div>
        <p>Your cart is empty.</p>
        <p>
          <Link to="/">Browse products</Link>
        </p>
      </section>
    );
  }
  return (
    <section>
      <PageHeading title="Your cart" focusKey="cart" />
      <div role="status" aria-live="polite" className="status-line">
        {status}
      </div>
      <table className="responsive">
        <caption className="sr-only">Cart lines</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Unit price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Line total</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody ref={bodyRef}>
          {lines.map((l, i) => (
            <Row
              key={l.productId}
              line={l}
              onStatus={(m) => {
                setStatus(m);
                if (m.startsWith("Removed")) afterRemove(i);
              }}
              onAuth={redirect}
            />
          ))}
        </tbody>
      </table>
      <p aria-live="polite" className="total">
        Cart total: <Money cents={total} />
      </p>
      <p className="actions">
        <button type="button" onClick={() => nav("/checkout")}>
          Checkout
        </button>{" "}
        <Link to="/">Continue shopping</Link>
      </p>
    </section>
  );
}
