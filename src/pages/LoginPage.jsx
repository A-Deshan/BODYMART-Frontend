import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const highlights = [
  'Track your orders, memberships, and storefront activity from one website account.',
  'Keep the public website experience separate from the internal admin dashboard.',
  'Use the same email across sessions without ever choosing an internal staff role.'
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form.email, form.password);
      const target = location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : '/';
      navigate(target);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="site-auth-page">
      <section className="site-auth-shell">
        <article className="site-auth-panel">
          <div>
            <span className="site-auth-badge">Website Member Access</span>
            <h2>Welcome back to the BodyMart storefront.</h2>
            <p>
              Sign in with your website account to continue shopping, manage your public account, and stay on the
              customer side of the platform.
            </p>
          </div>
          <ul className="site-auth-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="site-auth-card">
          <span className="site-auth-eyebrow">Log In</span>
          <h1>Enter your website account</h1>
          <p className="site-auth-copy">Use your customer email and password to access the BodyMart website.</p>

          <form className="site-auth-form" onSubmit={handleSubmit}>
            <label className="site-auth-label">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label className="site-auth-label">
              <span>Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>

            {error && <p className="site-auth-message error">{error}</p>}

            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="site-auth-foot">
            Need a website account? <Link to="/register">Create one here</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
