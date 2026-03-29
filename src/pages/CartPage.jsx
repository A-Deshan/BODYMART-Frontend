import { Link, useLocation } from 'react-router-dom';
import { formatCurrency } from '../utils/currency.js';

export default function CartPage({
  cart,
  subtotal,
  deliveryFee,
  totalAmount,
  isAuthenticated,
  onUpdateQuantity,
  onRemoveItem
}) {
  const location = useLocation();
  const freeDeliveryGap = Math.max(0, 100 - subtotal);

  return (
    <main className="main">
      <section className="inner section-head">
        <div>
          <h3>Your Cart</h3>
          <p>Review your items, adjust quantities, and continue to payment when you are ready.</p>
        </div>
      </section>

      {cart.length === 0 ? (
        <section className="inner empty-state">
          <h4>Your cart is empty</h4>
          <p>Add products from the shop to see them here before continuing to payment.</p>
          <Link to="/shop" className="primary nav-primary-link">Continue Shopping</Link>
        </section>
      ) : (
        <section className="inner cart-layout">
          <div className="cart-card">
            <div className="cart-card-head">
              <h4>Items in your order</h4>
              <p>{cart.length} product{cart.length === 1 ? '' : 's'} selected</p>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <article key={item.productId} className="cart-item">
                  <div className="cart-item-copy">
                    <h5>{item.name}</h5>
                    <p>{formatCurrency(item.unitPrice)} each</p>
                    <button
                      type="button"
                      className="link-btn remove-link"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cart-item-actions">
                    <div className="qty-control" aria-label={`Quantity controls for ${item.name}`}>
                      <button
                        type="button"
                        className="qty-button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="summary-card">
            <h4>Order Summary</h4>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</strong>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <p className="summary-note">
              {freeDeliveryGap > 0
                ? `${formatCurrency(freeDeliveryGap)} away from free delivery.`
                : 'Free delivery unlocked for this order.'}
            </p>

            {isAuthenticated ? (
              <Link to="/cart/payment" className="primary nav-primary-link summary-action">
                Continue to Payment
              </Link>
            ) : (
              <>
                <p className="summary-note">Log in to your website account to confirm this order.</p>
                <Link to="/login" state={{ from: location }} className="primary nav-primary-link summary-action">
                  Log in to confirm
                </Link>
              </>
            )}
            <Link to="/shop" className="link-btn continue-link">Continue Shopping</Link>
          </aside>
        </section>
      )}
    </main>
  );
}
