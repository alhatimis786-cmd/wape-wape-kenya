// Shared cart utilities — loaded on every page that needs cart data
// (homepage, checkout). Cart is stored in localStorage so it's shared
// across all pages on the domain.

// Real business WhatsApp number.
const WHATSAPP_NUMBER = "254181171147";

const cartState = {
  cart: JSON.parse(localStorage.getItem("wwk_cart") || "{}") // { productId: qty }
};

const money = (n) => "KES " + n.toLocaleString("en-KE");

function saveCart() {
  localStorage.setItem("wwk_cart", JSON.stringify(cartState.cart));
}

function cartCount() {
  return Object.values(cartState.cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(cartState.cart).reduce((sum, [id, qty]) => {
    const p = window.PRODUCTS.find((p) => p.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function imgSrc(product) {
  return `/images/${product.image}`;
}

function placeholderFor(product) {
  const label = encodeURIComponent(product.name);
  return `https://placehold.co/400x400/ECECF0/E0212B?text=${label}`;
}

function addToCart(id) {
  const p = window.PRODUCTS.find((p) => p.id === id);
  if (!p || p.inStock === false) return;
  cartState.cart[id] = (cartState.cart[id] || 0) + 1;
  saveCart();
}

function removeOneFromCart(id) {
  if (!cartState.cart[id]) return;
  cartState.cart[id] -= 1;
  if (cartState.cart[id] <= 0) delete cartState.cart[id];
  saveCart();
}

function buildOrderMessage(name, phone, address, payMethod) {
  const lines = [`Hi WapeWape, I'd like to order:`, ``];
  Object.entries(cartState.cart).forEach(([id, qty]) => {
    const p = window.PRODUCTS.find((p) => p.id === id);
    if (p && qty > 0) lines.push(`• ${p.name} x${qty} — ${money(p.price * qty)}`);
  });
  lines.push(``, `Total: ${money(cartTotal())}`, ``);
  lines.push(`Name: ${name}`, `Phone: ${phone}`, `Delivery: ${address}`, `Payment: ${payMethod}`);
  return lines.join("\n");
}
