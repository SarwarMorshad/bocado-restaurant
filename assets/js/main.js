const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
const navToggle = $("#navToggle");
const mobileNav = $("#mobileNav");
if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const open = mobileNav.classList.toggle("hidden") ? false : true;
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#mobileNav a").forEach((a) =>
    a.addEventListener("click", () => {
      mobileNav.classList.add("hidden");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const h2 = target.querySelector("h2,h1");
      if (h2) h2.setAttribute("tabindex", "-1"), h2.focus({ preventScroll: true });
    }, 500);
  });
});
const tabs = $$(".tab");
const panels = $$(".tab-panel");
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    panels.forEach((p) => p.classList.toggle("hidden", p.dataset.panel !== target));
  });
});
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxClose = $("#lightboxClose");
$$(".gallery-thumb img").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src.replace("w=800", "w=1600");
    lightbox.classList.remove("hidden");
    lightboxClose.focus();
  });
});
lightboxClose?.addEventListener("click", () => lightbox.classList.add("hidden"));
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.classList.add("hidden");
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") lightbox.classList.add("hidden");
});
const form = $("#bookingForm");
let formStart = Date.now();
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#formStatus");
  const btn = $("#submitBtn");
  if (status) status.textContent = "";
  const data = Object.fromEntries(new FormData(form));
  if (data.company) return;
  if (Date.now() - formStart < 1500) return;
  const errors = {};
  if (!data.fullName) errors.fullName = "Please enter your full name.";
  if (!data.email || !/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (!data.partySize) errors.partySize = "Select party size.";
  if (!data.date) errors.date = "Choose a date.";
  if (!data.time) errors.time = "Choose a time.";
  if (!form.consent?.checked) errors.consent = "Please agree to the privacy policy.";
  if (data.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(data.date + "T00:00:00");
    if (chosen < today) errors.date = "Please choose a future date.";
  }
  $$("[data-error]").forEach((p) => p.classList.add("hidden"));
  if (Object.keys(errors).length) {
    for (const [k, v] of Object.entries(errors)) {
      const el = document.querySelector(`[data-error="${k}"]`);
      if (el) {
        el.textContent = v;
        el.classList.remove("hidden");
      }
    }
    if (status) {
      status.textContent = "Please correct the highlighted fields.";
      status.className = "text-red-300";
    }
    return;
  }
  if (btn) btn.disabled = true;
  if (status) {
    status.textContent = "Sending...";
    status.className = "text-[var(--text-muted)]";
  }
  try {
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        partySize: Number(data.partySize),
        date: data.date,
        time: data.time,
        occasion: data.occasion || null,
        seating: data.seating || null,
        notes: data.notes || null,
        consent: true,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 201 && body.ok) {
      if (status) {
        status.textContent = `Booking request sent. Ref: ${
          body.reference || "BOC-" + new Date().toISOString().slice(0, 10) + "-00001"
        }`;
        status.className = "text-[var(--green-200)]";
      }
      form.reset();
      formStart = Date.now();
    } else {
      throw new Error(body.error || "Server error");
    }
  } catch (err) {
    if (status) {
      status.textContent = "Sorry, something went wrong. Please try again or call us.";
      status.className = "text-red-300";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
});
