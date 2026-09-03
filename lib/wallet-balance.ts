/** UI thresholds for API prepaid wallet (available = prepaid − accrued usage). */

export type WalletBalanceLevel = "healthy" | "low" | "depleted"

/** USD remaining before we show a low-balance warning. */
export const WALLET_LOW_AVAILABLE_USD = 1.5

/** Fraction of prepaid left (available / prepaid) below which we warn, when prepaid > 0. */
export const WALLET_LOW_FRACTION = 0.25

export function walletBalanceLevel(availableUsd: number, prepaidUsd: number): WalletBalanceLevel {
  const available = Number(availableUsd)
  const prepaid = Number(prepaidUsd)
  if (!Number.isFinite(available) || available <= 0) return "depleted"
  if (available <= WALLET_LOW_AVAILABLE_USD) return "low"
  if (prepaid > 0 && available / prepaid <= WALLET_LOW_FRACTION) return "low"
  return "healthy"
}

export function worstWalletLevel(
  rows: Array<{ available_usd: number; balance_usd: number }>
): WalletBalanceLevel {
  if (!rows.length) return "healthy"
  let worst: WalletBalanceLevel = "healthy"
  for (const row of rows) {
    const level = walletBalanceLevel(row.available_usd, row.balance_usd)
    if (level === "depleted") return "depleted"
    if (level === "low") worst = "low"
  }
  return worst
}

export function formatWalletLevelLabel(level: WalletBalanceLevel): string {
  switch (level) {
    case "depleted":
      return "No credits left"
    case "low":
      return "Running low"
    default:
      return "OK"
  }
}
