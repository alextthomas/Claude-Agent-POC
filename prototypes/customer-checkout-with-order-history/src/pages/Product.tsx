import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ErrorNotice,
  Loading,
  Money,
  PageHeading,
  ProductImage,
  QTY_MESSAGE,
  QuantityControl,
  parseQuantity,
} from "../components/common";
import { useAuthRedirect, useLoad, useMock } from "../hooks";
import { addToCart, getProduct } from "../mock/api";

type AddState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "ok"; name: string; qty: number }
  | { kind: "qty" }
  | { kind: "limit50" }
  | { kind: "unavailable" }
  | { kind: "fail" };

/** S-03 Product detail (US-9, US-10). The only place a product is added to the cart (UX-OQ-11). */
export function ProductPage() {
  const { id = "" } = useParams();
  const s = useMock();
  const nav = useNavigate();
  const redirect = useAuthRedirect();
  const [res, reload] = useLoad(
    () => getProduct(id),
    [id, s.scenarios.product === "loading", s.scenarios.product === "error"],
  );
  const [qty, setQty] = useState("1");
  const [add, setAdd] = useState<AddState>({ kind: "idle" });
  const signedIn = s.session.signedIn;

  const submit = async () => {
    if (add.kind === "busy") return;
    if (res.status !== "done" || res.value.kind !== "ok") return;
    if (!signedIn) {
      nav(`/sign-in?returnTo=${encodeURIComponent(`/products/${id}`)}`, {
        state: { banner: "gate" },
      });
      return;
    }
    const n = parseQuantity(qty);
    if (n === null) {
      setAdd({ kind: "qty" });
      return;
    }
    setAdd({ kind: "busy" });
    const r = await addToCart(id, n);
    if (r.kind === "auth") {
      if (r.reason === "rejected") setAdd({ kind: "fail" });
      else redirect(r.reason);
      return;
    }
    if (r.kind === "ok")
      setAdd({ kind: "ok", name: res.value.product.name, qty: r.qty });
    else if (r.kind === "invalidQty") setAdd({ kind: "qty" });
    else if (r.kind === "limit50") setAdd({ kind: "limit50" });
    else if (r.kind === "unavailable") setAdd({ kind: "unavailable" });
    else setAdd({ kind: "fail" });
  };

  if (res.status === "loading") {
    return (
      <section aria-busy="true">
        <PageHeading title="Product" focusKey={`product-${id}-loading`} />
        <Loading label="Loading product..." />
      </section>
    );
  }
  const v = res.value;
  if (v.kind === "notFound") {
    return (
      <section>
        <PageHeading title="Product not found" focusKey={`product-${id}-nf`} />
        <p>
          <Link to="/">Back to products</Link>
        </p>
      </section>
    );
  }
  if (v.kind === "error") {
    return (
      <section>
        <PageHeading title="Product" focusKey={`product-${id}-err`} />
        <ErrorNotice
          message="We couldn't load this product. Try again."
          onRetry={reload}
        />
      </section>
    );
  }
  const p = v.product;
  const unavailable = !p.purchasable || add.kind === "unavailable";
  return (
    <section>
      <p>
        <Link to="/">Back to products</Link>
      </p>
      <PageHeading title={p.name} focusKey={`product-${id}`} />
      <div className="product">
        <ProductImage label={p.name} />
        <div>
          <p>{p.description}</p>
          <p className="price">
            <Money cents={p.priceCents} />
          </p>
          {unavailable ? (
            <p role="status">This product is no longer available.</p>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {!signedIn ? <p>Sign in to add this to your cart</p> : null}
              <QuantityControl
                label="Quantity"
                value={qty}
                onChange={(x) => {
                  setQty(x);
                  if (add.kind === "qty") setAdd({ kind: "idle" });
                }}
                hint="1 to 10"
                error={add.kind === "qty" ? QTY_MESSAGE : null}
              />
              <button
                type="submit"
                aria-busy={add.kind === "busy"}
                aria-disabled={add.kind === "busy"}
              >
                Add to cart
              </button>
            </form>
          )}
          <div role="status" className="add-status">
            {add.kind === "ok" ? (
              <p>
                Added to cart: {add.name}, quantity {add.qty}.{" "}
                <Link to="/cart">View cart</Link>
              </p>
            ) : null}
          </div>
          {add.kind === "limit50" ? (
            <div role="alert" className="notice notice-error">
              <span aria-hidden="true" className="icon">
                ✖
              </span>
              <p>
                Your cart can hold at most 50 different products. Remove a
                product to add another. <Link to="/cart">View cart</Link>
              </p>
            </div>
          ) : null}
          {add.kind === "fail" ? (
            <ErrorNotice message="We couldn't add this to your cart. Try again." />
          ) : null}
        </div>
      </div>
    </section>
  );
}
