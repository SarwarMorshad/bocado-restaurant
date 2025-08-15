// Helpers
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

/* ===== Year ===== */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

/* ===== Mobile nav ===== */
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

/* ===== Smooth anchors ===== */
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

/* ===== Tabs ===== */
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

/* ===== Gallery lightbox ===== */
const lightbox = $("#lightbox"),
  lightboxImg = $("#lightboxImg"),
  lightboxClose = $("#lightboxClose");
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

/* ===== PDF Menu modal ===== */
const viewMenuBtn = $("#viewMenuBtn"),
  pdfModal = $("#pdfModal"),
  pdfClose = $("#pdfClose");
function openPdfModal() {
  pdfModal.classList.remove("hidden");
  pdfModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  pdfClose?.focus();
}
function closePdfModal() {
  pdfModal.classList.add("hidden");
  pdfModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
viewMenuBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  openPdfModal();
});
pdfClose?.addEventListener("click", closePdfModal);
pdfModal?.addEventListener("click", (e) => {
  if (e.target === pdfModal) closePdfModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePdfModal();
});

/* ===== Booking form ===== */
const form = $("#bookingForm");
let formStart = Date.now();

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = $("#formStatus"),
    btn = $("#submitBtn");
  if (status) status.textContent = "";
  const data = Object.fromEntries(new FormData(form));

  // Anti-spam
  if (data.company) return;
  if (Date.now() - formStart < 1500) return;

  // Validations
  const errors = {};
  if (!data.fullName) errors.fullName = "Please enter your full name.";
  if (!data.email || !/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) errors.email = "Enter a valid email address.";
  if (!data.partySize) errors.partySize = "Select party size.";
  if (!data.date) errors.date = "Choose a date.";
  if (!data.time) errors.time = "Choose a time.";
  if (!form.consent?.checked) errors.consent = "Please agree to the privacy policy.";

  // Past date prevention
  if (data.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(data.date + "T00:00:00");
    if (chosen < today) errors.date = "Please choose a future date.";
  }

  // Render errors
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

  // Submit
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
        seating: null,
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
      }
      status.className = "text-[var(--green-200)]";
      // Reset form + custom dropdown displays + date placeholder
      form.reset();
      $("#partySizeValue").value = "";
      $("#timeValue").value = "";
      $("#occasionValue").value = "";
      $("#partyDisplay").textContent = "Select party size";
      $("#partyDisplay").classList.add("text-[var(--text-muted)]");
      $("#timeDisplay").textContent = "Select a time";
      $("#timeDisplay").classList.add("text-[var(--text-muted)]");
      $("#occasionDisplay").textContent = "Select an occasion";
      $("#occasionDisplay").classList.add("text-[var(--text-muted)]");
      syncDatePlaceholder();
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

/* ===== Date: click anywhere opens picker ===== */
const dateInput = document.getElementById("date");
document.getElementById("dateClickWrapper")?.addEventListener("click", () => {
  if (!dateInput) return;
  if (typeof dateInput.showPicker === "function") {
    dateInput.showPicker();
  } else {
    dateInput.focus();
    dateInput.click();
  }
});

/* ===== Date placeholder + dd/mm/yyyy hiding sync ===== */
const datePh = document.getElementById("datePlaceholder");
function syncDatePlaceholder() {
  if (!dateInput || !datePh) return;
  const empty = !dateInput.value;
  datePh.style.opacity = empty ? "1" : "0";
  dateInput.classList.toggle("date-empty", empty);
}
syncDatePlaceholder();
dateInput?.addEventListener("change", syncDatePlaceholder);
dateInput?.addEventListener("input", syncDatePlaceholder);
dateInput?.addEventListener("blur", syncDatePlaceholder);

/* ===== Reusable custom dropdowns ===== */
function initCustomDropdown(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const btn = root.querySelector("button");
  const list = root.querySelector('ul[role="listbox"]');
  const display = root.querySelector("span[id$='Display']");
  const hidden = root.querySelector('input[type="hidden"]');
  const options = Array.from(list.querySelectorAll('[role="option"]'));

  let open = false,
    activeIndex = -1;

  function openList() {
    list.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
    open = true;
    const current = options.findIndex((o) => o.dataset.value === hidden.value);
    activeIndex = current >= 0 ? current : 0;
    highlight();
  }
  function closeList() {
    list.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
    open = false;
    activeIndex = -1;
  }
  function highlight() {
    options.forEach((o, i) => {
      o.classList.toggle("bg-[var(--bg-emerald)]", i === activeIndex);
      o.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      if (i === activeIndex) o.scrollIntoView({ block: "nearest" });
    });
  }
  function commit(i) {
    const opt = options[i];
    if (!opt) return;
    const val = opt.dataset.value || "";
    hidden.value = val;
    display.textContent = val || display.dataset.placeholder || "Select";
    display.classList.toggle("text-[var(--text-muted)]", !val);
    closeList();
    btn.focus();
  }

  if (!display.dataset.placeholder) display.dataset.placeholder = display.textContent.trim();

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    open ? closeList() : openList();
  });
  options.forEach((opt, i) => opt.addEventListener("click", () => commit(i)));
  document.addEventListener("click", (e) => {
    if (open && !root.contains(e.target)) closeList();
  });

  // Keyboard
  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openList();
      else if (e.key !== "ArrowDown") commit(activeIndex >= 0 ? activeIndex : 0);
    }
  });
  list.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeList();
      btn.focus();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(options.length - 1, activeIndex + 1);
      highlight();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      highlight();
    }
    if (e.key === "Home") {
      e.preventDefault();
      activeIndex = 0;
      highlight();
    }
    if (e.key === "End") {
      e.preventDefault();
      activeIndex = options.length - 1;
      highlight();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commit(activeIndex);
    }
  });
}
initCustomDropdown("occasionDropdown");
initCustomDropdown("partyDropdown");
initCustomDropdown("timeDropdown");

/* ===== Privacy Policy modal (form + footer link via delegation) ===== */
const policyModal = document.getElementById("policyModal");
const policyClose = document.getElementById("policyClose");
const policyAccept = document.getElementById("policyAccept");

function openPolicyModal() {
  if (!policyModal) return;
  policyModal.classList.remove("hidden");
  policyModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  policyClose?.focus();
}
function closePolicyModal() {
  if (!policyModal) return;
  policyModal.classList.add("hidden");
  policyModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// One handler catches both: form link (#privacyInlineLink) and footer link (#privacyFooterLink)
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("#privacyInlineLink, #privacyFooterLink");
  if (trigger) {
    e.preventDefault();
    openPolicyModal();
    return;
  }

  if (e.target.closest("#policyClose, #policyAccept")) {
    e.preventDefault();
    closePolicyModal();
    return;
  }

  if (e.target === policyModal) closePolicyModal(); // backdrop click
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePolicyModal();
});
