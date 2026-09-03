"use client"

import { HomePixelDecor } from "@/components/home/home-pixel-decor"
import { usePipelineDomain } from "@/components/home/home-pipeline-domain-context"
import { HomePipelineStageSlide } from "@/components/home/home-pipeline-stage-slide"
import {
  HomePipelineStageMockup,
  type PipelineMockupKey,
} from "@/components/home/home-pipeline-mockups"
import { pipelineStageScenario } from "@/constants/pipeline-domain-examples"
import type { HomePipelineStage } from "@/components/home/home-pipeline-stages"
import { cn } from "@/lib/utils"

function stageNumeral(index: number) {
  return String(index + 1).padStart(2, "0")
}

function StageTextPanel({
  stage,
  index,
  scenario,
  align = "left",
}: {
  stage: HomePipelineStage
  index: number
  scenario: string
  /** Content-side alignment — mirrors pixel clusters to that side. */
  align?: "left" | "right"
}) {
  const titleClass =
    stage.key === "parallel"
      ? "normal-case tracking-tight"
      : "uppercase tracking-tight"
  const isRight = align === "right"

  return (
    <article
      className={cn(
        "home-pipeline-card home-pipeline-card-glow relative flex w-full flex-col overflow-hidden rounded-[0.85rem] border bg-card sm:rounded-[1.35rem] dark:bg-[#050609]",
        stage.accentBorder
      )}
      style={{
        boxShadow: `inset 0 4px 95px -14px ${stage.accentHex}40, 0 0 56px -10px ${stage.accentHex}44`,
        ["--pipeline-glow" as string]: stage.accentHex,
      }}
    >
      {/* Dense pixel clusters always hug the content side */}
      <HomePixelDecor
        accentColor={stage.accentHex}
        density="dense"
        mirror={isRight}
      />
      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col px-3 pt-2.5 pb-0 sm:px-8 sm:pt-7 sm:pb-4 lg:px-11 lg:pt-9",
          isRight && "items-end text-right"
        )}
      >
        <span
          className="home-pipeline-jersey-num relative inline-block select-none text-[clamp(1.55rem,6.5vw,2.35rem)] leading-none sm:text-[clamp(2.15rem,9vw,11rem)]"
          style={{
            color: stage.accentHex,
            textShadow: `0 0 48px ${stage.accentHex}55, 0 0 96px ${stage.accentHex}33`,
          }}
          aria-hidden
        >
          {stageNumeral(index)}
        </span>

        <h3
          className={cn(
            "home-pipeline-title mt-1 max-w-md font-bold leading-tight text-foreground sm:mt-3",
            stage.key === "parallel"
              ? "text-sm sm:text-4xl lg:text-[2.75rem]"
              : "text-[0.8125rem] sm:text-3xl lg:text-4xl",
            titleClass,
            isRight && "ml-auto"
          )}
        >
          {stage.label}
        </h3>
      </div>

      <p
        className={cn(
          "relative z-10 mt-auto line-clamp-4 px-3 pb-4 pt-1.5 text-[0.6875rem] font-medium leading-snug text-foreground/95 sm:line-clamp-none sm:px-8 sm:pb-8 sm:pt-0 sm:text-lg lg:px-11 lg:pb-11 lg:text-xl",
          isRight && "text-right"
        )}
      >
        {scenario}
      </p>
    </article>
  )
}

export function HomePipelineStageBlock({
  stage,
  index,
}: {
  stage: HomePipelineStage
  index: number
}) {
  const { domain } = usePipelineDomain()
  const scenario = pipelineStageScenario(domain, stage.key)

  // Content card: dense pixels on the text side. Mockup: sparse hugging the outer edge.
  const textAlign = stage.layout === "text-left" ? "left" : "right"
  const mockupMirror = stage.layout === "text-left"

  const textPanel = (
    <StageTextPanel
      stage={stage}
      index={index}
      scenario={scenario}
      align={textAlign}
    />
  )
  const mockup = (
    <HomePipelineStageMockup
      stageKey={stage.key as PipelineMockupKey}
      density="sparse"
      mirror={mockupMirror}
    />
  )

  const textFrom = stage.layout === "text-left" ? "left" : "right"
  const mockupFrom = stage.layout === "text-left" ? "right" : "left"

  return (
    <div
      key={`${stage.key}-${domain.id}`}
      className="home-pipeline-stage-pair"
    >
      {stage.layout === "text-left" ? (
        <>
          <HomePipelineStageSlide from={textFrom}>{textPanel}</HomePipelineStageSlide>
          <HomePipelineStageSlide from={mockupFrom} delayMs={90}>
            {mockup}
          </HomePipelineStageSlide>
        </>
      ) : (
        <>
          <HomePipelineStageSlide from={mockupFrom}>{mockup}</HomePipelineStageSlide>
          <HomePipelineStageSlide from={textFrom} delayMs={90}>
            {textPanel}
          </HomePipelineStageSlide>
        </>
      )}
    </div>
  )
}
