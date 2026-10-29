import { useEffect, useId, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatDateTime, formatMoney } from "../lib/format";
import type { OrderStatus } from "../mock/types";

/** One h1 per screen; focus moves to it when `focusKey` changes (route change rule). */
export function PageHeading({
  title,
  docTitle,
  focusKey,
}: {
  title: string;
  docTitle?: string;
  focusKey?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = `${docTitle ?? title} - Shop (prototype)`;
  }, [title, docTitle]);
  useEffect(() => {
    ref.current?.focus();
  }, [focusKey]);
  return (
    <h1 ref={ref} tabIndex={-1}>
      {title}
    </h1>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div role="status" aria-busy="true" className="loading">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorNotice({
  message,
  onRetry,
  retryLabel = "Try again",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div role="alert" className="notice notice-error">
      <span aria-hidden="true" className="icon">
        ✖
      </span>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="notice notice-info">
      <span aria-hidden="true" className="icon">
        ℹ
      </span>
      <div>{children}</div>
    </div>
  );
}

export function Money({ cents }: { cents: number }) {
  return <span className="money">{formatMoney(cents)}</span>;
}

export function Time({ ms }: { ms: number }) {
  return (
    <time dateTime={new Date(ms).toISOString()}>{formatDateTime(ms)}</time>
  );
}

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  failed: "Failed",
};
const STATUS_ICON: Partial<Record<OrderStatus, string>> = {
  pending_payment: "⏳",
  paid: "✔",
  failed: "✖",
};

export function statusLabel(s: OrderStatus): string {
  return STATUS_LABEL[s] ?? s;
}

/** Status is conveyed by icon plus text, never colour alone. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      <span aria-hidden="true">{STATUS_ICON[status] ?? ""} </span>
      {statusLabel(status)}
    </span>
  );
}

export function ProductImage({ label }: { label: string }) {
  return (
    <div className="img-placeholder" aria-hidden="true">
      {label.slice(0, 1)}
    </div>
  );
}

export function Pagination({
  page,
  pages,
  basePath,
  label = "Pagination",
}: {
  page: number;
  pages: number;
  basePath: string;
  label?: string;
}) {
  const prev = page > 1 ? `${basePath}?page=${page - 1}` : null;
  const next = page < pages ? `${basePath}?page=${page + 1}` : null;
  return (
    <nav aria-label={label} className="pagination">
      {prev ? (
        <Link to={prev}>Previous</Link>
      ) : (
        <span aria-disabled="true">Previous</span>
      )}
      <span aria-current="page">
        Page {page} of {pages}
      </span>
      {next ? (
        <Link to={next}>Next</Link>
      ) : (
        <span aria-disabled="true">Next</span>
      )}
    </nav>
  );
}

/** Numeric text input with - and + buttons (UX-OQ-17). */
export function QuantityControl({
  label,
  hideLabel,
  value,
  onChange,
  error,
  onEnter,
  hint,
}: {
  label: string;
  hideLabel?: boolean;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  onEnter?: () => void;
  hint?: string;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const step = (d: number) => {
    const n = Number.parseInt(value, 10);
    const base = Number.isFinite(n) ? n : 0;
    onChange(String(Math.min(10, Math.max(1, base + d))));
  };
  const describedBy =
    [hint ? hintId : "", error ? errId : ""].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="qty">
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <div className="qty-row">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          size={3}
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {hint ? (
        <span id={hintId} className="hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <p id={errId} role="alert" className="field-error">
          <span aria-hidden="true">✖ </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function parseQuantity(v: string): number | null {
  if (!/^\d+$/.test(v.trim())) return null;
  const n = Number.parseInt(v.trim(), 10);
  return n >= 1 && n <= 10 ? n : null;
}

export const QTY_MESSAGE = "Quantity must be a whole number from 1 to 10.";
