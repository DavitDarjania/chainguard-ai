"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { detectInputType, labelInputType } from "@/lib/detectInputType";

type InputBoxProps = {
  compact?: boolean;
  defaultValue?: string;
};

export default function InputBox({ compact = false, defaultValue = "" }: InputBoxProps) {
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const inputType = useMemo(() => detectInputType(value), [value]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (!query || isSubmitting) return;
    setIsSubmitting(true);
    router.push(`/analyze?q=${encodeURIComponent(query)}`);
  }

  return (
    <motion.form
      onSubmit={submit}
      className={`glass-panel mx-auto flex w-full ${compact ? "max-w-3xl" : "max-w-4xl"} flex-col gap-3 rounded-lg p-3 shadow-glowGreen sm:flex-row`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="relative flex-1">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x... wallet / contract / token symbol"
          className="h-16 w-full rounded-md border border-neon-cyan/20 bg-black/35 px-5 pr-40 text-sm text-white outline-none transition focus:border-neon-green focus:shadow-glowGreen sm:text-base"
          spellCheck={false}
          aria-label="Wallet, contract, token name, or token symbol"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-neon-cyan/25 bg-neon-cyan/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-neon-cyan">
          {labelInputType(inputType)}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="flex h-16 items-center justify-center gap-3 rounded-md border border-neon-green/60 bg-neon-green px-7 text-sm font-black uppercase tracking-[0.2em] text-black shadow-glowGreen transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:border-neon-cyan/50 disabled:bg-neon-cyan disabled:hover:translate-y-0 disabled:hover:bg-neon-cyan"
      >
        {isSubmitting && (
          <span className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-[spin_0.75s_linear_infinite]" />
        )}
        {isSubmitting ? "Scanning" : "Analyze"}
      </button>
    </motion.form>
  );
}
