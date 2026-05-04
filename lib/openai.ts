import OpenAI from "openai";
import type { AnalysisResult, OnChainData, RiskLevel } from "@/types";

type AiAnalysis = Pick<
  AnalysisResult,
  "riskScore" | "riskLevel" | "redFlags" | "greenFlags" | "explanation" | "verdict"
>;

const SYSTEM_PROMPT =
  "You are a crypto security expert. Analyze the following blockchain data and determine if this wallet/contract/token is safe, suspicious, or a scam. Look for: unverified contracts, honeypot patterns, rug pull signals, abnormal transaction patterns, anonymous deployers, locked/unlocked liquidity, concentration of holdings. Return a JSON object with: { riskScore: number (0-100), riskLevel: 'SAFE'|'SUSPICIOUS'|'DANGER', redFlags: string[], greenFlags: string[], explanation: string (plain English, 3-4 sentences), verdict: string (one bold sentence recommendation) }";

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey ? new OpenAI({ apiKey }) : null;
}

function clampRiskScore(value: unknown): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 50;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeRiskLevel(value: unknown, score: number): RiskLevel {
  if (value === "SAFE" || value === "SUSPICIOUS" || value === "DANGER") return value;
  if (score >= 75) return "DANGER";
  if (score >= 40) return "SUSPICIOUS";
  return "SAFE";
}

function isProviderWarning(value: string): boolean {
  return /rate limit|max calls per sec|too many requests|provider|api key/i.test(value);
}

function parseOpenAiJson(text: string): AiAnalysis {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? text) as Partial<AiAnalysis>;
  const riskScore = clampRiskScore(parsed.riskScore);
  const riskLevel = normalizeRiskLevel(parsed.riskLevel, riskScore);

  return {
    riskScore,
    riskLevel,
    redFlags: Array.isArray(parsed.redFlags)
      ? parsed.redFlags.filter((flag) => typeof flag === "string" && !isProviderWarning(flag)).slice(0, 8)
      : [],
    greenFlags: Array.isArray(parsed.greenFlags) ? parsed.greenFlags.slice(0, 8) : [],
    explanation:
      typeof parsed.explanation === "string"
        ? parsed.explanation
        : "ChainGuard completed the scan, but the AI explanation could not be parsed cleanly.",
    verdict: typeof parsed.verdict === "string" ? parsed.verdict : "**Review manually before interacting.**"
  };
}

function heuristicAnalysis(data: OnChainData): AiAnalysis {
  let riskScore = 22;
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  if (data.contractVerified === false) {
    riskScore += 32;
    redFlags.push("Contract source code is not verified on Etherscan.");
  }

  if (data.scamDatabaseHits.length > 0) {
    riskScore += 45;
    redFlags.push(...data.scamDatabaseHits);
  }

  if ((data.transactionCount ?? 0) < 5) {
    riskScore += 14;
    redFlags.push("Very low transaction history makes behavior hard to validate.");
  } else {
    greenFlags.push("Address has observable transaction history.");
  }

  if (data.tokenHolders !== null && data.tokenHolders !== undefined) {
    if (data.tokenHolders < 100) {
      riskScore += 16;
      redFlags.push("Token holder count is low, suggesting concentrated ownership risk.");
    } else {
      greenFlags.push("Token has a meaningful holder base.");
    }
  }

  if ((data.liquidityUsd ?? 0) > 25000) greenFlags.push("Detected measurable token liquidity.");
  if (data.contractVerified === true) greenFlags.push("Contract source appears verified.");
  if (!data.warnings.length) greenFlags.push("Primary data providers responded successfully.");

  const score = clampRiskScore(riskScore);
  const riskLevel = normalizeRiskLevel(undefined, score);

  return {
    riskScore: score,
    riskLevel,
    redFlags: redFlags.length ? redFlags : ["No severe automated red flags were detected."],
    greenFlags: greenFlags.length ? greenFlags : ["No strong positive signals were available from public data."],
    explanation:
      "ChainGuard used deterministic fallback analysis because OpenAI is not configured or returned unavailable data. The scan weighs contract verification, transaction age, known scam hits, token liquidity, and holder distribution. Treat this as a fast triage result, not a complete audit.",
    verdict:
      riskLevel === "DANGER"
        ? "**Do not interact until a human security review clears this asset.**"
        : riskLevel === "SUSPICIOUS"
          ? "**Proceed only with a small test transaction and further manual review.**"
          : "**No major automated warnings found, but keep normal wallet hygiene.**"
  };
}

export async function analyzeWithOpenAI(data: OnChainData): Promise<AiAnalysis> {
  const client = getClient();

  if (!client) return heuristicAnalysis(data);

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Analyze this blockchain intelligence packet:\n${JSON.stringify(data, null, 2)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message.content?.trim() ?? "";

    return parseOpenAiJson(text);
  } catch {
    return heuristicAnalysis(data);
  }
}
