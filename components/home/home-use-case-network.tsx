"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import { PI_MARK } from "@/constants/branding-assets"
import { HOME_SHELL } from "@/components/home/home-accent-styles"
import { HomeUseCaseDetailPanel } from "@/components/home/home-use-case-detail-panel"
import { HomeUseCaseNetworkMobile } from "@/components/home/home-use-case-network-mobile"
import { assistantCategoryTheme } from "@/components/agent-templates/template-role-utils"
import {
  DEFAULT_USE_CASE_HUB_ID,
  HOME_USE_CASE_HUBS,
  USE_CASE_ACCENT_STROKE,
  getUseCaseHub,
  type UseCaseHub,
} from "@/components/home/home-use-case-network-data"
import type { HomeNetworkCategory } from "@/constants/assistant-gallery-network"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useSequentialReveal } from "@/hooks/use-sequential-reveal"
import { useHomeScrollReveal } from "@/hooks/use-home-scroll-reveal"
import {
  HomeSectionRevealItem,
  SECTION_REVEAL,
} from "@/components/home/home-section-reveal"
import { HomeScrollReveal } from "@/components/home/home-scroll-reveal"
import { cn } from "@/lib/utils"

type NodeKind = "center" | "hub" | "leaf"

type SimNode = {
  id: string
  kind: NodeKind
  label: string
  hubId?: string
  anchorX: number
  anchorY: number
  x: number
  y: number
  vx: number
  vy: number
  phase: number
}

const CENTER_ID = "center"
/** Elliptical hub ring — wide horizontally, short vertically. */
const HUB_RADIUS_X = 0.33
const HUB_RADIUS_Y = 0.28
/** Distance from hub to the leaf arc, also elliptical. */
const LEAF_BASE_DIST_X = 0.15
const LEAF_BASE_DIST_Y = 0.15
/** Spacing along the tangent between neighboring leaves. */
const LEAF_TANGENT_STEP = 0.105
const NETWORK_CX = 0.5
const NETWORK_CY = 0.46
const POSITION_MIN = 0.04
const POSITION_MAX = 0.94
const LAYOUT_INSET_X = 0.07
const LAYOUT_INSET_Y = 0.1
/** Keep top labels below the section heading. */
const LAYOUT_PAD_TOP = 0.08

function clampNetworkPos(value: number) {
  return Math.min(POSITION_MAX, Math.max(POSITION_MIN, value))
}

