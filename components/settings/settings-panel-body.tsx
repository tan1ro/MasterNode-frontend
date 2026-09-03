"use client"

import { useState, useEffect, useMemo } from "react"
import { useWebhookTaskFinished, useWebhookConfig, useAgentTemplates } from "@/hooks"
import { useSettingsPage } from "@/hooks/use-settings-page"
import { settingsGroupMembers } from "@/components/settings/settings-section-nav"
import {
  AccountAccessSection,
  AccountProfileSection,
  ApiAccessSection,
  AppearanceSection,
  BillingSettingsSection,
  ChatBehaviorSection,
  ChatManagementSection,
  ConnectedAppsSection,
  CustomAgentsSection,
  DataLocalSection,
  EducationSection,
  HelpSupportSettingsSection,
  LanguageRegionSection,
  LlmDefaultsSection,
  LlmRoutingSection,
  MemorySettingsSection,
  NotificationsSection,
  PipelineAdvancedSection,
  PreferencesSection,
  PrivacyDataSection,
  QuickLinksSection,
  RagResearchSection,
  SafetyWellbeingSection,
  SecuritySection,
  SettingsSaveStatus,
  WebhookSection,
} from "@/components/settings"
import { DesktopAppSection } from "@/components/settings/desktop-app-section"
import { persistWebhookPreferences } from "@/lib/settings-preferences"

interface SettingsPanelBodyProps {
  activeSection: string
}

