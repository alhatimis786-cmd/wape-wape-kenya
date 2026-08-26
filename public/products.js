// Placeholder catalog — replace with real stock and photos.
// image: filename only, expected at /images/<filename>. Falls back to a
// generated placeholder if the file isn't present yet.
//
// Fields:
//   price          — current selling price (KES)
//   originalPrice  — pre-discount price (KES). ONLY set this on the product
//                     that is today's Deal of the Day (see DAILY_DEALS below).
//                     Every other product should leave this null — in this
//                     "deal a day" model, nothing else is ever discounted.
//   hot            — true = shows a "Hot" badge and appears in the Trending strip
//   inStock        — false = shows "Out of stock" and disables Add to cart
//   stockCount     — real inventory count. Shows "Only X left" when low (<10).
//   highlights     — short bullet points shown on the deal detail page
//   dateAdded      — ISO date, used by the "Newest" sort
window.PRODUCTS = [
  { id: "p1", name: "Bluetooth Speaker 20W", category: "Electronics", price: 2200, originalPrice: 3200, hot: true, inStock: true, stockCount: 7, dateAdded: "2026-08-05", image: "speaker.jpg",
    highlights: ["20W drivers with deep bass", "10-hour battery life", "Bluetooth 5.0, works with any phone", "Water-resistant (splash-proof)"] },
  { id: "p2", name: "Wireless Earbuds Pro", category: "Electronics", price: 1800, originalPrice: null, hot: true, inStock: true, stockCount: 24, dateAdded: "2026-08-09", image: "earbuds.jpg",
    highlights: ["Active noise cancellation", "Up to 6 hours per charge, 24 with case", "Touch controls", "Sweat resistant"] },
  { id: "p3", name: "Power Bank 20000mAh", category: "Electronics", price: 1500, originalPrice: null, hot: false, inStock: true, stockCount: 18, dateAdded: "2026-07-28", image: "powerbank.jpg",
    highlights: ["20,000mAh capacity — charges most phones 4-5 times", "Dual USB output", "LED charge indicator"] },
  { id: "p4", name: "LED Ring Light 10\"", category: "Electronics", price: 1600, originalPrice: null, hot: false, inStock: true, stockCount: 12, dateAdded: "2026-07-20", image: "ringlight.jpg",
    highlights: ["10-inch ring, adjustable brightness", "Phone holder included", "Tripod stand included"] },

  { id: "p5", name: "Non-Stick Pan Set (3pc)", category: "Home & Kitchen", price: 2800, originalPrice: null, hot: true, inStock: true, stockCount: 9, dateAdded: "2026-08-08", image: "panset.jpg",
    highlights: ["3 sizes: 20cm, 24cm, 28cm", "Non-stick coating", "Works on gas, electric &amp; induction"] },
  { id: "p6", name: "Electric Kettle 1.8L", category: "Home & Kitchen", price: 1900, originalPrice: null, hot: false, inStock: true, stockCount: 15, dateAdded: "2026-07-15", image: "kettle.jpg",
    highlights: ["1.8L capacity", "Auto shut-off", "Boils in under 5 minutes"] },
  { id: "p7", name: "Storage Organizer Set", category: "Home & Kitchen", price: 1200, originalPrice: null, hot: false, inStock: false, stockCount: 0, dateAdded: "2026-07-10", image: "organizer.jpg",
    highlights: ["Set of 5 stackable containers", "Airtight lids", "Space-saving design"] },
  { id: "p8", name: "LED Desk Lamp", category: "Home & Kitchen", price: 1400, originalPrice: null, hot: false, inStock: true, stockCount: 20, dateAdded: "2026-08-01", image: "desklamp.jpg",
    highlights: ["3 brightness levels", "USB rechargeable", "Foldable, adjustable neck"] },

  { id: "p9", name: "Unisex Crossbody Bag", category: "Fashion", price: 1300, originalPrice: null, hot: false, inStock: true, stockCount: 11, dateAdded: "2026-07-25", image: "crossbody.jpg",
    highlights: ["Durable canvas material", "Adjustable strap", "Fits phone, wallet &amp; essentials"] },
  { id: "p10", name: "Analog Watch — Classic", category: "Fashion", price: 1700, originalPrice: null, hot: true, inStock: true, stockCount: 8, dateAdded: "2026-08-10", image: "watch.jpg",
    highlights: ["Stainless steel strap", "Water resistant", "1-year warranty"] },
  { id: "p11", name: "Sunglasses UV400", category: "Fashion", price: 900, originalPrice: null, hot: false, inStock: true, stockCount: 30, dateAdded: "2026-07-18", image: "sunglasses.jpg",
    highlights: ["UV400 protection", "Polarized lenses", "Comes with case"] },

  { id: "p12", name: "Blender 2000W", category: "Appliances", price: 3200, originalPrice: null, hot: true, inStock: true, stockCount: 6, dateAdded: "2026-08-07", image: "blender.jpg",
    highlights: ["2000W motor", "1.5L jug", "6 speed settings + pulse"] },
  { id: "p13", name: "Mini Fan Rechargeable", category: "Appliances", price: 1350, originalPrice: null, hot: false, inStock: true, stockCount: 14, dateAdded: "2026-07-22", image: "minifan.jpg",
    highlights: ["USB rechargeable", "3 speed settings", "Up to 6 hours per charge"] },

  { id: "p14", name: "Skincare Gift Set", category: "Beauty & Health", price: 1600, originalPrice: null, hot: false, inStock: true, stockCount: 16, dateAdded: "2026-08-02", image: "skincare.jpg",
    highlights: ["Cleanser, toner &amp; moisturizer set", "For all skin types", "Gift-ready packaging"] },
  { id: "p15", name: "Electric Shaver", category: "Beauty & Health", price: 1450, originalPrice: null, hot: false, inStock: true, stockCount: 13, dateAdded: "2026-07-12", image: "shaver.jpg",
    highlights: ["Cordless, USB rechargeable", "Washable head", "45-minute runtime"] },

  { id: "p16", name: "Baby Feeding Set", category: "Baby & Kids", price: 1100, originalPrice: null, hot: false, inStock: true, stockCount: 22, dateAdded: "2026-08-04", image: "babyset.jpg",
    highlights: ["BPA-free plastic", "Includes bowl, plate &amp; utensils", "Dishwasher safe"] }
];

// Deal of the Day rotation — references product IDs above.
// today     = today's featured deal (the ONLY product with a discount right now)
// yesterday = shown smaller, on the left, at regular price (deal has ended)
// tomorrow  = shown blurred/locked, on the right — a teaser, not purchasable yet
//
// Each day: move `today` -> `yesterday`, pick a new `today`, move originalPrice
// from the old today's product onto the new one (and clear it from the old one).
window.DAILY_DEALS = {
  today: "p1",
  yesterday: "p5",
  tomorrow: "p2"
};
