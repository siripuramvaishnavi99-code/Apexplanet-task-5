/* ================================================
   ApexStore — main.js  (shared utilities & init)
   ================================================ */
'use strict';

/* ── Toast System ──────────────────────────────── */
const Toast = (() => {
  let container;
  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }
  function show(message, type = 'info', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <span>${message}</span>
      <button class="toast-close" aria-label="Close">×</button>`;
    const c = getContainer();
    c.appendChild(toast);
    const close = () => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration);
  }
  return { success: m => show(m, 'success'), error: m => show(m, 'error'), info: m => show(m, 'info') };
})();

/* ── API Helper ────────────────────────────────── */
async function api(method, path, body) {
  const opts = { method, credentials: 'same-origin', headers: {} };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const res = await fetch(`/api${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || 'Something went wrong');
  return data;
}
window.api = api;

/* ── Navbar ────────────────────────────────────── */
function initNavbar() {
  const hamburger = document.querySelector('.hamburger');
  const navList = document.querySelector('.navbar-nav');
  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      hamburger.querySelectorAll('span').forEach((s, i) => {
        if (open) {
          if (i === 0) s.style.transform = 'translateY(7px) rotate(45deg)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'translateY(-7px) rotate(-45deg)';
        } else { s.style.transform = ''; s.style.opacity = ''; }
      });
    });
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // Dropdowns
  document.querySelectorAll('.dropdown').forEach(dd => {
    const trigger = dd.querySelector('[data-toggle="dropdown"]');
    const menu = dd.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.dropdown-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
      menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));
  });

  // Active nav link
  const path = location.pathname;
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href === '/' ? path === '/' : path.startsWith(href)) a.classList.add('active');
  });
}

/* ── Auth State ────────────────────────────────── */
async function initAuthState() {
  const guestEls = document.querySelectorAll('[data-auth="guest"]');
  const userEls = document.querySelectorAll('[data-auth="user"]');
  const adminEls = document.querySelectorAll('[data-auth="admin"]');
  const nameEls = document.querySelectorAll('[data-user-name]');
  const avatarEls = document.querySelectorAll('[data-user-avatar]');

  function setGuest() {
    guestEls.forEach(el => el.classList.remove('hidden'));
    userEls.forEach(el => el.classList.add('hidden'));
    adminEls.forEach(el => el.classList.add('hidden'));
  }
  function setUser(u) {
    guestEls.forEach(el => el.classList.add('hidden'));
    userEls.forEach(el => el.classList.remove('hidden'));
    if (u.role === 'admin') adminEls.forEach(el => el.classList.remove('hidden'));
    nameEls.forEach(el => el.textContent = u.name);
    avatarEls.forEach(el => el.textContent = u.avatar || u.name[0].toUpperCase());
  }

  try {
    const { user } = await api('GET', '/auth/me');
    window._currentUser = user;
    setUser(user);
  } catch { setGuest(); window._currentUser = null; }

  // Logout
  document.querySelectorAll('[data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try { await api('POST', '/auth/logout'); } catch {}
      window._currentUser = null;
      window.CartStore.clear();
      location.href = '/';
    });
  });
}

/* ── Cart Badge ────────────────────────────────── */
function updateCartBadge() {
  const items = window.CartStore.getItems();
  const count = items.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.classList.toggle('hidden', count === 0);
  });
}
window.updateCartBadge = updateCartBadge;

/* ── Lazy Images ───────────────────────────────── */
function initLazyImages() {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
  } else {
    document.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; });
  }
}

/* ── Modal ─────────────────────────────────────── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.querySelector('.modal')?.focus();
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
window.openModal = openModal;
window.closeModal = closeModal;

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
  if (e.target.closest('.modal-close')) {
    const overlay = e.target.closest('.modal-overlay');
    if (overlay) closeModal(overlay.id);
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
});

/* ── Stars renderer ────────────────────────────── */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '★';
    else if (i === full && half) html += '½';
    else html += '☆';
  }
  return html;
}
window.renderStars = renderStars;

/* ── Currency formatter ────────────────────────── */
function fmt(n) { return '$' + Number(n).toFixed(2); }
window.fmt = fmt;

/* ── Discount % ────────────────────────────────── */
function discountPct(original, current) {
  return original > current ? Math.round(((original - current) / original) * 100) : 0;
}
window.discountPct = discountPct;

/* ── Featured Products (homepage) ─────────────── */
async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-products');
  if (!grid) return;
  try {
    const { products } = await api('GET', '/products/featured');
    grid.innerHTML = products.map(renderProductCard).join('');
    initLazyImages();
    initAddToCart();
  } catch { grid.innerHTML = '<p class="text-muted text-center w-full" style="grid-column:1/-1">Failed to load products.</p>'; }
}

/* ── Product Card HTML ─────────────────────────── */
function renderProductCard(p) {
  const pct = discountPct(p.originalPrice, p.price);
  const badgeClass = p.badge === 'New' ? 'new' : p.badge === 'Sale' ? 'sale' : p.badge === 'Top Rated' ? 'top' : '';
  return `
  <article class="product-card fade-in" data-id="${p.id}">
    <a href="/product/${p.id}" class="product-img" aria-label="${p.name}">
      <img data-src="${p.image}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="${p.name}" loading="lazy">
      ${p.badge ? `<span class="product-badge ${badgeClass}">${p.badge}</span>` : ''}
    </a>
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating" aria-label="Rating: ${p.rating} out of 5">
        <span class="stars" aria-hidden="true">${renderStars(p.rating)}</span>
        <span>${p.rating} (${p.reviews})</span>
      </div>
      <div class="product-price">
        <span class="price-current">${fmt(p.price)}</span>
        ${p.originalPrice > p.price ? `<span class="price-original">${fmt(p.originalPrice)}</span><span class="price-discount">-${pct}%</span>` : ''}
      </div>
      <button class="btn btn-primary btn-add-cart" data-product='${JSON.stringify({ id: p.id, name: p.name, price: p.price, image: p.image, category: p.category })}' aria-label="Add ${p.name} to cart">
        Add to Cart
      </button>
    </div>
  </article>`;
}
window.renderProductCard = renderProductCard;

/* ── Add to Cart Buttons ───────────────────────── */
function initAddToCart() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.removeEventListener('click', handleAddToCart);
    btn.addEventListener('click', handleAddToCart);
  });
}
function handleAddToCart(e) {
  e.preventDefault();
  const product = JSON.parse(e.currentTarget.dataset.product);
  window.CartStore.addItem(product);
  Toast.success(`"${product.name}" added to cart!`);
  updateCartBadge();
}
window.initAddToCart = initAddToCart;

/* ── Init ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAuthState();
  updateCartBadge();
  loadFeaturedProducts();
  initLazyImages();
});
