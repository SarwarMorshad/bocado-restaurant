# BOCADO — One‑Page Website Requirements (HTML + CSS + JS + Tailwind)

This spec defines a **single‑page** website for **BOCADO**, a Spanish tapas bar & restaurant. The build must use **vanilla HTML**, **vanilla JavaScript**, and **Tailwind CSS** only (no React/Next.js or other frameworks). Visual style: **trendy**, clean, with a **green accent palette**.

---

## 1) Tech & Build

- **Stack**: HTML5, CSS3, JavaScript (ES6), Tailwind CSS.
- **Tailwind**: Use CDN for quick prototyping and Tailwind CLI for production (to purge unused CSS).
- **No frameworks**: Do not use React, Vue, Next.js, etc.
- **Images**: Store locally under `/public/images`.
- **Form delivery**: Frontend sends booking requests via `fetch()` to a backend endpoint (`/api/book`); email sending is handled server-side.

### Folder Structure
```
/ (project root)
  index.html
  /assets
    /css
      tailwind.css         # if using CLI build
      styles.css           # compiled Tailwind output (+ tiny custom CSS if needed)
    /js
      main.js              # interactions & booking logic
  /public
    /images                # hero, gallery, icons
  tailwind.config.js       # if using CLI build
  package.json             # if using CLI build
```
### Tailwind (CLI) Quick Setup
```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Build (watch/dev): npx tailwindcss -i ./assets/css/tailwind.css -o ./assets/css/styles.css --watch
# Build (prod):      npx tailwindcss -i ./assets/css/tailwind.css -o ./assets/css/styles.css --minify
```
**`tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        bocado: {
          green: { 100: "#E8F3EE", 400: "#58A37A", 600: "#2E7D54" },
          ivory: "#FAFAF7",
          slate: { 600: "#4B5563", 900: "#111827" },
          terracotta: "#C46A4A"
        }
      },
      fontFamily: {
        heading: ["Playfair Display", "ui-serif", "Georgia"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
```
**`assets/css/tailwind.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 2) Brand & Visual Direction

- **Palette**: primary green accent on warm light background.
  - Primary: `bocado-green-600` `#2E7D54`
  - Accent: `bocado-green-400` `#58A37A`
  - Background: `ivory` `#FAFAF7`
  - Text: `slate-900` `#111827`, muted `slate-600` `#4B5563`
  - Optional highlight: `terracotta` `#C46A4A`
- **Typography**: Headings = Playfair Display; Body = Inter (load via Google Fonts).
- **Aesthetic**: rounded radii (`rounded-2xl`), soft shadows (`shadow-lg`), subtle borders using `bocado.green.100`, generous whitespace.

---

## 3) Page Structure & IDs (Anchor Navigation)

1. **Header** (`#top`)
   - Sticky top bar with translucent background/blur on scroll.
   - Left: BOCADO logo/text. Right: navigation links → `#menu`, `#gallery`, `#about`, `#location`, `#booking` with a **Book** CTA.
   - Mobile: hamburger toggles slide‑down menu; close on link click or outside click.

2. **Hero** (`#hero`)
   - Full‑bleed image (min‑h-[70vh]) with dark overlay.
   - H1: “BOCADO — Spanish Tapas & Bar” in heading font.
   - Subhead: one sentence value proposition.
   - Primary CTA → scroll to `#booking`; secondary → `#menu`.

3. **Highlights / USPs** (`#highlights`)
   - 3–4 cards with icon + short title + one‑line description (e.g., Seasonal Tapas, Craft Cocktails, Vegan‑friendly, Open Late).

4. **Menu Preview** (`#menu`)
   - Category tabs/pills (Tapas • Mains • Desserts • Drinks) toggled via JS.
   - Grid with 6–8 featured items (name, short description, price).
   - Optional link to full menu PDF.

5. **Gallery** (`#gallery`)
   - Responsive grid (masonry/justified effect) with lazy‑loaded images.
   - Lightbox modal on click (keyboard navigable, ESC to close).

6. **About** (`#about`)
   - Short story about BOCADO + chef/team photo; note on sourcing.

7. **Location & Hours** (`#location`)
   - Address (link to Google Maps), opening hours table, contact details (tap‑to‑call on mobile, `mailto:` for email).
   - Optional embedded static map.

8. **Booking** (`#booking`)
   - Form card with green border and soft background.
   - Inline validation and success/error banners.

9. **Footer**
   - Social links, newsletter (optional), legal links (Privacy Policy, Imprint, Cookies).

---

## 4) Booking Form — Fields, Validation & Submission

### Fields
- `fullName` *(required)* — text
- `email` *(required)* — email format
- `phone` *(required for same‑day; otherwise optional)* — normalize to E.164 on submit if possible
- `partySize` *(required; 1–12)* — select
- `date` *(required; future only)* — `min=today`
- `time` *(required; within open hours)* — select with valid slots only
- `occasion` *(optional)* — `birthday | anniversary | business | other`
- `seating` *(optional)* — `indoor | terrace | bar`
- `notes` *(optional; ≤300 chars)* — textarea
- `consent` *(required)* — checkbox with links to Privacy & Terms

