import { afterEach, describe, expect, it, vi } from "vitest";
import { isMiniPay } from "../src";

describe("isMiniPay", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is false without a window (SSR)", () => {
    expect(isMiniPay()).toBe(false);
  });

  it("is false without window.ethereum", () => {
    vi.stubGlobal("window", {});
    expect(isMiniPay()).toBe(false);
  });

  it("is false when isMiniPay is not set", () => {
    vi.stubGlobal("window", { ethereum: {} });
    expect(isMiniPay()).toBe(false);
  });

  it("is true when window.ethereum.isMiniPay is true", () => {
    vi.stubGlobal("window", { ethereum: { isMiniPay: true } });
    expect(isMiniPay()).toBe(true);
  });
});
