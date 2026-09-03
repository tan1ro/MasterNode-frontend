import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSolution, SOLUTIONS } from "@/constants/solutions"
import { SolutionPage } from "@/components/solutions/solution-page"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const solution = getSolution(slug)
  if (!solution) return { title: "Solutions · MasterNode.ai" }
  return {
    title: `${solution.name} · Solutions · MasterNode.ai`,
    description: solution.subtitle,
  }
}

export default async function SolutionSlugPage({ params }: PageProps) {
  const { slug } = await params
  const solution = getSolution(slug)
  if (!solution) notFound()
  return <SolutionPage solution={solution} />
}
