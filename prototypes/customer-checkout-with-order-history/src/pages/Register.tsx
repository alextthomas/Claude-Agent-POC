import { useEffect, useId, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { PageHeading } from "../components/common";
import { useMock } from "../hooks";
import { codePoints, safeReturnTarget } from "../lib/format";
import { register } from "../mock/api";
import { PasswordField } from "./SignIn";

const COMMON = ["password1234", "123456789012", "qwertyuiop12", "iloveyou1234"];

interface Errors {
  email?: string;
  pw?: string;
  taken?: boolean;
}

function validate(email: string, pw: string): Errors {
  const e: Errors = {};
  const em = email.trim();
  if (!em) e.email = "Enter your email address.";
  else if (em.length > 254) e.email = "Email must be 254 characters or fewer.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
    e.email = "Enter a valid email address, for example name@example.com.";
  const n = codePoints(pw);
  if (!pw) e.pw = "Enter a password.";
  else if (n < 12) e.pw = "Password must be at least 12 characters.";
  else if (n > 128) e.pw = "Password must be 128 characters or fewer.";
  else if (COMMON.includes(pw.normalize("NFC").toLowerCase()))
    e.pw = "This password is too common. Choose a different password.";
  return e;
}

/** S-05 Register (US-12). The only screen that discloses that an email is registered (OQ-25). */
export function RegisterPage() {
  const s = useMock();
  const [params] = useSearchParams();
  const target = safeReturnTarget(params.get("returnTo"));
  const emailId = useId();
  const pwId = useId();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.email || errors.pw || errors.taken || formError)
      summaryRef.current?.focus();
  }, [errors, formError]);

  if (s.session.signedIn && !busy)
    return <Navigate to={target ?? "/"} replace />;

  const submit = async () => {
    if (busy) return;
    const e = validate(email, pw);
    setFormError(null);
    setErrors(e);
    if (e.email || e.pw) return;
    setBusy(true);
    const r = await register(email);
    setBusy(false);
    if (r.kind === "taken")
      setErrors({
        taken: true,
        email: "This email is already registered. Sign in instead.",
      });
    else if (r.kind === "rate")
      setFormError(
        "Too many attempts. Please wait a few minutes and try again.",
      );
    else if (r.kind === "error")
      setFormError("We couldn't create your account. Try again.");
  };

  const items: Array<{ id: string; text: string }> = [];
  if (errors.email) items.push({ id: emailId, text: errors.email });
  if (errors.pw) items.push({ id: pwId, text: errors.pw });

  return (
    <section>
      <PageHeading title="Create an account" focusKey="register" />
      <div ref={summaryRef} tabIndex={-1} className="summary-slot">
        {items.length > 0 ? (
          <div role="alert" className="notice notice-error">
            <span aria-hidden="true" className="icon">
              ✖
            </span>
            <div>
              <h2>There is a problem</h2>
              <ul>
                {items.map((i) => (
                  <li key={i.id}>
                    <a href={`#${i.id}`}>{i.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {formError ? (
          <div role="alert" className="notice notice-error">
            <span aria-hidden="true" className="icon">
              ✖
            </span>
            <p>{formError}</p>
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
          <label htmlFor={emailId}>
            Email<span className="req"> (required)</span>
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            readOnly={busy}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-err` : undefined}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email ? (
            <p id={`${emailId}-err`} className="field-error">
              <span aria-hidden="true">✖ </span>
              {errors.email}{" "}
              {errors.taken ? <Link to="/sign-in">Sign in</Link> : null}
            </p>
          ) : null}
        </div>
        <PasswordField
          id={pwId}
          label="Password"
          required
          value={pw}
          onChange={setPw}
          autoComplete="new-password"
          readOnly={busy}
          invalid={!!errors.pw}
          hint="Use 12 to 128 characters. You don't need numbers or symbols."
          describedBy={errors.pw ? `${pwId}-err` : undefined}
        />
        {errors.pw ? (
          <p id={`${pwId}-err`} className="field-error">
            <span aria-hidden="true">✖ </span>
            {errors.pw}
          </p>
        ) : null}
        <button type="submit" aria-busy={busy} aria-disabled={busy}>
          Register
        </button>
        <div role="status" className="status-line">
          {busy ? "Creating your account..." : ""}
        </div>
      </form>
      <p>
        <Link
          to={
            target
              ? `/sign-in?returnTo=${encodeURIComponent(target)}`
              : "/sign-in"
          }
        >
          Already have an account? Sign in
        </Link>
      </p>
    </section>
  );
}