function orbitOffset(
  t: number,
  phase: number,
  kind: NodeKind
): { ox: number; oy: number } {
  // Nearly static — tiny drift only so labels stay put.
  const scale = kind === "leaf" ? 0.25 : kind === "hub" ? 0.3 : 0.2
  const rx = 0.0035 * scale
  const ry = 0.003 * scale
  const speed = kind === "leaf" ? 0.4 : kind === "hub" ? 0.35 : 0.28
  return {
    ox: Math.sin(t * speed + phase) * rx,
    oy: Math.cos(t * speed * 0.9 + phase) * ry,
  }
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function polar(cx: number, cy: number, radiusX: number, radiusY: number, angleDeg: number) {
  const rad = degToRad(angleDeg - 90)
  return {
    x: cx + Math.cos(rad) * radiusX,
    y: cy + Math.sin(rad) * radiusY,
  }
}

/** Place leaves on an outward arc past the hub so spokes stay readable. */
function leafPositionsForHub(
  hubPos: { x: number; y: number },
  hubAngleDeg: number,
  leafCount: number
): Array<{ x: number; y: number }> {
  if (leafCount === 0) return []
  const outward = degToRad(hubAngleDeg - 90)
  const tangent = outward + Math.PI / 2
  const step = leafCount <= 2 ? LEAF_TANGENT_STEP * 1.12 : LEAF_TANGENT_STEP
  const baseX = hubPos.x + Math.cos(outward) * LEAF_BASE_DIST_X
  const baseY = hubPos.y + Math.sin(outward) * LEAF_BASE_DIST_Y

  return Array.from({ length: leafCount }, (_, leafIndex) => {
    const t = (leafIndex - (leafCount - 1) / 2) * step
    const bulge = (1 - Math.min(1, Math.abs(t) / (step * 1.6 + 0.01))) * 0.03
    return {
      x: baseX + Math.cos(tangent) * t + Math.cos(outward) * bulge,
      y: baseY + Math.sin(tangent) * t * 0.9 + Math.sin(outward) * bulge,
    }
  })
}

function buildRevealOrder(hubs: UseCaseHub[]): Map<string, number> {
  const order = new Map<string, number>()
  let step = 0
  order.set(CENTER_ID, step++)

  const sortedHubs = [...hubs].sort((a, b) => a.angle - b.angle)
  for (const hub of sortedHubs) {
    order.set(`hub-${hub.id}`, step++)
    hub.leaves.forEach((_, leafIndex) => {
      order.set(`leaf-${hub.id}-${leafIndex}`, step++)
    })
  }

  return order
}

function edgeRevealIndex(
  fromId: string,
  toId: string,
  order: Map<string, number>
): number {
  return Math.max(order.get(fromId) ?? 0, order.get(toId) ?? 0)
}

const REVEAL_ORDER = buildRevealOrder(HOME_USE_CASE_HUBS)
const MAX_REVEAL_STEP = Math.max(...REVEAL_ORDER.values())

function buildLayout(hubs: UseCaseHub[]): SimNode[] {
  const cx = NETWORK_CX
  const cy = NETWORK_CY
  const nodes: SimNode[] = [
    {
      id: CENTER_ID,
      kind: "center",
      label: "MasterNode",
      anchorX: cx,
      anchorY: cy,
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      phase: 0,
    },
  ]

  hubs.forEach((hub, hubIndex) => {
    const hubPos = polar(cx, cy, HUB_RADIUS_X, HUB_RADIUS_Y, hub.angle)
    const hubId = `hub-${hub.id}`
    nodes.push({
      id: hubId,
      kind: "hub",
      label: hub.graphLabel ?? hub.label,
      hubId: hub.id,
      anchorX: hubPos.x,
      anchorY: hubPos.y,
      x: hubPos.x,
      y: hubPos.y,
      vx: 0,
      vy: 0,
      phase: hubIndex * 1.15,
    })

    const positions = leafPositionsForHub(hubPos, hub.angle, hub.leaves.length)
    hub.leaves.forEach((leaf, leafIndex) => {
      const leafPos = positions[leafIndex] ?? hubPos
      nodes.push({
        id: `leaf-${hub.id}-${leafIndex}`,
        kind: "leaf",
        label: leaf.label,
        hubId: hub.id,
        anchorX: leafPos.x,
        anchorY: leafPos.y,
        x: leafPos.x,
        y: leafPos.y,
        vx: 0,
        vy: 0,
        phase: hubIndex * 0.9 + leafIndex * 0.55,
      })
    })
  })

  return finalizeLayout(nodes)
}

function pairMinDistance(a: SimNode, b: SimNode): number {
  const sameHub = Boolean(a.hubId && a.hubId === b.hubId)
  if (a.kind === "hub" && b.kind === "hub") return 0.26
  if (a.kind === "hub" || b.kind === "hub") {
    return sameHub ? 0.17 : 0.15
  }
  return sameHub ? 0.16 : 0.15
}

/** Soft push so leaf/hub labels stay clear of each other after polar layout. */
function separateOverlappingAnchors(nodes: SimNode[], clamp: boolean): void {
  const iterations = 48
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        if (a.kind === "center" || b.kind === "center") continue

        const pairMin = pairMinDistance(a, b) * (clamp ? 0.72 : 1)
        const dx = b.anchorX - a.anchorX
        const dy = b.anchorY - a.anchorY
        const dist = Math.hypot(dx, dy) || 0.0001
        if (dist >= pairMin) continue

        const push = ((pairMin - dist) / dist) * 0.55
        const ox = dx * push
        const oy = dy * push

        // Prefer moving leaves; nudge hubs only against foreign nodes.
        const moveA = a.kind === "leaf" || (a.kind === "hub" && b.kind === "hub")
        const moveB = b.kind === "leaf" || (b.kind === "hub" && a.kind === "hub")
        if (moveA) {
          a.anchorX -= ox
          if (!(a.kind === "hub" && b.kind === "hub")) a.anchorY -= oy
        }
        if (moveB) {
          b.anchorX += ox
          if (!(a.kind === "hub" && b.kind === "hub")) b.anchorY += oy
        }
        if (clamp) {
          if (moveA) {
            a.anchorX = clampNetworkPos(a.anchorX)
            a.anchorY = clampNetworkPos(a.anchorY)
          }
          if (moveB) {
            b.anchorX = clampNetworkPos(b.anchorX)
            b.anchorY = clampNetworkPos(b.anchorY)
          }
        }
      }
    }
  }
}

