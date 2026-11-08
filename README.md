# celo-fee-kit

Small typed helpers for paying gas in stablecoins on [Celo](https://celo.org) ([CIP-64](https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md) fee abstraction) with [viem](https://viem.sh).

Extracted from [GemJar](https://github.com/DevVichy/GemJar), where MiniPay users hold stablecoins but no CELO and so pay network fees in USDm.

## Why

- **USDC and USDT need an adapter address.** Their `feeCurrency` is a 6 -> 18 decimal adapter, not the token address. Passing the token address makes the transaction fail. This package keeps both addresses side by side.
- **Gas currency depends on the wallet.** Inside MiniPay you want a stablecoin; elsewhere you want the wallet's default. `resolveFeeCurrency` encodes that.
- **The allowlist is on-chain.** `isFeeCurrencyAllowed` checks the live FeeCurrencyDirectory instead of trusting a hard-coded table.

## Install

Not yet published to npm. Install from GitHub:

```bash
npm install github:DevVichy/celo-fee-kit viem
```

## Usage

```ts
import { isMiniPay, resolveFeeCurrency, withFeeCurrency } from "celo-fee-kit";

const feeCurrency = resolveFeeCurrency({ chainId, miniPay: isMiniPay() });

await walletClient.writeContract(
  withFeeCurrency({ address, abi, functionName: "stake" }, feeCurrency),
);
```

Pick a token by balance:

```ts
import { pickFeeToken } from "celo-fee-kit";

const token = pickFeeToken({
  chainId,
  balances: { USDm: 0n, USDC: 2_500_000n }, // raw balances in each token's decimals
  minBalance: 10n ** 17n, // 0.10 in 18-decimal units
});
token?.feeCurrencyAddress;
```

Check the live allowlist:

```ts
import { isFeeCurrencyAllowed } from "celo-fee-kit";

await isFeeCurrencyAllowed(publicClient, token.feeCurrencyAddress);
```

## API

| Export | Purpose |
| --- | --- |
| `MAINNET_TOKENS`, `getFeeToken` | USDm, EURm, USDC, USDT with token and fee-currency addresses |
| `isMiniPay()` | Detects the MiniPay in-app browser, SSR-safe |
| `resolveFeeCurrency` | `feeCurrency` address for MiniPay, `undefined` elsewhere |
| `withFeeCurrency` | Adds `feeCurrency` to params only when defined |
| `pickFeeToken`, `normalizeTo18` | Choose a token by balance across different decimals |
| `getAllowedFeeCurrencies`, `isFeeCurrencyAllowed` | Read the on-chain FeeCurrencyDirectory |

Only Celo Mainnet addresses are bundled. Verify testnet addresses yourself before relying on them.

## Development

```bash
npm install
npm test
npm run build
```

## License

MIT
