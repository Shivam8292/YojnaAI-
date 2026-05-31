/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary, #1a6b3c)",
          light: "var(--primary-light, #e8f5ee)",
        },
        accent: "var(--accent, #f5a623)",
        "text-primary": "var(--text-primary, #1a1a1a)",
        "text-secondary": "var(--text-secondary, #555555)",
        border: "var(--border, #e0e0e0)",
        error: "var(--error, #d32f2f)",
        success: "var(--success, #2e7d32)",
        background: "var(--background, #fafafa)",
        card: "var(--card-bg, #ffffff)",
      },
      fontFamily: {
        heading: ["'Noto Sans Devanagari'", "sans-serif"],
        body: ["'Noto Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
