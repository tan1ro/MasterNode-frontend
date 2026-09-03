import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Archive,
  ArrowUpCircle,
  Award,
  Ban,
  BarChart3,
  BookCopy,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  Code2,
  Compass,
  Copy,
  Crown,
  Database,
  DollarSign,
  Eye,
  FileCheck,
  FileSearch,
  FileSignature,
  FileStack,
  FileText,
  Filter,
  Fingerprint,
  Flag,
  FlaskConical,
  FormInput,
  Gauge,
  Gavel,
  Gift,
  GitBranch,
  GitFork,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  HeartHandshake,
  HelpCircle,
  Image,
  Inbox,
  Instagram,
  Landmark,
  Layers,
  Lightbulb,
  LineChart,
  Linkedin,
  List,
  ListChecks,
  ListOrdered,
  Lock,
  Magnet,
  Mail,
  Map,
  MapPin,
  Megaphone,
  Merge,
  MessageCircle,
  MessageSquare,
  Mic,
  Microscope,
  Monitor,
  MonitorPlay,
  MousePointer,
  Network,
  Newspaper,
  Package,
  PackageCheck,
  Palette,
  PenLine,
  PenTool,
  Phone,
  PieChart,
  PlayCircle,
  Plug,
  Presentation,
  Radar,
  Radio,
  Receipt,
  RefreshCw,
  Route,
  Scale,
  School,
  ScrollText,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Swords,
  Target,
  TestTube,
  Ticket,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Video,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { AssistantOutputFormat } from "@/constants/assistant-output-formats"

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  Research: Search,
  Summaries: List,
  "Code review": ShieldCheck,
  "Data extraction": Database,
  Writing: PenLine,
  Teaching: GraduationCap,
  Meetings: Calendar,
  "Risk management": AlertTriangle,
  "Decision support": Scale,
  Code: Code2,
  Marketing: Megaphone,
  "Market research": Radar,
  Branding: Palette,
  Content: PenLine,
  Digital: MousePointer,
  Social: Share2,
  "Demand gen": Target,
  Events: Ticket,
  CRO: LineChart,
  "Marketing ops": Workflow,
  Analytics: BarChart3,
  Lifecycle: Mail,
  PR: Newspaper,
  Sales: Briefcase,
  Prospecting: Radar,
  Qualification: ClipboardCheck,
  Discovery: MessageCircle,
  "Value selling": Presentation,
  Proposals: FileSignature,
  Negotiation: HeartHandshake,
  Closing: CheckCircle2,
  Expansion: ArrowUpCircle,
  "Sales ops": TrendingUp,
  Presales: Plug,
  Academics: GraduationCap,
  "Student success": School,
  Accreditation: Landmark,
  Legal: Scale,
  Contracts: FileSignature,
  "Privacy & data": Lock,
  Regulatory: Gavel,
  "Audit & controls": ClipboardCheck,
  "Governance & policy": Building2,
  Engineering: Wrench,
  Finance: DollarSign,
  General: Sparkles,
}

const DOMAIN_ICON_BG: Record<string, string> = {
  Research: "bg-violet/15 text-violet",
  Summaries: "bg-sky/15 text-sky",
  "Code review": "bg-cyan/15 text-cyan",
  "Data extraction": "bg-emerald/15 text-emerald",
  Writing: "bg-amber/15 text-amber",
  Teaching: "bg-oc/15 text-oc",
  Meetings: "bg-violet/15 text-violet",
  "Risk management": "bg-rose/15 text-rose",
  "Decision support": "bg-indigo/15 text-indigo",
  Code: "bg-cyan/15 text-cyan",
  Marketing: "bg-violet/15 text-violet",
  "Market research": "bg-violet/15 text-violet",
  Branding: "bg-fuchsia/15 text-fuchsia",
  Content: "bg-sky/15 text-sky",
  Digital: "bg-cyan/15 text-cyan",
  Social: "bg-indigo/15 text-indigo",
  "Demand gen": "bg-amber/15 text-amber",
  Events: "bg-oc/15 text-oc",
  CRO: "bg-rose/15 text-rose",
  "Marketing ops": "bg-muted text-muted-foreground",
  Analytics: "bg-emerald/15 text-emerald",
  Lifecycle: "bg-teal/15 text-teal",
  PR: "bg-violet/15 text-violet",
  Sales: "bg-emerald/15 text-emerald",
  Prospecting: "bg-sky/15 text-sky",
  Qualification: "bg-teal/15 text-teal",
  Discovery: "bg-indigo/15 text-indigo",
  "Value selling": "bg-violet/15 text-violet",
  Proposals: "bg-amber/15 text-amber",
  Negotiation: "bg-rose/15 text-rose",
  Closing: "bg-emerald/15 text-emerald",
  Expansion: "bg-oc/15 text-oc",
  "Sales ops": "bg-cyan/15 text-cyan",
  Presales: "bg-cyan/15 text-cyan",
  Academics: "bg-amber/15 text-amber",
  "Student success": "bg-sky/15 text-sky",
  Accreditation: "bg-indigo/15 text-indigo",
  Legal: "bg-sky/15 text-sky",
  Contracts: "bg-sky/15 text-sky",
  "Privacy & data": "bg-violet/15 text-violet",
  Regulatory: "bg-rose/15 text-rose",
  "Audit & controls": "bg-emerald/15 text-emerald",
  "Governance & policy": "bg-indigo/15 text-indigo",
  Engineering: "bg-cyan/15 text-cyan",
  Finance: "bg-emerald/15 text-emerald",
  General: "bg-amber/15 text-amber",
}

