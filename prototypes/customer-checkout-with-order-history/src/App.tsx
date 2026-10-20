import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import { DevPanel } from "./components/DevPanel";
import { PageHeading } from "./components/common";
import { Shell } from "./components/Shell";
import { CartPage } from "./pages/Cart";
import { Catalogue } from "./pages/Catalogue";
import { CheckoutPage } from "./pages/Checkout";
import { OutcomePage } from "./pages/Outcome";
import { OrderDetailPage, OrdersPage } from "./pages/Orders";
import { HandoffPage, ProviderPage } from "./pages/Payment";
import { ProductPage } from "./pages/Product";
import { RegisterPage } from "./pages/Register";
import { SignInPage } from "./pages/SignIn";
import { SignedOutPage } from "./pages/SignedOut";

function NotFoundPage() {
  return (
    <section>
      <PageHeading title="Page not found" focusKey="404" />
      <p>
        <Link to="/">Browse products</Link>
      </p>
    </section>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/provider/:orderId" element={<ProviderPage />} />
        <Route element={<Shell />}>
          <Route path="/" element={<Catalogue />} />
          <Route path="/products" element={<Catalogue />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/payment" element={<HandoffPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/outcome" element={<OutcomePage />} />
          <Route path="/signed-out" element={<SignedOutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <DevPanel />
    </BrowserRouter>
  );
}
