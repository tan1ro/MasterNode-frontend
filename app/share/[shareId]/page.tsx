import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SharedChatView } from "@/components/chat/shared-chat-view"
import { fetchPublicChatShare } from "@/lib/chat-share-public"
import { BRANDING } from "@/constants/branding"

type PageProps = {
  params: Promise<{ shareId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params
  const share = await fetchPublicChatShare(shareId)
  if (!share) {
    return { title: "Shared chat not found" }
  }
  const title = share.title?.trim() || "Shared chat"
  return {
    title,
    description: `A shared conversation on ${BRANDING.productName}`,
    alternates: { canonical: `/share/${encodeURIComponent(share.share_id)}` },
    openGraph: {
      title,
      description: `A shared conversation on ${BRANDING.productName}`,
      url: `/share/${encodeURIComponent(share.share_id)}`,
      type: "article",
    },
    robots: { index: false, follow: false },
  }
}

export default async function SharedChatPage({ params }: PageProps) {
  const { shareId } = await params
  const share = await fetchPublicChatShare(shareId)
  if (!share) {
    notFound()
  }
  return <SharedChatView share={share} />
}
