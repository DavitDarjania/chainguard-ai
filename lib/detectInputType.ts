import type { InputType } from "@/types";

const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function isEthAddress(value: string): boolean {
  return ETH_ADDRESS_PATTERN.test(value.trim());
}

export function detectInputType(value: string): InputType {
  const trimmed = value.trim();

  if (!trimmed) return "unknown";
  if (isEthAddress(trimmed)) return "wallet";
  if (/^[a-zA-Z0-9 ._-]{2,64}$/.test(trimmed)) return "token";

  return "unknown";
}

export function labelInputType(type: InputType): string {
  const labels: Record<InputType, string> = {
    wallet: "ETH wallet",
    contract: "Smart contract",
    token: "Token lookup",
    unknown: "Unknown input"
  };

  return labels[type];
}
