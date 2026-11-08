import { parseAbi, type Address, type PublicClient } from "viem";
import { FEE_CURRENCY_DIRECTORY } from "./tokens.js";

export const feeCurrencyDirectoryAbi = parseAbi(["function getCurrencies() view returns (address[])"]);

/** Reads the live list of accepted fee currencies from the on-chain FeeCurrencyDirectory. */
export async function getAllowedFeeCurrencies(client: Pick<PublicClient, "readContract">): Promise<readonly Address[]> {
  return client.readContract({
    address: FEE_CURRENCY_DIRECTORY,
    abi: feeCurrencyDirectoryAbi,
    functionName: "getCurrencies",
  });
}

/** True when `feeCurrency` is currently accepted on-chain. Address comparison ignores case. */
export async function isFeeCurrencyAllowed(client: Pick<PublicClient, "readContract">, feeCurrency: Address): Promise<boolean> {
  const allowed = await getAllowedFeeCurrencies(client);
  const target = feeCurrency.toLowerCase();
  return allowed.some((a) => a.toLowerCase() === target);
}
