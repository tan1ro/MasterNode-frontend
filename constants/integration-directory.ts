export type IntegrationDirectorySection = "connectors"

export interface IntegrationDirectoryLink {
  label: string
  href: string
  external?: boolean
}

export interface IntegrationDirectoryMeta {
  id: string
  developer: string
  developerUrl?: string
  tagline: string
  description: string
  tools: string[]
  links: IntegrationDirectoryLink[]
}

export const INTEGRATION_DIRECTORY_SECTIONS: {
  id: IntegrationDirectorySection
  label: string
}[] = [{ id: "connectors", label: "Connectors" }]

export const INTEGRATION_DIRECTORY_META: Record<string, IntegrationDirectoryMeta> = {
  n8n: {
    id: "n8n",
    developer: "n8n GmbH",
    developerUrl: "https://n8n.io",
    tagline: "Run automations from chat and tasks",
    description:
      "Link n8n so MasterNode can start your workflows from chat and keep automations in sync when pipeline tasks finish. Works like any other connector—connect once, then use it from chat.",
    tools: [
      "trigger_workflow",
      "chat_automation",
      "task_notifications",
      "mcp_invoke",
      "slack_routing",
    ],
    links: [
      { label: "n8n documentation", href: "https://docs.n8n.io/", external: true },
    ],
  },
  canva: {
    id: "canva",
    developer: "Canva",
    developerUrl: "https://www.canva.com",
    tagline: "Create and open designs from your workspace",
    description:
      "Link Canva to MasterNode so agents can create presentation-ready designs and open them in Canva for polish. Requires a Canva Connect app configured on your server—once OAuth credentials are set, members connect with one click.",
    tools: [
      "create_design",
      "open_in_canva",
      "export_asset",
      "mcp_invoke",
      "oauth_connect",
    ],
    links: [
      { label: "Canva Connect API", href: "https://www.canva.dev/docs/connect/", external: true },
      { label: "Developer portal", href: "https://www.canva.dev/", external: true },
    ],
  },
  google_docs: {
    id: "google_docs",
    developer: "Google",
    developerUrl: "https://docs.google.com",
    tagline: "Create and edit Docs in Google Drive",
    description:
      "Authorize Google Docs so MasterNode can draft documents, append sections, and open files in Drive. Ideal for reports, specs, and meeting notes produced by your parallel agent pipeline.",
    tools: [
      "create_document",
      "append_text",
      "open_in_drive",
      "mcp_invoke",
      "oauth_connect",
    ],
    links: [
      { label: "Google Docs API", href: "https://developers.google.com/docs/api", external: true },
      { label: "OAuth setup", href: "https://console.cloud.google.com/", external: true },
    ],
  },
  notion: {
    id: "notion",
    developer: "Notion Labs",
    developerUrl: "https://www.notion.so",
    tagline: "Sync pages and databases with your agents",
    description:
      "Paste a Notion integration token to let MasterNode create and update pages in your workspace. Use it for knowledge capture after tasks complete or to push structured outputs from chat into Notion databases.",
    tools: [
      "create_page",
      "update_page",
      "search_workspace",
      "mcp_invoke",
      "api_token_connect",
    ],
    links: [
      { label: "Notion integrations", href: "https://www.notion.so/my-integrations", external: true },
      { label: "API reference", href: "https://developers.notion.com/", external: true },
    ],
  },
  slack: {
    id: "slack",
    developer: "Salesforce (Slack)",
    developerUrl: "https://slack.com",
    tagline: "Post updates to Slack from chat and MCP",
    description:
      "Connect a Slack incoming webhook so MasterNode can send channel messages when agents finish work or when you invoke actions through MCP. Create a webhook in your Slack app settings, then paste the URL here.",
    tools: [
      "send_message",
      "channel_webhook",
      "mcp_invoke",
      "chat_notifications",
    ],
    links: [
      { label: "Incoming webhooks", href: "https://api.slack.com/messaging/webhooks", external: true },
      { label: "Slack API", href: "https://api.slack.com/", external: true },
    ],
  },
  github: {
    id: "github",
    developer: "GitHub",
    developerUrl: "https://github.com",
    tagline: "Open issues and browse repos from your workspace",
    description:
      "Add a GitHub personal access token so MasterNode can list repositories and create issues on your behalf. Agents and MCP clients use the connected token—scoped to the permissions you grant in GitHub.",
    tools: [
      "create_issue",
      "list_repos",
      "mcp_invoke",
      "api_token_connect",
    ],
    links: [
      { label: "Personal access tokens", href: "https://github.com/settings/tokens", external: true },
      { label: "GitHub REST API", href: "https://docs.github.com/en/rest", external: true },
    ],
  },
  google_drive: {
    id: "google_drive",
    developer: "Google",
    developerUrl: "https://drive.google.com",
    tagline: "Import and browse Drive files for your knowledge base",
    description:
      "Connect Google Drive to list files and pull documents into MasterNode. Works alongside local uploads on the Memory page.",
    tools: ["list_files", "import_to_rag", "mcp_invoke", "oauth_connect"],
    links: [
      { label: "Google Drive API", href: "https://developers.google.com/drive", external: true },
    ],
  },
  dropbox: {
    id: "dropbox",
    developer: "Dropbox",
    developerUrl: "https://www.dropbox.com",
    tagline: "Browse Dropbox folders for knowledge import",
    description: "Use a Dropbox access token to list files and sync content into your workspace knowledge base.",
    tools: ["list_folder", "mcp_invoke", "api_token_connect"],
    links: [{ label: "Dropbox developers", href: "https://www.dropbox.com/developers", external: true }],
  },
  linear: {
    id: "linear",
    developer: "Linear",
    developerUrl: "https://linear.app",
    tagline: "Track issues from your agent workspace",
    description: "Connect Linear with an API key to list issues and keep engineering work visible to agents via MCP.",
    tools: ["list_issues", "mcp_invoke", "api_token_connect"],
    links: [{ label: "Linear API", href: "https://developers.linear.app/", external: true }],
  },
  jira: {
    id: "jira",
    developer: "Atlassian",
    developerUrl: "https://www.atlassian.com/software/jira",
    tagline: "Sync Jira Cloud projects and issues",
    description:
      "Connect Jira Cloud with your site URL, email, and API token so agents can list projects and coordinate work.",
    tools: ["list_projects", "mcp_invoke", "api_token_connect"],
    links: [{ label: "Jira Cloud API", href: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/", external: true }],
  },
  airtable: {
    id: "airtable",
    developer: "Airtable",
    developerUrl: "https://airtable.com",
    tagline: "Browse bases and structured records",
    description: "Paste an Airtable personal access token to list bases and expose structured data to MCP clients.",
    tools: ["list_bases", "mcp_invoke", "api_token_connect"],
    links: [{ label: "Airtable API", href: "https://airtable.com/developers/web/api/introduction", external: true }],
  },
  discord: {
    id: "discord",
    developer: "Discord",
    developerUrl: "https://discord.com",
    tagline: "Post agent updates to Discord channels",
    description: "Add a Discord webhook URL to send messages when tasks complete or when MCP invokes send_message.",
    tools: ["send_message", "channel_webhook", "mcp_invoke"],
    links: [{ label: "Discord webhooks", href: "https://discord.com/developers/docs/resources/webhook", external: true }],
  },
  zapier: {
    id: "zapier",
    developer: "Zapier",
    developerUrl: "https://zapier.com",
    tagline: "Trigger thousands of apps through Zaps",
    description:
      "Paste a Zapier Catch Hook URL to fire automations from chat, pipeline events, and MCP integration_invoke.",
    tools: ["trigger_zap", "mcp_invoke", "webhook_connect"],
    links: [{ label: "Webhooks by Zapier", href: "https://zapier.com/apps/webhook/integrations", external: true }],
  },
}

export function getIntegrationMeta(id: string): IntegrationDirectoryMeta | undefined {
  return INTEGRATION_DIRECTORY_META[id]
}