/** Scale X/Y independently so the graph can stay wide without getting taller. */
function fitAnchorsInBounds(nodes: SimNode[]): void {
  let maxDx = 0
  let maxDy = 0
  nodes.forEach((node) => {
    if (node.kind === "center") return
    maxDx = Math.max(maxDx, Math.abs(node.anchorX - NETWORK_CX))
    maxDy = Math.max(maxDy, Math.abs(node.anchorY - NETWORK_CY))
  })
  const scaleX = maxDx > 0.001 ? Math.min(1, (0.5 - LAYOUT_INSET_X) / maxDx) : 1
  const scaleY = maxDy > 0.001 ? Math.min(1, (0.5 - LAYOUT_INSET_Y) / maxDy) : 1
  if (scaleX >= 0.999 && scaleY >= 0.999) return

  nodes.forEach((node) => {
    if (node.kind === "center") return
    node.anchorX = NETWORK_CX + (node.anchorX - NETWORK_CX) * scaleX
    node.anchorY = NETWORK_CY + (node.anchorY - NETWORK_CY) * scaleY
  })
}

function alignOppositeHubs(nodes: SimNode[]): void {
  const pairs: Array<[string, string]> = [
    ["sales_marketing", "compliance"],
    ["academics", "legal"],
  ]
  const hubs = nodes.filter((node) => node.kind === "hub")

  for (const [leftId, rightId] of pairs) {
    const left = hubs.find((hub) => hub.hubId === leftId)
    const right = hubs.find((hub) => hub.hubId === rightId)
    if (!left || !right) continue

    const y = (left.anchorY + right.anchorY) / 2
    const dyLeft = y - left.anchorY
    const dyRight = y - right.anchorY
    left.anchorY = y
    right.anchorY = y

    nodes.forEach((node) => {
      if (node.kind !== "leaf") return
      if (node.hubId === leftId) node.anchorY += dyLeft
      if (node.hubId === rightId) node.anchorY += dyRight
    })
  }
}

/** Nudge the graph down only if labels would collide with the heading. */
function keepLabelsBelowHeading(nodes: SimNode[]): void {
  let minY = Infinity
  nodes.forEach((node) => {
    minY = Math.min(minY, node.anchorY)
  })
  if (!Number.isFinite(minY) || minY >= LAYOUT_PAD_TOP) return
  const dy = LAYOUT_PAD_TOP - minY
  nodes.forEach((node) => {
    node.anchorY += dy
  })
}

function finalizeLayout(nodes: SimNode[]): SimNode[] {
  separateOverlappingAnchors(nodes, false)
  fitAnchorsInBounds(nodes)
  separateOverlappingAnchors(nodes, true)
  alignOppositeHubs(nodes)
  nodes.forEach((node) => {
    if (node.kind === "center") return
    node.anchorX = clampNetworkPos(node.anchorX)
    node.anchorY = clampNetworkPos(node.anchorY)
  })
  keepLabelsBelowHeading(nodes)
  nodes.forEach((node) => {
    node.x = node.anchorX
    node.y = node.anchorY
  })
  return nodes
}

