// Shared nav dropdown behavior — used on every page with a .nav-dropdown.
document.addEventListener("DOMContentLoaded", () => {
  populateDropdownCategories();

  document.querySelectorAll(".nav-dropdown").forEach((wrap) => {
    const btn = wrap.querySelector(".nav-dropdown-trigger");
    const panel = wrap.querySelector(".nav-dropdown-panel");
    if (!btn || !panel) return;

    const positionPanel = () => {
      if (window.innerWidth <= 720) {
        panel.style.top = ""; panel.style.left = "";
        return; // mobile uses the fixed bottom-sheet CSS instead
      }
      const rect = btn.getBoundingClientRect();
      panel.style.top = `${rect.bottom}px`;
      panel.style.left = `${rect.left}px`;
    };

    const close = () => {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };
    const toggle = (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) positionPanel();
    };

    btn.addEventListener("click", toggle);
    window.addEventListener("resize", () => { if (wrap.classList.contains("open")) positionPanel(); });
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  });
});

// Populates the Deals dropdown's "Browse by Category" list from whatever
// categories actually exist among live products — including any custom
// category a seller has typed in (e.g. "Furniture") — instead of a fixed
// hardcoded list. Runs on every page since the dropdown appears everywhere.
async function populateDropdownCategories() {
  const container = document.getElementById("dropdownCategoryList");
  if (!container || typeof sb === "undefined") return;

  const { data, error } = await sb.from("deals").select("category").eq("status", "live");
  if (error || !data) return;

  const categories = [...new Set(data.map((d) => d.category).filter(Boolean))].sort();
  if (!categories.length) return;

  container.innerHTML = categories.map((c) => {
    const label = typeof titleCase === "function" ? titleCase(c) : c;
    const safeLabel = typeof escapeHtml === "function" ? escapeHtml(label) : label;
    return `<a href="/?cat=${encodeURIComponent(c)}#shop">${safeLabel}</a>`;
  }).join("");
}
