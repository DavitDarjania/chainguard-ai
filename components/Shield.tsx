"use client";

import { motion } from "framer-motion";

type ShieldProps = {
  size?: "sm" | "lg";
};

export default function Shield({ size = "lg" }: ShieldProps) {
  const dimension = size === "lg" ? "h-20 w-20" : "h-11 w-11";

  return (
    <motion.div
      className={`${dimension} relative flex items-center justify-center`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55 }}
      aria-label="ChainGuard AI shield logo"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-neon-green/10 blur-xl"
        animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <svg viewBox="0 0 96 96" className="relative h-full w-full drop-shadow-[0_0_18px_rgba(0,255,136,0.65)]">
        <defs>
          <linearGradient id="shieldGradient" x1="12" x2="84" y1="8" y2="90">
            <stop stopColor="#00ff88" />
            <stop offset="1" stopColor="#00d4ff" />
          </linearGradient>
        </defs>
        <motion.path
          d="M48 8 78 20v22c0 20-12.8 36.7-30 46-17.2-9.3-30-26-30-46V20L48 8Z"
          fill="rgba(0, 255, 136, 0.07)"
          stroke="url(#shieldGradient)"
          strokeWidth="3"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.path
          d="M32 36h14V23m4 13h15m-33 14h12m8 0h12m-27 14h11v-9m8 9h14"
          fill="none"
          stroke="#00d4ff"
          strokeLinecap="round"
          strokeWidth="2.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.35 }}
        />
        {[32, 46, 64].map((x, index) => (
          <motion.circle
            key={x}
            cx={x}
            cy={[36, 50, 64][index]}
            r="3.2"
            fill="#00ff88"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.25 }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
