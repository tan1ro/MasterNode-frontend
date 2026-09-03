"use client"

import type { ReactNode } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { NormalizedPlanJsonFields } from "@/lib/pipeline-plan-normalize"
import { cn } from "@/lib/utils"

type TodoDraft = {
  id: string
  content: string
  status: string
}

function linesToList(text: string): string[] {
  return text
    .split(/\n/)
    .map((line) => line.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean)
}

function listToLines(items: string[] | undefined): string {
  return (items || []).join("\n")
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-[11px] text-muted-foreground">{children}</p>
}

function ListField({
  id,
  label,
  hint,
  value,
  onChange,
  readOnly,
  rows = 4,
  placeholder,
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (next: string) => void
  readOnly?: boolean
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-[12px] text-foreground/90">
        {label}
      </Label>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        rows={rows}
        placeholder={placeholder}
        className="mt-1.5 min-h-[88px] resize-y text-[13px] leading-relaxed"
      />
    </div>
  )
}

export interface ChatPipelinePlanEditorProps {
  value: NormalizedPlanJsonFields
  onChange: (next: NormalizedPlanJsonFields) => void
  readOnly?: boolean
  className?: string
}

export function ChatPipelinePlanEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: ChatPipelinePlanEditorProps) {
  const todos: TodoDraft[] = (value.todos || []).map((todo, index) => ({
    id: String(todo.id || `step-${index + 1}`),
    content: String(todo.content || todo.task || ""),
    status: String(todo.status || "pending"),
  }))

  const patch = (partial: Partial<NormalizedPlanJsonFields>) => {
    if (readOnly) return
    onChange({ ...value, ...partial })
  }

  const updateTodo = (index: number, content: string) => {
    const next = todos.map((todo, i) =>
      i === index ? { ...todo, content } : todo
    )
    patch({ todos: next })
  }

  const removeTodo = (index: number) => {
    patch({ todos: todos.filter((_, i) => i !== index) })
  }

  const addTodo = () => {
    patch({
      todos: [
        ...todos,
        {
          id: `step-${todos.length + 1}`,
          content: "",
          status: "pending",
        },
      ],
    })
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label htmlFor="plan-title" className="text-[12px] text-foreground/90">
          Plan title
        </Label>
        <Input
          id="plan-title"
          value={value.name || ""}
          onChange={(e) => patch({ name: e.target.value })}
          readOnly={readOnly}
          className="mt-1.5 text-[13px]"
          placeholder="What should this plan be called?"
        />
      </div>

      <div>
        <Label htmlFor="plan-overview" className="text-[12px] text-foreground/90">
          Short summary
        </Label>
        <FieldHint>One or two sentences explaining the plan.</FieldHint>
        <Textarea
          id="plan-overview"
          value={value.overview || ""}
          onChange={(e) => patch({ overview: e.target.value })}
          readOnly={readOnly}
          rows={3}
          className="mt-1.5 min-h-[72px] resize-y text-[13px] leading-relaxed"
          placeholder="What is this plan about?"
        />
      </div>

      <div>
        <Label htmlFor="plan-objective" className="text-[12px] text-foreground/90">
          Goal
        </Label>
        <FieldHint>What should the pipeline achieve?</FieldHint>
        <Textarea
          id="plan-objective"
          value={value.objective || ""}
          onChange={(e) => patch({ objective: e.target.value })}
          readOnly={readOnly}
          rows={3}
          className="mt-1.5 min-h-[72px] resize-y text-[13px] leading-relaxed"
          placeholder="Describe the outcome you want."
        />
      </div>

      <ListField
        id="plan-inputs"
        label="What you need to provide"
        hint="One item per line."
        value={listToLines(value.requiredInputs)}
        onChange={(text) => patch({ requiredInputs: linesToList(text) })}
        readOnly={readOnly}
        placeholder={"Brand guidelines\nMission statement\nProgram details"}
      />

      <ListField
        id="plan-deliverables"
        label="Expected outputs"
        hint="One item per line."
        value={listToLines(value.deliverables)}
        onChange={(text) => patch({ deliverables: linesToList(text) })}
        readOnly={readOnly}
        placeholder={"Homepage content\nAbout page\nContact section"}
      />

      {(value.outline && value.outline.length > 0) || !readOnly ? (
        <ListField
          id="plan-outline"
          label="Outline"
          hint="Optional. One step or section per line."
          value={listToLines(value.outline)}
          onChange={(text) => patch({ outline: linesToList(text) })}
          readOnly={readOnly}
          rows={3}
          placeholder="Homepage\nAbout\nPrograms"
        />
      ) : null}

      <ListField
        id="plan-modules"
        label="Pipeline modules"
        hint="One module name per line."
        value={listToLines(value.modules)}
        onChange={(text) => patch({ modules: linesToList(text) })}
        readOnly={readOnly}
        rows={3}
        placeholder={"Planner\nDesigner\nDeveloper"}
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label className="text-[12px] text-foreground/90">Build steps</Label>
            <FieldHint>Edit the checklist the pipeline will follow.</FieldHint>
          </div>
          {!readOnly ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 shadow-none"
              onClick={addTodo}
            >
              <Plus className="h-3.5 w-3.5" />
              Add step
            </Button>
          ) : null}
        </div>
        <ul className="mt-2 space-y-2">
          {todos.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border/70 px-3 py-3 text-[12px] text-muted-foreground">
              No build steps yet.
            </li>
          ) : (
            todos.map((todo, index) => (
              <li key={`${todo.id}-${index}`} className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-center text-[11px] tabular-nums text-muted-foreground">
                  {index + 1}.
                </span>
                <Input
                  value={todo.content}
                  onChange={(e) => updateTodo(index, e.target.value)}
                  readOnly={readOnly}
                  className="text-[13px]"
                  placeholder="Describe this step"
                  aria-label={`Build step ${index + 1}`}
                />
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-0.5 h-9 w-9 shrink-0 px-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeTodo(index)}
                    aria-label={`Remove step ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>

      {value.clarificationUpdates && value.clarificationUpdates.length > 0 ? (
        <ListField
          id="plan-clarifications"
          label="Clarification updates"
          value={listToLines(value.clarificationUpdates)}
          onChange={(text) => patch({ clarificationUpdates: linesToList(text) })}
          readOnly={readOnly}
          rows={3}
        />
      ) : null}

      {value.yourChoices && value.yourChoices.length > 0 ? (
        <ListField
          id="plan-choices"
          label="Your choices"
          value={listToLines(value.yourChoices)}
          onChange={(text) => patch({ yourChoices: linesToList(text) })}
          readOnly={readOnly}
          rows={3}
        />
      ) : null}
    </div>
  )
}

export { linesToList, listToLines }
