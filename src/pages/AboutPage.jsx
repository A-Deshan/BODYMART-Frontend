import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStoreHighlights } from '../services/storeApi.js';

const aboutPoints = [
  {
    title: 'Designed around real actions',
    description: 'The website focuses on shopping, memberships, and workout support instead of trying to be a crowded all-in-one landing page.'
  },
  {
    title: 'Shared with the admin side',
    description: 'Orders, memberships, and requests flow into the dashboard so the team can respond from the same system users interact with.'
  },
  {
    title: 'Simple by intention',
    description: 'We keep the interface calm, direct, and easy to scan so users can move forward without extra friction.'
  }
];

const summaryNotes = [
  'Live product and membership data',
  'Clear paths for shopping, joining, and support',
  'Admin visibility after each important action'
];

export default function AboutPage() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadHighlights() {
      try {
        const data = await fetchStoreHighlights();
        if (active) {
          setHighlights(data);
        }
      } catch {
        if (active) {
          setHighlights([]);
        }
      }
    }

    loadHighlights();

    return () => {
      active = false;
    };
  }, []);

  const topHighlights = highlights.slice(0, 3);

  return (
    <>
      <section className="simple-page-hero simple-page-hero-about">
        <div className="inner simple-page-hero-grid">
          <div className="simple-page-copy">
            <p className="eyebrow">About BodyMart</p>
            <h2>A connected gym website built to stay simple.</h2>
            <p className="simple-page-text">
              BodyMart brings together fitness retail, memberships, and support in one structured experience. The goal
              is not to add more screens, but to make each screen clearer and more useful.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="primary nav-primary-link">Browse Shop</Link>
              <Link to="/membership" className="link-btn">See Memberships</Link>
            </div>

            <div className="simple-tag-row">
              <span className="simple-tag">Minimal layout</span>
              <span className="simple-tag">Connected flows</span>
              <span className="simple-tag">Live data</span>
            </div>
          </div>

          <aside className="simple-page-panel">
            <p className="eyebrow">What Matters</p>
            <h3>A small set of focused journeys backed by one shared system.</h3>
            <ul className="simple-note-list">
              {summaryNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <main className="main simple-page-main">
        <section className="inner simple-section">
          <div className="section-head simple-section-head">
            <div>
              <p className="eyebrow">How We Approach It</p>
              <h3>The experience stays small on the surface and connected underneath.</h3>
            </div>
            <p>
              Users see a clean storefront and direct actions, while the underlying system keeps products, memberships,
              and follow-up connected to the admin dashboard.
            </p>
          </div>

          <div className="simple-card-grid">
            {aboutPoints.map((item) => (
              <article key={item.title} className="simple-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="inner simple-story-grid">
          <article className="simple-story-card">
            <p className="eyebrow">Why BodyMart Feels Different</p>
            <h3>We removed the extra noise and kept the journeys people actually need.</h3>
            <p>
              Product browsing comes from live inventory, memberships move through a dedicated login and payment flow,
              and workout-plan requests are handled through guided forms. Each part has a purpose, and each one connects
              back to the team managing the gym.
            </p>
            <p>
              That gives users a more reliable experience and gives the admin side a clearer view of what is happening
              on the website.
            </p>
          </article>

          <article className="simple-story-card">
            <p className="eyebrow">Live Store Signals</p>
            <h3>A quick view of what the storefront is moving right now.</h3>

            {topHighlights.length > 0 ? (
              <div className="simple-signal-list">
                {topHighlights.map((item) => (
                  <div key={item._id || item.productName} className="simple-signal-item">
                    <strong>{item.productName}</strong>
                    <span>{item.quantitySold} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="simple-empty-note">
                Sales highlights will appear here automatically once paid orders are recorded through the website.
              </p>
            )}
          </article>
        </section>

        <section className="inner simple-cta">
          <div>
            <p className="eyebrow">Explore The Experience</p>
            <h3>Move from the story into the actual shop and membership journeys.</h3>
            <p>
              The About page now stays brief and useful, then points directly to the parts of the site that matter most.
            </p>
          </div>
          <div className="simple-cta-actions">
            <Link to="/shop" className="primary nav-primary-link">Open Shop</Link>
            <Link to="/membership" className="secondary nav-secondary-link">Memberships</Link>
          </div>
        </section>
      </main>
    </>
  );
}
