import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/routes"

/** Former New Task form — creators create tasks via Chat only. */
export default function NewTaskPage() {
  redirect(ROUTES.chat)
}
