import { describe, expect, it } from "vitest"
import { walletBalanceLevel, worstWalletLevel } from "./wallet-balance"

describe("walletBalanceLevel", () => {
  it("marks depleted at zero or below", () => {
    expect(walletBalanceLevel(0, 5)).toBe("depleted")
    expect(walletBalanceLevel(-0.01, 5)).toBe("depleted")
  })

  it("marks low when under dollar threshold", () => {
    expect(walletBalanceLevel(1.2, 5)).toBe("low")
    expect(walletBalanceLevel(2, 5)).toBe("healthy")
  })

  it("marks low when under fraction of prepaid", () => {
    expect(walletBalanceLevel(1, 10)).toBe("low")
    expect(walletBalanceLevel(3, 10)).toBe("healthy")
  })
})

describe("worstWalletLevel", () => {
  it("returns worst across rows", () => {
    expect(
      worstWalletLevel([
        { available_usd: 4, balance_usd: 5 },
        { available_usd: 0.5, balance_usd: 5 },
      ])
    ).toBe("low")
    expect(
      worstWalletLevel([
        { available_usd: 4, balance_usd: 5 },
        { available_usd: 0, balance_usd: 5 },
      ])
    ).toBe("depleted")
  })
})
