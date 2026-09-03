import type { Metadata } from "next"
import "./globals.css"
import { AccessDeniedBannerSlot } from "@/components/layout/access-denied-banner-slot"
import { QueryProvider } from "@/providers/query-provider"
import { AuthSessionProvider } from "@/providers/auth-session-provider"
import { AuthJsProvider } from "@/providers/auth-js-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { SiteChromeNav } from "@/components/layout/site-chrome-nav"
import { MarketingChrome } from "@/components/marketing/marketing-page"
import { Footer } from "@/components/layout/footer"
import { AppShellMain } from "@/components/layout/app-shell-main"
import { SupportChatWidget } from "@/components/chat/support-chat-widget"
import { AuthProfileSync } from "@/components/layout/auth-profile-sync"
import { CookieConsentBanner } from "@/components/layout/cookie-consent-banner"
import { AnalyticsBootstrap } from "@/components/analytics/analytics-bootstrap"
import { ConsentSync } from "@/components/analytics/consent-sync"
import { DisableInspect } from "@/components/layout/disable-inspect"
import { PreferencesBodySync } from "@/components/layout/preferences-body-sync"
import { SuperuserHealthStrip } from "@/components/layout/superuser-health-strip"
import { BackendAvailabilityMonitor } from "@/components/layout/backend-availability-monitor"
import { DesktopAppBridge } from "@/components/layout/desktop-app-bridge"
import { DesktopNativeAuthGate } from "@/components/layout/desktop-native-auth-gate"
import { BRANDING } from "@/constants/branding"
import { shouldBlockInspect } from "@/lib/disable-inspect"

const productTitle = BRANDING.isBeta
  ? `${BRANDING.productName} (Beta)`
  : BRANDING.productName

/** Early capture before React hydrates — mirrors DisableInspect shortcuts. */
const EARLY_INSPECT_BLOCK_SCRIPT = `(function(){
  var EDIT={a:1,c:1,v:1,x:1,z:1,y:1};
  var EDIT_CODE={KeyA:1,KeyC:1,KeyV:1,KeyX:1,KeyZ:1,KeyY:1};
  function isEditable(t){
    return !!(t&&t.closest&&t.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']"));
  }
  function isEdit(e){
    var mod=e.ctrlKey||e.metaKey;
    if(!mod||e.altKey) return false;
    var k=(e.key||'').toLowerCase();
    return !!(EDIT[k]||EDIT_CODE[e.code]);
  }
  function bad(e){
    var k=(e.key||'').toLowerCase();
    var code=e.code||'';
    if(code==='F12'||e.key==='F12') return true;
    var mod=e.ctrlKey||e.metaKey;
    if(!mod) return false;
    if(isEdit(e)) return false;
    if((k==='u'||code==='KeyU')&&!e.shiftKey&&!e.altKey) return true;
    if((k==='s'||code==='KeyS')&&!e.altKey) return true;
    if(e.shiftKey&&!e.altKey){
      if(k==='i'||k==='j'||k==='c'||k==='k'||code==='KeyI'||code==='KeyJ'||code==='KeyC'||code==='KeyK') return true;
    }
    return false;
  }
  function stop(e){
    if(isEditable(e.target)) return;
    if(isEdit(e)) return;
    if(!bad(e)) return;
    e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }
  document.addEventListener('contextmenu',function(e){
    if(navigator.maxTouchPoints>0) return;
    try{ if(window.matchMedia('(pointer: coarse)').matches) return; }catch(_){}
    if(isEditable(e.target)) return;
    try{ var s=window.getSelection(); if(s&&!s.isCollapsed&&s.toString().trim()) return; }catch(_){}
    e.preventDefault();e.stopPropagation();
  },true);
  document.addEventListener('keydown',stop,true);
  window.addEventListener('keydown',stop,true);
})();`

export const metadata: Metadata = {
  title: {
    default: productTitle,
    template: `%s · ${productTitle}`,
  },
  description: `${BRANDING.tagline} ${BRANDING.slogan} Parallel LLM orchestration for teams.`,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const blockInspect = shouldBlockInspect()

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {blockInspect ? (
          <script
            // Runs immediately so F12 / right-click are blocked before hydration.
            dangerouslySetInnerHTML={{ __html: EARLY_INSPECT_BLOCK_SCRIPT }}
          />
        ) : null}
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>
            <AuthJsProvider>
            <AuthSessionProvider>
              <DesktopAppBridge />
              <DesktopNativeAuthGate />
              <AuthProfileSync />
              <PreferencesBodySync />
              <BackendAvailabilityMonitor />
              <div className="flex flex-col min-h-screen relative">
              <SiteChromeNav />
              <AppShellMain>
                <SuperuserHealthStrip />
                <AccessDeniedBannerSlot />
                <MarketingChrome>{children}</MarketingChrome>
              </AppShellMain>
              <Footer />
              </div>
              <SupportChatWidget />
              <CookieConsentBanner />
              <ConsentSync />
              <AnalyticsBootstrap />
              <DisableInspect />
            </AuthSessionProvider>
            </AuthJsProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
