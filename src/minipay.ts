/** True when running inside the MiniPay in-app browser. Safe to call during SSR. */
export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  const ethereum = (window as { ethereum?: { isMiniPay?: boolean } }).ethereum;
  return ethereum?.isMiniPay === true;
}
