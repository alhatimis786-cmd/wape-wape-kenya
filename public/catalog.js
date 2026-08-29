// Loads the live catalog from Supabase (real vendor + house deals) instead of
// a static file. Populates window.PRODUCTS and window.DAILY_DEALS in the same
// shape the rest of the site already expects, so app.js/deal.html/checkout.html
// don't need to change how they read that data.
//
// Business rule: only the deal with featured_date = today ever carries a
// discount (original_price). Everything else sells at its plain price.

window.PRODUCTS = [];
window.DAILY_DEALS = { today: null };

window.catalogReady = (async function loadCatalog() {
  const { data, error } = await sb
    .from("deals")
    .select("*")
    .eq("status", "live")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Failed to load catalog:", error.message);
    return;
  }

  // Seller names come from the public_sellers view (name + category only —
  // phone/contact stay private), fetched separately and merged in below.
  const sellerIds = [...new Set((data || []).map((d) => d.seller_id).filter(Boolean))];
  let sellerMap = {};
  if (sellerIds.length) {
    const { data: sellers } = await sb.from("public_sellers").select("id, business_name").in("id", sellerIds);
    (sellers || []).forEach((s) => { sellerMap[s.id] = s.business_name; });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  let todayId = null;

  window.PRODUCTS = (data || []).map((d) => {
    if (d.featured_date === todayStr) todayId = d.id;
    return {
      id: d.id,
      name: d.title,
      category: d.category,
      price: Number(d.price),
      originalPrice: d.original_price ? Number(d.original_price) : null,
      hot: !!d.hot,
      inStock: d.in_stock !== false,
      stockCount: d.stock_count,
      highlights: Array.isArray(d.highlights) ? d.highlights : [],
      dateAdded: d.submitted_at,
      image: d.image_url,
      sellerId: d.seller_id,
      sellerName: sellerMap[d.seller_id] || null
    };
  });

  window.DAILY_DEALS = { today: todayId };
})();
