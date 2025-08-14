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
