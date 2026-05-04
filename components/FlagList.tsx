"use client";

import { motion } from "framer-motion";

type FlagListProps = {
  title: string;
  items: string[];
  tone: "red" | "green";
};

export default function FlagList({ title, items, tone }: FlagListProps) {
  const isRed = tone === "red";
  const colorClass = isRed ? "text-neon-red border-neon-red/30" : "text-neon-green border-neon-green/30";

  return (
    <div className="glass-panel rounded-lg p-5">
      <h3 className={`mb-4 border-b pb-3 text-sm uppercase tracking-[0.26em] ${colorClass}`}>{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            className="flex gap-3 rounded-md border border-white/8 bg-white/[0.035] p-3 text-sm leading-6 text-white/76"
            initial={{ opacity: 0, x: isRed ? -18 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12, duration: 0.35 }}
          >
            <span className={isRed ? "text-neon-red" : "text-neon-green"}>{isRed ? "!" : "+"}</span>
            <span>{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
