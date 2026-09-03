/**
 * MasterNode Dark Code / Light — Shiki themes for the in-app code viewer only.
 * Does not affect generated website CSS variables or the generation pipeline.
 */
import type { ThemeRegistration } from "shiki"

export const SHIKI_THEME_DARK = "masternode-dark" as const
export const SHIKI_THEME_LIGHT = "masternode-light" as const

/**
 * Chrome + syntax for MasterNode Dark Code.
 * Canvas (#020509) stays the workspace; the viewer sits one step above it.
 */
export const MASTERNODE_EDITOR_DARK = {
  appBackground: "#020509",
  editorBackground: "#0B0D12",
  editorHeader: "#11141A",
  editorGutter: "#0B0D12",
  editorForeground: "#E6E8ED",
  editorForegroundSecondary: "#A0A7B4",
  comment: "#697382",
  lineNumber: "#4A5360",
  lineNumberActive: "#A0A7B4",
  lineHighlight: "rgba(230,232,237,0.04)",
  lineHighlightSolid: "#12151C",
  selection: "rgba(130,170,255,0.22)",
  selectionFg: "#FFFFFF",
  cursor: "#E6E8ED",
  gutterBorder: "#1B202A",
  border: "#1B202A",
  headerBorder: "#1B202A",
  title: "#E6E8ED",
  muted: "#A0A7B4",
  buttonBg: "#161A22",
  buttonBorder: "#1B202A",
  buttonFg: "#A0A7B4",
  buttonHoverBg: "#1C212B",
  buttonHoverFg: "#E6E8ED",
  accentBg: "#161A22",
  accentBorder: "#2A3140",
  punctuation: "#A0A7B4",
  tag: "#F07178",
  attribute: "#7DD3FC",
  string: "#A8D96C",
  doctype: "#C792EA",
  selector: "#82AAFF",
  property: "#82AAFF",
  value: "#E5C07B",
  cssVariable: "#7DD3FC",
  number: "#E5C07B",
  cssFunction: "#F2A65A",
  keyword: "#C792EA",
  function: "#F2A65A",
  jsNumber: "#E5C07B",
  boolean: "#F07178",
  type: "#4EC9B0",
  jsonKey: "#82AAFF",
  markdownCode: "#F07178",
  markdownLink: "#7DD3FC",
} as const

export const MASTERNODE_EDITOR_LIGHT = {
  appBackground: "#F3F4F7",
  editorBackground: "#F7F8FA",
  editorHeader: "#EEF0F4",
  editorGutter: "#F7F8FA",
  editorForeground: "#1F2430",
  editorForegroundSecondary: "#3D4656",
  comment: "#6B7280",
  lineNumber: "#8B93A3",
  lineNumberActive: "#4B5568",
  lineHighlight: "rgba(15,23,42,0.04)",
  lineHighlightSolid: "#E8EBF1",
  selection: "rgba(120,140,255,0.22)",
  selectionFg: "#0F172A",
  cursor: "#1F2430",
  gutterBorder: "rgba(15,23,42,0.08)",
  border: "#D8DDE6",
  headerBorder: "#D8DDE6",
  title: "#1F2430",
  muted: "#5B6575",
  buttonBg: "#FFFFFF",
  buttonBorder: "#D0D5DE",
  buttonFg: "#3D4656",
  buttonHoverBg: "#E8EBF1",
  buttonHoverFg: "#1F2430",
  accentBg: "#E8EEF8",
  accentBorder: "#B7C6DE",
  punctuation: "#64748B",
  tag: "#C2410C",
  attribute: "#0369A1",
  string: "#3F7D20",
  doctype: "#7C3AED",
  selector: "#1D4ED8",
  property: "#0369A1",
  value: "#A16207",
  cssVariable: "#0369A1",
  number: "#A16207",
  cssFunction: "#C2410C",
  keyword: "#7C3AED",
  function: "#C2410C",
  jsNumber: "#A16207",
  boolean: "#BE123C",
  type: "#1D4ED8",
  jsonKey: "#1D4ED8",
  markdownCode: "#BE123C",
  markdownLink: "#0369A1",
} as const

