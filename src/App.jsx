import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './components/SiteLayout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useCart } from './hooks/useCart.js';
import AboutPage from './pages/AboutPage.jsx';
import CartPage from './pages/CartPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MembershipPage from './pages/MembershipPage.jsx';
import MembershipPaymentPage from './pages/MembershipPaymentPage.jsx';
import OrderPaymentPage from './pages/OrderPaymentPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import WorkoutPlanPage from './pages/WorkoutPlanPage.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();
  const {
    cart,
    cartCount,
    subtotal,
    deliveryFee,
    totalAmount,
    message,
    isSubmitting,
    addToCart,
    updateQuantity,
    removeFromCart,
    placeOrder,
    clearMessage
  } = useCart();

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearMessage();
    }, 3200);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  return (
    <SiteLayout cartCount={cartCount}>
      {message && <div className="inner status-banner">{message}</div>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shop" element={<ShopPage onAddToCart={addToCart} cartCount={cartCount} />} />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              totalAmount={totalAmount}
              isAuthenticated={isAuthenticated}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeFromCart}
            />
          }
        />
        <Route
          path="/cart/payment"
          element={
            <OrderPaymentPage
              cart={cart}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              totalAmount={totalAmount}
              isSubmitting={isSubmitting}
              isAuthenticated={isAuthenticated}
              onPlaceOrder={placeOrder}
            />
          }
        />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/membership/payment" element={<MembershipPaymentPage />} />
        <Route path="/workout-plan" element={<WorkoutPlanPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SiteLayout>
  );
}
