import type { Metadata } from "next"
import { BlogIndex } from "@/components/blog/blog-index"
import { getAllPosts, getFeaturedPosts } from "@/constants/blog"
import { BRANDING } from "@/constants/branding"
import { ROUTES } from "@/lib/routes"

export const metadata: Metadata = {
  title: "Blog — MasterNode",
  description:
    "Product updates, engineering deep-dives, and best practices for building with parallel LLM agents on MasterNode.ai.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${BRANDING.productName} Blog`,
    description:
      "Product updates, engineering deep-dives, and how we think about orchestrating LLMs at scale.",
    url: "/blog",
    type: "website",
  },
}

export default function BlogPage() {
  return (
    <BlogIndex posts={getAllPosts()} featured={getFeaturedPosts()} ctaHref={ROUTES.signUp} />
  )
}
