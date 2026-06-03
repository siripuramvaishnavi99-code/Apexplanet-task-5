/* ================================================
   ApexStore — cart.js  (CartStore + Cart page UI)
   ================================================ */
'use strict';

/* ── CartStore (localStorage) ─────────────────── */
const CartStore = (() => {
  const KEY = 'apexstore_cart';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }

  return {
    getItems() { return load(); },
    addItem(product, qty = 1) {
      const items = load();
      const idx = items.findIndex(i => i.id === product.id);
      if (idx > -1) items[idx].qty += qty;
      else items.push({ ...product, qty });
      save(items);
    },
    removeItem(id) { save(load().filter(i => i.id !== id)); },
    updateQty(id, qty) {
      if (qty < 1) { this.removeItem(id); return; }
      const items = load();
      const idx = items.findIndex(i => i.id === id);
      if (idx > -1) { items[idx].qty = qty; save(items); }
    },
    getTotal() { return load().reduce((s, i) => s + i.price * i.qty, 0); },
    getCount() { return load().reduce((s, i) => s + i.qty, 0); },
    clear() { localStorage.removeItem(KEY); }
  };
})();
window.CartStore = CartStore;

/* ── Cart Page UI ─────────────────────────────── */
function initCartPage() {
  const cartSection = document.getElementById('cart-section');
  if (!cartSection) return;

  function render() {
    const items = CartStore.getItems();
    const empty = document.getElementById('cart-empty');
    const table = document.getElementById('cart-table-wrap');
    const summarySection = document.getElementById('cart-summary-section');

    if (items.length === 0) {
      if (empty) empty.classList.remove('hidden');
      if (table) table.classList.add('hidden');
      if (summarySection) summarySection.classList.add('hidden');
      updateCartBadge();
      return;
    }
    if (empty) empty.classList.add('hidden');
    if (table) table.classList.remove('hidden');
    if (summarySection) summarySection.classList.remove('hidden');

    const tbody = document.getElementById('cart-tbody');
    if (tbody) {
      tbody.innerHTML = items.map(item => `
        <tr data-id="${item.id}">
          <td data-label="Product">
            <div class="cart-product">
              <img src="${item.image}" alt="${item.name}" class="cart-img">
              <div>
                <div class="cart-product-name">${item.name}</div>
                <div class="cart-product-cat">${item.category || ''}</div>
              </div>
            </div>
          </td>
          <td data-label="Price">${fmt(item.price)}</td>
          <td data-label="Quantity">
            <div class="qty-control">
              <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </td>
          <td data-label="Total">${fmt(item.price * item.qty)}</td>
          <td data-label="Remove">
            <button class="remove-btn btn-icon btn" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
          </td>
        </tr>`).join('');
    }

    // Summary
    const subtotal = CartStore.getTotal();
    const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
    const total = subtotal + shipping;
    document.getElementById('summary-subtotal') && (document.getElementById('summary-subtotal').textContent = fmt(subtotal));
    document.getElementById('summary-shipping') && (document.getElementById('summary-shipping').textContent = shipping === 0 ? 'FREE' : fmt(shipping));
    document.getElementById('summary-total') && (document.getElementById('summary-total').textContent = fmt(total));

    updateCartBadge();
    bindCartEvents();
  }

  function bindCartEvents() {
    document.querySelectorAll('.qty-minus').forEach(btn => {
      btn.onclick = () => { CartStore.updateQty(btn.dataset.id, CartStore.getItems().find(i => i.id === btn.dataset.id)?.qty - 1); render(); };
    });
    document.querySelectorAll('.qty-plus').forEach(btn => {
      btn.onclick = () => { CartStore.updateQty(btn.dataset.id, CartStore.getItems().find(i => i.id === btn.dataset.id)?.qty + 1); render(); };
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = () => { CartStore.removeItem(btn.dataset.id); render(); Toast.info('Item removed from cart.'); };
    });
  }

  // Checkout
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (!window._currentUser) {
        Toast.error('Please log in to place an order.');
        setTimeout(() => location.href = '/login', 1200);
        return;
      }
      const items = CartStore.getItems().map(i => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty }));
      if (!items.length) { Toast.error('Your cart is empty.'); return; }
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Placing order…';
      try {
        await api('POST', '/orders', { items });
        CartStore.clear();
        render();
        Toast.success('Order placed successfully! Check your dashboard.');
        setTimeout(() => location.href = '/dashboard', 2000);
      } catch (err) {
        Toast.error(err.message);
      } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Place Order';
      }
    });
  }

  // Clear cart
  const clearBtn = document.getElementById('clear-cart-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { CartStore.clear(); render(); Toast.info('Cart cleared.'); });
  }

  render();
}

document.addEventListener('DOMContentLoaded', initCartPage);
