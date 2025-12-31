import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blueprint palette
        bp: {
          deep: "var(--color-bg-deep)",
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          elevated: "var(--color-bg-elevated)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          annotation: "var(--color-text-annotation)",
        },
        cyan: {
          DEFAULT: "var(--color-cyan)",
          glow: "var(--color-cyan-glow)",
          muted: "var(--color-cyan-muted)",
        },
        orange: {
          DEFAULT: "var(--color-orange)",
          muted: "var(--color-orange-muted)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
          dashed: "var(--color-border-dashed)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "monospace"],
        annotation: ["var(--font-annotation)", "cursive"],
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
      },
      boxShadow: {
        glow: "0 0 20px var(--color-cyan-glow)",
        "glow-lg": "0 0 40px var(--color-cyan-glow)",
      },
    },
  },
  plugins: [],
};

export default config;
