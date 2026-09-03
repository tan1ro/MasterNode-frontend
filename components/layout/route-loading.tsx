export function RouteLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl animate-pulse space-y-4" aria-busy="true">
      <div className="h-8 w-48 rounded-md bg-muted" />
      <div className="h-4 w-full max-w-xl rounded-md bg-muted/70" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 rounded-lg bg-muted/50" />
        <div className="h-32 rounded-lg bg-muted/50" />
      </div>
      <p className="sr-only">{label}</p>
    </div>
  )
}
