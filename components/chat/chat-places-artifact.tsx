"use client"

import { ExternalLink, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PlacesArtifact {
  location: string
  latitude: number
  longitude: number
  timezone?: string
  map_image_url: string
  osm_url: string
  maps_url: string
}

export function ChatPlacesArtifact({
  artifact,
  className,
}: {
  artifact: PlacesArtifact
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-3 overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[21/9] w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artifact.map_image_url}
          alt={`Map of ${artifact.location}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{artifact.location}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {artifact.latitude.toFixed(4)}°, {artifact.longitude.toFixed(4)}°
              {artifact.timezone ? ` · ${artifact.timezone}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={artifact.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1 text-xs text-foreground hover:bg-muted/60"
          >
            Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={artifact.osm_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-1 text-xs text-foreground hover:bg-muted/60"
          >
            OpenStreetMap
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
