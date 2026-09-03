"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { HELP_FAQS } from "@/content/help/faqs"

export function FaqList() {
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? HELP_FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : HELP_FAQS

  return (
    <>
      <Input
        type="search"
        placeholder="Search FAQ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-8 max-w-md"
      />
      <Card noGrid>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <p className="py-4 text-muted-foreground">No FAQ entries match your search.</p>
          ) : (
            <div className="space-y-6">
              {filtered.map((faq, i) => (
                <div
                  key={faq.q}
                  className="border-b border-border pb-6 last:border-b-0 last:pb-0"
                >
                  <p className="font-medium text-foreground">{faq.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
