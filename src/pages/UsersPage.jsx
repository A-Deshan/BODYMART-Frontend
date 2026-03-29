import { useEffect, useMemo, useState } from 'react';
import { createUser, deleteUser, fetchUsers, updateUser } from '../services/usersApi.js';

const initialForm = {
  name: '',
  email: '',
  role: 'stock_manager',
  isActive: true
};

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (u) => String(u.name || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUsers();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetForm() {
    setEditingId('');
    setForm(initialForm);
  }

  function selectForEdit(item) {
    setEditingId(item._id || item.id);
    setForm({
      name: item.name || '',
      email: item.email || '',
      role: item.role || 'stock_manager',
      isActive: item.isActive ?? true
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...form,
      email: form.email.trim().toLowerCase()
    };

    try {
      if (editingId) {
        const updated = await updateUser(editingId, payload);
        setItems((prev) => prev.map((x) => (x._id === editingId || x.id === editingId ? { ...x, ...updated } : x)));
      } else {
        const created = await createUser(payload);
        const optimisticId = created._id || created.id || `tmp-${Date.now()}`;
        setItems((prev) => [{ _id: optimisticId, ...payload, ...created }, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save user');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteUser(id);
      setItems((prev) => prev.filter((x) => x._id !== id && x.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user');
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <h1>User Management</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="stock_manager">Stock Manager</option>
            <option value="delivery_personnel">Delivery Personnel</option>
          </select>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active account
          </label>
          <div className="row-actions">
            <button type="submit">{editingId ? 'Update user' : 'Create user'}</button>
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
          <h2>Users</h2>
          <input type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const id = item._id || item.id;
                  return (
                    <tr key={id}>
                      <td>{item.name || '-'}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.role || '-'}</td>
                      <td>{item.isActive === false ? 'Inactive' : 'Active'}</td>
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