export function SettingsPanelBody({ activeSection }: SettingsPanelBodyProps) {
  const { prefs, patch, persistStatus, savedAt } = useSettingsPage()

  const [webhookSaved, setWebhookSaved] = useState(false)
  const [webhookLoadDone, setWebhookLoadDone] = useState(false)

  const webhookMutation = useWebhookTaskFinished()
  const { data: webhookConfig, isError: webhookConfigError } = useWebhookConfig()
  const { data: templatesData, isLoading: templatesLoading } = useAgentTemplates()

  useEffect(() => {
    if (webhookLoadDone || webhookConfigError) return
    if (!webhookConfig) return
    patch({
      webhookUrl: webhookConfig.url || "",
      webhookEvents: webhookConfig.events?.length ? webhookConfig.events : [],
    })
    persistWebhookPreferences(webhookConfig.url || "", webhookConfig.events || [])
    setWebhookLoadDone(true)
  }, [webhookConfig, webhookConfigError, webhookLoadDone, patch])

  useEffect(() => {
    if (webhookConfigError && !webhookLoadDone) setWebhookLoadDone(true)
  }, [webhookConfigError, webhookLoadDone])

  const activeMembers = useMemo(
    () => new Set(settingsGroupMembers(activeSection)),
    [activeSection]
  )

  const flashWebhookSaved = () => {
    setWebhookSaved(true)
    setTimeout(() => setWebhookSaved(false), 2000)
  }

  const handleWebhookEventToggle = (event: string) => {
    patch({
      webhookEvents: prefs.webhookEvents.includes(event)
        ? prefs.webhookEvents.filter((e) => e !== event)
        : [...prefs.webhookEvents, event],
    })
  }

  const handleSaveWebhook = () => {
    if (prefs.webhookUrl && prefs.webhookEvents.length > 0) {
      webhookMutation.mutate(
        { url: prefs.webhookUrl, events: prefs.webhookEvents },
        {
          onSuccess: (data) => {
            const url = data?.url || prefs.webhookUrl
            const events = data?.events?.length ? data.events : prefs.webhookEvents
            patch({ webhookUrl: url, webhookEvents: events })
            persistWebhookPreferences(url, events)
            flashWebhookSaved()
          },
        }
      )
    }
  }

  const show = (id: string) => activeMembers.has(id)

  return (
    <div className="settings-panel-body space-y-3">
      <SettingsSaveStatus persistStatus={persistStatus} savedAt={savedAt} />

      {show("account-profile") ? (
        <AccountProfileSection
          displayName={prefs.displayName}
          avatarDataUrl={prefs.avatarDataUrl}
          onDisplayNameChange={(v) => patch({ displayName: v })}
          onAvatarChange={(v) => patch({ avatarDataUrl: v })}
        />
      ) : null}
      {show("account") ? <AccountAccessSection /> : null}
      {show("security") ? <SecuritySection /> : null}
      {show("privacy-data") ? (
        <PrivacyDataSection
          allowTrainingData={prefs.allowTrainingData}
          retentionPeriodDays={prefs.retentionPeriodDays}
          onAllowTrainingDataChange={(v) => patch({ allowTrainingData: v })}
          onRetentionPeriodChange={(v) => patch({ retentionPeriodDays: v })}
        />
      ) : null}
      {show("safety-wellbeing") ? (
        <SafetyWellbeingSection
          trustedContactEmail={prefs.trustedContactEmail}
          trustedContactPhone={prefs.trustedContactPhone}
          crisisNotifyEnabled={prefs.crisisNotifyEnabled}
          parentalControlsEnabled={prefs.parentalControlsEnabled}
          guardianEmail={prefs.guardianEmail}
          onTrustedContactEmailChange={(v) => patch({ trustedContactEmail: v })}
          onTrustedContactPhoneChange={(v) => patch({ trustedContactPhone: v })}
          onCrisisNotifyEnabledChange={(v) => patch({ crisisNotifyEnabled: v })}
          onParentalControlsEnabledChange={(v) => patch({ parentalControlsEnabled: v })}
          onGuardianEmailChange={(v) => patch({ guardianEmail: v })}
        />
      ) : null}
      {show("chat-behavior") ? (
        <ChatBehaviorSection
          chatThinkingMode={prefs.chatThinkingMode}
          chatConfirmBeforePipeline={prefs.chatConfirmBeforePipeline}
          chatStreamResponses={prefs.chatStreamResponses}
          chatHistoryTurns={prefs.chatHistoryTurns}
          showPipelineActivityPanel={prefs.showPipelineActivityPanel}
          sendOnEnter={prefs.sendOnEnter}
          autoNameConversations={prefs.autoNameConversations}
          customInstructions={prefs.customInstructions}
          onThinkingModeChange={(v) => patch({ chatThinkingMode: v })}
          onConfirmBeforePipelineChange={(v) => patch({ chatConfirmBeforePipeline: v })}
          onStreamResponsesChange={(v) => patch({ chatStreamResponses: v })}
          onHistoryTurnsChange={(v) => patch({ chatHistoryTurns: v })}
          onShowPipelineActivityChange={(v) => patch({ showPipelineActivityPanel: v })}
          onSendOnEnterChange={(v) => patch({ sendOnEnter: v })}
          onAutoNameConversationsChange={(v) => patch({ autoNameConversations: v })}
          onCustomInstructionsChange={(v) => patch({ customInstructions: v })}
        />
      ) : null}
      {show("chat-management") ? <ChatManagementSection /> : null}
      {show("language-region") ? (
        <LanguageRegionSection
          responseLanguage={prefs.responseLanguage}
          timezone={prefs.timezone}
          dateFormat={prefs.dateFormat}
          timeFormat={prefs.timeFormat}
          onResponseLanguageChange={(v) => patch({ responseLanguage: v })}
          onTimezoneChange={(v) => patch({ timezone: v })}
          onDateFormatChange={(v) => patch({ dateFormat: v })}
          onTimeFormatChange={(v) => patch({ timeFormat: v })}
        />
      ) : null}
      {show("appearance") ? (
        <AppearanceSection
          themePreference={prefs.themePreference}
          compactDensity={prefs.compactDensity}
          showTokenCostHints={prefs.showTokenCostHints}
          fontSize={prefs.fontSize}
          renderMarkdown={prefs.renderMarkdown}
          syntaxHighlighting={prefs.syntaxHighlighting}
          onThemeChange={(v) => patch({ themePreference: v })}
          onCompactDensityChange={(v) => patch({ compactDensity: v })}
          onShowTokenCostHintsChange={(v) => patch({ showTokenCostHints: v })}
          onFontSizeChange={(v) => patch({ fontSize: v })}
          onRenderMarkdownChange={(v) => patch({ renderMarkdown: v })}
          onSyntaxHighlightingChange={(v) => patch({ syntaxHighlighting: v })}
        />
      ) : null}
      {show("memory") ? (
        <MemorySettingsSection
          memoryEnabled={prefs.memoryEnabled}
          keywordMemoryEnabled={prefs.keywordMemoryEnabled}
          onMemoryEnabledChange={(v) => patch({ memoryEnabled: v })}
          onKeywordMemoryEnabledChange={(v) => patch({ keywordMemoryEnabled: v })}
        />
      ) : null}
      {show("billing") ? <BillingSettingsSection /> : null}
      {show("connected-apps") ? <ConnectedAppsSection /> : null}
      {show("help-support") ? <HelpSupportSettingsSection /> : null}
      {show("education") ? <EducationSection /> : null}
      {show("quick-links") ? <QuickLinksSection /> : null}
      {show("api-access") ? <ApiAccessSection /> : null}
      {show("task-defaults") ? (
        <PreferencesSection
          refreshInterval={prefs.refreshInterval}
          onRefreshIntervalChange={(v) => patch({ refreshInterval: v })}
        />
      ) : null}
      {show("llm-defaults") ? (
        <LlmDefaultsSection
          defaultPreferredProvider={prefs.defaultPreferredProvider}
          defaultTemperature={prefs.defaultTemperature}
          defaultMaxTokens={prefs.defaultMaxTokens}
          onProviderChange={(v) => patch({ defaultPreferredProvider: v })}
          onTemperatureChange={(v) => patch({ defaultTemperature: v })}
          onMaxTokensChange={(v) => patch({ defaultMaxTokens: v })}
        />
      ) : null}
      {show("rag-research") ? (
        <RagResearchSection
          defaultUseRag={prefs.defaultUseRag}
          citationMode={prefs.citationMode}
          freshnessMode={prefs.freshnessMode}
          onDefaultUseRagChange={(v) => patch({ defaultUseRag: v })}
          onCitationModeChange={(v) => patch({ citationMode: v })}
          onFreshnessModeChange={(v) => patch({ freshnessMode: v })}
        />
      ) : null}
      {show("pipeline-advanced") ? <PipelineAdvancedSection /> : null}
      {show("custom-agents") ? (
        <CustomAgentsSection
          templateIds={prefs.templateIds}
          templates={templatesData?.templates}
          loading={templatesLoading}
          onChange={(templateIds) => patch({ templateIds })}
        />
      ) : null}
      {show("llm-routing") ? <LlmRoutingSection /> : null}
      {show("webhooks") ? (
        <WebhookSection
          webhookUrl={prefs.webhookUrl}
          webhookEvents={prefs.webhookEvents}
          saved={webhookSaved}
          isPending={webhookMutation.isPending}
          error={webhookMutation.isError ? webhookMutation.error : null}
          onUrlChange={(v) => patch({ webhookUrl: v })}
          onEventToggle={handleWebhookEventToggle}
          onSave={handleSaveWebhook}
        />
      ) : null}
      {show("notifications") ? (
        <NotificationsSection
          notifyOnTaskComplete={prefs.notifyOnTaskComplete}
          soundOnComplete={prefs.soundOnComplete}
          onNotifyChange={(v) => patch({ notifyOnTaskComplete: v })}
          onSoundChange={(v) => patch({ soundOnComplete: v })}
        />
      ) : null}
      {show("local-data") ? <DataLocalSection /> : null}
      {show("desktop-app") ? <DesktopAppSection /> : null}
    </div>
  )
}
