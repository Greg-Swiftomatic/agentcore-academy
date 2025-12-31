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
        // AWS color palette
        aws: {
          orange: "#FF9900",
          "orange-dark": "#EC7211",
          squid: "#232F3E",
          smile: "#252F3D",
        },
      },
    },
  },
  plugins: [],
};

export default config;
