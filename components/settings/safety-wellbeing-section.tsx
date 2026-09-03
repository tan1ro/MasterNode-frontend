"use client"

import { HeartHandshake, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import {
  SettingsSectionCard,
  SettingsToggleRow,
} from "@/components/settings/settings-pref-controls"

interface SafetyWellbeingSectionProps {
  trustedContactEmail: string
  trustedContactPhone: string
  crisisNotifyEnabled: boolean
  parentalControlsEnabled: boolean
  guardianEmail: string
  onTrustedContactEmailChange: (value: string) => void
  onTrustedContactPhoneChange: (value: string) => void
  onCrisisNotifyEnabledChange: (value: boolean) => void
  onParentalControlsEnabledChange: (value: boolean) => void
  onGuardianEmailChange: (value: string) => void
}

export function SafetyWellbeingSection({
  trustedContactEmail,
  trustedContactPhone,
  crisisNotifyEnabled,
  parentalControlsEnabled,
  guardianEmail,
  onTrustedContactEmailChange,
  onTrustedContactPhoneChange,
  onCrisisNotifyEnabledChange,
  onParentalControlsEnabledChange,
  onGuardianEmailChange,
}: SafetyWellbeingSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="safety-wellbeing" accent="destructive" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-rose-400" />
          <div>
            <CardTitle>Safety & wellbeing</CardTitle>
            <CardDescription>Crisis support contacts and parental controls for minors.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={HeartHandshake}
          title="Trusted contact / crisis notification"
          description="Nominate someone to be notified when distress signals are detected."
          accent="rose"
        >
          <Callout type="info">
            Preferences are saved to your account. Automated crisis detection and outbound notifications are enabled
            when both a contact and the toggle below are set.
          </Callout>
          <div className="grid max-w-md gap-3 mt-3">
            <div>
              <Label htmlFor="trustedContactEmail">Trusted contact email</Label>
              <Input
                id="trustedContactEmail"
                type="email"
                value={trustedContactEmail}
                onChange={(e) => onTrustedContactEmailChange(e.target.value)}
                placeholder="parent@example.com"
                className="mt-1.5"
                maxLength={320}
              />
            </div>
            <div>
              <Label htmlFor="trustedContactPhone">Trusted contact phone (optional)</Label>
              <Input
                id="trustedContactPhone"
                type="tel"
                value={trustedContactPhone}
                onChange={(e) => onTrustedContactPhoneChange(e.target.value)}
                placeholder="+1 555 0100"
                className="mt-1.5"
                maxLength={32}
              />
            </div>
            <SettingsToggleRow
              id="crisisNotifyEnabled"
              checked={crisisNotifyEnabled}
              onChange={onCrisisNotifyEnabledChange}
              label="Notify trusted contact on crisis signals"
              description="When enabled, severe distress classifications can trigger an email to your trusted contact."
            />
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Users}
          title="Parental controls"
          description="Link a guardian account to monitor and restrict a minor's usage."
          accent="rose"
        >
          <Callout type="warning" title="Guardian linking">
            Guardian email is stored on your account. Full family linking, content filters, and verified age gates
            will expand on this preference in a future release.
          </Callout>
          <div className="grid max-w-md gap-3 mt-3">
            <SettingsToggleRow
              id="parentalControlsEnabled"
              checked={parentalControlsEnabled}
              onChange={onParentalControlsEnabledChange}
              label="Enable parental controls"
              description="Restricts certain features until a guardian email is verified."
            />
            <div>
              <Label htmlFor="guardianEmail">Guardian email</Label>
              <Input
                id="guardianEmail"
                type="email"
                value={guardianEmail}
                onChange={(e) => onGuardianEmailChange(e.target.value)}
                placeholder="guardian@example.com"
                className="mt-1.5"
                maxLength={320}
                disabled={!parentalControlsEnabled}
              />
            </div>
          </div>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
