"use client"

import { Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { FONT_SIZE_OPTIONS, type FontSizePref } from "@/constants/user-settings"
import type { ThemePreference } from "@/lib/settings-preferences"
import { SettingsToggleRow } from "@/components/settings/settings-pref-controls"

interface AppearanceSectionProps {
  themePreference: ThemePreference
  compactDensity: boolean
  showTokenCostHints: boolean
  fontSize: FontSizePref
  renderMarkdown: boolean
  syntaxHighlighting: boolean
  onThemeChange: (value: ThemePreference) => void
  onCompactDensityChange: (value: boolean) => void
  onShowTokenCostHintsChange: (value: boolean) => void
  onFontSizeChange: (value: FontSizePref) => void
  onRenderMarkdownChange: (value: boolean) => void
  onSyntaxHighlightingChange: (value: boolean) => void
}

export function AppearanceSection({
  themePreference,
  compactDensity,
  showTokenCostHints,
  fontSize,
  renderMarkdown,
  syntaxHighlighting,
  onThemeChange: _onThemeChange,
  onCompactDensityChange,
  onShowTokenCostHintsChange,
  onFontSizeChange,
  onRenderMarkdownChange,
  onSyntaxHighlightingChange,
}: AppearanceSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="appearance" accent="violet" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-violet-400" />
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Density and chat display for this browser session.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fontSize">Chat font size</Label>
          <Select
            id="fontSize"
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value as FontSizePref)}
            className="mt-1.5"
          >
            {FONT_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <ul className="space-y-2 border-t border-border/50 pt-3">
          <li>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={compactDensity}
                onChange={(e) => onCompactDensityChange(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Compact UI density</span>
                <span className="block text-xs text-muted-foreground">Tighter spacing on lists and cards (where supported).</span>
              </span>
            </label>
          </li>
          <li>
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={showTokenCostHints}
                onChange={(e) => onShowTokenCostHintsChange(e.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Show token & cost hints</span>
                <span className="block text-xs text-muted-foreground">Surface usage estimates on dashboard and billing views.</span>
              </span>
            </label>
          </li>
          <li>
            <SettingsToggleRow
              id="renderMarkdown"
              checked={renderMarkdown}
              onChange={onRenderMarkdownChange}
              label="Render Markdown in chat"
              description="Show headers, bold, code blocks, and tables. Turn off for plain text."
            />
          </li>
          <li>
            <SettingsToggleRow
              id="syntaxHighlighting"
              checked={syntaxHighlighting}
              onChange={onSyntaxHighlightingChange}
              label="Code block syntax highlighting"
              description="Syntax colors in fenced code blocks. Pairs with the Markdown toggle."
              disabled={!renderMarkdown}
            />
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}
