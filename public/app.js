// ⚠ PLACEHOLDER — replace with the real business WhatsApp number before going live.
const WHATSAPP_NUMBER = "254700000000";

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: JSON.parse(localStorage.getItem("wwk_cart") || "{}") // { productId: qty }
};

const money = (n) => "KES " + n.toLocaleString("en-KE");

function saveCart() {
  localStorage.setItem("wwk_cart", JSON.stringify(state.cart));
}

function cartCount() {
  return Object.values(state.cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(state.cart).reduce((sum, [id, qty]) => {
    const p = window.PRODUCTS.find((p) => p.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function imgSrc(product) {
  return `/images/${product.image}`;
}

function placeholderFor(product) {
  const label = encodeURIComponent(product.name);
  return `https://placehold.co/400x400/ECECF0/FF5A1F?text=${label}`;
}

function discountPct(p) {
  if (!p.originalPrice || p.originalPrice <= p.price) return 0;
  return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
}

// ---------- Likes (personal, saved locally) & Ask-about (opens WhatsApp) ----------

function isLiked(id) {
  const liked = JSON.parse(localStorage.getItem("wwk_liked") || "{}");
  return !!liked[id];
}

function toggleLike(id, btn) {
  const liked = JSON.parse(localStorage.getItem("wwk_liked") || "{}");
  liked[id] = !liked[id];
  localStorage.setItem("wwk_liked", JSON.stringify(liked));
  btn.classList.toggle("liked", !!liked[id]);
  btn.setAttribute("aria-pressed", String(!!liked[id]));
}

function askAboutProduct(id) {
  const p = window.PRODUCTS.find((p) => p.id === id);
  if (!p) return;
  const msg = encodeURIComponent(`Hi, I have a question about ${p.name} (${money(p.price)}).`);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

const HEART_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6.7-4.35-9.33-8.2C1.02 10.28 1.6 6.9 4.36 5.3c2.3-1.33 5.02-.62 6.64 1.44C12.62 4.68 15.34 3.97 17.64 5.3c2.76 1.6 3.34 4.98 1.69 7.5C18.7 16.65 12 21 12 21z"/></svg>`;
const CHAT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

function cardActionsHTML(p) {
  const liked = isLiked(p.id);
  const outOfStock = p.inStock === false;
  return `
    <div class="card-actions">
      <button class="icon-btn like-btn${liked ? " liked" : ""}" data-id="${p.id}" aria-label="Save ${p.name}" aria-pressed="${liked}">${HEART_ICON}</button>
      <button class="icon-btn ask-btn" data-id="${p.id}" aria-label="Ask about ${p.name}">${CHAT_ICON}</button>
      <button class="add-btn" data-id="${p.id}" aria-label="Add ${p.name} to cart"${outOfStock ? " disabled" : ""}>+</button>
    </div>`;
}

function wireProductButtons(container) {
  container.querySelectorAll(".add-btn:not(:disabled)").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
  container.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleLike(btn.dataset.id, btn));
  });
  container.querySelectorAll(".ask-btn").forEach((btn) => {
    btn.addEventListener("click", () => askAboutProduct(btn.dataset.id));
  });
}

// ---------- Filtering / sorting ----------

function getVisibleProducts() {
  let items = state.category === "All"
    ? window.PRODUCTS
    : window.PRODUCTS.filter((p) => p.category === state.category);

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  items = [...items];
  switch (state.sort) {
    case "price-asc": items.sort((a, b) => a.price - b.price); break;
    case "price-desc": items.sort((a, b) => b.price - a.price); break;
    case "discount": items.sort((a, b) => discountPct(b) - discountPct(a)); break;
    case "newest": items.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); break;
    default: break; // featured = catalog order
  }
  return items;
}

// ---------- Rendering ----------

function renderNavCategories() {
  const cats = ["All", ...new Set(window.PRODUCTS.map((p) => p.category))];
  const el = document.getElementById("navCategories");
  el.innerHTML = cats
    .map((c) => `<a href="#shop" class="nav-cat-link${c === state.category ? " active" : ""}" data-cat="${c}">${c}</a>`)
    .join("");
  el.querySelectorAll(".nav-cat-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setCategory(link.dataset.cat);
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderTabs() {
  const cats = ["All", ...new Set(window.PRODUCTS.map((p) => p.category))];
  const el = document.getElementById("categoryTabs");
  el.innerHTML = cats
    .map((c) => `<button class="tab${c === state.category ? " active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  el.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });
}

function renderSidebar() {
  const cats = ["All", ...new Set(window.PRODUCTS.map((p) => p.category))];
  const el = document.getElementById("sidebarList");
  el.innerHTML = cats.map((c) => {
    const count = c === "All" ? window.PRODUCTS.length : window.PRODUCTS.filter((p) => p.category === c).length;
    return `<button class="sidebar-item${c === state.category ? " active" : ""}" data-cat="${c}"><span>${c}</span><span class="count">${count}</span></button>`;
  }).join("");
  el.querySelectorAll(".sidebar-item").forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });
}

function setCategory(cat) {
  state.category = cat;
  renderNavCategories();
  renderTabs();
  renderSidebar();
  renderGrid();
}

function cardBadges(p) {
  const pct = discountPct(p);
  let html = "";
  if (pct > 0) html += `<span class="badge badge-discount">-${pct}%</span>`;
  if (p.hot) html += `<span class="badge badge-hot">🔥 Hot</span>`;
  if (p.inStock === false) html += `<span class="badge badge-out">Out of stock</span>`;
  return html ? `<div class="card-badges">${html}</div>` : "";
}

function renderGrid() {
  const items = getVisibleProducts();
  const grid = document.getElementById("productGrid");
  const noResults = document.getElementById("noResults");
  const resultCount = document.getElementById("resultCount");

  resultCount.textContent = `${items.length} deal${items.length === 1 ? "" : "s"}${state.category !== "All" ? " in " + state.category : ""}${state.search ? ` matching "${state.search}"` : ""}`;

  if (items.length === 0) {
    grid.innerHTML = "";
    noResults.hidden = false;
  } else {
    noResults.hidden = true;
    grid.innerHTML = items.map((p) => {
      const outOfStock = p.inStock === false;
      return `
      <div class="card${outOfStock ? " out-of-stock" : ""}">
        <div class="card-img">
          ${cardBadges(p)}
          <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
        </div>
        <div class="card-body">
          <span class="card-cat">${p.category}</span>
          <span class="card-name">${p.name}</span>
          <div class="price-row">
            ${p.originalPrice ? `<span class="price-was">${money(p.originalPrice)}</span>` : ""}
            <span class="card-price">${money(p.price)}</span>
          </div>
          <span class="stock-note">${outOfStock ? "Restocking soon" : "In stock"}</span>
          ${cardActionsHTML(p)}
        </div>
      </div>`;
    }).join("");

    wireProductButtons(grid);
  }

  document.getElementById("statCount").textContent = window.PRODUCTS.length + "+";
}

function renderDealOfDay() {
  const deals = window.DAILY_DEALS;
  const row = document.getElementById("dotdRow");
  if (!row || !deals || !deals.today) return;

  const find = (id) => window.PRODUCTS.find((p) => p.id === id);
  const todayP = find(deals.today);
  const prevPs = (deals.previous || []).map(find).filter(Boolean);
  const nextP = find(deals.next);

  const cards = [];
  if (todayP) cards.push(dotdCardHTML(todayP, "Today", true));
  prevPs.forEach((p, i) => {
    cards.push(dotdCardHTML(p, i === 0 ? "Yesterday" : `${i + 1} days ago`, false));
  });
  if (nextP) cards.push(dotdLockedCardHTML(nextP));

  row.innerHTML = cards.join("");
  wireProductButtons(row);
}

function dotdCardHTML(p, tag, featured) {
  return `
    <article class="dotd-card${featured ? " dotd-featured" : ""}">
      <span class="dotd-tag">${tag}</span>
      <div class="dotd-img">
        <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
      </div>
      <div class="dotd-body">
        <span class="card-cat">${p.category}</span>
        <span class="dotd-name">${p.name}</span>
        <div class="price-row">
          ${p.originalPrice ? `<span class="price-was">${money(p.originalPrice)}</span>` : ""}
          <span class="card-price">${money(p.price)}</span>
        </div>
        ${cardActionsHTML(p)}
      </div>
    </article>`;
}

function dotdLockedCardHTML(p) {
  return `
    <article class="dotd-card dotd-locked">
      <span class="dotd-tag">Tomorrow</span>
      <div class="dotd-img">
        <img src="${imgSrc(p)}" alt="Mystery deal" loading="lazy" onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
        <div class="dotd-lock-overlay"><span class="lock-q">?</span></div>
      </div>
      <div class="dotd-body">
        <span class="dotd-name">Tomorrow's deal</span>
        <span class="stock-note">Revealed at midnight</span>
      </div>
    </article>`;
}

function renderTrending() {
  const hot = window.PRODUCTS.filter((p) => p.hot);
  const section = document.getElementById("trendingSection");
  const row = document.getElementById("trendingRow");
  if (hot.length === 0) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  row.innerHTML = hot.map((p) => `
    <a class="trending-card" href="#shop" data-id="${p.id}">
      <div class="t-img">
        <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
      </div>
      <div class="t-body">
        <span class="t-name">${p.name}</span>
        <span class="t-price">${money(p.price)}</span>
      </div>
    </a>
  `).join("");
}

function renderCart() {
  const el = document.getElementById("cartItems");
  const entries = Object.entries(state.cart).filter(([, qty]) => qty > 0);

  if (entries.length === 0) {
    el.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
  } else {
    el.innerHTML = entries.map(([id, qty]) => {
      const p = window.PRODUCTS.find((p) => p.id === id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img src="${imgSrc(p)}" alt="${p.name}" onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
          <div class="cart-item-info">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${money(p.price)}</div>
          </div>
          <div class="qty-controls">
            <button data-id="${id}" data-action="dec">−</button>
            <span>${qty}</span>
            <button data-id="${id}" data-action="inc">+</button>
          </div>
        </div>`;
    }).join("");

    el.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (btn.dataset.action === "inc") addToCart(id);
        else removeOneFromCart(id);
      });
    });
  }

  document.getElementById("cartTotal").textContent = money(cartTotal());
  updateBadges();
}