### Validation (client‑side)
- Validate on blur and on submit; block submit until required fields are valid.
- Error messages under fields using Tailwind utility classes; associate via `aria-describedby`.
- Prevent **past dates** and **times outside opening hours**.

### Anti‑spam
- Hidden honeypot input (must remain empty).
- Submit time threshold (≥ 1.5s between first interaction and submit).

### Submission Contract
- **Endpoint**: `POST /api/book`
- **Request JSON**:
  ```json
  {
    "fullName": "string",
    "email": "string",
    "phone": "string|null",
    "partySize": 2,
    "date": "YYYY-MM-DD",
    "time": "HH:mm",
    "occasion": "birthday|anniversary|business|other|null",
    "seating": "indoor|terrace|bar|null",
    "notes": "string|null",
    "consent": true
  }
  ```
- **Success (201)**: `{ "ok": true, "reference": "BOC-YYYY-MM-xxxxx" }`
- **Client UX**: show success banner with reference and clear form.
- **Error (4xx/5xx)**: show accessible error banner; preserve user input.

---

## 5) Accessibility (WCAG 2.2 AA)

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- Visible focus styles: `focus:ring-2 focus:ring-bocado-green-600 focus:outline-none`.
- Keyboard support for menus, tabs, modals/lightbox (trap focus; close with ESC).
- Form errors announced via `aria-live="polite"` and linked via `aria-describedby`.
- Respect `prefers-reduced-motion` (shorten/disable animations).

---

## 6) Interactions (JavaScript in `assets/js/main.js`)

- **Smooth scrolling** for anchor links + set focus on target section heading.
- **Header on scroll**: apply shadow/blur after scroll ≥ 8px.
- **Mobile nav**: toggle open/close; close on link click or outside click.
- **Menu tabs**: basic JS to switch visible category panel.
- **Gallery lightbox**: open/close with keyboard support.
- **Form**: inline validation, anti‑spam checks, async submit with `fetch()`, success/error banners.

---

## 7) Performance

- Use Tailwind CLI to purge unused CSS (`--minify`) for production.
- Optimize images (AVIF/WEBP with fallbacks), and set explicit `width`/`height` to avoid CLS.
- Lazy‑load non‑critical images (`loading="lazy"`).
- Preload hero image and font files.
- **Targets**: LCP ≤ 2.5s, CLS ≤ 0.1, Lighthouse: Performance ≥ 90.

---

## 8) SEO & Social

- `<title>` and `<meta name="description">` in `<head>`.
- Open Graph & Twitter meta tags with hero image.
- `LocalBusiness` JSON‑LD (name, address, hours, phone).
- Provide `robots.txt` and `sitemap.xml` (single URL + key images).

---

## 9) Legal (EU/Germany)

- Footer must include **Privacy Policy** and **Imprint** links.
- Booking form must include **GDPR consent** text and checkbox.
- Cookie notice only if using non‑essential cookies/analytics.

---

## 10) Deliverables

- `index.html` (complete one‑page site).
- `assets/css/styles.css` (compiled Tailwind output; minimal custom CSS if any).
- `assets/js/main.js` (all interactions & form logic).
- Sample images and menu items (placeholders are acceptable).

---

## 11) Acceptance Criteria (Definition of Done)

- Sticky header with responsive navigation and mobile drawer.
- Smooth in‑page navigation; keyboard and touch friendly.
- Menu tabs switch without layout jump; gallery opens in accessible lightbox.
- Booking form validates, prevents past dates, posts to `/api/book`, and shows success/error banners.
- All interactive elements are keyboard accessible with visible focus; modals trap focus.
- Production CSS is purged/minified; images are optimized; Lighthouse thresholds met.
- No console errors in latest Chrome/Firefox/Safari; HTML passes basic validation.

---

## 12) Starter Snippets

### Fonts & CSS in `<head>`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
```

### Booking Form (skeleton)
```html
<section id="booking" class="scroll-mt-24 py-16 bg-bocado-green-100">
  <div class="mx-auto max-w-3xl px-4">
    <h2 class="font-heading text-3xl mb-6">Book a Table</h2>
    <form id="bookingForm" class="space-y-4 bg-white p-6 rounded-2xl shadow-lg border border-bocado-green-100">
      <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true">
      <!-- Fields here ... -->
      <label class="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required>
        I agree to the <a href="#" class="text-bocado-green-600 underline ml-1">privacy policy</a>.
      </label>
      <div class="flex items-center gap-3">
        <button id="submitBtn" class="inline-flex items-center rounded-full bg-bocado-green-600 px-5 py-2.5 text-white">Submit</button>
        <div id="formStatus" class="text-sm" role="status" aria-live="polite"></div>
      </div>
    </form>
  </div>
</section>
```
