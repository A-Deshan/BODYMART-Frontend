import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDashboardOverview } from '../services/dashboardApi.js';
import { fetchOrders } from '../services/ordersApi.js';
import { formatCurrency } from '../utils/currency.js';

const statusSteps = ['ordered', 'processing', 'shipped', 'delivered'];

const orderStatusToStep = {
  processing: 1,
  confirmed: 1,
  dispatched: 2,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: 1
};

function statusLabel(status) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'out_for_delivery') return 'Out for Delivery';
  if (status === 'dispatched') return 'Shipped';
  if (status === 'cancelled') return 'Cancelled';
  return 'Processing';
}

function progressPercent(status) {
  const step = orderStatusToStep[status] ?? 1;
  return (step / (statusSteps.length - 1)) * 100;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const firstName = useMemo(() => {
    const name = String(user?.name || 'Admin').trim();
    return name.split(' ')[0] || 'Admin';
  }, [user?.name]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [overviewData, orderData] = await Promise.all([fetchDashboardOverview(), fetchOrders()]);
      setOverview(overviewData);
      setOrders(orderData.slice(0, 4));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="muted">Loading dashboard...</p>;

  return (
    <section className="dashboard-shell">
      <header className="dashboard-header">
        <h1>Welcome back, {firstName}!</h1>
        <p className="muted">Here&apos;s what&apos;s happening with your operations.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="dashboard-stats-grid">
        <article className="dashboard-stat-card">
          <p>Total Orders</p>
          <h2>{overview?.ordersCount ?? orders.length}</h2>
        </article>
        <article className="dashboard-stat-card">
          <p>Pending Delivery</p>
          <h2>{overview?.pendingOrders ?? 0}</h2>
        </article>
        <article className="dashboard-stat-card">
          <p>Total Sales</p>
          <h2>{formatCurrency(overview?.totalSales)}</h2>
        </article>
      </div>

      <div className="row-between">
        <h2>Recent Orders</h2>
        <button type="button" className="ghost-btn" onClick={loadData}>Refresh</button>
      </div>

      <div className="orders-stack">
        {orders.length === 0 ? (
          <article className="order-card">
            <p className="muted">No recent orders yet.</p>
          </article>
        ) : (
          orders.map((order) => {
            const count = Array.isArray(order.items) ? order.items.length : 0;
            const percentage = progressPercent(order.orderStatus);
            return (
              <article key={order._id} className="order-card">
                <div className="order-top">
                  <div>
                    <h3>Order #{order.orderNumber || order._id?.slice(-6)}</h3>
                    <p className="muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="order-right">
                    <span className="order-badge">{statusLabel(order.orderStatus)}</span>
                    <h3>{formatCurrency(order.totalAmount)}</h3>
                    <p className="muted">{count} items</p>
                  </div>
                </div>

                <div className="order-progress-wrap">
                  <div className="order-progress">
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="order-steps">
                    {statusSteps.map((step) => (
                      <span key={step}>{step[0].toUpperCase() + step.slice(1)}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
