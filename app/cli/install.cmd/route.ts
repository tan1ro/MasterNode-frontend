import { desktopInstallCmd, installScriptResponse, originFromRequest } from "@/lib/desktop-cli-install"

export function GET(request: Request) {
  return installScriptResponse(desktopInstallCmd(originFromRequest(request)))
}
