import { useEffect, useMemo, useRef, useState } from 'react';
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/productsApi.js';
import { formatCurrency } from '../utils/currency.js';

const initialForm = {
  name: '',
  category: '',
  description: '',
  imageUrl: '',
  price: '',
  stock: '0',
  lowStockThreshold: '5',
  isVisible: true
};

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

function isDataUrl(value) {
  return String(value || '').startsWith('data:image/');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);
  const [imageUrlField, setImageUrlField] = useState('');
  const [imageLabel, setImageLabel] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, query]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const items = await fetchProducts();
      setProducts(items);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function selectForEdit(item) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      price: String(item.price),
      stock: String(item.stock),
      lowStockThreshold: String(item.lowStockThreshold),
      isVisible: item.isVisible
    });
    setImageUrlField(isDataUrl(item.imageUrl) ? '' : item.imageUrl || '');
    setImageLabel(item.imageUrl ? 'Current product image ready' : '');
    setDragActive(false);
    dragDepthRef.current = 0;
  }

  function resetForm() {
    setEditingId('');
    setForm(initialForm);
    setImageUrlField('');
    setImageLabel('');
    setDragActive(false);
    dragDepthRef.current = 0;
  }

  async function applyImageFile(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('Please use an image smaller than 3 MB.');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setImageUrlField('');
      setImageLabel(file.name);
      setError('');
    } catch {
      setError('Failed to process the image. Please try another file.');
    }
  }

  function handleImageUrlChange(event) {
    const value = event.target.value;
    setImageUrlField(value);
    setImageLabel(value ? 'Image link ready' : '');
    setForm((prev) => ({ ...prev, imageUrl: value }));
    if (value) {
      setError('');
    }
  }

  async function handleImageInputChange(event) {
    const file = event.target.files?.[0];
    await applyImageFile(file);
    event.target.value = '';
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    setDragActive(true);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setDragActive(false);
    }
  }

  async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    await applyImageFile(file);
  }

  function clearImage() {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setImageUrlField('');
    setImageLabel('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold)
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save product');
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteProduct(id);
      if (editingId === id) resetForm();
      await loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete product');
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel">
        <h1>Product Management</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            required
          />
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Low stock threshold"
            value={form.lowStockThreshold}
            onChange={(e) => setForm((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
            required
          />
          <div className="image-field">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageInputChange}
            />
            <div
              className={`image-dropzone${dragActive ? ' active' : ''}${form.imageUrl ? ' has-image' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Product preview"
                  className="image-preview"
                />
              ) : (
                <div className="image-placeholder">
                  <strong>Drag and drop a product image here</strong>
                  <p>PNG, JPG, or WEBP up to 3 MB.</p>
                </div>
              )}

              <div className="image-field-copy">
                <strong>{form.imageUrl ? 'Image ready for this product' : 'Add a product image'}</strong>
                <p>{imageLabel || 'Drop an image here or upload one from your device.'}</p>
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload image
                </button>
                {form.imageUrl && (
                  <button type="button" className="ghost-btn" onClick={clearImage}>
                    Remove image
                  </button>
                )}
              </div>
            </div>

            <input
              type="url"
              placeholder="Or paste an image URL"
              value={imageUrlField}
              onChange={handleImageUrlChange}
            />
          </div>
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => setForm((prev) => ({ ...prev, isVisible: e.target.checked }))}
            />
            Visible on website
          </label>
          <div className="row-actions">
            <button type="submit">{editingId ? 'Update product' : 'Create product'}</button>
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
          <h2>Products</h2>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>{p.isVisible ? 'Visible' : 'Hidden'}</td>
                    <td className="action-cell">
                      <button type="button" className="ghost-btn" onClick={() => selectForEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(p._id)}>
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