export type MasternodeEditorTokens = {
  [K in keyof typeof MASTERNODE_EDITOR_DARK]: string
}

export function masternodeEditorTokens(scheme: "light" | "dark"): MasternodeEditorTokens {
  return scheme === "dark" ? MASTERNODE_EDITOR_DARK : MASTERNODE_EDITOR_LIGHT
}

/** Dark canvas wins. Light only when the document is explicitly not dark. */
export function codeViewerColorScheme(opts: {
  resolvedTheme?: string | null
  documentHasDarkClass?: boolean
}): "light" | "dark" {
  if (opts.documentHasDarkClass) return "dark"
  if (opts.resolvedTheme === "light") return "light"
  return "dark"
}

/** CSS custom properties applied to `.code-block` (viewer chrome only). */
export function codeBlockCssVars(scheme: "light" | "dark"): Record<string, string> {
  const t = masternodeEditorTokens(scheme)
  return {
    "--code-block-bg": t.editorBackground,
    "--code-block-header-bg": t.editorHeader,
    "--code-block-gutter": t.editorGutter,
    "--code-block-gutter-border": t.gutterBorder,
    "--code-block-fg": t.editorForeground,
    "--code-block-fg-secondary": t.editorForegroundSecondary,
    "--code-block-muted": t.muted,
    "--code-block-title": t.title,
    "--code-block-border": t.border,
    "--code-block-header-border": t.headerBorder,
    "--code-block-btn-border": t.buttonBorder,
    "--code-block-btn-bg": t.buttonBg,
    "--code-block-btn-fg": t.buttonFg,
    "--code-block-btn-hover-bg": t.buttonHoverBg,
    "--code-block-btn-hover-fg": t.buttonHoverFg,
    "--code-block-accent-bg": t.accentBg,
    "--code-block-accent-border": t.accentBorder,
    "--code-block-line-number": t.lineNumber,
    "--code-block-line-number-active": t.lineNumberActive,
    "--code-block-line-active": t.lineHighlight,
    "--code-block-selection": t.selection,
    "--code-block-selection-fg": t.selectionFg,
  }
}

