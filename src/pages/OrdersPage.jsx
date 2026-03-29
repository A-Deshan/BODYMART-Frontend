import { useEffect, useMemo, useState } from 'react';
import { createOrder, deleteOrder, fetchOrders, updateOrder, updateOrderStatus } from '../services/ordersApi.js';
import { formatCurrency } from '../utils/currency.js';

const initialForm = {
  orderNumber: '',
  subtotal: '0',
  deliveryFee: '0',
  totalAmount: '0',
  paymentMethod: 'card',
  paymentStatus: 'pending',
  orderStatus: 'processing',
  itemsJson: '[{"name":"Sample item","quantity":1,"unitPrice":0}]'
};

function formatPaymentMethodLabel(value) {
  if (value === 'bank_transfer') return 'Bank transfer';
  if (value === 'cash') return 'Cash on delivery';
  if (value === 'card') return 'Card';
  return value || '-';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);

  const filteredOrders = useMemo(() => {
    if (!statusFilter) return orders;
    return orders.filter((x) => x.orderStatus === statusFilter);
  }, [orders, statusFilter]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function selectForEdit(item) {
    setEditingId(item._id);
    setForm({
      orderNumber: item.orderNumber || '',
      subtotal: String(item.subtotal ?? 0),
      deliveryFee: String(item.deliveryFee ?? 0),
      totalAmount: String(item.totalAmount ?? 0),
      paymentMethod: item.paymentMethod || 'card',
      paymentStatus: item.paymentStatus || 'pending',
      orderStatus: item.orderStatus || 'processing',
      itemsJson: JSON.stringify(item.items || [], null, 2)
    });
  }

  function resetForm() {
    setEditingId('');
    setForm(initialForm);
  }

  function parseItemsOrThrow(itemsJson) {
    try {
      const parsed = JSON.parse(itemsJson);
      if (!Array.isArray(parsed)) throw new Error('items must be an array');
      return parsed;
    } catch {
      throw new Error('Items must be valid JSON array');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    let items;
    try {
      items = parseItemsOrThrow(form.itemsJson);
    } catch (err) {
      setError(err.message);
      return;
    }

    const payload = {
      orderNumber: form.orderNumber || undefined,
      subtotal: Number(form.subtotal),
      deliveryFee: Number(form.deliveryFee),
      totalAmount: Number(form.totalAmount),
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      orderStatus: form.orderStatus,
      items
    };

    try {
      if (editingId) {
        await updateOrder(editingId, payload);
      } else {
        await createOrder(payload);
      }
      resetForm();
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save order');
    }
  }

  async function handleStatusChange(id, nextStatus) {
    setError('');
    try {
      await updateOrderStatus(id, nextStatus);
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update order status');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteOrder(id);
      if (editingId === id) resetForm();
      await loadOrders();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete order');
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <h1>Order Management</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Order number (optional)"
            value={form.orderNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, orderNumber: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Subtotal"
            value={form.subtotal}
            onChange={(e) => setForm((prev) => ({ ...prev, subtotal: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Delivery fee"
            value={form.deliveryFee}
            onChange={(e) => setForm((prev) => ({ ...prev, deliveryFee: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Total amount"
            value={form.totalAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
            required
          />
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
          >
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="other">Other</option>
          </select>
          <select
            value={form.paymentStatus}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentStatus: e.target.value }))}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={form.orderStatus}
            onChange={(e) => setForm((prev) => ({ ...prev, orderStatus: e.target.value }))}
          >
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="dispatched">Dispatched</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <textarea
            rows={8}
            placeholder="Items JSON"
            value={form.itemsJson}
            onChange={(e) => setForm((prev) => ({ ...prev, itemsJson: e.target.value }))}
          />
          <div className="row-actions">
            <button type="submit">{editingId ? 'Update order' : 'Create order'}</button>
            {editingId && (
              <button type="button" className="ghost-btn" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="row-between">
          <h2>Orders</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="dispatched">Dispatched</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((item) => (
                  <tr key={item._id}>
                    <td>{item.orderNumber}</td>
                    <td>{formatCurrency(item.totalAmount)}</td>
                    <td>{`${formatPaymentMethodLabel(item.paymentMethod)} / ${item.paymentStatus}`}</td>
                    <td>
                      <select
                        value={item.orderStatus}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      >
                        <option value="processing">Processing</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="out_for_delivery">Out for delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="action-cell">
                      <button type="button" className="ghost-btn" onClick={() => selectForEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </td>
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
