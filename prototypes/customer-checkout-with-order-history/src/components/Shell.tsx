import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMock, useNow } from "../hooks";
import { formatDateTime } from "../lib/format";
import { warningInfo } from "../lib/session";
import { keepAlive, signOut } from "../mock/api";
import { cartCount, clearNotice } from "../mock/store";

/** S-01 session-expiry warning, idle and absolute-limit variants (J-26). Non-modal, never takes focus. */
function SessionWarning() {
  const s = useMock();
  const now = useNow();
  const nav = useNavigate();
  const loc = useLocation();
  const [busy, setBusy] = useState(false);
  const w = warningInfo(s.session, now);

  const stay = async () => {
    if (busy) return;
    setBusy(true);
    const r = await keepAlive();
    setBusy(false);
    if (r === "401") {
      nav(
        `/sign-in?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`,
        {
          replace: true,
          state: { banner: "expired" },
        },
      );
    }
  };

  if (!w.variant) return null;
  return (
    <section className="session-warning" aria-label="Session notice">
      <span aria-hidden="true" className="icon">
        ⚠
      </span>
      <div>
        {w.variant === "idle" ? (
          <>
            <p role="alert">
              Your session will expire in 2 minutes because of inactivity. Stay
              signed in?
            </p>
            {s.keepAlive.error ? (
              <p role="alert" key={s.keepAlive.attempt} className="warn-error">
                <span aria-hidden="true">✖ </span>Your session was not extended.
                Try again.
              </p>
            ) : null}
            <button
              type="button"
              aria-busy={busy}
              aria-disabled={busy}
              onClick={stay}
            >
              {s.keepAlive.error ? "Try again" : "Stay signed in"}
            </button>
          </>
        ) : (
          <p role="alert">
            Your session ends at {formatDateTime(w.absoluteExpiry)}; please sign
            in again
          </p>
        )}
      </div>
    </section>
  );
}

function StillSignedIn() {
  const s = useMock();
  useEffect(() => {
    if (!s.notice) return;
    const id = window.setTimeout(clearNotice, 8000);
    return () => window.clearTimeout(id);
  }, [s.notice]);
  // The live region is always present so the change is announced politely without moving focus.
  return (
    <div role="status" aria-live="polite" className="still-signed-in">
      {s.notice ? <span>{s.notice.text}</span> : null}
    </div>
  );
}

export function Shell() {
  const s = useMock();
  const nav = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const signedIn = s.session.signedIn;
  const sc = s.scenarios.cart;
  const count = cartCount();

  const doSignOut = async () => {
    setSigningOut(true);
    setSignOutError(false);
    const r = await signOut();
    setSigningOut(false);
    if (r === "ok") nav("/signed-out");
    else setSignOutError(true);
  };

  const cartLabel =
    sc === "loading" || sc === "error"
      ? "Cart"
      : `Cart, ${count} ${count === 1 ? "item" : "items"}`;

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SessionWarning />
      <StillSignedIn />
      <header className="site-header">
        <Link to="/" className="brand">
          Shop
        </Link>
        <nav aria-label="Main">
          <ul>
            <li>
              <NavLink to="/" end>
                Products
              </NavLink>
            </li>
            {signedIn ? (
              <>
                <li>
                  <NavLink to="/cart" aria-label={cartLabel}>
                    Cart
                    {sc === "normal" || sc === "updateFail" ? (
                      <span className="count"> ({count})</span>
                    ) : null}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/orders">Orders</NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={doSignOut}
                    aria-busy={signingOut}
                    aria-disabled={signingOut}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/sign-in">Sign in</NavLink>
                </li>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      {signOutError ? (
        <div role="alert" className="notice notice-error shell-error">
          <span aria-hidden="true" className="icon">
            ✖
          </span>
          <p>We couldn't sign you out. Try again.</p>
          <button type="button" onClick={doSignOut}>
            Try again
          </button>
        </div>
      ) : null}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
