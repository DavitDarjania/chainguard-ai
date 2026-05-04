"use client";

import { motion } from "framer-motion";

export default function GridBackground() {
  const particles = Array.from({ length: 26 }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${(index * 53) % 100}%`,
    delay: (index % 9) * 0.33
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -inset-[42px] animate-gridShift bg-[linear-gradient(rgba(0,255,136,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(10,10,15,0.5)_48%,#0a0a0f_88%)]" />
      <div className="absolute left-0 top-0 h-32 w-full animate-scanline bg-gradient-to-b from-transparent via-neon-cyan/10 to-transparent" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-neon-cyan shadow-glowCyan"
          style={{ left: particle.left, top: particle.top }}
          animate={{ y: [-8, 18, -8], opacity: [0.15, 0.8, 0.15], scale: [1, 1.8, 1] }}
          transition={{ duration: 5 + (particle.id % 5), repeat: Infinity, delay: particle.delay }}
        />
      ))}
    </div>
  );
}