/** Per-template icons for sales specialists (distinct from Marketing megaphone). */
/** Per-template icons for academics specialists. */
const ACADEMICS_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "sample-academics-timetable-planner": Calendar,
  "sample-academics-research-architect": Microscope,
  "sample-academics-paper-journal-writer": ScrollText,
  "sample-academics-bloom-course-planner": Layers,
  "sample-academics-exam-blueprint": ClipboardCheck,
  "sample-academics-syllabus-auditor": List,
  "sample-academics-naac-nba-prep": Landmark,
  "sample-academics-project-mentor": Users,
  "sample-academics-literature-synthesizer": BookMarked,
  "sample-academics-thesis-planner": BookOpen,
  "sample-academics-grant-proposal": Award,
  "sample-academics-ethics-irb": ShieldCheck,
  "sample-academics-citation-auditor": FileCheck,
  "sample-academics-conference-poster": Presentation,
  "sample-academics-peer-review-response": PenTool,
  "sample-academics-lesson-planner": Lightbulb,
  "sample-academics-assignment-designer": ClipboardList,
  "sample-academics-study-coach": Brain,
  "sample-academics-defense-coach": GraduationCap,
  "sample-academics-obe-attainment": Target,
  "sample-academics-placement-coordinator": UserCheck,
  "sample-academics-rubric-designer": ListChecks,
  "sample-academics-lms-course-builder": Monitor,
  "sample-academics-flipped-classroom": RefreshCw,
  "sample-academics-lab-practical-planner": FlaskConical,
  "sample-academics-quiz-generator": HelpCircle,
  "sample-academics-grading-feedback": MessageCircle,
  "sample-academics-active-learning": Zap,
  "sample-academics-course-outline": FileText,
  "sample-academics-invigilation-planner": MapPin,
  "sample-academics-faculty-observation": Eye,
  "sample-academics-systematic-review": Search,
  "sample-academics-research-methodology": Compass,
  "sample-academics-journal-matcher": BookOpen,
  "sample-academics-abstract-writer": ScrollText,
  "sample-academics-research-data-plan": Database,
  "sample-academics-hypothesis-framer": Lightbulb,
  "sample-academics-replication-plan": Copy,
  "sample-academics-research-collaboration": Users,
  "sample-academics-bibliography-formatter": ListOrdered,
  "sample-academics-research-timeline": CalendarRange,
  "sample-academics-academic-advisor": UserCheck,
  "sample-academics-capstone-coach": Flag,
  "sample-academics-study-skills-workshop": School,
  "sample-academics-scholarship-finder": Search,
  "sample-academics-peer-tutoring": Users,
  "sample-academics-career-portfolio": Briefcase,
  "sample-academics-wellness-referral": Heart,
  "sample-academics-academic-integrity": ShieldAlert,
  "sample-academics-presentation-coach": Mic,
  "sample-academics-aqar-writer": ScrollText,
  "sample-academics-iqac-planner": Building2,
  "sample-academics-nba-sar": FileStack,
  "sample-academics-criteria-evidence": ClipboardCheck,
  "sample-academics-self-study-report": BookOpen,
  "sample-academics-outcome-framework": GitBranch,
}

