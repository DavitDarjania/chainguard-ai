"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import FlagList from "@/components/FlagList";
import GridBackground from "@/components/GridBackground";
import InputBox from "@/components/InputBox";
import RiskGauge from "@/components/RiskGauge";
import ScanAnimation from "@/components/ScanAnimation";
import Shield from "@/components/Shield";
import type { AnalysisResult, AnalyzeResponse, RiskLevel } from "@/types";

const LEVEL_STYLES: Record<RiskLevel, string> = {
  SAFE: "border-neon-green/50 bg-neon-green/10 text-neon-green shadow-glowGreen",
  SUSPICIOUS: "border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow shadow-[0_0_24px_rgba(255,230,109,0.22)]",
  DANGER: "border-neon-red/60 bg-neon-red/10 text-neon-red shadow-glowRed"
};

function encodeShare(result: AnalysisResult): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(result))));
}

function decodeShare(payload: string): AnalysisResult | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(payload)))) as AnalysisResult;
  } catch {
    return null;
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(value));
}

function saveHistory(result: AnalysisResult) {
  const stored = window.localStorage.getItem("chainguard-history");
  const history = stored ? (JSON.parse(stored) as AnalysisResult[]) : [];
  const next = [result, ...history.filter((item) => item.id !== result.id && item.input !== result.input)].slice(0, 30);
  window.localStorage.setItem("chainguard-history", JSON.stringify(next));
}

function useTypedText(text: string, enabled: boolean) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    if (!enabled) {
      setVisible(text);
      return;
    }

    setVisible("");
    const words = text.split(/\s+/).filter(Boolean);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(words.slice(0, index).join(" "));
      if (index >= words.length) window.clearInterval(timer);
    }, 62);

    return () => window.clearInterval(timer);
  }, [enabled, text]);

  return visible;
}

function DataCell({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/22 p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/42">{label}</div>
      <div className="mt-2 break-words text-sm text-white/82">{value ?? "Unknown"}</div>
    </div>
  );
}

