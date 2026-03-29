import { useEffect, useState } from 'react';
import { fetchInventory, fetchInventoryHistory, updateStock } from '../services/inventoryApi.js';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [operation, setOperation] = useState('set');
  const [quantity, setQuantity] = useState('0');
  const [reason, setReason] = useState('manual_update');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadInventory() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchInventory({ lowStockOnly });
      setItems(data);
      if (!selectedProductId && data.length > 0) {
        setSelectedProductId(data[0].productId);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const data = await fetchInventoryHistory(selectedProductId ? { productId: selectedProductId } : {});
      setHistory(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load stock history');
    }
  }

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly]);

  useEffect(() => {
    loadHistory();
  }, [selectedProductId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!selectedProductId) {
      setError('Select a product first');
      return;
    }

    try {
      await updateStock(selectedProductId, {
        quantity: Number(quantity),
        operation,
        reason
      });
      await Promise.all([loadInventory(), loadHistory()]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Stock update failed');
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <div className="row-between">
          <h1>Inventory Management</h1>
          <label className="check-row">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                  <th>Alert</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} onClick={() => setSelectedProductId(item.productId)}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.stock}</td>
                    <td>{item.lowStockThreshold}</td>
                    <td>{item.lowStock ? 'Low' : 'OK'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Update Stock</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
            <option value="">Select product</option>
            {items.map((item) => (
              <option key={item.productId} value={item.productId}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="set">Set</option>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button type="submit">Apply</button>
        </form>

        <h2>Stock History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Product</th>
                <th>Op</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row._id}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{row.productId?.name || '-'}</td>
                  <td>{row.operation}</td>
                  <td>{row.previousStock}</td>
                  <td>{row.newStock}</td>
                  <td>{row.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
