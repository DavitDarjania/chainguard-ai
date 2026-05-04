"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GridBackground from "@/components/GridBackground";
import InputBox from "@/components/InputBox";
import Shield from "@/components/Shield";

const stats = [
  { value: "10,432", label: "scams detected" },
  { value: "99.2%", label: "accuracy" },
  { value: "< 3s", label: "analysis" }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-7 text-white">
      <GridBackground />
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Shield size="sm" />
          <span className="text-sm font-black uppercase tracking-[0.28em] text-neon-green">ChainGuard AI</span>
        </Link>
        <Link
          href="/history"
          className="rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-neon-cyan transition hover:border-neon-cyan hover:bg-neon-cyan/20"
        >
          History
        </Link>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col items-center justify-center pb-10 text-center">
        <div className="mb-8">
          <Shield />
        </div>
        <motion.h1
          className="neon-text max-w-5xl text-4xl font-black leading-tight tracking-normal sm:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Is it safe? Ask ChainGuard.
        </motion.h1>
        <motion.p
          className="mt-6 max-w-3xl text-base leading-8 text-white/68 sm:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          AI-powered scam detection for wallets, tokens & smart contracts
        </motion.p>

        <div className="mt-11 w-full">
          <InputBox />
        </div>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-panel rounded-lg px-5 py-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.1 }}
            >
              <div className="text-2xl font-black text-neon-green sm:text-3xl">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/48">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
