import type { OnChainData } from "@/types";

const ETHERSCAN_BASE_URL = "https://api.etherscan.io/v2/api";

type EtherscanResponse<T> = {
  status: string;
  message: string;
  result: T;
};

type EtherscanTx = {
  timeStamp: string;
};

type ContractSource = {
  SourceCode: string;
  ContractName: string;
  ABI: string;
};

type TransactionWindow = {
  sampleCount: number;
  firstTransactionAt: string | null;
  lastTransactionAt: string | null;
};

const KNOWN_SCAM_ADDRESSES = new Map<string, string>([
  ["0x000000000000000000000000000000000000dead", "Known burn/scam sink frequently used in deceptive token flows"]
]);

function getApiKey(): string | undefined {
  return process.env.ETHERSCAN_API_KEY;
}

function isRateLimitMessage(message: string): boolean {
  return /rate limit|max calls per sec|too many requests/i.test(message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function etherscanFetch<T>(params: Record<string, string>, attempt = 1): Promise<T> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("ETHERSCAN_API_KEY is not configured");
  }

  const url = new URL(ETHERSCAN_BASE_URL);
  Object.entries({ chainid: "1", ...params, apikey: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, { next: { revalidate: 30 } });

  if (!response.ok) {
    if ((response.status === 429 || response.status >= 500) && attempt < 4) {
      await delay(900 * attempt);
      return etherscanFetch<T>(params, attempt + 1);
    }

    throw new Error(`Etherscan request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as EtherscanResponse<T>;

  if (payload.status === "0" && payload.message !== "No transactions found") {
    const message = typeof payload.result === "string" ? payload.result : payload.message;

    if (isRateLimitMessage(message) && attempt < 4) {
      await delay(900 * attempt);
      return etherscanFetch<T>(params, attempt + 1);
    }

    throw new Error(message);
  }

  return payload.result;
}

export async function getAccountBalance(address: string): Promise<string> {
  const wei = await etherscanFetch<string>({
    module: "account",
    action: "balance",
    address,
    tag: "latest"
  });

  const eth = Number(wei) / 1e18;
  return Number.isFinite(eth) ? eth.toFixed(5) : "0.00000";
}

export async function getTransactions(address: string): Promise<EtherscanTx[]> {
  const result = await etherscanFetch<EtherscanTx[] | string>({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: "10000",
    sort: "asc"
  });

  return Array.isArray(result) ? result : [];
}

async function getTransactionPage(address: string, sort: "asc" | "desc", offset: string): Promise<EtherscanTx[]> {
  const result = await etherscanFetch<EtherscanTx[] | string>({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset,
    sort
  });

  return Array.isArray(result) ? result : [];
}

export async function getTransactionWindow(address: string): Promise<TransactionWindow> {
  const firstPage = await getTransactionPage(address, "asc", "1");
  await delay(750);
  const latestPage = await getTransactionPage(address, "desc", "10000");
  const latestTransaction = latestPage[0];

  return {
    sampleCount: latestPage.length,
    firstTransactionAt: firstPage[0] ? new Date(Number(firstPage[0].timeStamp) * 1000).toISOString() : null,
    lastTransactionAt: latestTransaction ? new Date(Number(latestTransaction.timeStamp) * 1000).toISOString() : null
  };
}

export async function getContractSource(address: string): Promise<ContractSource | null> {
  const result = await etherscanFetch<ContractSource[]>({
    module: "contract",
    action: "getsourcecode",
    address
  });

  return result[0] ?? null;
}

export async function getContractBytecode(address: string): Promise<string> {
  return etherscanFetch<string>({
    module: "proxy",
    action: "eth_getCode",
    address,
    tag: "latest"
  });
}

export async function collectEtherscanData(address: string): Promise<Partial<OnChainData>> {
  const warnings: string[] = [];
  const scamDatabaseHits: string[] = [];

  const balanceResult = await Promise.resolve(getAccountBalance(address)).then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason })
  );
  await delay(750);
  const txResult = await Promise.resolve(getTransactionWindow(address)).then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason })
  );
  await delay(750);
  const bytecodeResult = await Promise.resolve(getContractBytecode(address)).then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason })
  );
  await delay(750);
  const contractResult = await Promise.resolve(getContractSource(address)).then(
    (value) => ({ status: "fulfilled" as const, value }),
    (reason) => ({ status: "rejected" as const, reason })
  );

  const lowerAddress = address.toLowerCase();
  const knownHit = KNOWN_SCAM_ADDRESSES.get(lowerAddress);

  if (knownHit) scamDatabaseHits.push(knownHit);

  if (balanceResult.status === "rejected") warnings.push(balanceResult.reason.message);
  if (txResult.status === "rejected") warnings.push(txResult.reason.message);
  if (contractResult.status === "rejected") warnings.push(contractResult.reason.message);
  if (bytecodeResult.status === "rejected") warnings.push(bytecodeResult.reason.message);

  const transactionWindow = txResult.status === "fulfilled" ? txResult.value : null;
  const contract = contractResult.status === "fulfilled" ? contractResult.value : null;
  const bytecode = bytecodeResult.status === "fulfilled" ? bytecodeResult.value : "0x";
  const hasCode = Boolean(bytecode && bytecode !== "0x");
  const verified = Boolean(contract?.SourceCode && contract.SourceCode.trim().length > 0);

  return {
    normalizedAddress: address,
    balanceEth: balanceResult.status === "fulfilled" ? balanceResult.value : undefined,
    transactionCount: transactionWindow?.sampleCount,
    firstTransactionAt: transactionWindow?.firstTransactionAt ?? null,
    lastTransactionAt: transactionWindow?.lastTransactionAt ?? null,
    contractVerified: hasCode ? verified : null,
    contractName: contract?.ContractName || null,
    scamDatabaseHits,
    warnings
  };
}
