# Wape Wape Kenya

Storefront for wapewape.co.ke — static HTML/CSS/JS, no build step.

## Structure
- `public/index.html` — page markup
- `public/style.css` — design system (colors, type, layout)
- `public/app.js` — cart, checkout, WhatsApp order logic
- `public/products.js` — product catalog (currently placeholder data)
- `public/images/` — product photos, referenced by filename from `products.js`
- `public/manifest.json`, `public/sw.js`, `public/icons/` — installable PWA support

## To do before going fully live
- Replace `WHATSAPP_NUMBER` placeholder in `public/app.js` with the real business number
- Replace placeholder products in `public/products.js` with real stock (or wire to a live data source)
- Add real product photos to `public/images/`
