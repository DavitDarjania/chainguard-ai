import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        void: "#0a0a0f",
        neon: {
          green: "#00ff88",
          cyan: "#00d4ff",
          yellow: "#ffe66d",
          red: "#ff3355"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "ui-monospace", "monospace"]
      },
      boxShadow: {
        glowGreen: "0 0 24px rgba(0, 255, 136, 0.35)",
        glowCyan: "0 0 24px rgba(0, 212, 255, 0.32)",
        glowRed: "0 0 28px rgba(255, 51, 85, 0.38)"
      },
      keyframes: {
        gridShift: {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(42px, 42px, 0)" }
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.62" },
          "50%": { opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        typeCursor: {
          "0%, 45%": { opacity: "1" },
          "46%, 100%": { opacity: "0" }
        }
      },
      animation: {
        gridShift: "gridShift 18s linear infinite",
        scanline: "scanline 5s linear infinite",
        pulseGlow: "pulseGlow 2.8s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        radar: "radar 2.2s linear infinite",
        typeCursor: "typeCursor 0.9s step-end infinite"
      }
    }
  },
  plugins: []
};

export default config;
