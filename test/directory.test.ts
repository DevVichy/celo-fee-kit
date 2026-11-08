import { describe, expect, it, vi } from "vitest";
import { FEE_CURRENCY_DIRECTORY, MAINNET_TOKENS, getAllowedFeeCurrencies, isFeeCurrencyAllowed } from "../src";

function mockClient(addresses: `0x${string}`[]) {
  return { readContract: vi.fn().mockResolvedValue(addresses) } as never;
}

describe("getAllowedFeeCurrencies", () => {
  it("reads getCurrencies from the FeeCurrencyDirectory", async () => {
    const readContract = vi.fn().mockResolvedValue([MAINNET_TOKENS.USDm.feeCurrencyAddress]);
    const result = await getAllowedFeeCurrencies({ readContract } as never);

    expect(result).toEqual([MAINNET_TOKENS.USDm.feeCurrencyAddress]);
    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({ address: FEE_CURRENCY_DIRECTORY, functionName: "getCurrencies" }),
    );
  });
});

describe("isFeeCurrencyAllowed", () => {
  it("matches addresses case-insensitively", async () => {
    const client = mockClient([MAINNET_TOKENS.USDT.feeCurrencyAddress]);
    const upper = MAINNET_TOKENS.USDT.feeCurrencyAddress.toUpperCase().replace("0X", "0x") as `0x${string}`;
    expect(await isFeeCurrencyAllowed(client, upper)).toBe(true);
  });

  it("is false for addresses not on the list", async () => {
    const client = mockClient([MAINNET_TOKENS.USDm.feeCurrencyAddress]);
    expect(await isFeeCurrencyAllowed(client, MAINNET_TOKENS.USDC.tokenAddress)).toBe(false);
  });
});
