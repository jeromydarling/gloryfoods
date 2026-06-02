/**
 * Client-side basket. State lives in localStorage; the drawer + header badge
 * re-render reactively. Pricing here is for display only — the /api/checkout
 * function re-prices every line from D1 before charging anything.
 */
import { allItems, formatPrice, type MenuItem } from "@data/menu";

type Cart = Record<string, number>; // slug -> quantity
const KEY = "selam-cart-v1";
const MAX_QTY = 24;

const itemMap = new Map<string, MenuItem>(allItems.map((i) => [i.slug, i]));

function read(): Cart {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Cart;
    // keep only known slugs / sane quantities
    const clean: Cart = {};
    for (const [slug, qty] of Object.entries(parsed)) {
      if (itemMap.has(slug) && Number.isInteger(qty) && qty > 0) {
        clean[slug] = Math.min(qty, MAX_QTY);
      }
    }
    return clean;
  } catch {
    return {};
  }
}

let cart: Cart = typeof localStorage !== "undefined" ? read() : {};

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* storage may be unavailable; cart still works in-memory */
  }
  render();
}

export function getCount(): number {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}
export function getSubtotal(): number {
  return Object.entries(cart).reduce((sum, [slug, qty]) => {
    const item = itemMap.get(slug);
    return sum + (item ? item.priceCents * qty : 0);
  }, 0);
}
export function getLines() {
  return Object.entries(cart)
    .map(([slug, qty]) => ({ item: itemMap.get(slug)!, qty }))
    .filter((l) => l.item);
}
export function hasSubscription(): boolean {
  return getLines().some((l) => l.item.category === "subscription");
}

export function add(slug: string, qty = 1) {
  if (!itemMap.has(slug)) return;
  const item = itemMap.get(slug)!;
  // subscriptions are billed singly — never stack a recurring box
  if (item.category === "subscription") {
    cart[slug] = 1;
  } else {
    cart[slug] = Math.min((cart[slug] ?? 0) + qty, MAX_QTY);
  }
  persist();
  open();
  pulse();
}
export function setQty(slug: string, qty: number) {
  if (qty <= 0) delete cart[slug];
  else cart[slug] = Math.min(qty, MAX_QTY);
  persist();
}
export function remove(slug: string) {
  delete cart[slug];
  persist();
}
export function clear() {
  cart = {};
  persist();
}

/* ---------- drawer + badge rendering ------------------------------------ */
const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel);

function pulse() {
  const badge = $<HTMLElement>("[data-cart-count]");
  badge?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }],
    { duration: 350, easing: "ease-out" }
  );
}

function render() {
  const count = getCount();
  const badge = $<HTMLElement>("[data-cart-count]");
  if (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  const body = $<HTMLElement>("[data-cart-body]");
  const empty = $<HTMLElement>("[data-cart-empty]");
  const foot = $<HTMLElement>("[data-cart-foot]");
  if (!body || !empty || !foot) return;

  const lines = getLines();
  empty.hidden = lines.length > 0;
  foot.hidden = lines.length === 0;
  body.innerHTML = lines
    .map(({ item, qty }) => {
      const interval = item.interval ? ` / ${item.interval.label}` : "";
      return `
      <div class="cart-line" data-slug="${item.slug}">
        <img class="cart-line__img" src="${item.image}" alt="" loading="lazy" width="64" height="64" />
        <div>
          <div class="cart-line__name">${item.name}</div>
          <div class="cart-line__price">${formatPrice(item.priceCents)}${interval}</div>
          <div class="cart-qty">
            <button type="button" data-dec aria-label="Decrease quantity of ${item.name}">&minus;</button>
            <span aria-live="polite">${qty}</span>
            <button type="button" data-inc aria-label="Increase quantity of ${item.name}">+</button>
          </div>
        </div>
        <div class="cart-line__total">${formatPrice(item.priceCents * qty)}</div>
      </div>`;
    })
    .join("");

  const sub = $<HTMLElement>("[data-cart-subtotal]");
  if (sub) sub.textContent = formatPrice(getSubtotal());
}

/* ---------- open / close ------------------------------------------------ */
let lastFocused: HTMLElement | null = null;
export function open() {
  const drawer = $<HTMLElement>("[data-cart-drawer]");
  const backdrop = $<HTMLElement>("[data-cart-backdrop]");
  if (!drawer || !backdrop) return;
  lastFocused = document.activeElement as HTMLElement;
  drawer.hidden = false;
  backdrop.hidden = false;
  requestAnimationFrame(() => {
    drawer.setAttribute("data-open", "");
    backdrop.setAttribute("data-open", "");
    drawer.setAttribute("aria-hidden", "false");
  });
  document.body.style.overflow = "hidden";
  $<HTMLButtonElement>("[data-cart-close]")?.focus();
}
export function close() {
  const drawer = $<HTMLElement>("[data-cart-drawer]");
  const backdrop = $<HTMLElement>("[data-cart-backdrop]");
  if (!drawer || !backdrop) return;
  drawer.removeAttribute("data-open");
  backdrop.removeAttribute("data-open");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => {
    drawer.hidden = true;
    backdrop.hidden = true;
  }, 400);
  lastFocused?.focus();
}

async function checkout() {
  const btn = $<HTMLButtonElement>("[data-cart-checkout]");
  const err = $<HTMLElement>("[data-cart-error]");
  if (!btn) return;
  if (err) err.textContent = "";
  btn.disabled = true;
  btn.setAttribute("aria-busy", "true");
  const original = btn.innerHTML;
  btn.innerHTML = "<span>Taking you to checkout…</span>";
  try {
    const items = getLines().map((l) => ({ slug: l.item.slug, quantity: l.qty }));
    const mode = hasSubscription() ? "subscription" : "payment";
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items, mode }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error || "Checkout is unavailable right now.");
    window.location.href = data.url;
  } catch (e) {
    if (err) err.textContent = e instanceof Error ? e.message : "Something went wrong.";
    btn.disabled = false;
    btn.removeAttribute("aria-busy");
    btn.innerHTML = original;
  }
}

/* ---------- wire up DOM ------------------------------------------------- */
export function initCart() {
  // open / close controls
  document.querySelectorAll("[data-cart-open]").forEach((b) =>
    b.addEventListener("click", open)
  );
  $<HTMLElement>("[data-cart-backdrop]")?.addEventListener("click", close);
  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-cart-close]")) close();
    if (t.closest("[data-cart-checkout]")) checkout();

    // add-to-cart buttons anywhere on the page
    const addBtn = t.closest<HTMLElement>("[data-add]");
    if (addBtn) {
      add(addBtn.dataset.add!);
      addBtn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
        { duration: 240 }
      );
    }

    // qty steppers inside the drawer
    const line = t.closest<HTMLElement>(".cart-line");
    if (line) {
      const slug = line.dataset.slug!;
      const cur = cart[slug] ?? 0;
      if (t.closest("[data-inc]")) setQty(slug, cur + 1);
      if (t.closest("[data-dec]")) setQty(slug, cur - 1);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  render();
}
