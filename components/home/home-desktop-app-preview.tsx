"use client"

import { BrandPiMark } from "@/components/layout/brand-logo"

export function HomeDesktopAppPreview() {
  return (
    <div className="home-desktop-window" aria-label="MasterNode Desktop preview">
      <div className="home-desktop-titlebar" aria-hidden>
        <div className="home-desktop-traffic">
          <span />
          <span />
          <span />
        </div>
        <span className="home-desktop-live">Workspace</span>
      </div>

      <div className="home-desktop-shell">
        <aside className="home-desktop-sidebar">
          <div className="home-desktop-brand">
            <BrandPiMark size="sm" showBeta={false} markClassName="h-7 w-7" />
            <div>
              <p className="home-desktop-kicker">MasterNode.ai</p>
              <p className="home-desktop-brand-name">Chat</p>
            </div>
          </div>
          <ol className="home-desktop-rail">
            <li data-state="active">
              <span>01</span>
              <strong>Agents</strong>
            </li>
            <li data-state="idle">
              <span>02</span>
              <strong>Pipeline</strong>
            </li>
            <li data-state="idle">
              <span>03</span>
              <strong>Workspace</strong>
            </li>
          </ol>
        </aside>

        <div className="home-desktop-stage">
          <p className="home-desktop-eyebrow">Same product, native window</p>
          <p className="home-desktop-goal">Plan, generate, and ship from the laptop app.</p>
          <div className="home-desktop-composer">
            Describe a landing page for a neighborhood cafe…
          </div>
          <div className="home-desktop-run">Send</div>
        </div>
      </div>
    </div>
  )
}