function updateBadges() {
  const count = cartCount();
  document.getElementById("navCartCount").textContent = count;
  document.getElementById("stickyCount").textContent = `${count} item(s)`;
  document.getElementById("stickyTotal").textContent = money(cartTotal());
  document.getElementById("stickyBar").classList.toggle("visible", count > 0);
}

// ---------- Cart actions ----------

function addToCart(id) {
  const p = window.PRODUCTS.find((p) => p.id === id);
  if (!p || p.inStock === false) return;
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
}

function removeOneFromCart(id) {
  if (!state.cart[id]) return;
  state.cart[id] -= 1;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  renderCart();
}

// ---------- Drawer / modal controls ----------

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("visible");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("visible");
}
function openCheckout() {
  closeCart();
  document.getElementById("checkoutModal").classList.add("open");
  document.getElementById("checkoutOverlay").classList.add("visible");
}
function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("open");
  document.getElementById("checkoutOverlay").classList.remove("visible");
}

// ---------- WhatsApp order ----------

function buildOrderMessage(name, phone, address, payMethod) {
  const lines = [`Hi Wape Wape Kenya, I'd like to order:`, ``];
  Object.entries(state.cart).forEach(([id, qty]) => {
    const p = window.PRODUCTS.find((p) => p.id === id);
    if (p && qty > 0) lines.push(`• ${p.name} x${qty} — ${money(p.price * qty)}`);
  });
  lines.push(``, `Total: ${money(cartTotal())}`, ``);
  lines.push(`Name: ${name}`, `Phone: ${phone}`, `Delivery: ${address}`, `Payment: ${payMethod}`);
  return lines.join("\n");
}

