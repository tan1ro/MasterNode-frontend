import type { Metadata } from "next"
import { HttpErrorPage } from "@/components/errors/http-error-page"

export const metadata: Metadata = {
  title: "Page not found — MasterNode.ai",
}

export default function NotFound() {
  return <HttpErrorPage code={404} />
}
