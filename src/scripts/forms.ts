/**
 * Progressive enhancement for the newsletter + contact forms. Forms degrade to
 * a normal POST if JS is unavailable; here we intercept for inline feedback.
 */
function emailLooksValid(value: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function initNewsletter() {
  document.querySelectorAll<HTMLFormElement>("[data-newsletter]").forEach((form) => {
    const status = form.parentElement?.querySelector<HTMLElement>(
      "[data-newsletter-status]"
    );
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector<HTMLInputElement>('input[name="email"]');
      const email = input?.value.trim() ?? "";
      if (!emailLooksValid(email)) {
        if (status) status.textContent = "Please enter a valid email.";
        input?.focus();
        return;
      }
      if (status) status.textContent = "Adding you to the list…";
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, source: location.pathname }),
        });
        if (!res.ok) throw new Error();
        if (status) status.textContent = "You're on the list — talk soon. ✦";
        form.reset();
      } catch {
        if (status)
          status.textContent = "Couldn't subscribe just now. Try again in a moment.";
      }
    });
  });
}

export function initContact() {
  const form = document.querySelector<HTMLFormElement>("[data-contact]");
  if (!form) return;
  const status = form.querySelector<HTMLElement>("[data-contact-status]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
    };
    if (!payload.name || !emailLooksValid(payload.email) || payload.message.length < 4) {
      if (status) status.textContent = "Please fill in each field with a little more.";
      return;
    }
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (btn) btn.disabled = true;
    if (status) status.textContent = "Sending…";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      if (status) status.textContent = "Thank you — we'll write back soon.";
      form.reset();
    } catch {
      if (status) status.textContent = "Message didn't send. Please email us directly.";
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
