import { useEffect, useMemo, useState } from 'react';
import {
  createDelivery,
  deleteDelivery,
  fetchDeliveries,
  updateDelivery
} from '../services/deliveriesApi.js';

const initialForm = {
  orderNumber: '',
  customerName: '',
  assignedTo: '',
  status: 'dispatched',
  notes: ''
};

export default function DeliveriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((d) => d.status === statusFilter);
  }, [items, statusFilter]);

  async function loadDeliveries() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDeliveries();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeliveries();
  }, []);

  function resetForm() {
    setEditingId('');
    setForm(initialForm);
  }

  function selectForEdit(item) {
    setEditingId(item._id || item.id);
    setForm({
      orderNumber: item.orderNumber || '',
      customerName: item.customerName || '',
      assignedTo: item.assignedTo || '',
      status: item.status || 'dispatched',
      notes: item.notes || ''
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = { ...form };

    try {
      if (editingId) {
        const updated = await updateDelivery(editingId, payload);
        setItems((prev) => prev.map((x) => (x._id === editingId || x.id === editingId ? { ...x, ...updated } : x)));
      } else {
        const created = await createDelivery(payload);
        const optimisticId = created._id || created.id || `tmp-${Date.now()}`;
        setItems((prev) => [{ _id: optimisticId, ...payload, ...created }, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save delivery');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteDelivery(id);
      setItems((prev) => prev.filter((x) => x._id !== id && x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete delivery');
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const updated = await updateDelivery(id, { status });
      setItems((prev) => prev.map((x) => (x._id === id || x.id === id ? { ...x, ...updated, status } : x)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <h1>Delivery Management</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Order number"
            value={form.orderNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, orderNumber: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Assigned to"
            value={form.assignedTo}
            onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
            required
          />
          <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <option value="dispatched">Dispatched</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <textarea
            rows={5}
            placeholder="Delivery notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <div className="row-actions">
            <button type="submit">{editingId ? 'Update delivery' : 'Create delivery'}</button>
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
          <h2>Deliveries</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
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
                  <th>Customer</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id}>
                      <td>{item.orderNumber || '-'}</td>
                      <td>{item.customerName || '-'}</td>
                      <td>{item.assignedTo || '-'}</td>
                      <td>
                        <select value={item.status || 'dispatched'} onChange={(e) => handleStatusChange(id, e.target.value)}>
                          <option value="dispatched">Dispatched</option>
                          <option value="out_for_delivery">Out for delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="action-cell">
                        <button type="button" className="ghost-btn" onClick={() => selectForEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="danger-btn" onClick={() => handleDelete(id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
