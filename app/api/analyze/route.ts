import { NextResponse } from "next/server";
import { analyzeWithOpenAI } from "@/lib/openai";
import { detectInputType, isEthAddress } from "@/lib/detectInputType";
import { collectEtherscanData } from "@/lib/etherscan";
import { collectMoralisData } from "@/lib/moralis";
import type { AnalysisResult, AnalyzeRequest, AnalyzeResponse, OnChainData } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createResultId(input: string): string {
  const clean = input.trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < clean.length; index += 1) {
    hash = (hash << 5) - hash + clean.charCodeAt(index);
    hash |= 0;
  }

  return `cg_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}

function mergeWarnings(...warningSets: Array<string[] | undefined>): string[] {
  return Array.from(new Set(warningSets.flatMap((warnings) => warnings ?? []).filter(Boolean)));
}

export async function POST(request: Request): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json({ error: "Enter a wallet, contract address, token name, or token symbol." }, { status: 400 });
    }

    const detectedType = detectInputType(query);

    if (detectedType === "unknown") {
      return NextResponse.json(
        { error: "ChainGuard could not recognize that input. Try an Ethereum address or token symbol." },
        { status: 400 }
      );
    }

    const baseData: OnChainData = {
      input: query,
      inputType: detectedType,
      scamDatabaseHits: [],
      warnings: []
    };

    let etherscanData: Partial<OnChainData> = {};
    let moralisData: Partial<OnChainData> = {};

    if (isEthAddress(query)) {
      etherscanData = await collectEtherscanData(query);
      moralisData = await collectMoralisData(query, query);
    } else {
      moralisData = await collectMoralisData(query);

      if (moralisData.normalizedAddress && isEthAddress(moralisData.normalizedAddress)) {
        etherscanData = await collectEtherscanData(moralisData.normalizedAddress);
      }
    }

    const inferredType = etherscanData.contractVerified !== null && etherscanData.contractVerified !== undefined ? "contract" : detectedType;

    const onChainData: OnChainData = {
      ...baseData,
      ...etherscanData,
      ...moralisData,
      inputType: inferredType,
      scamDatabaseHits: Array.from(
        new Set([...(etherscanData.scamDatabaseHits ?? []), ...(moralisData.scamDatabaseHits ?? [])])
      ),
      warnings: mergeWarnings(baseData.warnings, etherscanData.warnings, moralisData.warnings)
    };

    const ai = await analyzeWithOpenAI(onChainData);
    const result: AnalysisResult = {
      id: createResultId(query),
      input: query,
      inputType: onChainData.inputType,
      createdAt: new Date().toISOString(),
      ...ai,
      onChainData
    };

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ChainGuard analysis failed. Please retry with a different wallet, token, or contract."
      },
      { status: 500 }
    );
  }
}
