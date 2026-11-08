import { describe, expect, it } from "vitest";
import {
  CELO_MAINNET_ID,
  MAINNET_TOKENS,
  normalizeTo18,
  pickFeeToken,
  resolveFeeCurrency,
  withFeeCurrency,
} from "../src";

describe("resolveFeeCurrency", () => {
  it("returns undefined outside MiniPay", () => {
    expect(resolveFeeCurrency({ chainId: CELO_MAINNET_ID, miniPay: false })).toBeUndefined();
  });

  it("defaults to USDm inside MiniPay on mainnet", () => {
    expect(resolveFeeCurrency({ chainId: CELO_MAINNET_ID, miniPay: true })).toBe(MAINNET_TOKENS.USDm.feeCurrencyAddress);
  });

  it("uses the adapter address, not the token address, for USDC and USDT", () => {
    for (const symbol of ["USDC", "USDT"] as const) {
      const result = resolveFeeCurrency({ chainId: CELO_MAINNET_ID, miniPay: true, symbol });
      expect(result).toBe(MAINNET_TOKENS[symbol].feeCurrencyAddress);
      expect(result?.toLowerCase()).not.toBe(MAINNET_TOKENS[symbol].tokenAddress.toLowerCase());
    }
  });

  it("returns undefined on unknown or missing chains", () => {
    expect(resolveFeeCurrency({ chainId: 1, miniPay: true })).toBeUndefined();
    expect(resolveFeeCurrency({ chainId: undefined, miniPay: true })).toBeUndefined();
  });
});

describe("withFeeCurrency", () => {
  it("adds feeCurrency when defined", () => {
    const addr = MAINNET_TOKENS.USDm.feeCurrencyAddress;
    expect(withFeeCurrency({ functionName: "stake" }, addr)).toEqual({ functionName: "stake", feeCurrency: addr });
  });

  it("omits the key entirely when undefined", () => {
    const result = withFeeCurrency({ functionName: "stake" }, undefined);
    expect(result).toEqual({ functionName: "stake" });
    expect("feeCurrency" in result).toBe(false);
  });
});

describe("normalizeTo18", () => {
  it("leaves 18-decimal amounts alone", () => {
    expect(normalizeTo18(5n * 10n ** 18n, 18)).toBe(5n * 10n ** 18n);
  });

  it("scales 6-decimal amounts up", () => {
    expect(normalizeTo18(1_000_000n, 6)).toBe(10n ** 18n);
  });

  it("scales higher-decimal amounts down", () => {
    expect(normalizeTo18(10n ** 24n, 24)).toBe(10n ** 18n);
  });
});

describe("pickFeeToken", () => {
  const oneDollar = 10n ** 18n;

  it("picks the first preferred token with enough balance", () => {
    const token = pickFeeToken({
      chainId: CELO_MAINNET_ID,
      balances: { USDm: 0n, USDC: 2_000_000n },
      minBalance: oneDollar,
    });
    expect(token?.symbol).toBe("USDC");
  });

  it("compares across decimals correctly", () => {
    const token = pickFeeToken({
      chainId: CELO_MAINNET_ID,
      balances: { USDC: 999_999n },
      minBalance: oneDollar,
    });
    expect(token).toBeUndefined();
  });

  it("respects a custom preference order", () => {
    const token = pickFeeToken({
      chainId: CELO_MAINNET_ID,
      balances: { USDm: 5n * oneDollar, USDT: 5_000_000n },
      minBalance: oneDollar,
      preference: ["USDT", "USDm"],
    });
    expect(token?.symbol).toBe("USDT");
  });

  it("returns undefined on unknown chains", () => {
    expect(pickFeeToken({ chainId: 1, balances: { USDm: 10n * oneDollar }, minBalance: oneDollar })).toBeUndefined();
  });
});
