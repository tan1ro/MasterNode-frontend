import { describe, expect, it } from "vitest"
import {
  applyOptimisticPlanContinue,
  extractPipelinePlanFromTask,
  isAwaitingPlanReview,
  isPlanReviewPhase,
  taskHasApprovedPlanExecution,
  taskHasStoredPlan,
  taskRequiresPlanApproval,
} from "./pipeline-plan"
import type { Task } from "@/types/api"

describe("pipeline-plan", () => {
  it("extracts plan markdown and questions from task", () => {
    const task = {
      task_id: "t1",
      task: "write doc",
      status: "awaiting_plan_review",
      created_at: "",
      updated_at: "",
      pipeline_plan: {
        plan_markdown: "# Plan\n\n## Goal\nTest",
        questions: [
          {
            id: "q1",
            prompt: "Depth?",
            options: [{ id: "a", label: "Short" }],
          },
        ],
      },
    } as Task
    const plan = extractPipelinePlanFromTask(task)
    expect(plan?.plan_markdown).toContain("## Goal")
    expect(plan?.questions).toHaveLength(1)
    expect(isAwaitingPlanReview(task.status)).toBe(true)
    expect(taskHasStoredPlan(task)).toBe(true)
  })

  it("detects approved plan execution vs awaiting review", () => {
    const awaiting = {
      task_id: "t2",
      task: "doc",
      status: "awaiting_plan_review",
      created_at: "",
      updated_at: "",
      pipeline_plan: {
        plan_markdown: "# Plan",
        questions: [{ id: "q1", prompt: "Depth?", options: [{ id: "a", label: "Short" }] }],
      },
    } as Task
    expect(taskHasApprovedPlanExecution(awaiting)).toBe(false)

    const approved = {
      ...awaiting,
      status: "running",
      approved_plan_markdown: "# Plan\n\n## Your choices",
      pipeline_plan: {
        ...awaiting.pipeline_plan,
        status: "approved",
        answers: { q1: "a" },
      },
    } as Task
    expect(taskHasApprovedPlanExecution(approved)).toBe(true)

    const prematureComplete = {
      ...awaiting,
      status: "completed",
      pipeline_plan: {
        plan_markdown: "# Plan",
        questions: [{ id: "q1", prompt: "Depth?", options: [{ id: "a", label: "Short" }] }],
      },
    } as Task
    expect(taskHasApprovedPlanExecution(prematureComplete)).toBe(false)
  })

  it("keeps plan review phase when status is running without approval", () => {
    const premature = {
      task_id: "t3",
      task: "doc",
      status: "running",
      created_at: "",
      updated_at: "",
      pipeline_plan: {
        plan_markdown: "# Plan",
        questions: [{ id: "q1", prompt: "Depth?", options: [{ id: "a", label: "Short" }] }],
      },
    } as Task
    expect(isPlanReviewPhase(premature)).toBe(true)
    expect(taskHasApprovedPlanExecution(premature)).toBe(false)
  })

  it("requires approval for chat-sourced tasks even when plan metadata was stripped", () => {
    const chatRun = {
      task_id: "t4",
      task: "Create a portfolio website",
      status: "running",
      created_at: "",
      updated_at: "",
      source_conversation_id: "conv-1",
    } as Task
    expect(taskRequiresPlanApproval(chatRun)).toBe(true)
    expect(taskHasApprovedPlanExecution(chatRun)).toBe(false)
    expect(isPlanReviewPhase(chatRun)).toBe(true)
  })

  it("does not treat completed tasks as plan review even without approval", () => {
    const prematureComplete = {
      task_id: "t5",
      task: "Create a portfolio website",
      status: "completed",
      created_at: "",
      updated_at: "",
      source_conversation_id: "conv-1",
      pipeline_plan: {
        plan_markdown: "# Plan",
        questions: [{ id: "q1", prompt: "Purpose?", options: [{ id: "a", label: "Branding" }] }],
      },
    } as Task
    expect(isPlanReviewPhase(prematureComplete)).toBe(false)
    expect(taskHasApprovedPlanExecution(prematureComplete)).toBe(false)
  })

  it("optimistically flips awaiting plan review into a running approved task", () => {
    const awaiting = {
      task_id: "t6",
      task: "inflation brief",
      status: "awaiting_plan_review",
      created_at: "",
      updated_at: "",
      plan_review: true,
      pipeline_plan: {
        plan_markdown: "# Global Inflation\n",
        status: "draft",
        questions: [],
      },
    } as Task
    const next = applyOptimisticPlanContinue(awaiting, {
      planMarkdown: "# Global Inflation\n\nApproved",
      answers: { q1: "a" },
    })
    expect(next?.status).toBe("running")
    expect(next?.plan_review).toBe(false)
    expect(next?.approved_plan_markdown).toContain("Approved")
    expect(next?.pipeline_plan?.status).toBe("approved")
    expect(isPlanReviewPhase(next)).toBe(false)
    expect(taskHasApprovedPlanExecution(next)).toBe(true)
  })

  it("prefers approved_plan_markdown when extracting a saved plan from a task", () => {
    const task = {
      task_id: "t7",
      task: "inflation brief",
      status: "running",
      created_at: "",
      updated_at: "",
      approved_plan_markdown: "# Approved Global Inflation Plan\n",
      pipeline_plan: {
        plan_markdown: "# Draft plan\n",
        status: "approved",
        modules: ["Research"],
      },
    } as Task
    const plan = extractPipelinePlanFromTask(task)
    expect(plan?.plan_markdown).toContain("Approved Global Inflation Plan")
    expect(plan?.status).toBe("approved")
    expect(plan?.modules).toEqual(["Research"])
  })
})
