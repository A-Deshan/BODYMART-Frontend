import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStoreProducts } from '../services/storeApi.js';
import { formatCurrency } from '../utils/currency.js';

const quickLinks = [
  {
    label: 'Shop',
    title: 'Browse supplements and equipment',
    description: 'Live pricing and inventory with a clean cart review before checkout.',
    cta: 'Open Shop',
    to: '/shop'
  },
  {
    label: 'Membership',
    title: 'Choose the right membership plan',
    description: 'Log in, select a plan, and continue through the payment flow without extra steps.',
    cta: 'View Memberships',
    to: '/membership'
  },
  {
    label: 'Workout Plan',
    title: 'Request guided training support',
    description: 'Share your goals and let the team follow up with a plan suited to your routine.',
    cta: 'Request A Plan',
    to: '/workout-plan'
  }
];

const valuePoints = [
  {
    title: 'One place for the essentials',
    description: 'Shopping, memberships, and coaching support live in one clear website experience.'
  },
  {
    title: 'Less clutter, clearer steps',
    description: 'Each journey has its own page, so users can move forward without scanning through crowded sections.'
  },
  {
    title: 'Connected to real operations',
    description: 'Orders, memberships, and requests flow into the admin dashboard so the team can follow through quickly.'
  }
];

const fallbackImages = [
  'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=900&q=80'
];

const fallbackShowcaseProducts = [
  {
    name: 'Performance Supplements',
    category: 'supplements',
    description: 'A simple preview of the live store selection available for active training routines.',
    imageUrl: fallbackImages[0]
  },
  {
    name: 'Strength Equipment',
    category: 'equipment',
    description: 'Browse practical equipment options without leaving the main storefront experience.',
    imageUrl: fallbackImages[1]
  },
  {
    name: 'Training Essentials',
    category: 'accessories',
    description: 'See the kind of everyday gear available in the shop before opening the full catalog.',
    imageUrl: fallbackImages[2]
  }
];

function productCategoryLabel(category) {
  return String(category || 'products').toUpperCase();
}

function hasPrice(value) {
  return value !== undefined && value !== null && value !== '';
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadFeaturedProducts() {
      try {
        const data = await fetchStoreProducts({ limit: 3 });
        if (active) {
          setFeaturedProducts(data.slice(0, 3));
        }
      } catch {
        if (active) {
          setFeaturedProducts([]);
        }
      }
    }

    loadFeaturedProducts();

    return () => {
      active = false;
    };
  }, []);

  const showcaseProducts = featuredProducts.length > 0 ? featuredProducts : fallbackShowcaseProducts;
  const hasLiveProducts = featuredProducts.length > 0;

  return (
    <>
      <section className="simple-page-hero simple-page-hero-home">
        <div className="inner simple-page-hero-grid">
          <div className="simple-page-copy">
            <p className="eyebrow">BodyMart</p>
            <h2>Fitness essentials, memberships, and support in one clear place.</h2>
            <p className="simple-page-text">
              Browse products, join through the membership flow, and request a workout plan without moving through a
              crowded homepage. The goal is simple: make the next step obvious.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="primary nav-primary-link">Explore The Shop</Link>
              <Link to="/membership" className="link-btn">View Memberships</Link>
            </div>

            <div className="simple-tag-row">
              <span className="simple-tag">Live products</span>
              <span className="simple-tag">Member access</span>
              <span className="simple-tag">Admin follow-up</span>
            </div>
          </div>

          <aside className="simple-page-panel">
            <p className="eyebrow">Start Here</p>
            <h3>Pick the part of BodyMart you need today.</h3>
            <div className="simple-link-list">
              {quickLinks.map((item) => (
                <Link key={item.title} to={item.to} className="simple-link-item">
                  <span className="simple-link-label">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="link-btn">{item.cta}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <main className="main simple-page-main">
        <section className="inner simple-section">
          <div className="section-head simple-section-head">
            <div>
              <p className="eyebrow">Why It Feels Easier</p>
              <h3>A simpler homepage that focuses on the actions people actually use.</h3>
            </div>
            <p>
              The homepage now highlights only the main journeys on the site, which makes it faster to understand and
              easier to navigate on the first visit.
            </p>
          </div>

          <div className="simple-card-grid">
            {valuePoints.map((item) => (
              <article key={item.title} className="simple-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="inner simple-showcase">
          <div className="simple-showcase-head">
            <div>
              <p className="eyebrow">Store Preview</p>
              <h3>See a few products before opening the full shop.</h3>
              <p>
                {hasLiveProducts
                  ? 'These products are pulled from the current store inventory.'
                  : 'This preview keeps the homepage useful even before live store data is available.'}
              </p>
            </div>
            <Link to="/shop" className="link-btn">See Full Shop</Link>
          </div>

          <div className="simple-product-grid">
            {showcaseProducts.map((item, index) => (
              <article key={`${item.name}-${index}`} className="simple-product-card">
                <img src={item.imageUrl || fallbackImages[index % fallbackImages.length]} alt={item.name} />
                <div className="simple-product-body">
                  <p className="category">{productCategoryLabel(item.category)}</p>
                  <h4>{item.name}</h4>
                  <p>{item.description || 'Quality gear and supplements selected for consistent gym routines.'}</p>
                  <div className="simple-product-foot">
                    <strong>{hasPrice(item.price) ? formatCurrency(item.price) : 'Live pricing in shop'}</strong>
                    <Link to="/shop" className="link-btn">View</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="inner simple-cta">
          <div>
            <p className="eyebrow">Need More Than Products?</p>
            <h3>Choose a membership or request a workout plan in a few clear steps.</h3>
            <p>
              The website stays minimal, but the connected flows are still there when you need them.
            </p>
          </div>
          <div className="simple-cta-actions">
            <Link to="/membership" className="primary nav-primary-link">Memberships</Link>
            <Link to="/workout-plan" className="secondary nav-secondary-link">Workout Plan</Link>
          </div>
        </section>
      </main>
    </>
  );
}
