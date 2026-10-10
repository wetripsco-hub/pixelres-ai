// Tailwind v3 (matches package.json). The old file pointed at "@tailwindcss/postcss",
// which is not installed, and clashed with postcss.config.js.
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
