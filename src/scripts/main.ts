import { initCart } from "./cart";
import { initReveal, initHeader } from "./motion";
import { initNewsletter, initContact } from "./forms";

const boot = () => {
  initHeader();
  initCart();
  initReveal();
  initNewsletter();
  initContact();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
