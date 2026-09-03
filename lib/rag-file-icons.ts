import {
  BookOpen,
  FileCode,
  FileJson,
  FileText,
  Globe,
  Image,
  Presentation,
  Table2,
  type LucideIcon,
} from "lucide-react"
import { fileTypeStyleForExt } from "../constants/rag"

export interface RagFileVisual {
  icon: LucideIcon
  /** Icon tile: background, text, border */
  tile: string
  /** Type badge: background, text, border */
  badge: string
}

const DEFAULT_VISUAL: RagFileVisual = {
  icon: FileText,
  tile: "bg-muted/50 text-muted-foreground border-border/60",
  badge: "bg-muted/30 text-muted-foreground border-border/60",
}

const RAG_FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  pptx: Presentation,
  docx: FileText,
  xlsx: Table2,
  csv: Table2,
  json: FileJson,
  html: Globe,
  htm: Globe,
  md: BookOpen,
  markdown: BookOpen,
  txt: FileCode,
  png: Image,
  jpg: Image,
  jpeg: Image,
  webp: Image,
  gif: Image,
}

export function ragFileVisual(ext: string): RagFileVisual {
  const key = String(ext || "").trim().toLowerCase()
  const style = fileTypeStyleForExt(key)
  const icon = RAG_FILE_ICONS[key] ?? RAG_FILE_ICONS[style.label.toLowerCase()] ?? FileText
  return {
    icon,
    tile: style.tile,
    badge: style.badge,
  }
}

export function iconForRagFileExt(ext: string): LucideIcon {
  return ragFileVisual(ext).icon
}

export function ragFileIconTileClass(ext: string): string {
  return ragFileVisual(ext).tile
}

export function ragFileBadgeClass(ext: string): string {
  return ragFileVisual(ext).badge
}
