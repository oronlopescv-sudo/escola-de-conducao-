/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asfalto: "#1B2430",
        "asfalto-2": "#242F3E",
        sinal: "#F7B500",
        faixa: "#F4F6F8",
        linha: "#E2E6EA",
        stop: "#D64541",
        verde: "#2E9E5B",
      },
      fontFamily: {
        display: ["'Fjalla One'", "sans-serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
