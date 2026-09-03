import { desktopInstallSh, installScriptResponse, originFromRequest } from "@/lib/desktop-cli-install"

export function GET(request: Request) {
  return installScriptResponse(desktopInstallSh(originFromRequest(request)))
}
