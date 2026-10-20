import { useSearchParams, Link } from "react-router-dom";
import {
  ErrorNotice,
  Loading,
  Money,
  PageHeading,
  Pagination,
  ProductImage,
} from "../components/common";
import { useLoad, useMock } from "../hooks";
import { listProducts } from "../mock/api";

/** S-02 Catalogue list (US-8). No "Add to cart" here for anyone (UX-OQ-11). */
export function Catalogue() {
  const [params] = useSearchParams();
  const raw = params.get("page");
  const page = raw === null ? 1 : Number(raw);
  const s = useMock();
  const [res, reload] = useLoad(
    () => listProducts(page),
    [page, s.scenarios.catalogue],
  );

  return (
    <section aria-busy={res.status === "loading"}>
      <PageHeading title="Products" focusKey={`catalogue-${raw ?? "1"}`} />
      {res.status === "loading" ? (
        <Loading label="Loading products..." />
      ) : null}
      {res.status === "done" && res.value.kind === "error" ? (
        <ErrorNotice
          message="We couldn't load the products. Try again."
          onRetry={reload}
        />
      ) : null}
      {res.status === "done" && res.value.kind === "empty" ? (
        <p>There are no products to show yet.</p>
      ) : null}
      {res.status === "done" && res.value.kind === "outOfRange" ? (
        <p>
          <Link to="/">Go to first page</Link>
        </p>
      ) : null}
      {res.status === "done" && res.value.kind === "ok" ? (
        <>
          <div role="status" className="sr-only">
            Page {res.value.page} of {res.value.pages}
          </div>
          <ul className="grid">
            {res.value.items.map((p) => (
              <li key={p.id} className="card">
                <ProductImage label={p.name} />
                <Link
                  to={`/products/${p.id}`}
                  aria-describedby={`price-${p.id}`}
                >
                  {p.name}
                </Link>
                <span id={`price-${p.id}`}>
                  <Money cents={p.priceCents} />
                </span>
              </li>
            ))}
          </ul>
          <Pagination
            page={res.value.page}
            pages={res.value.pages}
            basePath="/"
          />
        </>
      ) : null}
    </section>
  );
}
