"use client";

import { motion } from "framer-motion";

export default function ScanAnimation() {
  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center text-center">
      <div className="relative h-72 w-72">
        <div className="absolute inset-0 rounded-full border border-neon-green/30 shadow-glowGreen" />
        <div className="absolute inset-8 rounded-full border border-neon-cyan/20" />
        <div className="absolute inset-16 rounded-full border border-neon-green/20" />
        <div className="absolute left-1/2 top-0 h-1/2 w-[2px] origin-bottom animate-radar bg-gradient-to-t from-neon-green to-transparent shadow-glowGreen" />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(0,255,136,0.22),transparent_32%,transparent)] animate-radar" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-glowCyan"
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </div>
      <div className="mt-8 text-neon-green">
        <span>SCANNING CHAIN INTELLIGENCE</span>
        <span className="animate-typeCursor">_</span>
      </div>
      <div className="mt-3 max-w-lg text-sm leading-6 text-white/54">
        Querying on-chain telemetry, contract provenance, holder topology, liquidity pressure, and AI risk model.
      </div>
    </div>
  );
}
