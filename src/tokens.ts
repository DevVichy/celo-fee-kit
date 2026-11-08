import type { Address } from "viem";

export const CELO_MAINNET_ID = 42220;

export type StablecoinSymbol = "USDm" | "EURm" | "USDC" | "USDT";

export interface FeeCurrencyToken {
  symbol: StablecoinSymbol;
  decimals: number;
  /** ERC-20 token address. */
  tokenAddress: Address;
  /**
   * Address to pass in a transaction's `feeCurrency` field (CIP-64).
   * For USDC and USDT this is a 6 -> 18 decimal adapter, NOT the token
   * address. Passing the token address there makes the transaction fail.
   */
  feeCurrencyAddress: Address;
}

/** Stablecoins usable for gas on Celo Mainnet. */
export const MAINNET_TOKENS: Readonly<Record<StablecoinSymbol, FeeCurrencyToken>> = {
  USDm: {
    symbol: "USDm",
    decimals: 18,
    tokenAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    feeCurrencyAddress: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  },
  EURm: {
    symbol: "EURm",
    decimals: 18,
    tokenAddress: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    feeCurrencyAddress: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  },
  USDC: {
    symbol: "USDC",
    decimals: 6,
    tokenAddress: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    feeCurrencyAddress: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  },
  USDT: {
    symbol: "USDT",
    decimals: 6,
    tokenAddress: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    feeCurrencyAddress: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72",
  },
};

/** On-chain allowlist of fee currencies. The live source of truth beyond the table above. */
export const FEE_CURRENCY_DIRECTORY: Address = "0x15F344b9E6c3Cb6F0376A36A64928b13F62C6276";

/** Default order used when picking a token to pay gas with. */
export const DEFAULT_PREFERENCE: readonly StablecoinSymbol[] = ["USDm", "USDC", "USDT", "EURm"];

/**
 * Looks up a fee-currency token. Returns `undefined` on chains without a
 * known table (only Celo Mainnet is bundled; verify testnet addresses
 * yourself before adding them).
 */
export function getFeeToken(chainId: number | undefined, symbol: StablecoinSymbol): FeeCurrencyToken | undefined {
  return chainId === CELO_MAINNET_ID ? MAINNET_TOKENS[symbol] : undefined;
}
