"use client"

import { Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SettingsSelectField,
  SettingsSectionCard,
} from "@/components/settings/settings-pref-controls"
import {
  COMMON_TIMEZONES,
  DATE_FORMAT_OPTIONS,
  RESPONSE_LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from "@/constants/user-settings"
import type { DateFormatPref, TimeFormatPref } from "@/constants/user-settings"

interface LanguageRegionSectionProps {
  responseLanguage: string
  timezone: string
  dateFormat: DateFormatPref
  timeFormat: TimeFormatPref
  onResponseLanguageChange: (value: string) => void
  onTimezoneChange: (value: string) => void
  onDateFormatChange: (value: DateFormatPref) => void
  onTimeFormatChange: (value: TimeFormatPref) => void
}

export function LanguageRegionSection({
  responseLanguage,
  timezone,
  dateFormat,
  timeFormat,
  onResponseLanguageChange,
  onTimezoneChange,
  onDateFormatChange,
  onTimeFormatChange,
}: LanguageRegionSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="language-region" accent="sky" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-sky-400" />
          <div>
            <CardTitle>Language & region</CardTitle>
            <CardDescription>Response language, timezone, and date/time display.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={Globe}
          title="Response language"
          description="AI replies default to this language regardless of what you type."
          accent="sky"
        >
          <SettingsSelectField
            id="responseLanguage"
            label="Preferred response language"
            value={responseLanguage}
            onChange={onResponseLanguageChange}
            options={RESPONSE_LANGUAGE_OPTIONS}
          />
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Globe}
          title="Timezone"
          description="Timestamps across chat, billing, and notifications."
          accent="sky"
        >
          <SettingsSelectField
            id="timezone"
            label="Timezone"
            value={timezone}
            onChange={onTimezoneChange}
            options={COMMON_TIMEZONES}
          />
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Globe}
          title="Date & time format"
          description="How dates and clocks are shown in the interface."
          accent="sky"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsSelectField
              id="dateFormat"
              label="Date format"
              value={dateFormat}
              onChange={(v) => onDateFormatChange(v as DateFormatPref)}
              options={DATE_FORMAT_OPTIONS}
            />
            <SettingsSelectField
              id="timeFormat"
              label="Time format"
              value={timeFormat}
              onChange={(v) => onTimeFormatChange(v as TimeFormatPref)}
              options={TIME_FORMAT_OPTIONS}
            />
          </div>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
