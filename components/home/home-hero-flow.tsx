"use client"

import { useEffect, useRef } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type Point = { x: number; y: number }

const LAYERS = [
  { thickness: 0.16, speed: 1, alpha: 0.55, yBias: 0.72 },
  { thickness: 0.11, speed: 1.35, alpha: 0.42, yBias: 0.82 },
  { thickness: 0.09, speed: 0.85, alpha: 0.34, yBias: 0.62 },
] as const

function waveY(
  xNorm: number,
  time: number,
  layer: number,
  height: number,
  yBias: number
): number {
  const t = time * 0.00038 * LAYERS[layer].speed
  const x = xNorm * Math.PI * 2
  return (
    height * yBias +
    Math.sin(x * 1.1 + t) * height * 0.11 +
    Math.sin(x * 2.3 - t * 1.4) * height * 0.06 +
    Math.cos(x * 0.7 + t * 0.6) * height * 0.04
  )
}

function buildRibbonPoints(
  width: number,
  height: number,
  time: number,
  layerIndex: number
): { upper: Point[]; lower: Point[] } {
  const layer = LAYERS[layerIndex]
  const steps = Math.max(80, Math.floor(width / 8))
  const half = (height * layer.thickness) / 2
  const upper: Point[] = []
  const lower: Point[] = []

  for (let i = 0; i <= steps; i++) {
    const xNorm = i / steps
    const x = xNorm * width
    const y = waveY(xNorm, time, layerIndex, height, layer.yBias)
    upper.push({ x, y: y - half })
    lower.push({ x, y: y + half })
  }

  return { upper, lower }
}

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  layerIndex: number,
  isDark: boolean
) {
  const layer = LAYERS[layerIndex]
  const { upper, lower } = buildRibbonPoints(width, height, time, layerIndex)

  ctx.save()
  ctx.beginPath()
  upper.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  for (let i = lower.length - 1; i >= 0; i--) {
    ctx.lineTo(lower[i].x, lower[i].y)
  }
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, height * 0.55, width, height)
  if (isDark) {
    grad.addColorStop(0, `rgba(244, 164, 41, ${layer.alpha * 0.7})`)
    grad.addColorStop(0.45, `rgba(34, 208, 200, ${layer.alpha * 0.85})`)
    grad.addColorStop(1, `rgba(184, 240, 51, ${layer.alpha * 0.65})`)
  } else {
    grad.addColorStop(0, `rgba(244, 164, 41, ${layer.alpha * 0.45})`)
    grad.addColorStop(0.5, `rgba(34, 208, 200, ${layer.alpha * 0.5})`)
    grad.addColorStop(1, `rgba(120, 180, 60, ${layer.alpha * 0.4})`)
  }

  ctx.fillStyle = grad
  ctx.globalCompositeOperation = layerIndex === 0 ? "source-over" : "screen"
  ctx.filter = "blur(0.5px)"
  ctx.fill()
  ctx.restore()
}

function paintFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = "source-over"

  for (let i = LAYERS.length - 1; i >= 0; i--) {
    drawRibbon(ctx, width, height, time, i, isDark)
  }
}

export function HomeHeroFlow({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const rafRef = useRef<number>(0)
  const isDarkRef = useRef(true)

  useEffect(() => {
    isDarkRef.current = document.documentElement.classList.contains("dark")
    const observer = new MutationObserver(() => {
      isDarkRef.current = document.documentElement.classList.contains("dark")
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || reducedMotion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = container.getBoundingClientRect()
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const loop = (time: number) => {
      const { width, height } = container.getBoundingClientRect()
      paintFrame(ctx, width, height, time, isDarkRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  const anchorClass =
    "pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[48%] min-h-[14rem] max-h-[28rem] overflow-hidden sm:h-[52%] sm:max-h-[32rem]"

  if (reducedMotion) {
    return null
  }

  return (
    <div ref={containerRef} className={cn(anchorClass, className)} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
