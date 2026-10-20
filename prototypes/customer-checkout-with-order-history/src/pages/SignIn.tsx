import { useEffect, useId, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { InfoNotice, PageHeading } from "../components/common";
import { useMock } from "../hooks";
import { safeReturnTarget } from "../lib/format";
import { signIn } from "../mock/api";

type Failure = "wrong" | "cap" | "ip429" | "unavailable" | null;

const FAILURE_TEXT: Record<Exclude<Failure, null>, string> = {
  wrong: "Email or password is incorrect",
  cap: "Too many sign-in attempts right now. Wait 16 seconds and try again.",
  ip429: "Too many sign-in attempts. Please try again later.",
  unavailable: "Sign-in is unavailable right now. Try again.",
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  readOnly,
  describedBy,
  invalid,
  hint,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  readOnly?: boolean;
  describedBy?: string;
  invalid?: boolean;
  hint?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? <span className="req"> (required)</span> : null}
      </label>
      {hint ? (
        <span id={hintId} className="hint">
          {hint}
        </span>
      ) : null}
      <div className="pw-row">
        <input
          id={id}
          name="password"
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          readOnly={readOnly}
          aria-required={required ? true : undefined}
          aria-invalid={invalid ? true : undefined}
          aria-describedby={
            [hint ? hintId : "", describedBy ?? ""].filter(Boolean).join(" ") ||
            undefined
          }
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-pressed={show}
          onClick={() => setShow((x) => !x)}
        >
          {show ? "Hide password" : "Show password"}
        </button>
      </div>
    </div>
  );
}

/** S-06 Sign in (US-13). Never reveals whether an account exists (NFR-16). */
export function SignInPage() {
  const s = useMock();
  const loc = useLocation();
  const [params] = useSearchParams();
  const target = safeReturnTarget(params.get("returnTo"));
  const banner = (loc.state as { banner?: "expired" | "gate" } | null)?.banner;

  const emailId = useId();
  const pwId = useId();
  const msgId = useId();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const [empties, setEmpties] = useState<{ email?: string; pw?: string }>({});
  const summaryRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (failure || empties.email || empties.pw) summaryRef.current?.focus();
  }, [failure, empties]);

  if (s.session.signedIn && !busy)
    return <Navigate to={target ?? "/"} replace />;

  const submit = async () => {
    if (busy) return;
    const e: { email?: string; pw?: string } = {};
    if (!email.trim()) e.email = "Enter your email address.";
    if (!pw) e.pw = "Enter your password.";
    setEmpties(e);
    setFailure(null);
    if (e.email || e.pw) return;
    setBusy(true);
    setSlow(false);
    timer.current = window.setTimeout(() => setSlow(true), 5000);
    const r = await signIn(email, pw);
    window.clearTimeout(timer.current);
    setBusy(false);
    setSlow(false);
    if (r.kind !== "ok") {
      setFailure(r.kind);
      if (r.kind === "wrong") setPw(""); // email kept, password cleared
    }
  };

  const summaryItems = [empties.email, empties.pw].filter(
    (x): x is string => !!x,
  );
  return (
    <section>
      <PageHeading title="Sign in" focusKey="signin" />
      {banner === "expired" ? (
        <InfoNotice>
          <p role="status">Your session has expired. Sign in to continue.</p>
        </InfoNotice>
      ) : null}
      {banner === "gate" ? (
        <InfoNotice>
          <p role="status">Sign in to continue.</p>
        </InfoNotice>
      ) : null}

      <div ref={summaryRef} tabIndex={-1} className="summary-slot">
        {failure ? (
          <div role="alert" id={msgId} className="notice notice-error">
            <span aria-hidden="true" className="icon">
              ✖
            </span>
            <p>{FAILURE_TEXT[failure]}</p>
            {failure === "unavailable" ? (
              <button type="button" onClick={() => void submit()}>
                Try again
              </button>
            ) : null}
          </div>
        ) : null}
        {summaryItems.length > 0 ? (
          <div role="alert" className="notice notice-error">
            <span aria-hidden="true" className="icon">
              ✖
            </span>
            <div>
              <h2>There is a problem</h2>
              <ul>
                {empties.email ? (
                  <li>
                    <a href={`#${emailId}`}>{empties.email}</a>
                  </li>
                ) : null}
                {empties.pw ? (
                  <li>
                    <a href={`#${pwId}`}>{empties.pw}</a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <form
        noValidate
        aria-busy={busy}
        onSubmit={(ev) => {
          ev.preventDefault();
          void submit();
        }}
      >
        <div className="field">
          <label htmlFor={emailId}>Email</label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            readOnly={busy}
            aria-invalid={empties.email ? true : undefined}
            aria-describedby={failure === "wrong" ? msgId : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordField
          id={pwId}
          label="Password"
          value={pw}
          onChange={setPw}
          autoComplete="current-password"
          readOnly={busy}
          invalid={!!empties.pw}
          describedBy={failure === "wrong" ? msgId : undefined}
        />
        <button type="submit" aria-busy={busy} aria-disabled={busy}>
          Sign in
        </button>
        <div role="status" className="status-line">
          {busy
            ? slow
              ? "Still working. This can take up to 20 seconds."
              : "Signing in..."
            : ""}
        </div>
      </form>
      <p>
        <Link
          to={
            target
              ? `/register?returnTo=${encodeURIComponent(target)}`
              : "/register"
          }
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
