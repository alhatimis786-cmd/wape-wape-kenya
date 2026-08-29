// Shared Supabase client + auth helpers, used across pages.
const SUPABASE_URL = "https://dwhcjtidbguhtbetapqa.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ql_XwB2OmUg6fgDfpZCl3Q_rDmTP6Oj";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Escapes any user- or database-supplied text before it's inserted into
// innerHTML. Without this, a malicious customer/seller name, product title,
// or address could contain a <script> tag or event-handler attribute that
// executes in the browser of whoever views it next — including an admin.
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function wwkSignUp({ email, password, fullName, phone }) {
  return sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } }
  });
}

async function wwkSignIn({ email, password }) {
  return sb.auth.signInWithPassword({ email, password });
}

async function wwkSignOut() {
  await sb.auth.signOut();
  window.location.href = "/";
}

async function wwkGetSession() {
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function wwkGetProfile(userId) {
  return sb.from("profiles").select("*").eq("id", userId).single();
}

// Updates the nav's account area based on whether someone is logged in.
// Expects an element with id="navAccountArea" to exist on the page.
async function wwkRenderNavAccount() {
  const el = document.getElementById("navAccountArea");
  if (!el) return;
  const session = await wwkGetSession();
  if (session) {
    const { data: profile } = await wwkGetProfile(session.user.id);
    const name = (profile && profile.full_name) ? profile.full_name.split(" ")[0] : "Account";
    let roleLink = "";
    if (profile && profile.role === "seller") {
      roleLink = `<a href="/seller-dashboard.html" class="nav-whatsapp">My Products</a>`;
      // Already registered — the "Sell With WapeWape" invitation no longer
      // applies to them, so hide it everywhere it appears on the page.
      document.querySelectorAll(".sell-with-nav-link").forEach((a) => { a.style.display = "none"; });
    } else if (profile && profile.role === "admin") {
      roleLink = `<a href="/admin.html" class="nav-whatsapp">Admin</a>`;
    }
    el.innerHTML = `
      ${roleLink}
      <span class="nav-account-name">${name}</span>
      <button class="nav-whatsapp" id="navLogoutBtn" type="button">Log Out</button>
    `;
    document.getElementById("navLogoutBtn").addEventListener("click", wwkSignOut);
  } else {
    el.innerHTML = `<a href="/login.html" class="nav-whatsapp">Log In</a>`;
  }
}

document.addEventListener("DOMContentLoaded", wwkRenderNavAccount);
