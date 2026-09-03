"use client"

import { useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUpsertAgentTemplate } from "@/hooks"
import {
  samplesForPack,
  visibleBusinessPacks,
  type BusinessPackId,
} from "@/constants/business-packs"
import { packCardAccent } from "@/components/agent-templates/template-role-utils"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { UpgradePopup } from "@/components/shared/feature-gate"
import { useEntitlements } from "@/hooks/use-entitlements"

export function BusinessPackInstaller({ compact }: { compact?: boolean }) {
  const upsert = useUpsertAgentTemplate()
  const [busyPack, setBusyPack] = useState<BusinessPackId | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const { can } = useEntitlements()
  const canManageTemplates = can("templates.manage")

  const installPack = useCallback(
    async (packId: BusinessPackId) => {
      setError(null)
      setBusyPack(packId)
      const samples = samplesForPack(packId)
      try {
        for (const body of samples) {
          const { category: _c, ...payload } = body
          await upsert.mutateAsync(payload)
        }
      } catch (e) {
        setError(e)
      } finally {
        setBusyPack(null)
      }
    },
    [upsert]
  )

  if (compact) {
    return (
      <section className="space-y-4">
        <UpgradePopup
          open={showUpgradePopup}
          onOpenChange={setShowUpgradePopup}
          feature="templates.manage"
          title="Upgrade required to install packs"
        />
        <p className="text-sm font-medium uppercase tracking-wider text-cyan">Packs</p>
        {error ? (
          <ApiErrorCallout error={error} title="Install failed" fallbackMessage="Install failed" />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visibleBusinessPacks().map((pack) => {
            const count = samplesForPack(pack.id).length
            const busy = busyPack === pack.id
            const accent = packCardAccent[pack.id] ?? "cyan"
            return (
              <Card
                key={pack.id}
                noGrid
                accent={accent}
                className="flex items-center justify-between gap-4 p-5 min-h-[100px]"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground truncate">{pack.label}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{count} templates</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={Boolean(busyPack) || count === 0}
                  onClick={() => {
                    if (!canManageTemplates) {
                      setShowUpgradePopup(true)
                      return
                    }
                    void installPack(pack.id)
                  }}
                  className="shrink-0"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Install"}
                </Button>
              </Card>
            )
          })}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-10 space-y-3">
      <UpgradePopup
        open={showUpgradePopup}
        onOpenChange={setShowUpgradePopup}
        feature="templates.manage"
        title="Upgrade required to install packs"
      />
      <p className="text-[11px] font-medium uppercase tracking-wider text-cyan">Business packs</p>
      {error ? (
        <ApiErrorCallout error={error} title="Install failed" fallbackMessage="Install failed" />
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {visibleBusinessPacks().map((pack) => {
          const count = samplesForPack(pack.id).length
          const busy = busyPack === pack.id
          const accent = packCardAccent[pack.id] ?? "cyan"
          return (
            <Card key={pack.id} noGrid accent={accent} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{pack.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">{count} templates</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={Boolean(busyPack) || count === 0}
                onClick={() => {
                  if (!canManageTemplates) {
                    setShowUpgradePopup(true)
                    return
                  }
                  void installPack(pack.id)
                }}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    …
                  </>
                ) : (
                  "Install"
                )}
              </Button>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
