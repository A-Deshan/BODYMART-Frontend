import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStoreProducts } from '../services/storeApi.js';
import { formatCurrency } from '../utils/currency.js';

const fallbackImages = [
  'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=900&q=80'
];

function formatCategoryName(category) {
  return String(category || 'products')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function productCategoryLabel(category) {
  return formatCategoryName(category).toUpperCase();
}

export default function ShopPage({ onAddToCart, cartCount = 0 }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchStoreProducts({ limit: 48 });
        setProducts(data);
      } catch {
        setError('We could not load the shop right now.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((item) => String(item.category || '').toLowerCase()).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const categoryOk = category === 'all' || String(item.category || '').toLowerCase() === category;
      const queryOk =
        !q ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q);
      return categoryOk && queryOk;
    });
  }, [products, query, category]);

  const hasActiveFilters = query.trim() !== '' || category !== 'all';
  const activeCategoryLabel = category === 'all' ? 'All Categories' : formatCategoryName(category);
  const resultsSummary = loading
    ? 'Loading the latest products from the live store.'
    : hasActiveFilters
      ? `Showing ${activeCategoryLabel.toLowerCase()}${query.trim() ? ` that match "${query.trim()}"` : ''}.`
      : 'Showing everything currently available in the live catalog.';

  function clearFilters() {
    setQuery('');
    setCategory('all');
  }

  return (
    <main className="main simple-page-main">
        <section className="inner shop-control-card" aria-label="Shop filters">
          <div className="shop-control-head">
            <div>
              <p className="eyebrow">Browse The Catalog</p>
              <h3>Search and filter the store in one place.</h3>
            </div>
            <Link to="/cart" className="ghost-btn shop-cart-button">
              Review Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
          </div>

          <div className="shop-filter-layout">
            <label className="shop-input-group">
              <span>Search</span>
              <input
                type="text"
                placeholder="Search by product name or keyword"
                aria-label="Search products"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <label className="shop-input-group shop-input-group-select">
              <span>Category</span>
              <select
                value={category}
                aria-label="Filter by category"
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'All Categories' : formatCategoryName(item)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="shop-category-pills">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`shop-category-pill${item === category ? ' active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item === 'all' ? 'All' : formatCategoryName(item)}
              </button>
            ))}

            {hasActiveFilters && (
              <button type="button" className="link-btn shop-clear-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="inner shop-results-bar">
          <div>
            <p className="eyebrow">Results</p>
            <h3>{loading ? 'Loading products...' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}</h3>
            <p>{error ? 'The store could not be loaded right now.' : resultsSummary}</p>
          </div>

          <div className="shop-results-actions">
            {category !== 'all' && <span className="simple-tag">Category: {activeCategoryLabel}</span>}
            {query.trim() && <span className="simple-tag">Search: {query.trim()}</span>}
          </div>
        </section>

        <section className="inner shop-grid">
          {error ? (
            <article className="shop-feedback-card">
              <h4>We could not load the shop right now.</h4>
              <p>Please try again in a moment to see the latest products.</p>
            </article>
          ) : loading ? (
            <article className="shop-feedback-card">
              <h4>Loading products</h4>
              <p>The live catalog is being prepared now.</p>
            </article>
          ) : filtered.length === 0 ? (
            <article className="shop-feedback-card">
              <h4>No products match your search</h4>
              <p>Try a different keyword or clear the current filters to keep browsing the store.</p>
              {hasActiveFilters && (
                <button type="button" className="primary small" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </article>
          ) : (
            filtered.map((item, index) => (
              <article key={item._id || `${item.name}-${index}`} className="shop-product-card">
                <img src={item.imageUrl || fallbackImages[index % fallbackImages.length]} alt={item.name} />
                <div className="shop-product-body">
                  <p className="category">{productCategoryLabel(item.category)}</p>
                  <h4>{item.name}</h4>
                  <p className="shop-product-description">
                    {item.description || 'High-quality performance gear for your training routine.'}
                  </p>
                  <div className="shop-product-foot">
                    <strong>{formatCurrency(item.price)}</strong>
                    <button type="button" className="primary small" onClick={() => onAddToCart(item)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
  );
}
