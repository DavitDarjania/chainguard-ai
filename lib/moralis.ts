import type { OnChainData } from "@/types";

const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2";

type MoralisMetadata = {
  address: string;
  name: string;
  symbol: string;
  total_supply_formatted?: string;
};

type MoralisPrice = {
  usdPrice?: number;
  liquidityUsd?: number;
};

async function moralisFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    throw new Error("MORALIS_API_KEY is not configured");
  }

  const url = new URL(`${MORALIS_BASE_URL}${path}`);
  url.searchParams.set("chain", "eth");

  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-Key": apiKey
    },
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error(`Moralis request failed with HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function searchToken(query: string): Promise<MoralisMetadata | null> {
  const response = await moralisFetch<{ result?: MoralisMetadata[] }>("/erc20/metadata/symbols", {
    symbols: query.toUpperCase()
  });

  return response.result?.[0] ?? null;
}

export async function getTokenMetadata(address: string): Promise<MoralisMetadata | null> {
  const response = await moralisFetch<MoralisMetadata[]>("/erc20/metadata", {
    addresses: address
  });

  return response[0] ?? null;
}

export async function getTokenPrice(address: string): Promise<MoralisPrice | null> {
  return moralisFetch<MoralisPrice>(`/erc20/${address}/price`).catch(() => null);
}

export async function getTokenHolders(address: string): Promise<number | null> {
  const response = await moralisFetch<{ total?: number }>(`/erc20/${address}/owners`, {
    limit: "1"
  }).catch(() => null);

  return response?.total ?? null;
}

export async function collectMoralisData(input: string, address?: string): Promise<Partial<OnChainData>> {
  const warnings: string[] = [];

  try {
    const metadata = address ? await getTokenMetadata(address) : await searchToken(input);
    const tokenAddress = address ?? metadata?.address;

    if (!metadata || !tokenAddress) {
      return { warnings: [`Moralis could not resolve token metadata for "${input}"`] };
    }

    const [price, holders] = await Promise.all([getTokenPrice(tokenAddress), getTokenHolders(tokenAddress)]);

    return {
      normalizedAddress: tokenAddress,
      tokenName: metadata.name,
      tokenSymbol: metadata.symbol,
      tokenSupply: metadata.total_supply_formatted ?? null,
      tokenHolders: holders,
      tokenPriceUsd: price?.usdPrice ?? null,
      liquidityUsd: price?.liquidityUsd ?? null,
      warnings
    };
  } catch (error) {
    return {
      warnings: [error instanceof Error ? error.message : "Moralis request failed"]
    };
  }
}
