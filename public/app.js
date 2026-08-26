const state = {
  category: "All",
  search: "",
  sort: "featured"
};

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
        <a href="/deal.html?id=${p.id}" class="card-img">
          ${cardBadges(p)}
          <img src="${imgSrc(p)}" alt="${p.name}" loading="lazy"
               onerror="this.onerror=null;this.src='${placeholderFor(p)}'">
        </a>
        <div class="card-body">
          <span class="card-cat">${p.category}</span>
          <a href="/deal.html?id=${p.id}" class="card-name">${p.name}</a>
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

  const todayP = window.PRODUCTS.find((p) => p.id === deals.today);
  if (!todayP) return;

  const pct = discountPct(todayP);
  const highlightsHtml = (todayP.highlights || []).slice(0, 4).map((h) => `
    <li>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
      ${h}
    </li>`).join("");

  row.innerHTML = `
    <article class="dotd-card dotd-featured">
      <a href="/deal.html?id=${todayP.id}" class="dotd-img">
        <span class="dotd-tag">Today Only</span>
        <img src="${imgSrc(todayP)}" alt="${todayP.name}" loading="lazy" onerror="this.onerror=null;this.src='${placeholderFor(todayP)}'">
        <span class="dotd-verified-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
          WapeWape Verified
        </span>
      </a>
      <div class="dotd-body">
        <span class="card-cat">${todayP.category}</span>
        <a href="/deal.html?id=${todayP.id}" class="dotd-name">${todayP.name}</a>
        ${highlightsHtml ? `<ul class="dotd-highlights">${highlightsHtml}</ul>` : ""}
        <div class="dotd-featured-actions">
          <a href="/deal.html?id=${todayP.id}" class="btn btn-primary">View Deal</a>
          <button class="btn btn-ghost" id="dotdAddToCart">Add to Cart</button>
        </div>
      </div>
      <div class="dotd-pricing">
        ${todayP.originalPrice ? `
        <div>
          <span class="dotd-price-label">Typical Market Price</span>
          <span class="dotd-market-price">${money(todayP.originalPrice)}</span>
        </div>` : ""}
        <div>
          <span class="dotd-price-label">WapeWape Price</span>
          <span class="dotd-deal-price">${money(todayP.price)}</span>
        </div>
        ${pct > 0 ? `<span class="dotd-savings">You Save ${money(todayP.originalPrice - todayP.price)} (${pct}%)</span>` : ""}
        <div class="dotd-verify-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Price verified against current market pricing.
        </div>
      </div>
    </article>`;

  document.getElementById("dotdAddToCart").addEventListener("click", () => addToCart(todayP.id));
  startDotdCountdown();
}

function startDotdCountdown() {
  const el = document.getElementById("dotdCountdown");
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
  };
  tick();
  setInterval(tick, 1000);
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
  const entries = Object.entries(cartState.cart).filter(([, qty]) => qty > 0);

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
        renderCart();
      });
    });
  }

  document.getElementById("cartTotal").textContent = money(cartTotal());
  updateBadges();
}

function updateBadges() {
  const count = cartCount();
  document.getElementById("navCartCount").textContent = count;
  document.getElementById("cartFabBadge").textContent = count;
  document.getElementById("cartFab").classList.toggle("visible", count > 0);
}

// ---------- Cart drawer controls ----------

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("visible");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("visible");
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
  document.getElementById("cartFab").addEventListener("click", openCart);
  document.getElementById("closeCart").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);

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
