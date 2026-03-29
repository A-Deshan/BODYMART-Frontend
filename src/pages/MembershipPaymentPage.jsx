import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchMembershipPlans, purchaseMembership } from '../services/storeApi.js';
import { formatCurrency } from '../utils/currency.js';

const expiryMonths = Array.from({ length: 12 }, (_, index) => index + 1);
const expiryYears = Array.from({ length: 12 }, (_, index) => new Date().getFullYear() + index);

export default function MembershipPaymentPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState({
    billingPhone: '',
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

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchMembershipPlans();
        setPlans(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load membership details.');
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.key === searchParams.get('plan')),
    [plans, searchParams]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedPlan) {
      setError('Select a valid membership plan first.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const item = await purchaseMembership({
        planKey: selectedPlan.key,
        billingPhone: form.billingPhone,
        cardholderName: form.cardholderName,
        cardNumber: form.cardNumber,
        expiryMonth: form.expiryMonth,
        expiryYear: form.expiryYear,
        cvv: form.cvv
      });
      setReceipt(item);
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment could not be completed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="main">
      <section className="inner section-head membership-head">
        <div>
          <h3>Membership Payment</h3>
          <p>Confirm your selected plan, complete payment, and activate the membership on your website account.</p>
        </div>
      </section>

      {loading ? (
        <section className="inner empty-state">
          <h4>Loading payment details</h4>
          <p>We are preparing the membership payment page.</p>
        </section>
      ) : !selectedPlan ? (
        <section className="inner empty-state">
          <h4>Membership plan not found</h4>
          <p>Return to the membership page and choose a valid plan before continuing to payment.</p>
          <Link to="/membership" className="primary nav-primary-link">Back to Memberships</Link>
        </section>
      ) : receipt ? (
        <section className="inner membership-success-card">
          <span className="site-auth-badge membership-lock-badge">Payment Completed</span>
          <h4>{selectedPlan.name} is now active.</h4>
          <p>
            Your membership payment was recorded successfully and is already visible in the admin membership section.
          </p>
          <div className="membership-success-grid">
            <div>
              <span>Category</span>
              <strong>{receipt.membershipCategory}</strong>
            </div>
            <div>
              <span>Payment status</span>
              <strong>{receipt.paymentStatus}</strong>
            </div>
            <div>
              <span>Reference</span>
              <strong>{receipt.paymentReference}</strong>
            </div>
            <div>
              <span>Total paid</span>
              <strong>{formatCurrency(receipt.price)}</strong>
            </div>
          </div>
          <div className="membership-lock-actions">
            <Link to="/membership" className="primary nav-primary-link">Back to Memberships</Link>
            <Link to="/" className="ghost-btn">Return Home</Link>
          </div>
        </section>
      ) : (
        <section className="inner membership-payment-layout">
          <article className="membership-payment-card">
            <span className="site-auth-badge membership-lock-badge">Selected Plan</span>
            <h4>{selectedPlan.name}</h4>
            <p>{selectedPlan.description}</p>

            <div className="membership-summary-list">
              <div className="membership-summary-row">
                <span>Category</span>
                <strong>{selectedPlan.category}</strong>
              </div>
              <div className="membership-summary-row">
                <span>Duration</span>
                <strong>{selectedPlan.durationMonths} month{selectedPlan.durationMonths === 1 ? '' : 's'}</strong>
              </div>
              <div className="membership-summary-row">
                <span>Amount</span>
                <strong>{formatCurrency(selectedPlan.price)}</strong>
              </div>
              <div className="membership-summary-row">
                <span>Website account</span>
                <strong>{user?.email || '-'}</strong>
              </div>
            </div>
          </article>

          <article className="membership-payment-card">
            <h4>Payment Details</h4>
            <p className="site-auth-copy">
              Fill in the required payment details below. Only safe payment metadata is stored with the membership.
            </p>

            <form className="site-auth-form membership-payment-form" onSubmit={handleSubmit}>
              <label className="site-auth-label">
                <span>Member name</span>
                <input type="text" value={user?.name || ''} readOnly />
              </label>
              <label className="site-auth-label">
                <span>Member email</span>
                <input type="email" value={user?.email || ''} readOnly />
              </label>
              <label className="site-auth-label">
                <span>Phone number</span>
                <input
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={form.billingPhone}
                  onChange={(event) => setForm((prev) => ({ ...prev, billingPhone: event.target.value }))}
                  required
                />
              </label>
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
              <label className="site-auth-label membership-payment-wide">
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

              {error && <p className="site-auth-message error membership-payment-wide">{error}</p>}

              <button type="submit" className="primary membership-payment-wide" disabled={submitting}>
                {submitting ? 'Processing payment...' : `Pay ${formatCurrency(selectedPlan.price)}`}
              </button>
            </form>
          </article>
        </section>
      )}
    </main>
  );
}
