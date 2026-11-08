import type { Address } from "viem";
import { DEFAULT_PREFERENCE, getFeeToken, type FeeCurrencyToken, type StablecoinSymbol } from "./tokens.js";

export interface ResolveFeeCurrencyOptions {
  chainId: number | undefined;
  /** Pass the result of `isMiniPay()`. Outside MiniPay the wallet keeps its native gas currency. */
  miniPay: boolean;
  /** Token to pay gas with. Defaults to USDm. */
  symbol?: StablecoinSymbol;
}

/**
 * Returns the `feeCurrency` address to attach to a transaction, or
 * `undefined` to leave gas in CELO. MiniPay users typically hold no CELO,
 * so inside MiniPay gas is paid in a stablecoin.
 */
export function resolveFeeCurrency({ chainId, miniPay, symbol = "USDm" }: ResolveFeeCurrencyOptions): Address | undefined {
  if (!miniPay) return undefined;
  return getFeeToken(chainId, symbol)?.feeCurrencyAddress;
}

/**
 * Spreads `feeCurrency` into transaction params only when it is defined, so
 * the field is omitted entirely instead of being sent as `undefined`.
 */
export function withFeeCurrency<T extends object>(params: T, feeCurrency: Address | undefined): T & { feeCurrency?: Address } {
  return feeCurrency ? { ...params, feeCurrency } : params;
}

/** Scales a token amount to 18 decimals so balances of different tokens can be compared. */
export function normalizeTo18(amount: bigint, decimals: number): bigint {
  if (decimals === 18) return amount;
  if (decimals > 18) return amount / 10n ** BigInt(decimals - 18);
  return amount * 10n ** BigInt(18 - decimals);
}

export interface PickFeeTokenOptions {
  chainId: number | undefined;
  /** Raw balances in each token's own decimals. */
  balances: Partial<Record<StablecoinSymbol, bigint>>;
  /** Smallest balance, in 18-decimal units, worth paying gas from. */
  minBalance: bigint;
  /** Tried in order. Defaults to USDm, USDC, USDT, EURm. */
  preference?: readonly StablecoinSymbol[];
}

/** Picks the first preferred stablecoin whose balance covers `minBalance`. */
export function pickFeeToken({ chainId, balances, minBalance, preference = DEFAULT_PREFERENCE }: PickFeeTokenOptions): FeeCurrencyToken | undefined {
  for (const symbol of preference) {
    const token = getFeeToken(chainId, symbol);
    const balance = balances[symbol];
    if (token && balance !== undefined && normalizeTo18(balance, token.decimals) >= minBalance) return token;
  }
  return undefined;
}
