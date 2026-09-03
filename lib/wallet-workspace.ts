import { getStoredApiKey } from "@/lib/storage"
import type { ApiKeyRecord, ApiWalletAppResponse, ApiWalletKeyResponse, ApiWalletResponse } from "@/types/api"

export function isAppWallet(d: ApiWalletResponse): d is ApiWalletAppResponse {
  return d.auth === "app"
}

export function isKeyWallet(d: ApiWalletResponse): d is ApiWalletKeyResponse {
  return d.auth === "api_key"
}

/**
 * Tenant id used for prepaid wallet and per-tenant cost totals (dyn-/key-/svc-).
 * Matches the active browser-stored API key when possible.
 */
export function resolveWalletWorkspaceTenantId(
  wallet: ApiWalletResponse | undefined,
  apiKeys?: ApiKeyRecord[]
): string | null {
  if (!wallet?.api_wallet_enabled) return null

  const stored = getStoredApiKey()

  if (isAppWallet(wallet) && wallet.wallets?.length) {
    if (stored && apiKeys?.length) {
      const keyRec = apiKeys.find((k) => k.api_key === stored)
      if (keyRec?.key_id) {
        const row = wallet.wallets.find((w) => w.key_id === keyRec.key_id)
        if (row?.tenant_id) return row.tenant_id
      }
    }
    return wallet.wallets[0]?.tenant_id ?? null
  }

  if (isKeyWallet(wallet) && wallet.wallet_required) {
    return wallet.tenant_id
  }

  return null
}