function connectionPairs(nodes: SimNode[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = []
  const hubByDomain = new Map<string, string>()

  nodes.forEach((node) => {
    if (node.kind === "hub") hubByDomain.set(node.hubId!, node.id)
  })

  nodes.forEach((node) => {
    if (node.kind === "hub") pairs.push([CENTER_ID, node.id])
    if (node.kind === "leaf" && node.hubId) {
      const hubNodeId = hubByDomain.get(node.hubId)
      if (hubNodeId) pairs.push([hubNodeId, node.id])
    }
  })

  return pairs
}

function lineAnchorEl(wrapper: HTMLElement, kind: NodeKind): HTMLElement {
  if (kind === "center") {
    return (wrapper.querySelector("[data-line-anchor]") as HTMLElement) ?? wrapper
  }
  return (wrapper.querySelector("[data-line-anchor]") as HTMLElement) ?? wrapper
}

function nodeCenterInContainer(
  el: HTMLElement,
  container: HTMLElement
): { x: number; y: number } {
  const c = container.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  return {
    x: r.left - c.left + r.width / 2,
    y: r.top - c.top + r.height / 2,
  }
}

/** Attach a spoke slightly into the label so the cap sits on the text. */
function edgePointOnNode(
  el: HTMLElement,
  container: HTMLElement,
  towardX: number,
  towardY: number,
  overlap = 2
): { x: number; y: number } {
  const origin = nodeCenterInContainer(el, container)
  const r = el.getBoundingClientRect()
  const dx = towardX - origin.x
  const dy = towardY - origin.y
  const dist = Math.hypot(dx, dy) || 1
  const nx = dx / dist
  const ny = dy / dist
  const hw = Math.max(3, r.width / 2 + overlap)
  const hh = Math.max(3, r.height / 2 + overlap)
  const tx = Math.abs(nx) < 1e-6 ? Number.POSITIVE_INFINITY : hw / Math.abs(nx)
  const ty = Math.abs(ny) < 1e-6 ? Number.POSITIVE_INFINITY : hh / Math.abs(ny)
  const t = Math.min(tx, ty)
  return { x: origin.x + nx * t, y: origin.y + ny * t }
}

function applyNodePosition(el: HTMLElement, node: SimNode) {
  el.style.left = `${node.x * 100}%`
  el.style.top = `${node.y * 100}%`
}

export function HomeUseCaseNetwork({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref: headerRevealRef, visible: headerVisible } = useHomeScrollReveal(0.2)
  const { ref: inViewRef, visible: inView } = useHomeScrollReveal(0.15)
  const { step: revealStep, isRevealed: isRevealStep } = useSequentialReveal(MAX_REVEAL_STEP, {
    enabled: inView,
    instant: reducedMotion,
    stepMs: 320,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nodeElsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const nodesRef = useRef<SimNode[]>(buildLayout(HOME_USE_CASE_HUBS))
  const pairsRef = useRef(connectionPairs(nodesRef.current))
  const lineElsRef = useRef<SVGLineElement[]>([])
  const frameRef = useRef<number>()
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false })
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [activeHubId, setActiveHubId] = useState(DEFAULT_USE_CASE_HUB_ID)

  const activeHub = getUseCaseHub(activeHubId) ?? HOME_USE_CASE_HUBS[0]
  const nodes = nodesRef.current

  const registerNode = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) nodeElsRef.current.set(id, el)
    else nodeElsRef.current.delete(id)
  }, [])

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })
  }, [])

  const syncNodeDom = useCallback(() => {
    nodesRef.current.forEach((node) => {
      const el = nodeElsRef.current.get(node.id)
      if (el) applyNodePosition(el, node)
    })
  }, [])

  const drawLinePositions = useCallback(() => {
    const currentNodes = nodesRef.current
    const container = containerRef.current
    if (!container || size.width === 0 || lineElsRef.current.length === 0) return

    const nodeById = new Map(currentNodes.map((n) => [n.id, n]))
    pairsRef.current.forEach(([fromId, toId], index) => {
      const from = nodeById.get(fromId)
      const to = nodeById.get(toId)
      const line = lineElsRef.current[index]
      const fromWrap = nodeElsRef.current.get(fromId)
      const toWrap = nodeElsRef.current.get(toId)
      if (!from || !to || !line || !fromWrap || !toWrap) return

      const fromEl = lineAnchorEl(fromWrap, from.kind)
      const toEl = lineAnchorEl(toWrap, to.kind)
      const fromCenter = nodeCenterInContainer(fromEl, container)
      const toCenter = nodeCenterInContainer(toEl, container)
      const start = edgePointOnNode(fromEl, container, toCenter.x, toCenter.y, 3)
      const end = edgePointOnNode(toEl, container, fromCenter.x, fromCenter.y, 3)
      line.setAttribute("x1", String(start.x))
      line.setAttribute("y1", String(start.y))
      line.setAttribute("x2", String(end.x))
      line.setAttribute("y2", String(end.y))
    })
  }, [size.height, size.width])

  const drawLineStyles = useCallback(() => {
    const svg = svgRef.current
    const currentNodes = nodesRef.current
    if (!svg || size.width === 0) return

    const nodeById = new Map(currentNodes.map((n) => [n.id, n]))
    const pairs = pairsRef.current
    const activeHub = getUseCaseHub(activeHubId)
    const activeStroke = activeHub ? USE_CASE_ACCENT_STROKE[activeHub.accent] : undefined

    if (lineElsRef.current.length !== pairs.length) {
      svg.innerHTML = ""
      lineElsRef.current = pairs.map(([fromId, toId]) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
        line.setAttribute("pathLength", "1")
        line.dataset.from = fromId
        line.dataset.to = toId
        svg.appendChild(line)
        return line
      })
    }

    pairs.forEach(([fromId, toId], index) => {
      const from = nodeById.get(fromId)
      const to = nodeById.get(toId)
      const line = lineElsRef.current[index]
      if (!from || !to || !line) return

      const isActive = from.hubId === activeHubId || to.hubId === activeHubId
      const revealIdx = edgeRevealIndex(fromId, toId, REVEAL_ORDER)
      const revealed = isRevealStep(revealIdx)
      const kind = from.kind === "center" || to.kind === "hub" ? "primary" : "secondary"

      line.setAttribute(
        "class",
        `home-use-case-network__line home-use-case-network__line--${kind}${isActive ? " home-use-case-network__line--active" : ""}${revealed ? " home-use-case-network__line--revealed" : ""}`
      )

      if (isActive && activeStroke) {
        line.setAttribute("stroke", activeStroke)
      } else {
        line.removeAttribute("stroke")
      }
    })

    drawLinePositions()
  }, [activeHubId, drawLinePositions, isRevealStep, revealStep, size.width])

  useEffect(() => {
    measure()
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure])

  useEffect(() => {
    syncNodeDom()
    drawLineStyles()
  }, [activeHubId, drawLineStyles, revealStep, size.width, syncNodeDom])

  useEffect(() => {
    if (reducedMotion || size.width === 0) return

    const spring = 0.024
    const damping = 0.82
    let start = performance.now()

    const step = (now: number) => {
      const t = (now - start) / 1000
      const parallaxX = mouseRef.current.active ? (mouseRef.current.x - 0.5) * 0.012 : 0
      const parallaxY = mouseRef.current.active ? (mouseRef.current.y - 0.5) * 0.012 : 0

      nodesRef.current.forEach((node) => {
        const { ox, oy } = orbitOffset(t, node.phase, node.kind)
        const targetX = clampNetworkPos(node.anchorX + parallaxX + ox)
        const targetY = clampNetworkPos(node.anchorY + parallaxY + oy)

        node.vx += (targetX - node.x) * spring
        node.vy += (targetY - node.y) * spring
        node.vx *= damping
        node.vy *= damping
        node.x = clampNetworkPos(node.x + node.vx)
        node.y = clampNetworkPos(node.y + node.vy)
      })

      syncNodeDom()
      drawLinePositions()
      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [drawLinePositions, reducedMotion, size.width, syncNodeDom])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      active: true,
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    mouseRef.current.active = false
  }, [])

  const selectHub = useCallback((hubId: string) => {
    setActiveHubId(hubId as HomeNetworkCategory)
  }, [])

  return (
    <section
      id="use-cases"
      className={cn(
        "home-use-case-network-section scroll-mt-[calc(var(--home-landing-nav-height)+1.5rem)] px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24",
        className
      )}
      aria-label="MasterNode use cases"
    >
      <div className={HOME_SHELL}>
        <div
          ref={headerRevealRef as React.RefObject<HTMLDivElement>}
          className="mx-auto mb-8 w-full text-center lg:mb-10"
        >
          <HomeSectionRevealItem
            visible={headerVisible}
            reducedMotion={reducedMotion}
            delayMs={0}
            className="home-section-badge--amber inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
          >
            <span
              className="size-1.5 rounded-full bg-amber shadow-[0_0_10px_hsl(var(--amber))]"
              aria-hidden
            />
            Domains
          </HomeSectionRevealItem>
          <h2 className="mt-5 font-heading text-[clamp(1.125rem,2.1vw+0.65rem,2.25rem)] font-bold leading-tight tracking-tight text-foreground whitespace-nowrap">
            <HomeSectionRevealItem
              visible={headerVisible}
              reducedMotion={reducedMotion}
              delayMs={SECTION_REVEAL.firstLine}
              className="block"
            >
              One platform. Specialized AI for every function.
            </HomeSectionRevealItem>
          </h2>
          <p className="mx-auto mt-2.5 max-w-3xl text-base leading-relaxed text-muted-foreground">
            <HomeSectionRevealItem
              visible={headerVisible}
              reducedMotion={reducedMotion}
              delayMs={SECTION_REVEAL.firstLine + SECTION_REVEAL.lineStagger}
              className="block"
            >
              MasterNode adapts its AI teams to the domain, context and workflow behind every request.
            </HomeSectionRevealItem>
          </p>
        </div>

        <div className="grid min-w-0 items-start gap-x-5 gap-y-3 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)] xl:gap-x-8">
          <HomeScrollReveal className="z-[1] min-w-0 lg:self-start">
            <HomeUseCaseDetailPanel
              hub={activeHub}
              className="min-w-0"
            />
          </HomeScrollReveal>

          <div
            ref={inViewRef as React.RefObject<HTMLDivElement>}
            className="min-w-0 lg:self-start"
          >
            <HomeUseCaseNetworkMobile
              activeHub={activeHub}
              onSelectHub={selectHub}
            />

            <div
              ref={containerRef}
              className="home-use-case-network relative -mt-2 mx-auto hidden w-full overflow-visible lg:block lg:aspect-[1.32/1]"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
            <svg
              ref={svgRef}
              className="home-use-case-network__svg pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox={size.width > 0 ? `0 0 ${size.width} ${size.height}` : undefined}
              preserveAspectRatio="none"
              overflow="visible"
              aria-hidden
            />

            {nodes.map((node) => {
              const revealIndex = REVEAL_ORDER.get(node.id) ?? 0
              const revealed = isRevealStep(revealIndex)

              if (node.kind === "center") {
                return (
                  <div
                    key={node.id}
                    ref={(el) => registerNode(node.id, el)}
                    className="home-use-case-network__center pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                  >
                    <div
                      className={cn(
                        "home-use-case-network__node-reveal",
                        revealed && "home-use-case-network__node-reveal--in"
                      )}
                    >
                      <Image
                        src={PI_MARK.src}
                        alt=""
                        width={40}
                        height={40}
                        data-line-anchor
                        className="home-use-case-network__mark mx-auto size-9 sm:size-10"
                        aria-hidden
                      />
                      <p className="home-use-case-network__brand mt-2 text-center text-lg font-medium tracking-tight text-foreground sm:text-xl">
                        MasterNode
                      </p>
                    </div>
                  </div>
                )
              }

              const isHub = node.kind === "hub"
              const isActive = node.hubId === activeHubId
              const isDimmed = revealed && Boolean(node.hubId && node.hubId !== activeHubId)
              const hubTheme =
                isHub && node.hubId ? assistantCategoryTheme(node.hubId) : null

              return (
                <div
                  key={node.id}
                  ref={(el) => registerNode(node.id, el)}
                    className={cn(
                      "home-use-case-network__node absolute -translate-x-1/2 -translate-y-1/2",
                      isHub ? "home-use-case-network__node--hub z-[2]" : "home-use-case-network__node--leaf z-[1]",
                      isDimmed && "opacity-35 transition-opacity duration-300",
                      isActive && !isHub && "opacity-100"
                    )}
                  style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
                >
                  <div
                    className={cn(
                      "home-use-case-network__node-reveal",
                      revealed && "home-use-case-network__node-reveal--in"
                    )}
                  >
                    {isHub ? (
                      <button
                        type="button"
                        onClick={() => selectHub(node.hubId!)}
                        onMouseEnter={() => selectHub(node.hubId!)}
                        onFocus={() => selectHub(node.hubId!)}
                        className={cn(
                          "home-use-case-network__hub-btn rounded-lg px-2.5 py-1.5 text-center transition-colors",
                          isActive && hubTheme?.tabActive
                        )}
                        data-line-anchor
                        aria-pressed={isActive}
                      >
                        <span
                          className={cn(
                            "font-heading text-[0.9375rem] leading-tight sm:text-base",
                            isActive ? hubTheme?.badgeIcon : "text-foreground/88"
                          )}
                        >
                          {node.label}
                        </span>
                      </button>
                    ) : (
                      <span
                        data-line-anchor
                        className={cn(
                          "text-[0.8125rem] leading-snug sm:text-sm",
                          isActive
                            ? "text-foreground/90"
                            : "text-muted-foreground/85"
                        )}
                      >
                        {node.label}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
