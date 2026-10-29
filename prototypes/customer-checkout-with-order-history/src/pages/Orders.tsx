import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ErrorNotice,
  Loading,
  Money,
  PageHeading,
  Pagination,
  StatusBadge,
  Time,
  statusLabel,
} from "../components/common";
import { useAuthRedirect, useLoad, useMock } from "../hooks";
import { formatMoney } from "../lib/format";
import { getOrder, listOrders } from "../mock/api";

/** S-10 Order history (US-5). Only paid, pending_payment and failed orders; 20 per page, newest first. */
export function OrdersPage() {
  const [params] = useSearchParams();
  const raw = params.get("page");
  const page = raw === null ? 1 : Number(raw);
  const s = useMock();
  const redirect = useAuthRedirect();
  const [res, reload] = useLoad(
    () => listOrders(page),
    [page, s.scenarios.orders],
  );

  useEffect(() => {
    if (
      res.status === "done" &&
      res.value.kind === "auth" &&
      res.value.reason !== "rejected"
    )
      redirect(res.value.reason);
  }, [res, redirect]);

  const key = `orders-${raw ?? "1"}`;
  if (res.status === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Your orders" focusKey={`${key}-l`} />
        <Loading label="Loading your orders..." />
      </section>
    );
  }
  const v = res.value;
  return (
    <section>
      <PageHeading title="Your orders" focusKey={key} />
      {v.kind === "auth" ? (
        v.reason === "rejected" ? (
          <ErrorNotice
            message="We couldn't load your orders. Try again."
            onRetry={reload}
          />
        ) : (
          <Loading label="Loading your orders..." />
        )
      ) : null}
      {v.kind === "error" ? (
        <ErrorNotice
          message="We couldn't load your orders. Try again."
          onRetry={reload}
        />
      ) : null}
      {v.kind === "empty" ? (
        <>
          <p>You haven't placed any orders yet.</p>
          <p>
            <Link to="/" className="button-link primary">
              Continue shopping
            </Link>
          </p>
        </>
      ) : null}
      {v.kind === "outOfRange" ? (
        <p>
          <Link to="/orders">Go to first page</Link>
        </p>
      ) : null}
      {v.kind === "ok" ? (
        <>
          <div role="status" className="sr-only">
            Page {v.page} of {v.pages}
          </div>
          <table className="responsive">
            <caption>Order history</caption>
            <thead>
              <tr>
                <th scope="col">Order number</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {v.items.map((o) => (
                <tr key={o.id}>
                  <th scope="row">
                    <Link
                      to={`/orders/${o.id}`}
                      aria-label={`Order ${o.number}, ${statusLabel(o.status)}, ${formatMoney(o.totalCents)}`}
                    >
                      {o.number}
                    </Link>
                  </th>
                  <td data-label="Date">
                    <Time ms={o.createdAt} />
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={o.status} />
                  </td>
                  <td data-label="Total" className="num">
                    <Money cents={o.totalCents} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={v.page} pages={v.pages} basePath="/orders" />
        </>
      ) : null}
    </section>
  );
}

/** S-11 Order detail (US-6, US-15). Lines are the snapshot taken at order creation. */
export function OrderDetailPage() {
  const { id = "" } = useParams();
  const s = useMock();
  const redirect = useAuthRedirect();
  const [res, reload] = useLoad(
    () => getOrder(id),
    [id, s.scenarios.orderDetail],
  );

  useEffect(() => {
    if (
      res.status === "done" &&
      res.value.kind === "auth" &&
      res.value.reason !== "rejected"
    )
      redirect(res.value.reason);
  }, [res, redirect]);

  if (res.status === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Order" focusKey={`od-${id}-l`} />
        <Loading label="Loading order..." />
      </section>
    );
  }
  const v = res.value;
  if (v.kind === "notFound") {
    return (
      <section>
        <PageHeading title="Order not found" focusKey={`od-${id}-nf`} />
        <p>We couldn't find this order.</p>
        <p>
          <Link to="/orders">Back to orders</Link>
        </p>
      </section>
    );
  }
  if (v.kind === "auth" || v.kind === "error") {
    return (
      <section>
        <PageHeading title="Order" focusKey={`od-${id}-err`} />
        {v.kind === "auth" && v.reason !== "rejected" ? (
          <Loading label="Loading order..." />
        ) : (
          <ErrorNotice
            message="We couldn't load this order. Try again."
            onRetry={reload}
          />
        )}
      </section>
    );
  }
  const o = v.order;
  return (
    <section>
      <PageHeading title={`Order ${o.number}`} focusKey={`od-${id}`} />
      <p>
        <Link to="/orders">Back to orders</Link>
      </p>
      <dl className="facts">
        <dt>Date</dt>
        <dd>
          <Time ms={o.createdAt} />
        </dd>
        <dt>Status</dt>
        <dd>
          <StatusBadge status={o.status} />
        </dd>
        <dt>Payment status</dt>
        <dd>
          <StatusBadge status={o.status} />
        </dd>
        {o.card ? (
          <>
            <dt>Payment card</dt>
            <dd aria-label={`${o.card.brand} ending in ${o.card.last4}`}>
              {o.card.brand} ending in {o.card.last4}
            </dd>
          </>
        ) : null}
      </dl>
      <table className="responsive">
        <caption>Order lines</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Quantity</th>
            <th scope="col">Unit price</th>
            <th scope="col">Line total</th>
          </tr>
        </thead>
        <tbody>
          {o.lines.map((l) => (
            <tr key={l.productId}>
              <th scope="row">{l.name}</th>
              <td data-label="Quantity">{l.qty}</td>
              <td data-label="Unit price">
                <Money cents={l.unitCents} />
              </td>
              <td data-label="Line total">
                <Money cents={l.qty * l.unitCents} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>
              Total
            </th>
            <td>
              <Money cents={o.totalCents} />
            </td>
          </tr>
        </tfoot>
      </table>
      {o.status === "pending_payment" ? (
        <p>
          <Link to={`/orders/${o.id}/outcome`}>Check payment status</Link>
        </p>
      ) : null}
    </section>
  );
}
