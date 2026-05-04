"use client";

import { motion } from "framer-motion";
import type { RiskLevel } from "@/types";

type RiskGaugeProps = {
  score: number;
  level: RiskLevel;
};

const LEVEL_COLORS: Record<RiskLevel, string> = {
  SAFE: "#00ff88",
  SUSPICIOUS: "#ffe66d",
  DANGER: "#ff3355"
};

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = LEVEL_COLORS[level];

  return (
    <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.25, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 14px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          className="text-5xl font-black"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ color }}
        >
          {score}
        </motion.div>
        <div className="mt-1 text-xs uppercase tracking-[0.34em] text-white/52">Risk</div>
      </div>
    </div>
  );
}
