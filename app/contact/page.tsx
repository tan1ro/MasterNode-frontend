"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Building2, Mail, Send, Wrench } from "lucide-react"
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
import { BRANDING } from "@/constants/branding"
import { CONTACT_DEPARTMENTS } from "@/constants/help"
import { ROUTES } from "@/lib/routes"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "sales",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", department: "sales", message: "" })
    }, 3000)
  }

  return (
    <main className="pb-16">
      <MarketingHero
        eyebrow="Contact"
        title="Reach the right team"
        description="Sales, enterprise, partnerships, press, or legal — pick a department and we’ll route your message. Product bugs belong on Support."
        actions={
          <>
            <MarketingCtaButton href={`mailto:${BRANDING.contactEmail}`}>
              Email us
            </MarketingCtaButton>
            <MarketingGhostButton href={ROUTES.support}>Need a fix instead?</MarketingGhostButton>
          </>
        }
      />

      <MarketingSection width="wide" className="pb-8 pt-2">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] lg:gap-10">
          <div className="space-y-4">
            <MarketingSectionTitle
              eyebrow="01 — departments"
              title="Who should you reach?"
              description="Choose a path — we route inquiries, we don’t troubleshoot product failures here."
            />

            <div className="grid gap-3">
              {CONTACT_DEPARTMENTS.map((dept) => (
                <button
                  key={dept.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, department: dept.value }))}
                  className="group block w-full text-left"
                >
                  <MarketingCard
                    className={`transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04] ${
                      formData.department === dept.value ? "border-amber/40 bg-amber/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                        <Building2 className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{dept.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{dept.description}</p>
                      </div>
                    </div>
                  </MarketingCard>
                </button>
              ))}
            </div>

            <MarketingCard>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">Email</p>
                  <a
                    href={`mailto:${BRANDING.contactEmail}`}
                    className="break-all text-sm text-amber underline-offset-4 hover:underline"
                  >
                    {BRANDING.contactEmail}
                  </a>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Company and commercial inquiries
                  </p>
                </div>
              </div>
            </MarketingCard>

            <Link href={ROUTES.support} className="group block">
              <MarketingCard className="transition-colors hover:border-amber/35 hover:bg-muted/40 dark:hover:border-white/20 dark:hover:bg-white/[0.04]">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-amber dark:border-white/10 dark:bg-white/[0.04]">
                    <Wrench className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 font-semibold text-foreground">
                      Product not working?
                      <ArrowUpRight
                        className="size-4 text-muted-foreground/70 transition-colors group-hover:text-amber"
                        aria-hidden
                      />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Go to Support to troubleshoot or open a case
                    </p>
                  </div>
                </div>
              </MarketingCard>
            </Link>
          </div>

          <div>
            <MarketingSectionTitle
              eyebrow="02 — inquiry"
              title="Send a message"
              description="We’ll route it to the right team."
            />
            <MarketingCard>
              {submitted ? (
                <div className="py-8 text-center">
                  <p className="font-semibold text-foreground">Message received.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="mt-1"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
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
                    <Label htmlFor="department">Department</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {CONTACT_DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                      <option value="general">General inquiry</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      className="mt-1 min-h-[6.5rem] resize-y"
                      placeholder="What would you like to discuss?"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                    <p className="text-xs text-muted-foreground">
                      Typical reply within one business day.
                    </p>
                    <Button type="submit" className="inline-flex items-center gap-2 sm:ml-auto">
                      <Send className="size-4" aria-hidden />
                      Send message
                    </Button>
                  </div>
                </form>
              )}
            </MarketingCard>

            <p className="mt-4 text-sm text-muted-foreground">
              Looking for “How do I…?” answers? Visit the{" "}
              <Link href={ROUTES.help} className="text-amber underline-offset-4 hover:underline">
                Help Center
              </Link>
              .
            </p>
          </div>
        </div>
      </MarketingSection>
    </main>
  )
}
