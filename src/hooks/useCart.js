import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { createStoreOrder } from '../services/storeApi.js';

const CART_STORAGE_KEY = 'bodymart-cart';

function readStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          item.productId &&
          item.name &&
          Number(item.quantity) > 0 &&
          Number(item.unitPrice) >= 0
      )
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }));
  } catch {
    return [];
  }
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => readStoredCart());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart]
  );
  const deliveryFee = useMemo(() => (cart.length === 0 || subtotal >= 100 ? 0 : 5.99), [cart.length, subtotal]);
  const totalAmount = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(product) {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === product._id);
      if (idx === -1) {
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            quantity: 1,
            unitPrice: Number(product.price)
          }
        ];
      }

      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      return next;
    });
    setMessage(`${product.name} added to your cart.`);
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Math.max(0, Number(quantity) || 0);

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  async function placeOrder(payload = {}) {
    if (cart.length === 0) {
      setMessage('Your cart is empty. Add products first.');
      return false;
    }

    if (!isAuthenticated) {
      setMessage('Log in to your website account before confirming an order.');
      return false;
    }

    setIsSubmitting(true);

    try {
      const order = await createStoreOrder({ items: cart, ...payload });
      setCart([]);
      setMessage(
        order.paymentStatus === 'paid'
          ? `Order ${order.orderNumber} placed and payment recorded successfully.`
          : `Order ${order.orderNumber} placed successfully.`
      );
      return order;
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setMessage('Log in to your website account before confirming an order.');
        return null;
      }

      setMessage(err?.response?.data?.message || 'We could not place your order. Please try again.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearMessage() {
    setMessage('');
  }

  return {
    cart,
    cartCount,
    subtotal,
    deliveryFee,
    totalAmount,
    message,
    isSubmitting,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    clearMessage
  };
}
