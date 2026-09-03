import { desktopInstallPs1, installScriptResponse, originFromRequest } from "@/lib/desktop-cli-install"

export function GET(request: Request) {
  return installScriptResponse(desktopInstallPs1(originFromRequest(request)))
}