const LEGAL_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "sample-legal-compliance-orchestrator": Building2,
  "sample-legal-contract-risk-lens": FileSignature,
  "sample-legal-audit-readiness": ClipboardCheck,
  "sample-legal-dpia-privacy-risk": Fingerprint,
  "sample-legal-vendor-compliance-screen": ShieldCheck,
  "sample-legal-policy-drafter": ScrollText,
  "sample-legal-obligation-mapper": Scale,
  "sample-legal-compliance-training-plan": GraduationCap,
  "sample-legal-control-testing": FileCheck,
  "sample-legal-nda-reviewer": Lock,
  "sample-legal-saas-msa-review": FileStack,
  "sample-legal-sla-credits": Target,
  "sample-legal-gdpr-dsar": Eye,
  "sample-legal-breach-response": ShieldAlert,
  "sample-legal-cookie-consent": Globe,
  "sample-legal-sox-controls": ClipboardList,
  "sample-legal-anti-bribery": Ban,
  "sample-legal-employment-compliance": Users,
  "sample-legal-esg-disclosure": TrendingUp,
  "sample-legal-records-retention": Archive,
  "sample-legal-ip-oss-compliance": Code2,
  "sample-legal-incident-triage": AlertTriangle,
  "sample-legal-litigation-hold": Gavel,
  "sample-legal-dpa-baa-reviewer": FileSignature,
  "sample-legal-ccpa-cpra-mapper": Map,
  "sample-legal-cross-border-transfer": Globe,
  "sample-legal-ropa-data-map": Database,
  "sample-legal-hipaa-security-gap": ShieldCheck,
  "sample-legal-pci-dss-scoper": Receipt,
  "sample-legal-coppa-children-privacy": Users,
  "sample-legal-sow-scope-reviewer": ListChecks,
  "sample-legal-indemnity-liability": Scale,
  "sample-legal-software-license-review": Lock,
  "sample-legal-subcontract-flowdown": GitBranch,
  "sample-legal-amendment-change-order": PenLine,
  "sample-legal-soc2-readiness": ShieldCheck,
  "sample-legal-iso27001-gap": Lock,
  "sample-legal-nist-csf-assessment": Radar,
  "sample-legal-tprm-assessment": Network,
  "sample-legal-subpoena-response": Gavel,
  "sample-legal-regulatory-exam-prep": ClipboardList,
  "sample-legal-aml-kyc-review": Landmark,
  "sample-legal-sanctions-export": Ban,
  "sample-legal-sec-disclosure": TrendingUp,
  "sample-legal-environmental-compliance": Globe,
  "sample-legal-workplace-investigation": Search,
  "sample-legal-worker-classification": Briefcase,
  "sample-legal-ada-accommodation": HeartHandshake,
  "sample-legal-i9-compliance": FileCheck,
  "sample-legal-ai-governance": Brain,
  "sample-legal-trademark-clearance": Award,
  "sample-legal-trade-secret-program": Lock,
  "sample-legal-patent-landscape": Microscope,
  "sample-legal-dmca-takedown": AlertOctagon,
  "sample-legal-whistleblower-program": Megaphone,
  "sample-legal-board-governance": Crown,
}

const MARKETING_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "sample-market-intel-engine": Radar,
  "sample-marketing-competitor-financials": TrendingUp,
  "sample-marketing-icp-mapping": Megaphone,
  "sample-marketing-customer-swot": Layers,
  "sample-marketing-positioning-messaging": Megaphone,
  "sample-marketing-gtm-architect": Megaphone,
  "sample-marketing-seo-brief": Search,
  "sample-marketing-ad-copy": Megaphone,
  "sample-marketing-campaign-planner": Megaphone,
  "sample-marketing-email-nurture": Mail,
  "sample-marketing-abm-campaign": Megaphone,
  "sample-marketing-inbound-routing": Megaphone,
  "sample-marketing-product-launch": Zap,
  "sample-marketing-attribution-model": Megaphone,
  "sample-marketing-competitive-battlecards": Megaphone,
}

const SALES_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "sample-sales-prospecting-planner": Briefcase,
  "sample-sales-lead-qualification-engine": Magnet,
  "sample-sales-discovery-facilitator": Briefcase,
  "sample-sales-needs-analysis": Briefcase,
  "sample-sales-stakeholder-engagement": Briefcase,
  "sample-sales-demo-presenter": MonitorPlay,
  "sample-sales-roi-business-case": DollarSign,
  "sample-sales-proposal-sow": FileSignature,
  "sample-sales-rfp-response": FileSignature,
  "sample-sales-negotiation-coach": Briefcase,
  "sample-sales-closing-coach": Briefcase,
  "sample-sales-pipeline-forecast": TrendingUp,
}

