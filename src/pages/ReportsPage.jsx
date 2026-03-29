import { useEffect, useState } from 'react';
import {
  createReport,
  exportInventoryCsv,
  exportSalesCsv,
  fetchAnalyticsSummary,
  fetchProductPerformance,
  fetchReports,
  fetchRevenueTrend,
  fetchUserGrowth
} from '../services/reportsApi.js';
import { formatCurrency } from '../utils/currency.js';

const initialForm = {
  reportType: 'sales',
  fromDate: '',
  toDate: '',
  format: 'csv'
};

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [range, setRange] = useState({ fromDate: '', toDate: '' });
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  function buildRangeParams() {
    return {
      fromDate: range.fromDate || undefined,
      toDate: range.toDate || undefined
    };
  }

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReports();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    setAnalyticsLoading(true);
    setError('');

    const params = buildRangeParams();

    try {
      const [summaryData, trendData, productData, userData] = await Promise.all([
        fetchAnalyticsSummary(params),
        fetchRevenueTrend({ ...params, groupBy: 'day' }),
        fetchProductPerformance({ ...params, limit: 8 }),
        fetchUserGrowth({ ...params, groupBy: 'month' })
      ]);

      setSummary(summaryData);
      setRevenueTrend(trendData);
      setProductPerformance(productData);
      setUserGrowth(userData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    loadAnalytics();
  }, []);

  async function handleGenerate(event) {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        reportType: form.reportType,
        fromDate: form.fromDate || null,
        toDate: form.toDate || null,
        format: form.format,
        requestedAt: new Date().toISOString()
      };
      const created = await createReport(payload);
      const optimisticId = created._id || created.id || `tmp-${Date.now()}`;
      setItems((prev) => [{ _id: optimisticId, ...payload, ...created }, ...prev]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate report');
    }
  }

  async function handleExportSales() {
    setExporting(true);
    setError('');
    try {
      await exportSalesCsv(buildRangeParams());
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to export sales CSV');
    } finally {
      setExporting(false);
    }
  }

  async function handleExportInventory() {
    setExporting(true);
    setError('');
    try {
      await exportInventoryCsv(buildRangeParams());
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to export inventory CSV');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <div className="row-between">
          <h1>Reporting & Analytics</h1>
          <button type="button" className="ghost-btn" onClick={loadAnalytics}>
            Refresh Analytics
          </button>
        </div>

        <div className="form-grid form-inline">
          <input
            type="date"
            value={range.fromDate}
            onChange={(e) => setRange((prev) => ({ ...prev, fromDate: e.target.value }))}
          />
          <input
            type="date"
            value={range.toDate}
            onChange={(e) => setRange((prev) => ({ ...prev, toDate: e.target.value }))}
          />
          <button type="button" onClick={loadAnalytics}>Apply Range</button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="panel stat-card">
          <p className="muted">Total Sales</p>
          <h2>{analyticsLoading ? '...' : formatCurrency(summary?.totalSales || 0)}</h2>
        </article>
        <article className="panel stat-card">
          <p className="muted">Paid Orders</p>
          <h2>{analyticsLoading ? '...' : summary?.paidOrders || 0}</h2>
        </article>
        <article className="panel stat-card">
          <p className="muted">Active Memberships</p>
          <h2>{analyticsLoading ? '...' : summary?.activeMemberships || 0}</h2>
        </article>
        <article className="panel stat-card">
          <p className="muted">Low Stock Products</p>
          <h2>{analyticsLoading ? '...' : summary?.lowStockProducts || 0}</h2>
        </article>
      </div>

      <div className="panel">
        <h2>Generate Report Record</h2>
        <form className="form-grid form-inline" onSubmit={handleGenerate}>
          <select value={form.reportType} onChange={(e) => setForm((prev) => ({ ...prev, reportType: e.target.value }))}>
            <option value="sales">Sales</option>
            <option value="inventory">Inventory</option>
            <option value="memberships">Memberships</option>
            <option value="users">Users</option>
          </select>
          <input type="date" value={form.fromDate} onChange={(e) => setForm((prev) => ({ ...prev, fromDate: e.target.value }))} />
          <input type="date" value={form.toDate} onChange={(e) => setForm((prev) => ({ ...prev, toDate: e.target.value }))} />
          <select value={form.format} onChange={(e) => setForm((prev) => ({ ...prev, format: e.target.value }))}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button type="submit">Generate</button>
        </form>

        <div className="row-actions">
          <button type="button" className="ghost-btn" onClick={handleExportSales} disabled={exporting}>
            Export Sales CSV
          </button>
          <button type="button" className="ghost-btn" onClick={handleExportInventory} disabled={exporting}>
            Export Inventory CSV
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <article className="panel">
          <h2>Revenue Trend</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {revenueTrend.map((row) => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>{formatCurrency(row.totalRevenue || 0)}</td>
                    <td>{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Top Product Performance</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {productPerformance.map((row) => (
                  <tr key={row.productName}>
                    <td>{row.productName}</td>
                    <td>{row.quantitySold}</td>
                    <td>{formatCurrency(row.revenue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="panel">
        <h2>User Growth Trend</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>New Users</th>
              </tr>
            </thead>
            <tbody>
              {userGrowth.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Generated Reports</h2>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Format</th>
                  <th>Requested At</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id || item.id || `${item.reportType}-${item.requestedAt}`}>
                    <td>{item.reportType || '-'}</td>
                    <td>{item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '-'}</td>
                    <td>{item.toDate ? new Date(item.toDate).toLocaleDateString() : '-'}</td>
                    <td>{item.format || '-'}</td>
                    <td>{item.requestedAt ? new Date(item.requestedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
