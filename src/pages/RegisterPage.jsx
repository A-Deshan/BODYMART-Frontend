import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const highlights = [
  'Create a customer account without any admin-only category or staff role selection.',
  'Register once and keep your website profile separate from the BodyMart admin panel.',
  'Start with the essentials now and expand the website experience later without changing the form.'
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      const target = location.state?.from?.pathname
        ? `${location.state.from.pathname}${location.state.from.search || ''}`
        : '/';
      navigate(target);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="site-auth-page">
      <section className="site-auth-shell">
        <article className="site-auth-panel">
          <div>
            <span className="site-auth-badge">Website Registration</span>
            <h2>Create a BodyMart website account in four fields.</h2>
            <p>
              This registration form is designed for the storefront only, so it keeps the workflow simple and avoids
              internal staff-only options.
            </p>
          </div>
          <ul className="site-auth-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="site-auth-card">
          <span className="site-auth-eyebrow">Sign Up</span>
          <h1>Open your website account</h1>
          <p className="site-auth-copy">Register with your full name, email, password, and password confirmation.</p>

          <form className="site-auth-form" onSubmit={handleSubmit}>
            <label className="site-auth-label">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
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
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
            <label className="site-auth-label">
              <span>Confirm password</span>
              <input
                type="password"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={8}
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />
            </label>

            {error && <p className="site-auth-message error">{error}</p>}

            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="site-auth-foot">
            Already registered? <Link to="/login">Sign in here</Link>
          </p>
        </article>
      </section>
    </main>
  );
}
