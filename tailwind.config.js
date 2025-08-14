/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        bocado: {
          emerald: { 100: "#E6F4F1", 400: "#34B39C", 600: "#12705B" },
          gold: { 100: "#FFF9E5", 400: "#FFD166", 600: "#E6B800" },
          ivory: "#FDFCF7",
          charcoal: { 600: "#3A3A3A", 900: "#181818" },
          accent: "#E4572E", // Spanish red-orange accent
        },
      },
      fontFamily: {
        heading: ["Playfair Display", "ui-serif", "Georgia"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
