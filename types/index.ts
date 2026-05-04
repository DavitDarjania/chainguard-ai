export type InputType = "wallet" | "contract" | "token" | "unknown";

export type RiskLevel = "SAFE" | "SUSPICIOUS" | "DANGER";

export type OnChainData = {
  input: string;
  inputType: InputType;
  normalizedAddress?: string;
  balanceEth?: string;
  transactionCount?: number;
  firstTransactionAt?: string | null;
  lastTransactionAt?: string | null;
  contractVerified?: boolean | null;
  contractName?: string | null;
  tokenName?: string | null;
  tokenSymbol?: string | null;
  tokenSupply?: string | null;
  tokenHolders?: number | null;
  tokenPriceUsd?: number | null;
  liquidityUsd?: number | null;
  scamDatabaseHits: string[];
  warnings: string[];
};

export type AnalysisResult = {
  id: string;
  input: string;
  inputType: InputType;
  createdAt: string;
  riskScore: number;
  riskLevel: RiskLevel;
  redFlags: string[];
  greenFlags: string[];
  explanation: string;
  verdict: string;
  onChainData: OnChainData;
};

export type AnalyzeRequest = {
  query: string;
};

export type AnalyzeResponse = {
  result?: AnalysisResult;
  error?: string;
};