function DangerSound({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(110, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(55, context.currentTime + 0.45);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.48);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);

    return () => {
      oscillator.disconnect();
      gain.disconnect();
      void context.close();
    };
  }, [active]);

  return null;
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const sharedPayload = searchParams.get("share");
  const historyId = searchParams.get("id");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(query || sharedPayload || historyId));
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const typedExplanation = useTypedText(result?.explanation ?? "", Boolean(result));

  const shareUrl = useMemo(() => {
    if (!result || typeof window === "undefined") return "";
    return `${window.location.origin}/analyze?share=${encodeURIComponent(encodeShare(result))}`;
  }, [result]);

  useEffect(() => {
    async function load() {
      setError("");
      setResult(null);
      setLoading(true);

      if (sharedPayload) {
        const shared = decodeShare(sharedPayload);
        if (shared) {
          setResult(shared);
          saveHistory(shared);
        } else {
          setError("Shared result link is damaged or expired.");
        }
        setLoading(false);
        return;
      }

      if (historyId) {
        const stored = window.localStorage.getItem("chainguard-history");
        const history = stored ? (JSON.parse(stored) as AnalysisResult[]) : [];
        const match = history.find((item) => item.id === historyId);
        if (match) setResult(match);
        else setError("That local history item could not be found on this device.");
        setLoading(false);
        return;
      }

      if (!query) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const payload = (await response.json()) as AnalyzeResponse;

        if (!response.ok || !payload.result) {
          throw new Error(payload.error ?? "Analysis failed.");
        }

        setResult(payload.result);
        saveHistory(payload.result);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Analysis failed.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [historyId, query, sharedPayload]);

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  }

  return (
    <main className={`relative min-h-screen px-5 py-7 text-white ${result?.riskLevel === "DANGER" ? "danger-noise" : ""}`}>
      <GridBackground />
      <DangerSound active={soundEnabled && result?.riskLevel === "DANGER"} />
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Shield size="sm" />
          <span className="text-sm font-black uppercase tracking-[0.28em] text-neon-green">ChainGuard AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/history" className="text-xs uppercase tracking-[0.2em] text-white/58 hover:text-neon-cyan">
            History
          </Link>
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-white/58 hover:text-neon-green">
            New scan
          </Link>
        </div>
      </nav>

      <section className="mx-auto mt-10 max-w-7xl">
        <InputBox compact defaultValue={query} />

        {loading && <ScanAnimation />}

        {!loading && error && (
          <div className="glass-panel mx-auto mt-12 max-w-3xl rounded-lg border-neon-red/40 p-7 text-center shadow-glowRed">
            <div className="text-sm uppercase tracking-[0.28em] text-neon-red">Analysis error</div>
            <p className="mt-4 text-white/72">{error}</p>
          </div>
        )}

        {!loading && !error && result && (
          <motion.div
            className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <aside className="glass-panel rounded-lg p-6">
              <RiskGauge score={result.riskScore} level={result.riskLevel} />
              <div className={`mx-auto mt-5 w-fit rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.24em] ${LEVEL_STYLES[result.riskLevel]}`}>
                {result.riskLevel}
              </div>
              <div className="mt-7 space-y-3 text-sm text-white/62">
                <div className="break-all text-white/86">{result.input}</div>
                <div className="uppercase tracking-[0.2em] text-neon-cyan">{result.inputType}</div>
              </div>
              <div className="mt-7 flex flex-col gap-3">
                <button
                  onClick={copyShareUrl}
                  className="rounded-md border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neon-cyan transition hover:bg-neon-cyan hover:text-black"
                >
                  {shareCopied ? "Copied" : "Share Result"}
                </button>
                <label className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.035] px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/62">
                  Danger audio
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-neon-red"
                    checked={soundEnabled}
                    onChange={(event) => setSoundEnabled(event.target.checked)}
                  />
                </label>
              </div>
            </aside>

            <div className="space-y-6">
              <section className="glass-panel rounded-lg p-6">
                <h2 className="text-sm uppercase tracking-[0.28em] text-neon-green">AI explanation</h2>
                <p className="mt-5 min-h-28 text-base leading-8 text-white/78">
                  {typedExplanation}
                  <span className="animate-typeCursor text-neon-green">_</span>
                </p>
              </section>

              <section className="glass-panel rounded-lg p-6">
                <h2 className="text-sm uppercase tracking-[0.28em] text-neon-cyan">On-chain data</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <DataCell label="Balance" value={result.onChainData.balanceEth ? `${result.onChainData.balanceEth} ETH` : null} />
                  <DataCell label="Age" value={formatDate(result.onChainData.firstTransactionAt)} />
                  <DataCell label="Transactions" value={result.onChainData.transactionCount} />
                  <DataCell label="Token holders" value={result.onChainData.tokenHolders} />
                  <DataCell label="Token" value={result.onChainData.tokenSymbol || result.onChainData.tokenName} />
                  <DataCell label="Supply" value={result.onChainData.tokenSupply} />
                  <DataCell label="Price" value={result.onChainData.tokenPriceUsd ? `$${result.onChainData.tokenPriceUsd}` : null} />
                  <DataCell label="Liquidity" value={result.onChainData.liquidityUsd ? `$${Math.round(result.onChainData.liquidityUsd).toLocaleString()}` : null} />
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-2">
                <FlagList title="Red flags" tone="red" items={result.redFlags} />
                <FlagList title="Green flags" tone="green" items={result.greenFlags} />
              </div>

              <section className={`rounded-lg border p-6 ${LEVEL_STYLES[result.riskLevel]}`}>
                <div className="text-xs uppercase tracking-[0.28em]">Verdict</div>
                <div className="mt-3 text-lg font-black leading-8">{result.verdict.replace(/\*\*/g, "")}</div>
              </section>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<ScanAnimation />}>
      <AnalyzeContent />
    </Suspense>
  );
}
