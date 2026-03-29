import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SiteLayout({ cartCount, children }) {
  const { isAuthenticated, logout, user } = useAuth();
  const badgeLabel = cartCount > 99 ? '99+' : cartCount;
  const firstName = String(user?.name || 'Member').trim().split(/\s+/)[0];

  return (
    <div className="site">
      <header className="topbar">
        <div className="inner nav-wrap">
          <div className="brand">
            <span className="brand-icon">BM</span>
            <h1>Body<span>Mart</span></h1>
          </div>

          <nav className="main-nav">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/workout-plan">Workout Plan</NavLink>
            <NavLink to="/membership">Membership</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>

          <div className="nav-actions">
            <NavLink to="/cart" aria-label="Cart" className={({ isActive }) => `cart-link${isActive ? ' active' : ''}`}>
              <svg
                className="cart-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.78L21 7H7.4" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{badgeLabel}</span>}
            </NavLink>
            {isAuthenticated ? (
              <>
                <div className="site-account-chip">
                  <span>Signed in</span>
                  <strong>{firstName}</strong>
                </div>
                <button type="button" className="ghost-btn nav-logout-btn" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({ isActive }) => `login-link${isActive ? ' active' : ''}`}>
                  Log in
                </NavLink>
                <NavLink to="/register" className="primary nav-primary-link">Sign up</NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="footer">
        <div className="inner footer-grid">
          <div>
            <div className="brand footer-brand">
              <span className="brand-icon">BM</span>
              <h1>Body<span>Mart</span></h1>
            </div>
            <p>Your one-stop destination for premium fitness equipment, supplements, and expert wellness guidance.</p>
          </div>
          <div>
            <h5>Shop</h5>
            <p>Supplements</p>
            <p>Equipment</p>
            <p>Apparel</p>
            <p>Accessories</p>
          </div>
          <div>
            <h5>Support</h5>
            <p>FAQ</p>
            <p>Shipping & Returns</p>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
          <div>
            <h5>Contact Us</h5>
            <p>123 Fitness Blvd, Gym City, CA 90210</p>
            <p>+1 (555) 123-4567</p>
            <p>support@bodymart.com</p>
          </div>
        </div>
        <p className="copyright">© 2026 BodyMart. All rights reserved.</p>
      </footer>
    </div>
  );
}
