/** Bundled official brand logos for integration cards. */

export interface IntegrationLogoConfig {
  /** Local SVG under /public/integrations/logos/ */
  src: string
  alt: string
}

export const INTEGRATION_LOGOS: Record<string, IntegrationLogoConfig> = {
  n8n: {
    src: "/integrations/logos/n8n.svg",
    alt: "n8n",
  },
  canva: {
    src: "/integrations/logos/canva.svg",
    alt: "Canva",
  },
  google_docs: {
    src: "/integrations/logos/google-docs.svg",
    alt: "Google Docs",
  },
  google_drive: {
    src: "/integrations/logos/google-drive.svg",
    alt: "Google Drive",
  },
  notion: {
    src: "/integrations/logos/notion.svg",
    alt: "Notion",
  },
  slack: {
    src: "/integrations/logos/slack.svg",
    alt: "Slack",
  },
  github: {
    src: "/integrations/logos/github.svg",
    alt: "GitHub",
  },
  dropbox: {
    src: "/integrations/logos/dropbox.svg",
    alt: "Dropbox",
  },
  linear: {
    src: "/integrations/logos/linear.svg",
    alt: "Linear",
  },
  jira: {
    src: "/integrations/logos/jira.svg",
    alt: "Jira",
  },
  airtable: {
    src: "/integrations/logos/airtable.svg",
    alt: "Airtable",
  },
  discord: {
    src: "/integrations/logos/discord.svg",
    alt: "Discord",
  },
  zapier: {
    src: "/integrations/logos/zapier.svg",
    alt: "Zapier",
  },
}
