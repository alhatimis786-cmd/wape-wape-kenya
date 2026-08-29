// Loads the live catalog from Supabase (real vendor + house deals) instead of
// a static file. Populates window.PRODUCTS and window.DAILY_DEALS in the same
// shape the rest of the site already expects, so app.js/deal.html/checkout.html
// don't need to change how they read that data.
//
// Business rule: only the deal that's currently within its 24-hour "Deal of
// the Day" window (tracked by featured_at) ever carries a discount. A
// scheduled database job automatically reverts the price back to normal the
// moment that window closes, even if nobody is on the site to see it happen.

window.PRODUCTS = [];
window.DAILY_DEALS = { today: null, featuredAt: null };

window.catalogReady = (async function loadCatalog() {
  const { data, error } = await sb
    .from("deals")
    .select("id, seller_id, title, description, category, deal_type, price, original_price, image_url, image_urls, status, hot, in_stock, stock_count, highlights, featured_at, submitted_at")
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

  const nowMs = Date.now();
  let todayId = null;
  let featuredAt = null;

  window.PRODUCTS = (data || []).map((d) => {
    const isCurrentlyFeatured = !!d.featured_at && (nowMs - new Date(d.featured_at).getTime()) < 24 * 60 * 60 * 1000;
    if (isCurrentlyFeatured) { todayId = d.id; featuredAt = d.featured_at; }
    const gallery = Array.isArray(d.image_urls) && d.image_urls.length ? d.image_urls : (d.image_url ? [d.image_url] : []);
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
      images: gallery,
      dealType: d.deal_type || "regular",
      sellerId: d.seller_id,
      sellerName: sellerMap[d.seller_id] || null
    };
  });

  window.DAILY_DEALS = { today: todayId, featuredAt };
})();
