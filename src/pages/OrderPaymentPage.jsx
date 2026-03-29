import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/currency.js';

const paymentOptions = [
  {
    key: 'card',
    title: 'Card Payment',
    description: 'Pay now with your debit or credit card and record the order as paid immediately.'
  },
  {
    key: 'bank_transfer',
    title: 'Bank Transaction',
    description: 'Place the order now and share your transfer reference so the team can verify it.'
  },
  {
    key: 'cash',
    title: 'Cash on Delivery',
    description: 'Place the order now and pay when the products reach you.'
  }
];

const expiryMonths = Array.from({ length: 12 }, (_, index) => index + 1);
const expiryYears = Array.from({ length: 12 }, (_, index) => new Date().getFullYear() + index);

function paymentMethodLabel(value) {
  if (value === 'bank_transfer') return 'Bank Transaction';
  if (value === 'cash') return 'Cash on Delivery';
  return 'Card Payment';
}

export default function OrderPaymentPage({
  cart,
  subtotal,
  deliveryFee,
  totalAmount,
  isSubmitting,
  isAuthenticated,
  onPlaceOrder
}) {
  const location = useLocation();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState({
    paymentMethod: 'card',
    contactPhone: '',
    paymentReference: '',
    orderNote: '',
    cardholderName: user?.name || '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      cardholderName: prev.cardholderName || user?.name || ''
    }));
  }, [user]);

  const selectedOption = useMemo(
    () => paymentOptions.find((option) => option.key === form.paymentMethod) || paymentOptions[0],
    [form.paymentMethod]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      paymentMethod: form.paymentMethod,
      contactPhone: form.contactPhone,
      paymentReference: form.paymentMethod === 'bank_transfer' ? form.paymentReference : '',
      orderNote: form.orderNote,
      cardholderName: form.paymentMethod === 'card' ? form.cardholderName : '',
      cardNumber: form.paymentMethod === 'card' ? form.cardNumber : '',
      expiryMonth: form.paymentMethod === 'card' ? form.expiryMonth : '',
      expiryYear: form.paymentMethod === 'card' ? form.expiryYear : '',
      cvv: form.paymentMethod === 'card' ? form.cvv : ''
    };

    const order = await onPlaceOrder(payload);

    if (!order) {
      return;
    }

    setReceipt(order);
  }

  return (
    <main className="main simple-page-main">
      {receipt ? (
        <section className="inner order-payment-success">
          <span className="site-auth-badge">Order Placed</span>
          <h4>Your order is on its way into processing.</h4>
          <p>
            {receipt.paymentStatus === 'paid'
              ? 'Your payment has been recorded and the order is now visible to the admin team.'
              : 'Your order has been recorded and is now visible to the admin team for follow-up.'}
          </p>

          <div className="order-payment-success-grid">
            <div>
              <span>Order number</span>
              <strong>{receipt.orderNumber}</strong>
            </div>
            <div>
              <span>Payment method</span>
              <strong>{paymentMethodLabel(receipt.paymentMethod)}</strong>
            </div>
            <div>
              <span>Payment status</span>
              <strong>{receipt.paymentStatus}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatCurrency(receipt.totalAmount)}</strong>
            </div>
          </div>

          <div className="membership-lock-actions">
            <Link to="/shop" className="primary nav-primary-link">Back to Shop</Link>
            <Link to="/cart" className="ghost-btn">Return to Cart</Link>
          </div>
        </section>
      ) : cart.length === 0 ? (
        <section className="inner empty-state">
          <h4>Your cart is empty</h4>
          <p>Add products before choosing a payment option.</p>
          <Link to="/shop" className="primary nav-primary-link">Go to Shop</Link>
        </section>
      ) : (
        <section className="inner order-payment-layout">
          <article className="order-payment-card">
            <div className="order-payment-head">
              <div>
                <p className="eyebrow">Payment Options</p>
                <h4>Choose how you want to complete this order.</h4>
              </div>
              <Link to="/cart" className="link-btn">Back to Cart</Link>
            </div>

            <div className="order-payment-methods">
              {paymentOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`order-payment-option${form.paymentMethod === option.key ? ' active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: option.key }))}
                >
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                </button>
              ))}
            </div>

            <div className="order-payment-note">
              <strong>{selectedOption.title}</strong>
              <p>{selectedOption.description}</p>
            </div>

            <form className="site-auth-form order-payment-form" onSubmit={handleSubmit}>
              <label className="site-auth-label">
                <span>Contact phone</span>
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={form.contactPhone}
                  onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
                  required
                />
              </label>

              {form.paymentMethod === 'card' && (
                <>
                  <label className="site-auth-label">
                    <span>Cardholder name</span>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={form.cardholderName}
                      onChange={(event) => setForm((prev) => ({ ...prev, cardholderName: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="site-auth-label order-payment-wide">
                    <span>Card number</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={(event) => setForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="site-auth-label">
                    <span>Expiry month</span>
                    <select
                      value={form.expiryMonth}
                      onChange={(event) => setForm((prev) => ({ ...prev, expiryMonth: event.target.value }))}
                      required
                    >
                      <option value="">Month</option>
                      {expiryMonths.map((month) => (
                        <option key={month} value={month}>
                          {String(month).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="site-auth-label">
                    <span>Expiry year</span>
                    <select
                      value={form.expiryYear}
                      onChange={(event) => setForm((prev) => ({ ...prev, expiryYear: event.target.value }))}
                      required
                    >
                      <option value="">Year</option>
                      {expiryYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="site-auth-label">
                    <span>CVV</span>
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="123"
                      value={form.cvv}
                      onChange={(event) => setForm((prev) => ({ ...prev, cvv: event.target.value }))}
                      required
                    />
                  </label>
                </>
              )}

              {form.paymentMethod === 'bank_transfer' && (
                <label className="site-auth-label order-payment-wide">
                  <span>Transfer reference</span>
                  <input
                    type="text"
                    placeholder="Reference or receipt number"
                    value={form.paymentReference}
                    onChange={(event) => setForm((prev) => ({ ...prev, paymentReference: event.target.value }))}
                    required
                  />
                </label>
              )}

              <label className="site-auth-label order-payment-wide">
                <span>
                  {form.paymentMethod === 'cash' ? 'Delivery note (optional)' : 'Order note (optional)'}
                </span>
                <input
                  type="text"
                  placeholder={
                    form.paymentMethod === 'cash'
                      ? 'Delivery instructions, landmark, or best time'
                      : 'Anything the team should know about this order'
                  }
                  value={form.orderNote}
                  onChange={(event) => setForm((prev) => ({ ...prev, orderNote: event.target.value }))}
                />
              </label>

              <div className="order-payment-actions">
                <button type="submit" className="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Placing Order...' : `Place Order with ${selectedOption.title}`}
                </button>
              </div>
            </form>
          </article>

          <aside className="order-payment-card order-payment-summary">
            <p className="eyebrow">Order Summary</p>
            <h4>Review your items before placing the order.</h4>

            <div className="order-payment-items">
              {cart.map((item) => (
                <div key={item.productId} className="order-payment-item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
                </div>
              ))}
            </div>

            <div className="membership-summary-list">
              <div className="membership-summary-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className="membership-summary-row">
                <span>Delivery</span>
                <strong>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</strong>
              </div>
              <div className="membership-summary-row">
                <span>Total</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
            </div>

            <p className="site-auth-copy order-payment-summary-note">
              Card payments are recorded as paid immediately. Bank transfers and cash on delivery stay pending until the
              team confirms them.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
