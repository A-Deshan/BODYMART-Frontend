import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchMembershipPlans } from '../services/storeApi.js';
import { formatCurrency } from '../utils/currency.js';

const features = [
  {
    title: 'Full Gym Access',
    description: 'Train with cardio, strength, and recovery zones designed for daily consistency.',
    icon: '🏋️'
  },
  {
    title: 'Flexible Durations',
    description: 'Choose monthly, three-month, annual, or any additional plan configured by the gym.',
    icon: '🗓️'
  },
  {
    title: 'Tracked Payments',
    description: 'Every completed website payment flows directly into the admin membership dashboard.',
    icon: '💳'
  }
];

export default function MembershipPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPlans() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchMembershipPlans();
        setPlans(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load membership options right now.');
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  function handlePlanSelect(planKey) {
    navigate(`/membership/payment?plan=${encodeURIComponent(planKey)}`);
  }

  return (
    <main className="main">
      <section className="inner why-section membership-why-section">
        <h3>Why Join BodyMart?</h3>
        <p>Choose a plan, complete the website payment flow, and let the admin team see the membership instantly.</p>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span>{feature.icon}</span>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="inner membership-lock-card">
          <div>
            <span className="site-auth-badge membership-lock-badge">Members Only Checkout</span>
            <h4>Log in to continue with a membership purchase.</h4>
            <p>
              Membership activation now happens only through a logged-in website account so payment and membership
              records stay tied to the correct member profile.
            </p>
          </div>
          <div className="membership-lock-actions">
            <Link to="/login" state={{ from: location }} className="primary nav-primary-link">
              Log in
            </Link>
            <Link to="/register" state={{ from: location }} className="ghost-btn">
              Create website account
            </Link>
          </div>
        </section>
      )}

      <section className="inner membership-plan-grid">
        {loading && <p className="muted">Loading membership options...</p>}
        {error && <p className="error">{error}</p>}

        {!loading &&
          !error &&
          plans.map((plan) => (
            <article key={plan.key} className="membership-plan-card">
              <div className="membership-plan-top">
                <span className="membership-plan-tag">{plan.category}</span>
                <strong>{formatCurrency(plan.price)}</strong>
              </div>
              <h4>{plan.name}</h4>
              <p>{plan.description}</p>
              <div className="membership-plan-meta">
                <span>{plan.durationMonths} month{plan.durationMonths === 1 ? '' : 's'}</span>
                <span>Recorded in admin after payment</span>
              </div>
              <button
                type="button"
                className="primary"
                disabled={!isAuthenticated}
                onClick={() => handlePlanSelect(plan.key)}
              >
                {isAuthenticated ? 'Continue to payment' : 'Log in to purchase'}
              </button>
            </article>
          ))}
      </section>
    </main>
  );
}