function tokenColors(t: MasternodeEditorTokens): NonNullable<ThemeRegistration["tokenColors"]> {
  return [
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: t.comment, fontStyle: "italic" },
    },
    {
      scope: [
        "punctuation",
        "punctuation.definition.tag",
        "punctuation.definition.tag.begin",
        "punctuation.definition.tag.end",
        "punctuation.separator",
        "punctuation.terminator",
        "punctuation.accessor",
        "punctuation.section",
        "meta.brace",
        "keyword.operator",
      ],
      settings: { foreground: t.punctuation },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.control.import",
        "keyword.control.export",
        "keyword.control.from",
        "keyword.control.flow",
        "keyword.operator.new",
        "keyword.other",
        "storage",
        "storage.type",
        "storage.modifier",
      ],
      settings: { foreground: t.keyword },
    },
    {
      scope: ["storage.modifier.package", "storage.modifier.import", "storage.type.java"],
      settings: { foreground: t.editorForeground },
    },
    {
      scope: ["keyword.other.doctype", "meta.tag.sgml.doctype", "entity.name.tag.doctype"],
      settings: { foreground: t.doctype },
    },
    {
      scope: ["string", "string.quoted", "string.template", "string.unquoted"],
      settings: { foreground: t.string },
    },
    {
      scope: ["constant.numeric.css"],
      settings: { foreground: t.number },
    },
    {
      scope: ["constant.numeric", "constant.numeric.integer", "constant.numeric.float", "constant.numeric.hex"],
      settings: { foreground: t.jsNumber },
    },
    {
      scope: ["constant.language.boolean", "constant.language.null", "constant.language", "constant.language.json"],
      settings: { foreground: t.boolean },
    },
    {
      scope: ["entity.name.tag", "entity.name.tag.html", "entity.name.tag.xml"],
      settings: { foreground: t.tag },
    },
    {
      scope: [
        "entity.name.tag.css",
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.pseudo-element.css",
        "source.css entity.name.tag",
        "meta.selector.css",
      ],
      settings: { foreground: t.selector },
    },
    {
      scope: ["entity.other.attribute-name", "entity.other.attribute-name.html"],
      settings: { foreground: t.attribute },
    },
    {
      scope: [
        "support.type.property-name",
        "support.type.property-name.css",
        "meta.property-name",
        "meta.property-name.css",
      ],
      settings: { foreground: t.property },
    },
    {
      scope: [
        "support.constant.property-value",
        "support.constant.property-value.css",
        "constant.other.color",
        "constant.other.color.rgb-value",
        "support.constant.color",
        "meta.property-value.css",
      ],
      settings: { foreground: t.value },
    },
    {
      scope: [
        "variable.css",
        "variable.argument.css",
        "variable.other.custom-property",
        "support.type.custom-property.css",
        "entity.other.attribute-name.custom.css",
      ],
      settings: { foreground: t.cssVariable },
    },
    {
      scope: ["support.function.css", "support.function.misc.css", "support.function.any-method.css"],
      settings: { foreground: t.cssFunction },
    },
    {
      scope: [
        "entity.name.function",
        "entity.name.function.member",
        "meta.function-call",
        "meta.function-call.generic",
        "support.function",
        "support.function.builtin",
      ],
      settings: { foreground: t.function },
    },
    {
      scope: [
        "support.type",
        "entity.name.type",
        "entity.name.class",
        "entity.name.namespace",
        "support.class",
        "storage.type.primitive",
      ],
      settings: { foreground: t.type },
    },
    {
      scope: ["support.class.component", "entity.name.tag.jsx", "entity.name.tag.tsx"],
      settings: { foreground: t.type },
    },
    {
      scope: ["variable.other.property", "meta.object-literal.key", "support.type.property-name.json"],
      settings: { foreground: t.jsonKey },
    },
    {
      scope: ["markup.heading", "markup.heading entity.name", "punctuation.definition.heading", "entity.name.section"],
      settings: { foreground: t.keyword, fontStyle: "bold" },
    },
    {
      scope: ["markup.inline.raw", "markup.raw.inline", "markup.fenced_code.block.language"],
      settings: { foreground: t.markdownCode },
    },
    {
      scope: ["markup.underline.link", "string.other.link", "meta.link"],
      settings: { foreground: t.markdownLink },
    },
    {
      scope: ["markup.bold", "markup.italic"],
      settings: { foreground: t.editorForeground },
    },
    {
      scope: ["punctuation.definition.list", "markup.list"],
      settings: { foreground: t.comment },
    },
    {
      scope: ["variable", "variable.other", "variable.other.readwrite", "variable.other.object"],
      settings: { foreground: t.editorForeground },
    },
    {
      scope: ["variable.parameter", "variable.parameter.function"],
      settings: { foreground: t.editorForegroundSecondary },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: t.tag },
    },
  ]
}

function shikiTheme(name: string, displayName: string, type: "dark" | "light", t: MasternodeEditorTokens): ThemeRegistration {
  return {
    name,
    displayName,
    type,
    fg: t.editorForeground,
    bg: t.editorBackground,
    colors: {
      "editor.background": t.editorBackground,
      "editor.foreground": t.editorForeground,
      "editorLineNumber.foreground": t.lineNumber,
      "editorLineNumber.activeForeground": t.lineNumberActive,
      "editor.lineHighlightBackground": t.lineHighlightSolid,
      "editor.selectionBackground": t.selection,
      "editorCursor.foreground": t.cursor,
      "editorGutter.background": t.editorGutter,
    },
    tokenColors: tokenColors(t),
  }
}

export const MASTERNODE_SHIKI_THEME_DARK: ThemeRegistration = shikiTheme(
  SHIKI_THEME_DARK,
  "MasterNode Dark Code",
  "dark",
  MASTERNODE_EDITOR_DARK
)

export const MASTERNODE_SHIKI_THEME_LIGHT: ThemeRegistration = shikiTheme(
  SHIKI_THEME_LIGHT,
  "MasterNode Light Code",
  "light",
  MASTERNODE_EDITOR_LIGHT
)
