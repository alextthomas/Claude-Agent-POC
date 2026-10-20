import { Link } from "react-router-dom";
import { PageHeading } from "../components/common";

/** S-12 Signed-out state (US-14). Same view whether sign-out happened now or the session had expired. */
export function SignedOutPage() {
  return (
    <section>
      <PageHeading
        title="You've been signed out"
        docTitle="Signed out"
        focusKey="signed-out"
      />
      <p>
        <Link to="/sign-in">Sign in</Link> <Link to="/">Browse products</Link>
      </p>
    </section>
  );
}
