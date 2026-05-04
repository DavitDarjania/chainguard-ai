"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GridBackground from "@/components/GridBackground";
import Shield from "@/components/Shield";
import type { AnalysisResult, RiskLevel } from "@/types";

const ROW_STYLES: Record<RiskLevel, string> = {
  SAFE: "border-neon-green/20 text-neon-green",
  SUSPICIOUS: "border-neon-yellow/20 text-neon-yellow",
  DANGER: "border-neon-red/25 text-neon-red"
};

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("chainguard-history");
    setHistory(stored ? (JSON.parse(stored) as AnalysisResult[]) : []);
  }, []);

  function clearHistory() {
    window.localStorage.removeItem("chainguard-history");
    setHistory([]);
  }

  return (
    <main className="relative min-h-screen px-5 py-7 text-white">
      <GridBackground />
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Shield size="sm" />
          <span className="text-sm font-black uppercase tracking-[0.28em] text-neon-green">ChainGuard AI</span>
        </Link>
        <Link href="/" className="text-xs uppercase tracking-[0.2em] text-white/58 hover:text-neon-green">
          New scan
        </Link>
      </nav>

      <section className="mx-auto mt-12 max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="neon-text text-3xl font-black sm:text-5xl">Analysis History</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              Local scan archive stored in this browser. Select any row to reopen the full result.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="rounded-md border border-neon-red/35 bg-neon-red/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neon-red transition hover:bg-neon-red hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        <div className="glass-panel mt-8 overflow-hidden rounded-lg">
          {history.length === 0 ? (
            <div className="p-10 text-center text-white/58">
              No scans yet. Run an address, token, or contract through ChainGuard to populate this table.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.035] text-xs uppercase tracking-[0.18em] text-white/42">
                  <tr>
                    <th className="px-5 py-4">Target</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Risk</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Scanned</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      className={`border-b bg-black/10 transition hover:bg-white/[0.055] ${ROW_STYLES[item.riskLevel]}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <td className="px-5 py-4">
                        <Link href={`/analyze?id=${encodeURIComponent(item.id)}`} className="block max-w-[360px] truncate text-white/84 hover:text-neon-cyan">
                          {item.input}
                        </Link>
                      </td>
                      <td className="px-5 py-4 uppercase tracking-[0.16em] text-white/52">{item.inputType}</td>
                      <td className="px-5 py-4 font-black">{item.riskLevel}</td>
                      <td className="px-5 py-4 text-white/76">{item.riskScore}/100</td>
                      <td className="px-5 py-4 text-white/52">{new Date(item.createdAt).toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
