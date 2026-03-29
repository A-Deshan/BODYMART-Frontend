import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const modulesByRole = {
  admin: ['dashboard', 'products', 'inventory', 'users', 'memberships', 'orders', 'deliveries', 'reports', 'workout-plans'],
  stock_manager: ['dashboard', 'products', 'inventory', 'orders'],
  delivery_personnel: ['dashboard', 'deliveries']
};

const moduleLabels = {
  dashboard: 'Dashboard',
  products: 'Products',
  inventory: 'Inventory',
  users: 'Users',
  memberships: 'Memberships',
  orders: 'Orders',
  deliveries: 'Deliveries',
  reports: 'Reports',
  'workout-plans': 'Workout Plans'
};

const moduleIcons = {
  dashboard: '▦',
  products: '◫',
  inventory: '◪',
  users: '◉',
  memberships: '◎',
  orders: '◌',
  deliveries: '◍',
  reports: '◈',
  'workout-plans': '◬'
};

export function ProtectedLayout() {
  const { token, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedModules = modulesByRole[user?.role] || [];
  const initial = String(user?.name || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-icon">BM</span>
          <h2>Body<span>Mart</span></h2>
        </div>
        <nav>
          {allowedModules.map((module) => (
            <NavLink key={module} to={`/${module}`} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <span className="nav-symbol">{moduleIcons[module] || '•'}</span>
              {moduleLabels[module] || module}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
          <div className="user-chip">
            <span className="avatar-dot">{initial}</span>
            <div>
              <p>{user?.name || 'Admin User'}</p>
              <span>{String(user?.role || '').replaceAll('_', ' ')}</span>
            </div>
          </div>
          <button type="button" className="signout-btn" onClick={logout}>Sign Out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
