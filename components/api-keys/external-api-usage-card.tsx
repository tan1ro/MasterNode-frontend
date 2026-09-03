"use client"

import Link from "next/link"
import { BookOpen, ExternalLink, Terminal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES, API_BASE_URL, API_DOCS_URL } from "@/lib/routes"

/** Surfaces env + doc links so users can wire MasterNode into IDEs and scripts. */
export function ExternalApiUsageCard() {
  const envSnippet = `# Example — add to .env (do not commit real secrets)
PI_API_URL=${API_BASE_URL}
PI_API_KEY=your_master_node_api_key_here`

  return (
    <Card className="border-cyan/20 bg-cyan/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-cyan shrink-0" aria-hidden />
          <div>
            <CardTitle className="text-lg">Use the API from your IDE or app</CardTitle>
            <CardDescription>
              Send your MasterNode key as <code className="text-xs">X-API-Key</code> on every request. Same REST API as
              the web UI—ideal for Cursor, VS Code REST Client, Postman, and CI.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="text-xs leading-relaxed bg-muted/80 border border-border rounded-lg p-3 overflow-x-auto font-mono text-muted-foreground">
          {envSnippet}
        </pre>
        <p className="text-sm text-muted-foreground">
          Copy a key from the list below (or paste an existing one), click <strong className="text-foreground">Save</strong>, then
          reuse the same value as <code className="text-xs bg-muted px-1 rounded">PI_API_KEY</code> in your tooling.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`${ROUTES.docs}#ide-and-api`} className="inline-flex">
            <Button variant="outline" size="sm" className="border-cyan/30">
              <BookOpen className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              Documentation: IDE &amp; API
            </Button>
          </Link>
          <a href={API_DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex">
            <Button variant="outline" size="sm" className="border-cyan/30">
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              OpenAPI — try requests
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
