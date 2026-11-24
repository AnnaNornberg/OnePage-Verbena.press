const STORE_DATA = {
  whatsapp: "5553999999999",
  products: [
    {
      id: "verdao",
      name: "Verdão (300ml)",
      notes: "Couve orgânica, maçã verde, pepino, limão siciliano e gengibre fresco.",
      price: 14.5,
      color: "#1d5d43"
    },
    {
      id: "citrico",
      name: "Cítrico (300ml)",
      notes: "Laranja pera, cenoura doce, cúrcuma fresca e pitada de pimenta preta.",
      price: 14.5,
      color: "#d78a36"
    },
    {
      id: "raiz-pura",
      name: "Raiz Pura (300ml)",
      notes: "Beterraba, maçã gala, limão tahiti e folhas de hortelã fresca.",
      price: 14.5,
      color: "#7c2d3e"
    }
  ],
  kit: {
    id: "kit-especial",
    name: "Degustação Completa — Kit 6 garrafas",
    price: 78.0
  }
};

const cart = new Map();

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function buildWhatsUrl(text) {
  const digits = STORE_DATA.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const flavorsGrid = document.getElementById("flavors-grid");
const flavorFragment = document.createDocumentFragment();

STORE_DATA.products.forEach((item) => {
  const card = document.createElement("article");
  card.className = "flavor-card reveal";

  const top = document.createElement("div");

  const dot = document.createElement("span");
  dot.className = "flavor-dot";
  dot.style.backgroundColor = item.color;

  const title = document.createElement("h3");
  title.textContent = item.name;

  const desc = document.createElement("p");
  desc.textContent = item.notes;

  top.append(dot, title, desc);

  const bottom = document.createElement("div");
  bottom.className = "flavor-bottom";

  const price = document.createElement("span");
  price.className = "flavor-price";
  price.textContent = formatBRL(item.price);

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "btn btn-outline";
  addBtn.textContent = "Adicionar";
  addBtn.addEventListener("click", () => addToCart(item));

  bottom.append(price, addBtn);
  card.append(top, bottom);
  flavorFragment.appendChild(card);
});

if (flavorsGrid) {
  flavorsGrid.appendChild(flavorFragment);
}

const cartCountEl = document.getElementById("cart-count");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const drawerEl = document.getElementById("cart-drawer");
const backdropEl = document.getElementById("drawer-backdrop");

function openDrawer() {
  if (!drawerEl || !backdropEl) return;
  drawerEl.hidden = false;
  backdropEl.hidden = false;
}

function closeDrawer() {
  if (!drawerEl || !backdropEl) return;
  drawerEl.hidden = true;
  backdropEl.hidden = true;
}

function addToCart(product) {
  const existing = cart.get(product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(product.id, { ...product, qty: 1 });
  }
  renderCart();
  openDrawer();
}

function removeFromCart(id) {
  const existing = cart.get(id);
  if (!existing) return;
  if (existing.qty > 1) {
    existing.qty -= 1;
  } else {
    cart.delete(id);
  }
  renderCart();
}

function renderCart() {
  if (!cartItemsEl || !cartCountEl || !cartTotalEl) return;
  cartItemsEl.innerHTML = "";
  let totalQty = 0;
  let totalPrice = 0;

  if (cart.size === 0) {
    const empty = document.createElement("p");
    empty.style.color = "var(--forest-muted)";
    empty.style.fontSize = "0.9rem";
    empty.textContent = "Sua sacola ainda está vazia.";
    cartItemsEl.appendChild(empty);
  } else {
    cart.forEach((item) => {
      totalQty += item.qty;
      totalPrice += item.price * item.qty;

      const row = document.createElement("div");
      row.className = "cart-row";

      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = `${item.qty}× ${item.name}`;

      const sub = document.createElement("span");
      sub.textContent = formatBRL(item.price * item.qty);

      info.append(name, sub);

      const remBtn = document.createElement("button");
      remBtn.type = "button";
      remBtn.className = "remove-item";
      remBtn.textContent = "Remover";
      remBtn.addEventListener("click", () => removeFromCart(item.id));

      row.append(info, remBtn);
      cartItemsEl.appendChild(row);
    });
  }

  cartCountEl.textContent = String(totalQty);
  cartTotalEl.textContent = formatBRL(totalPrice);
}

const addKitBtn = document.getElementById("add-kit-btn");
if (addKitBtn) {
  addKitBtn.addEventListener("click", () => addToCart(STORE_DATA.kit));
}

const cartTrigger = document.getElementById("cart-trigger");
if (cartTrigger) {
  cartTrigger.addEventListener("click", openDrawer);
}

const closeDrawerBtn = document.getElementById("close-drawer");
if (closeDrawerBtn) {
  closeDrawerBtn.addEventListener("click", closeDrawer);
}

if (backdropEl) {
  backdropEl.addEventListener("click", closeDrawer);
}

const checkoutWhatsBtn = document.getElementById("checkout-whats");
if (checkoutWhatsBtn) {
  checkoutWhatsBtn.addEventListener("click", () => {
    if (cart.size === 0) {
      window.open(
        buildWhatsUrl("Olá! Gostaria de conhecer os sabores da Verbena Press."),
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    const lines = [];
    let sum = 0;
    cart.forEach((item) => {
      lines.push(`- ${item.qty}x ${item.name} (${formatBRL(item.price * item.qty)})`);
      sum += item.price * item.qty;
    });
    const message = `Olá! Gostaria de fazer um pedido na Verbena Press:\n\n${lines.join("\n")}\n\nTotal: ${formatBRL(sum)}`;
    window.open(buildWhatsUrl(message), "_blank", "noopener,noreferrer");
  });
}

const footerWhatsLink = document.getElementById("footer-whats");
if (footerWhatsLink) {
  footerWhatsLink.href = buildWhatsUrl("Olá! Vim pelo site da Verbena Press.");
}

renderCart();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

function showVisibleReveals() {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  revealItems.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh * 0.96) {
      el.classList.add("is-visible");
    }
  });
}

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
  );
  revealItems.forEach((el) => observer.observe(el));
  showVisibleReveals();
  window.addEventListener("scroll", showVisibleReveals, { passive: true });
}