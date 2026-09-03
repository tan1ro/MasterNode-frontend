"use client"

import Link from "next/link"
import { BookOpen, Info, Keyboard, Map, MessageCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useRestartChatIntroTour } from "@/hooks/use-restart-chat-intro-tour"
import { ROUTES } from "@/lib/routes"
import { APP_VERSION, APP_VERSION_LABEL } from "@/lib/app-version"

export function HelpSupportSettingsSection() {
  const { openKeyboardShortcuts, openBugReport } = useAppShell()
  const { canRestart, restartTour } = useRestartChatIntroTour()

  return (
    <Card variant="minimal" interactive={false} id="help-support" accent="sky" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-400" />
          <div>
            <CardTitle>Help & support</CardTitle>
            <CardDescription>Documentation, shortcuts, feedback, and release notes.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={Info}
          title="App version"
          description={`You are running MasterNode ${APP_VERSION_LABEL}.`}
          accent="sky"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 items-center rounded-md border border-border/60 bg-muted/40 px-3 text-sm font-medium tabular-nums text-foreground">
              Version {APP_VERSION}
            </span>
            <Link
              href={ROUTES.changelog}
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Changelog
            </Link>
            <Link
              href={ROUTES.helpReleaseNotes}
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Release notes
            </Link>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={BookOpen}
          title="Documentation & help center"
          description="Guides, FAQs, and product docs."
          accent="sky"
        >
          <Link
            href={ROUTES.help}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Open help center
          </Link>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Keyboard}
          title="Keyboard shortcuts"
          description="Reference panel for all interface shortcuts."
          accent="sky"
        >
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => openKeyboardShortcuts()}>
              Show shortcuts
            </Button>
            <Link
              href={`${ROUTES.help}/keyboard-shortcuts`}
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Full shortcuts page
            </Link>
          </div>
        </SettingsSectionCard>

        {canRestart ? (
          <SettingsSectionCard
            icon={Map}
            title="Chat walkthrough"
            description="Replay the guided tour of sidebar, search, composer, and quick prompts."
            accent="sky"
          >
            <Button type="button" variant="outline" size="sm" onClick={restartTour}>
              <Map className="mr-2 h-4 w-4" aria-hidden />
              Restart tour
            </Button>
          </SettingsSectionCard>
        ) : null}

        <SettingsSectionCard
          icon={MessageCircle}
          title="Feedback & bug reports"
          description="Tell us what broke or what you need."
          accent="sky"
        >
          <Button type="button" variant="outline" size="sm" onClick={() => openBugReport()}>
            Report a bug
          </Button>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Sparkles}
          title="What's new"
          description="Recent feature updates and improvements."
          accent="sky"
        >
          <Link
            href={ROUTES.helpReleaseNotes}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Release notes
          </Link>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
