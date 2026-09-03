"use client"

import { Building2, PlusCircle, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldError, inputErrorClass } from "@/components/auth/field-error"
import { OrganizationLogoUpload } from "@/components/auth/organization-logo-upload"
import { OrganizationSearchCombobox } from "@/components/auth/organization-search-combobox"
import type { OrganizationSummary } from "@/services/organizations"
import { cn } from "@/lib/utils"

export type OrganizationSetupMode = "create" | "join"

export interface OrganizationSetupStepProps {
  mode: OrganizationSetupMode
  onModeChange: (mode: OrganizationSetupMode) => void
  orgName: string
  onOrgNameChange: (value: string) => void
  orgNameError?: string
  selectedOrganization: OrganizationSummary | null
  onSelectOrganization: (org: OrganizationSummary | null) => void
  joinOrgError?: string
  logoDataUrl: string
  logoFileName?: string
  onLogoChange: (dataUrl: string, file: File) => void
  onLogoClear: () => void
  onLogoValidationError?: (message: string) => void
  logoError?: string
  generalError?: string
  disabled?: boolean
}

function ModeToggle({
  mode,
  value,
  onChange,
  icon: Icon,
  title,
  description,
  disabled,
}: {
  mode: OrganizationSetupMode
  value: OrganizationSetupMode
  onChange: (m: OrganizationSetupMode) => void
  icon: typeof PlusCircle
  title: string
  description: string
  disabled?: boolean
}) {
  const active = mode === value
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(value)}
      className={cn(
        "flex flex-1 flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-amber bg-amber/10 shadow-sm"
          : "border-border/60 bg-muted/10 hover:border-amber/30 hover:bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", active ? "text-amber" : "text-muted-foreground")} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </button>
  )
}

export function OrganizationSetupStep({
  mode,
  onModeChange,
  orgName,
  onOrgNameChange,
  orgNameError,
  selectedOrganization,
  onSelectOrganization,
  joinOrgError,
  logoDataUrl,
  logoFileName,
  onLogoChange,
  onLogoClear,
  onLogoValidationError,
  logoError,
  generalError,
  disabled,
}: OrganizationSetupStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 border border-amber/25">
          <Building2 className="h-5 w-5 text-amber" />
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Set up your organization
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create a new workspace or join an existing organization your team already uses.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <ModeToggle
          mode={mode}
          value="create"
          onChange={onModeChange}
          icon={PlusCircle}
          title="Create new"
          description="Start a new organization and invite others later."
          disabled={disabled}
        />
        <ModeToggle
          mode={mode}
          value="join"
          onChange={onModeChange}
          icon={Users}
          title="Join existing"
          description="Search and join a team that is already on MasterNode."
          disabled={disabled}
        />
      </div>

      {mode === "join" ? (
        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 sm:p-5 space-y-4">
          <OrganizationSearchCombobox
            selected={selectedOrganization}
            onSelect={onSelectOrganization}
            error={joinOrgError}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <OrganizationLogoUpload
            value={logoDataUrl}
            fileName={logoFileName}
            onChange={onLogoChange}
            onClear={onLogoClear}
            onValidationError={onLogoValidationError}
            error={logoError}
            disabled={disabled}
          />

          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-base font-medium">
              Organization name
            </Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => onOrgNameChange(e.target.value)}
              placeholder="e.g. Acme Labs"
              disabled={disabled}
              className={cn("h-11 text-base sm:h-12", inputErrorClass(Boolean(orgNameError)))}
              aria-invalid={Boolean(orgNameError)}
              aria-describedby={orgNameError ? "org-name-error" : undefined}
            />
            <FieldError id="org-name-error" message={orgNameError} />
            <p className="text-xs text-muted-foreground">
              This name will be visible to members who search for your organization.
            </p>
          </div>
        </div>
      )}

      <FieldError
        message={generalError}
        className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5"
      />
    </div>
  )
}