const PRESALES_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "sample-presales-technical-qualifier": Plug,
  "sample-presales-integration-architect": Plug,
  "sample-presales-demo-specialist": MonitorPlay,
  "sample-presales-poc-executor": Plug,
  "sample-presales-proposal-engineer": FileSignature,
  "sample-presales-feasibility-review": Plug,
  "sample-presales-delivery-handoff": Plug,
}

const PIPELINE_ROLE_ICONS: Record<string, LucideIcon> = {
  Master: Target,
  Decompose: GitFork,
  "Parallel Work": Bot,
  Aggregate: Merge,
  Supervise: ShieldCheck,
  Custom: Search,
}

const OUTPUT_FORMAT_ICONS: Record<AssistantOutputFormat, LucideIcon> = {
  pptx: Presentation,
  pdf: FileText,
  docx: FileText,
  html: Globe,
  image: Image,
  video: Video,
  research: BookOpen,
}

function isAcademicsTemplateId(templateId?: string | null): boolean {
  const id = String(templateId ?? "").trim()
  return id.startsWith("sample-academics-")
}

function isLegalTemplateId(templateId?: string | null): boolean {
  const id = String(templateId ?? "").trim()
  return id.startsWith("sample-legal-")
}

export function iconForDomainFocus(focus: string): LucideIcon {
  return DOMAIN_ICONS[focus] ?? Sparkles
}

export function domainFocusIconBg(focus: string): string {
  return DOMAIN_ICON_BG[focus] ?? "bg-muted text-muted-foreground"
}

/** Gallery / customize icon — falls back to domain focus when no dedicated icon exists. */
export function iconForAssistant(
  templateId?: string | null,
  domainFocus?: string | null
): LucideIcon {
  const id = String(templateId ?? "").trim()
  if (id && ACADEMICS_TEMPLATE_ICONS[id]) return ACADEMICS_TEMPLATE_ICONS[id]
  if (id && LEGAL_TEMPLATE_ICONS[id]) return LEGAL_TEMPLATE_ICONS[id]
  if (id && MARKETING_TEMPLATE_ICONS[id]) return MARKETING_TEMPLATE_ICONS[id]
  if (id && SALES_TEMPLATE_ICONS[id]) return SALES_TEMPLATE_ICONS[id]
  if (id && PRESALES_TEMPLATE_ICONS[id]) return PRESALES_TEMPLATE_ICONS[id]
  if (id.startsWith("sample-marketing-") || id.startsWith("sample-market-")) return Megaphone
  if (id.startsWith("sample-sales-")) return Briefcase
  if (id.startsWith("sample-presales-")) return Plug
  if (isAcademicsTemplateId(id)) return GraduationCap
  if (isLegalTemplateId(id)) return Scale
  const focus = String(domainFocus ?? "").trim()
  if (focus) return iconForDomainFocus(focus)
  return Sparkles
}

export function assistantIconBg(
  templateId?: string | null,
  domainFocus?: string | null
): string {
  const id = String(templateId ?? "").trim()
  if (id.startsWith("sample-presales-")) return DOMAIN_ICON_BG.Presales
  if (id.startsWith("sample-sales-")) return DOMAIN_ICON_BG.Sales
  if (id.startsWith("sample-marketing-") || id.startsWith("sample-market-")) {
    return DOMAIN_ICON_BG.Marketing
  }
  if (isAcademicsTemplateId(id)) return DOMAIN_ICON_BG.Academics
  if (isLegalTemplateId(id)) return DOMAIN_ICON_BG.Legal
  const focus = String(domainFocus ?? "").trim()
  if (focus) return domainFocusIconBg(focus)
  return "bg-muted text-muted-foreground"
}

export function iconForPipelineRole(role: string): LucideIcon {
  return PIPELINE_ROLE_ICONS[role] ?? Bot
}

export function iconForOutputFormat(fmt: AssistantOutputFormat | string): LucideIcon {
  const key = fmt as AssistantOutputFormat
  return OUTPUT_FORMAT_ICONS[key] ?? FileText
}
