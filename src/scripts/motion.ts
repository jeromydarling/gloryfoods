/**
 * Tasteful, restrained motion:
 *  - scroll-reveal via IntersectionObserver (staggered by [data-reveal-delay])
 *  - header shadow on scroll
 *  - mobile nav toggle
 * All reveal animations are inert under prefers-reduced-motion (the CSS sets
 * the resting state to fully visible, and we simply mark everything visible).
 */
const reduce =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = el.dataset.revealDelay;
        if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
        el.classList.add("is-visible");
        obs.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

export function initHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
    else header.removeAttribute("data-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const mobile = document.querySelector<HTMLElement>("[data-mobile-nav]");
  toggle?.addEventListener("click", () => {
    const open = header.hasAttribute("data-nav-open");
    if (open) {
      header.removeAttribute("data-nav-open");
      mobile?.setAttribute("hidden", "");
    } else {
      header.setAttribute("data-nav-open", "");
      mobile?.removeAttribute("hidden");
    }
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  });
}
