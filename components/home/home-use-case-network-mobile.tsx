"use client"

import Image from "next/image"
import { PI_MARK } from "@/constants/branding-assets"
import { assistantCategoryTheme } from "@/components/agent-templates/template-role-utils"
import {
  HOME_USE_CASE_HUBS,
  type UseCaseHub,
} from "@/components/home/home-use-case-network-data"
import { cn } from "@/lib/utils"

/**
 * Mobile / tablet use-case explorer — replaces the radial graph below `lg`
 * so labels never overlap. Same hub selection state as the desktop network.
 */
export function HomeUseCaseNetworkMobile({
  activeHub,
  onSelectHub,
}: {
  activeHub: UseCaseHub
  onSelectHub: (hubId: string) => void
}) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-5 lg:hidden">
      <div className="flex flex-col items-center gap-2 pt-1">
        <Image
          src={PI_MARK.src}
          alt=""
          width={40}
          height={40}
          className="size-10 object-contain"
          aria-hidden
        />
        <p className="font-heading text-lg font-medium tracking-tight text-foreground">
          MasterNode
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
        role="listbox"
        aria-label="Assistant domains"
      >
        {HOME_USE_CASE_HUBS.map((hub) => {
          const Icon = hub.icon
          const theme = assistantCategoryTheme(hub.id)
          const isActive = hub.id === activeHub.id

          return (
            <button
              key={hub.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onSelectHub(hub.id)}
              className={cn(
                "flex min-h-[4.5rem] flex-col items-start gap-2 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                isActive
                  ? cn(theme.tabActive, "shadow-sm")
                  : "border-border/70 bg-card/40 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03]"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  isActive ? theme.cardIcon : "bg-muted/50 text-muted-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <span
                className={cn(
                  "font-heading text-sm font-semibold leading-snug",
                  isActive ? "text-foreground" : "text-foreground/85"
                )}
              >
                {hub.label}
              </span>
            </button>
          )
        })}
      </div>

      <div
        key={activeHub.id}
        className="rounded-2xl border border-border/70 bg-card/50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Selected domain
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="font-heading text-base font-semibold text-foreground">
                {activeHub.label}
              </p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {activeHub.description}
            </p>
            <p className="mt-2 text-sm italic text-foreground/80">
              &ldquo;{activeHub.examples[0]}&rdquo;
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${activeHub.label} topics`}>
          {activeHub.leaves.map((leaf) => (
            <li
              key={leaf.label}
              className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground/90 dark:border-white/12 dark:bg-white/[0.04]"
            >
              {leaf.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
