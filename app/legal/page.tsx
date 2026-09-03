import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  Cookie,
  Mail,
  Scale,
  SlidersHorizontal,
} from "lucide-react"
import { LEGAL_DOCUMENTS_BY_SLUG, LEGAL_SLUGS } from "@/content/legal"
import { LEGAL_ENTITY, LEGAL_LAST_UPDATED } from "@/constants/legal"
import { ROUTES } from "@/lib/routes"

const QUICK_LINKS = [
  {
    href: ROUTES.usagePolicy,
    title: "Usage policy",
    description: "A plain-language summary of acceptable use and enforcement.",
    icon: Scale,
  },
  {
    href: ROUTES.privacyChoices,
    title: "Your privacy choices",
    description: "Manage cookie consent, analytics opt-out, and CCPA rights.",
    icon: SlidersHorizontal,
  },
  {
    href: `${ROUTES.privacy}#cookies`,
    title: "Cookie policy",
    description: "What we store, why, and how to withdraw consent.",
    icon: Cookie,
  },
] as const

export default function LegalPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6">
        <header className="border-b border-border/40 pb-8">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br from-amber/15 to-transparent text-amber">
              <Scale className="size-7" aria-hidden />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Legal & Compliance</h1>
              <p className="mt-1 text-sm text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED.hub}</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Policies for {LEGAL_ENTITY.name}. By using our service you agree to the{" "}
            <Link href={ROUTES.terms} className="text-amber underline underline-offset-2 hover:no-underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={ROUTES.privacy} className="text-amber underline underline-offset-2 hover:no-underline">
              Privacy Policy
            </Link>
            .
          </p>
        </header>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Core policies
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {LEGAL_SLUGS.map((slug) => {
              const doc = LEGAL_DOCUMENTS_BY_SLUG[slug]
              const Icon = doc.icon
              return (
                <Link
                  key={slug}
                  href={`/legal/${slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-amber/50 hover:bg-card/70"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-amber">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">{doc.title}</h3>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-amber"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{doc.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Quick links
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-amber/50 hover:bg-card/70"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-amber">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">{link.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section
          id="imprint"
          className="mt-12 scroll-mt-28 rounded-2xl border border-border/60 bg-card/30 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <Building2 className="size-5 text-amber" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground">Company & contact</h2>
          </div>
          <div className="mt-4 grid gap-6 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="space-y-1">
              <p className="font-medium text-foreground">{LEGAL_ENTITY.legalName}</p>
              <p>{LEGAL_ENTITY.address}</p>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Legal", email: LEGAL_ENTITY.emailLegal },
                { label: "Privacy", email: LEGAL_ENTITY.emailPrivacy },
                { label: "Security", email: LEGAL_ENTITY.emailSecurity },
                { label: "DPA", email: LEGAL_ENTITY.emailDpa },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                  <span className="text-foreground/80">{row.label}:</span>
                  <a
                    href={`mailto:${row.email}`}
                    className="text-amber underline underline-offset-2 hover:no-underline"
                  >
                    {row.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
