// Placeholder catalog — replace with real stock and photos.
// image: filename only, expected at /images/<filename>. Falls back to a
// generated placeholder if the file isn't present yet.
//
// Fields:
//   price          — current selling price (KES)
//   originalPrice  — pre-discount price (KES). Omit/null if there's no discount.
//   hot            — true = shows a "Hot" badge and appears in the Trending strip
//   inStock        — false = shows "Out of stock" and disables Add to cart
//   dateAdded      — ISO date, used by the "Newest" sort
window.PRODUCTS = [
  { id: "p1", name: "Bluetooth Speaker 20W", category: "Electronics", price: 2200, originalPrice: 3200, hot: true, inStock: true, dateAdded: "2026-08-05", image: "speaker.jpg" },
  { id: "p2", name: "Wireless Earbuds Pro", category: "Electronics", price: 1800, originalPrice: 2600, hot: true, inStock: true, dateAdded: "2026-08-09", image: "earbuds.jpg" },
  { id: "p3", name: "Power Bank 20000mAh", category: "Electronics", price: 1500, originalPrice: 2100, hot: false, inStock: true, dateAdded: "2026-07-28", image: "powerbank.jpg" },
  { id: "p4", name: "LED Ring Light 10\"", category: "Electronics", price: 1600, originalPrice: null, hot: false, inStock: true, dateAdded: "2026-07-20", image: "ringlight.jpg" },

  { id: "p5", name: "Non-Stick Pan Set (3pc)", category: "Home & Kitchen", price: 2800, originalPrice: 3900, hot: true, inStock: true, dateAdded: "2026-08-08", image: "panset.jpg" },
  { id: "p6", name: "Electric Kettle 1.8L", category: "Home & Kitchen", price: 1900, originalPrice: 2400, hot: false, inStock: true, dateAdded: "2026-07-15", image: "kettle.jpg" },
  { id: "p7", name: "Storage Organizer Set", category: "Home & Kitchen", price: 1200, originalPrice: null, hot: false, inStock: false, dateAdded: "2026-07-10", image: "organizer.jpg" },
  { id: "p8", name: "LED Desk Lamp", category: "Home & Kitchen", price: 1400, originalPrice: 1900, hot: false, inStock: true, dateAdded: "2026-08-01", image: "desklamp.jpg" },

  { id: "p9", name: "Unisex Crossbody Bag", category: "Fashion", price: 1300, originalPrice: 1800, hot: false, inStock: true, dateAdded: "2026-07-25", image: "crossbody.jpg" },
  { id: "p10", name: "Analog Watch — Classic", category: "Fashion", price: 1700, originalPrice: null, hot: true, inStock: true, dateAdded: "2026-08-10", image: "watch.jpg" },
  { id: "p11", name: "Sunglasses UV400", category: "Fashion", price: 900, originalPrice: 1300, hot: false, inStock: true, dateAdded: "2026-07-18", image: "sunglasses.jpg" },

  { id: "p12", name: "Blender 2000W", category: "Appliances", price: 3200, originalPrice: 4500, hot: true, inStock: true, dateAdded: "2026-08-07", image: "blender.jpg" },
  { id: "p13", name: "Mini Fan Rechargeable", category: "Appliances", price: 1350, originalPrice: null, hot: false, inStock: true, dateAdded: "2026-07-22", image: "minifan.jpg" },

  { id: "p14", name: "Skincare Gift Set", category: "Beauty & Health", price: 1600, originalPrice: 2200, hot: false, inStock: true, dateAdded: "2026-08-02", image: "skincare.jpg" },
  { id: "p15", name: "Electric Shaver", category: "Beauty & Health", price: 1450, originalPrice: null, hot: false, inStock: true, dateAdded: "2026-07-12", image: "shaver.jpg" },

  { id: "p16", name: "Baby Feeding Set", category: "Baby & Kids", price: 1100, originalPrice: 1500, hot: false, inStock: true, dateAdded: "2026-08-04", image: "babyset.jpg" }
];

// Deal of the Day rotation — references product IDs above.
// today = today's featured deal. previous = last 2 days, most recent first.
// next = tomorrow's teaser (shown blurred/locked on the site, not purchasable yet).
window.DAILY_DEALS = {
  today: "p1",
  previous: ["p5", "p12"],
  next: "p2"
};
