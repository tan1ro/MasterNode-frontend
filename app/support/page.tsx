"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, FileQuestion, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  MarketingCard,
  MarketingCtaButton,
  MarketingGhostButton,
  MarketingHero,
  MarketingSection,
  MarketingSectionTitle,
} from "@/components/marketing/marketing-page"
import {
  SUPPORT_COVERAGE,
  SUPPORT_ISSUE_CATEGORIES,
  SUPPORT_TROUBLESHOOT,
} from "@/constants/help"
import { ROUTES } from "@/lib/routes"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "technical",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", category: "technical", message: "" })
    }, 3000)
  }

  return (
    <main className="pb-24">
      <MarketingHero
        eyebrow="Support"
        title="Fix what’s broken"
        description="Something isn’t working? Identify the issue, try quick troubleshooting, then open a case. Most issues get a reply within one business day."
        actions={
          <>
            <MarketingCtaButton href="#open-issue">Open an issue</MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.help}>Help Center</MarketingGhostButton>
          </>
        }
      />

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="01 — identify"
          title="What kind of problem is it?"
          description="Account, billing, technical, or subscription — pick the closest match."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {SUPPORT_ISSUE_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, category: cat.value }))
                  document.getElementById("open-issue")?.scrollIntoView({ behavior: "smooth" })
                }}
                className="group block h-full text-left"
              >
                <MarketingCard
                  className={`h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04] ${
                    formData.category === cat.value ? "border-amber/40 bg-amber/[0.04]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{cat.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                </MarketingCard>
              </button>
            )
          })}
        </div>
      </MarketingSection>

      <MarketingSection className="pb-14">
        <MarketingSectionTitle
          eyebrow="02 — troubleshoot"
          title="Try this first"
          description="Many issues clear without a ticket."
        />
        <ol className="grid gap-3 sm:grid-cols-2">
          {SUPPORT_TROUBLESHOOT.map((step, index) => (
            <li key={step}>
              <MarketingCard className="flex items-start gap-3 py-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-xs font-semibold text-amber dark:border-white/10">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </MarketingCard>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href={ROUTES.help} className="group block h-full">
            <MarketingCard className="h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <FileQuestion className="size-5 text-amber" aria-hidden />
                  Help Center &amp; FAQ
                </h3>
                <ArrowUpRight
                  className="size-4 text-muted-foreground/50 transition-colors group-hover:text-amber"
                  aria-hidden
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Self-serve “How do I…?” guides — not for open incidents.
              </p>
            </MarketingCard>
          </Link>
          <Link href={ROUTES.docs} className="group block h-full">
            <MarketingCard className="h-full transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <BookOpen className="size-5 text-amber" aria-hidden />
                  Documentation
                </h3>
                <ArrowUpRight
                  className="size-4 text-muted-foreground/50 transition-colors group-hover:text-amber"
                  aria-hidden
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Product docs and API reference when you need deeper detail.
              </p>
            </MarketingCard>
          </Link>
        </div>
      </MarketingSection>

      <MarketingSection width="narrow" className="pb-14" id="open-issue">
        <MarketingSectionTitle
          eyebrow="03 — open a case"
          title="Still not working?"
          description="Tell us what failed and how to reproduce it. Signed-in context helps — include your account email."
        />
        <MarketingCard>
          {submitted ? (
            <div className="py-8 text-center">
              <p className="font-semibold text-foreground">Issue received.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We&apos;ll follow up on this case shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="support-name">Name</Label>
                  <Input
                    id="support-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="support-email">Account email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="support-category">Issue type</Label>
                <select
                  id="support-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {SUPPORT_ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="support-message">What happened?</Label>
                <Textarea
                  id="support-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="mt-1 min-h-[7rem] resize-y"
                  placeholder="Steps to reproduce, what you expected, and what you saw instead…"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                <p className="text-xs text-muted-foreground">
                  Typical reply within one business day.
                </p>
                <Button type="submit" className="inline-flex items-center gap-2 sm:ml-auto">
                  <Send className="size-4" aria-hidden />
                  Submit issue
                </Button>
              </div>
            </form>
          )}
        </MarketingCard>
      </MarketingSection>

      <MarketingSection width="narrow" className="pb-14">
        <MarketingSectionTitle eyebrow="04 — coverage" title="What we handle here" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {SUPPORT_COVERAGE.map((item) => (
            <li key={item}>
              <MarketingCard className="py-4">
                <span className="text-sm text-muted-foreground">{item}</span>
              </MarketingCard>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection width="narrow">
        <MarketingCard className="border-amber/25 bg-amber/[0.04]">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Looking for sales, partnerships, or press? Use{" "}
            <Link href={ROUTES.contact} className="text-amber underline-offset-4 hover:underline">
              Contact
            </Link>
            . For legal or privacy, see{" "}
            <Link href={ROUTES.legal} className="text-amber underline-offset-4 hover:underline">
              Legal
            </Link>
            .
          </p>
        </MarketingCard>
      </MarketingSection>
    </main>
  )
}