function sendOrderToWhatsApp(e) {
  e.preventDefault();
  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const payMethod = document.querySelector('input[name="payMethod"]:checked').value;

  if (cartCount() === 0) {
    alert("Your cart is empty — add something first.");
    return;
  }

  const msg = encodeURIComponent(buildOrderMessage(name, phone, address, payMethod));
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

// ---------- Init ----------

let searchDebounce;

document.addEventListener("DOMContentLoaded", () => {
  renderDealOfDay();
  renderTrending();
  renderNavCategories();
  renderTabs();
  renderSidebar();
  renderGrid();
  renderCart();

  document.getElementById("navCartBtn").addEventListener("click", openCart);
  document.getElementById("stickyViewCart").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("goToCheckout").addEventListener("click", openCheckout);
  document.getElementById("closeCheckout").addEventListener("click", closeCheckout);
  document.getElementById("checkoutOverlay").addEventListener("click", closeCheckout);
  document.getElementById("checkoutForm").addEventListener("submit", sendOrderToWhatsApp);

  document.getElementById("navSearchInput").addEventListener("input", (e) => {
    clearTimeout(searchDebounce);
    const value = e.target.value;
    searchDebounce = setTimeout(() => {
      state.search = value;
      renderGrid();
    }, 150);
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;
  document.getElementById("footerWhatsApp").href = waLink;
  document.getElementById("navWhatsApp").href = waLink;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
});
