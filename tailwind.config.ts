import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#f9f7f3",
        foreground: "#1f2937",
        accent: "#ef7d47"
      }
    }
  },
  plugins: []
};

export default config;
