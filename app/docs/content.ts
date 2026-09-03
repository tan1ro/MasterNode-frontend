import { API_BASE_URL, ROUTES } from "@/lib/routes"

// MasterNode.ai - Built on π (Pi) concept
// π (Pi) = P (Parallel) + i (Intelligence)

const PLACEHOLDER = "http://localhost:8000"

function injectBaseUrl<T>(obj: T): T {
  if (API_BASE_URL === PLACEHOLDER) return obj
  if (typeof obj === "string") return obj.replaceAll(PLACEHOLDER, API_BASE_URL) as T
  if (Array.isArray(obj)) return obj.map(injectBaseUrl) as T
  if (typeof obj === "object" && obj !== null) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) out[k] = injectBaseUrl(v)
    return out as T
  }
  return obj
}

const _contentData = {
  sections: {
    "introduction": {
      title: "Introduction",
      description: "What MasterNode.ai is and how parallel agents fit your workflow",
      icon: "Sparkles",
      paragraphs: [
        "MasterNode.ai is a multi-tenant platform for parallel LLM agent orchestration. You describe an outcome; the system decomposes the work, runs specialized agents in parallel where it helps, and aggregates everything into a single coherent result.",
        "The product is built on π (Pi): Parallel plus intelligence—many coordinated agents with clear roles (planning, decomposition, parallel execution, aggregation, and supervision), not one endless chat thread.",
        "Use the web app for chat, tasks, and dashboards; call the REST API from your services; or subscribe over WebSockets for live progress—similar to how Cursor blends editor workflows, CLI, and docs, but here the focus is orchestration and APIs.",
      ],
      highlights: [
        {
          title: "Multi-tenant SaaS",
          body: "Isolated tenants, API keys, rate limits, and usage metering suitable for teams and production workloads.",
        },
        {
          title: "RAG-ready",
          body: "Upload documents so agents retrieve relevant chunks instead of relying on memory alone.",
        },
        {
          title: "Observable runs",
          body: "Dashboard views and WebSocket events expose task and agent progress as execution unfolds.",
        },
      ],
    },
    "quick-start": {
      title: "Quickstart",
      description: "API key, first task, and monitoring—get productive in a few minutes",
      icon: "Rocket",
      content: [
        {
          type: "heading",
          level: 3,
          text: "Step 1: Get Your API Key"
        },
        {
          type: "paragraph",
          text: "Navigate to the API Keys page to generate your first API key. This key authenticates all your API requests."
        },
        {
          type: "code",
          id: "api-key-example",
          examples: {
            python: "import requests\nimport os\n\nAPI_KEY = os.getenv('PI_API_KEY', 'your-api-key')\nBASE_URL = os.getenv('PI_API_URL', 'http://localhost:8000')\n\nresponse = requests.get(\n    f'{BASE_URL}/v1/api-keys',\n    headers={'X-API-Key': API_KEY}\n)\nprint('API key is valid!' if response.status_code == 200 else 'Invalid API key')",
            javascript: "const API_KEY = process.env.PI_API_KEY || 'your-api-key';\nconst BASE_URL = process.env.PI_API_URL || 'http://localhost:8000';\n\nconst response = await fetch(BASE_URL + '/v1/api-keys', {\n  headers: { 'X-API-Key': API_KEY }\n});\n\nif (response.ok) {\n  console.log('API key is valid!');\n} else {\n  console.error('Invalid API key');\n}",
            curl: "curl -X GET http://localhost:8000/v1/api-keys \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          type: "heading",
          level: 3,
          text: "Step 2: Create Your First Task"
        },
        {
          type: "paragraph",
          text: "Use the chat interface to create your first parallel agent task."
        },
        {
          type: "code",
          id: "create-task-example",
          examples: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/task',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'task': 'Analyze the top 5 programming languages',\n        'max_parallel_agents': 5,\n        'use_rag': False\n    }\n)\ntask = response.json()\nprint(f\"Created task: {task['task_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    task: 'Analyze the top 5 programming languages',\n    max_parallel_agents: 5,\n    use_rag: false\n  })\n});\n\nconst task = await response.json();\nconsole.log(`Created task: ${task.task_id}`);",
            curl: "curl -X POST http://localhost:8000/v1/task \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"task\": \"Analyze the top 5 programming languages\",\n    \"max_parallel_agents\": 5,\n    \"use_rag\": false\n  }'"
          }
        }
      ]
    },
    "web-app": {
      title: "Using the web app",
      description: "Where to work inside this Next.js frontend—pick a surface and go",
      icon: "LayoutDashboard",
      areas: [
        {
          title: "Dashboard",
          description: "High-level view of activity, task status, and quick navigation across the product.",
          href: ROUTES.dashboard,
        },
        {
          title: "Chat",
          description: "Conversational interface for delegating work to the agent pipeline in natural language.",
          href: ROUTES.chat,
        },
        {
          title: "Tasks",
          description: "Browse runs, open a task for detail, and inspect graphs and results.",
          href: ROUTES.tasks,
        },
        {
          title: "API keys",
          description:
            "Issue and revoke keys for programmatic access; set Read/Write scopes at creation (see Docs → API key permissions).",
          href: ROUTES.apiKeys,
        },
        {
          title: "IDE & external API",
          description: "Use your MasterNode API key from Cursor, VS Code, Postman, or CI—same REST surface as the web app.",
          href: `${ROUTES.docs}#ide-and-api`,
        },
        {
          title: "RAG",
          description: "Upload and manage documents used for retrieval-augmented runs.",
          href: ROUTES.rag,
        },
        {
          title: "Settings",
          description: "Environment and product settings, including how the app reaches your API.",
          href: ROUTES.settings,
        },
        {
          title: "Billing",
          description: "Plans, limits, and usage—align spend with how many tasks and agents you run.",
          href: ROUTES.billing,
        },
        {
          title: "Support",
          description: "Help and contact options when something blocks your team.",
          href: ROUTES.support,
        },
      ],
    },
    "parallel-orchestration": {
      title: "Parallel orchestration",
      description: "From one user task to many agents and back to one answer",
      icon: "GitBranch",
      stages: [
        {
          title: "Intake",
          description:
            "You submit a task (UI or API) with optional max_parallel_agents, use_rag, and template hints.",
        },
        {
          title: "Decomposition",
          description:
            "The control plane builds a DAG of subtasks so independent pieces can run concurrently without conflicting.",
        },
        {
          title: "Execution",
          description:
            "Workers run parallel agents against subtasks; a supervisor keeps coordination and safety in check.",
        },
        {
          title: "Aggregation",
          description:
            "Results are merged into a final output; you poll HTTP or listen on WebSockets until completion.",
        },
      ],
    },
    "models-and-usage": {
      title: "Models & usage",
      description: "Providers, configuration, and how consumption maps to plans",
      icon: "Cpu",
      paragraphs: [
        "Model calls are routed through LiteLLM, so you can use OpenAI, Anthropic, Groq, DeepSeek, local models (for example Ollama or vLLM), or any OpenAI-compatible HTTP endpoint your deployment trusts.",
        "In production, provider secrets stay on the backend. The browser only talks to your FastAPI base URL; never embed provider keys in frontend code.",
      ],
      modelCatalogTitle: "Reference: model context attributes",
      modelCatalogNote:
        "Default context and max-mode context sizes for common frontier models (layout aligned with Cursor's Models & Pricing reference). Actual limits depend on your provider account and the model id you configure in LiteLLM.",
      modelCatalog: [
        { provider: "Anthropic", name: "Claude 4 Sonnet", defaultContext: "200k", maxMode: "—", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4 Sonnet 1M", defaultContext: "—", maxMode: "1M", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.5 Haiku", defaultContext: "200k", maxMode: "—", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.5 Opus", defaultContext: "200k", maxMode: "200k", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.5 Sonnet", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.6 Opus", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.6 Opus (Fast mode)", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Anthropic", name: "Claude 4.6 Sonnet", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Cursor", name: "Composer 1", defaultContext: "200k", maxMode: "—", capabilities: "" },
        { provider: "Cursor", name: "Composer 1.5", defaultContext: "200k", maxMode: "—", capabilities: "" },
        { provider: "Cursor", name: "Composer 2", defaultContext: "200k", maxMode: "—", capabilities: "" },
        { provider: "Google", name: "Gemini 2.5 Flash", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Google", name: "Gemini 3 Flash", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Google", name: "Gemini 3 Pro", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Google", name: "Gemini 3 Pro Image Preview", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "Google", name: "Gemini 3.1 Pro", defaultContext: "200k", maxMode: "1M", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5 Fast", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5 Mini", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5-Codex", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.1 Codex", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.1 Codex Max", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.1 Codex Mini", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.2", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.2 Codex", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.3 Codex", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.4", defaultContext: "272k", maxMode: "1M", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.4 Mini", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "OpenAI", name: "GPT-5.4 Nano", defaultContext: "272k", maxMode: "—", capabilities: "" },
        { provider: "xAI", name: "Grok 4.20", defaultContext: "200k", maxMode: "2M", capabilities: "" },
        { provider: "Moonshot", name: "Kimi K2.5", defaultContext: "262k", maxMode: "—", capabilities: "" },
      ],
      envVars: [
        {
          name: "NEXT_PUBLIC_API_URL",
          purpose: "Where the Next.js app sends API traffic (defaults to http://localhost:8000 in development).",
        },
        {
          name: "X-API-Key / PI_API_KEY",
          purpose:
            "MasterNode tenant key for REST and WebSockets from scripts, IDEs (Cursor, VS Code), Postman, and CI.",
        },
        {
          name: "LITELLM_API_KEY (backend)",
          purpose: "Common backend variable for LiteLLM; provider-specific keys may apply depending on your config.",
        },
      ],
      usageNote:
        "Usage and cost follow tokens and plan rules: Free, Pro, Premium, and Infinity differ by chat credits, parallel agent caps, and RAG file limits. Inspect usage via the API and the Billing page.",
    },
    "integrations": {
      title: "Integrations & workflows",
      description: "REST, streams, and callbacks—fit MasterNode into your stack",
      icon: "Plug",
      paragraphs: [
        "Pair the REST API with any language or scheduler. Use WebSockets when you need push-style updates for dashboards or assistants instead of polling task endpoints.",
        "Webhooks notify your own URL when tasks finish so you can fan out to Slack, kick CI, or enqueue downstream jobs without tight coupling to our UI.",
      ],
      bullets: [
        "REST: tasks, API keys, RAG files, agent templates, usage, and webhooks.",
        "WebSocket: subscribe to per-task event streams for running, agent_completed, and task_completed style updates.",
        "Webhooks: register endpoints for task lifecycle notifications (see API Reference for paths and payloads).",
      ],
    },
    "ide-and-api": {
      title: "IDE & external API usage",
      description:
        "Call MasterNode from Cursor, VS Code REST Client, JetBrains HTTP Client, Postman, GitHub Actions, or any HTTP library using your MasterNode API key.",
      icon: "Terminal",
      paragraphs: [
        "The web app authenticates with your in-app login session for browser flows.",
        "Outside the browser, tools authenticate with a MasterNode API key: send the secret on every request in the X-API-Key header. Create keys on the API Keys page and store them in environment variables or your IDE’s secret store—never commit them to git.",
        "Point clients at your API base URL (NEXT_PUBLIC_API_URL in the frontend build, or the host where you deploy FastAPI). Explore and try requests interactively via the OpenAPI UI at /docs on that host.",
      ],
      bullets: [
        "Minimum for a request: Base URL + X-API-Key + Content-Type: application/json where applicable.",
        "Typical env names: PI_API_URL (or NEXT_PUBLIC_API_URL) and PI_API_KEY—read them from your process environment in scripts.",
        "Same REST routes as the web app: POST /v1/task, GET /v1/task, GET /v1/task/{id}/result, RAG upload, agent templates, usage, webhooks—see API reference.",
        "For long-running work, poll GET /v1/task/{task_id} or open a WebSocket stream (see WebSockets in this documentation).",
      ],
      code: {
        python:
          "import os\nimport requests\n\nAPI_KEY = os.environ[\"PI_API_KEY\"]\nBASE = os.environ.get(\"PI_API_URL\", \"http://localhost:8000\")\n\nresp = requests.post(\n    f\"{BASE}/v1/task\",\n    headers={\"X-API-Key\": API_KEY, \"Content-Type\": \"application/json\"},\n    json={\n        \"task\": \"Summarize the repo README\",\n        \"max_parallel_agents\": 3,\n        \"use_rag\": False,\n    },\n)\nresp.raise_for_status()\nprint(resp.json())",
        javascript:
          "const API_KEY = process.env.PI_API_KEY;\nconst BASE = process.env.PI_API_URL || 'http://localhost:8000';\n\nconst resp = await fetch(`${BASE}/v1/task`, {\n  method: 'POST',\n  headers: {\n    'X-API-Key': API_KEY,\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    task: 'Summarize the repo README',\n    max_parallel_agents: 3,\n    use_rag: false,\n  }),\n});\nconsole.log(await resp.json());",
        curl:
          "# .env for shell (export before curl) or paste into REST Client \"env\"\n# export PI_API_URL=http://localhost:8000\n# export PI_API_KEY=your_key_here\n\ncurl -sS -X POST \"${PI_API_URL:-http://localhost:8000}/v1/task\" \\\n  -H \"X-API-Key: ${PI_API_KEY}\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"task\":\"Hello from terminal\",\"max_parallel_agents\":3,\"use_rag\":false}'",
      },
    },
    "api-key-permissions": {
      title: "API key permissions",
      description:
        "Scoped keys for IDEs and automation: how Read and Write map to HTTP, what each combination is for, and how this compares to platforms like OpenAI.",
      icon: "Shield",
      paragraphs: [
        "When you create a MasterNode API key in the dashboard, you choose **Read** and/or **Write** before the secret is minted. After creation, the server enforces those choices on **every REST request** that authenticates with `X-API-Key` (browser `OPTIONS` preflights are exempt so CORS keeps working).",
        "This is the same **least-privilege** idea as OpenAI’s project keys: there you might pick **All**, **Read only**, or **Restricted** with per-resource toggles. MasterNode uses two coarse axes—read versus write—aligned to **standard HTTP verbs** so any HTTP client, SDK, or reverse proxy behaves predictably without learning product-specific scope strings.",
        "You must enable **at least one** of Read or Write. **Read-only** keys are ideal for dashboards, log tailers, and CI jobs that poll status but never enqueue spend. **Write-only** keys suit tightly controlled submitters that should not list tasks or export results. **Both** (default) match a full-access integration key.",
      ],
      permissionTable: [
        {
          scope: "Read",
          http: "GET, HEAD",
          use: "List tasks, fetch task detail and results, list API keys, usage and metrics, health, wallet balance, RAG file listings, agent templates (GET), and any other safe, non-mutating REST call.",
        },
        {
          scope: "Write",
          http: "POST, PUT, PATCH, DELETE",
          use: "Create tasks and batches, cancel tasks, create or delete API keys, RAG upload and deletes, wallet deposit, feedback, webhooks, template writes, backup/restore where exposed, and any route that changes state.",
        },
        {
          scope: "Neither (disabled)",
          http: "—",
          use: "Not allowed: you cannot save a key with both boxes unchecked.",
        },
      ],
      stages: [
        {
          title: "Read permission in depth",
          description:
            "When **Read** is on, the key may call endpoints that only observe state.\n\nExamples: `GET /v1/task`, `GET /v1/task/{id}`, `GET /v1/task/{id}/result`, `GET /v1/api-keys`, `GET /v1/usage`, `GET /v1/wallet`, `GET /health`, and similar GET routes in the OpenAPI document.\n\nWhen **Read** is off, **every** `GET` and `HEAD` returns **403 Forbidden** with a message that this key lacks read permission—even if Write is on—so a write-only automation cannot silently exfiltrate data.",
        },
        {
          title: "Write permission in depth",
          description:
            "When **Write** is on, the key may call mutating verbs.\n\nExamples: `POST /v1/task`, `POST /v1/task/batch`, `DELETE` to cancel a task, `POST /v1/api-keys`, `DELETE /v1/api-keys/{id}`, `POST /v1/rag/upload`, `POST /v1/wallet/deposit`, `POST /rag/ingest`, and other POST/PUT/PATCH/DELETE routes.\n\nWhen **Write** is off, those methods return **403** so a read-only key cannot create tasks, rotate secrets, or spend prepaid balance—even if Read is enabled.",
        },
        {
          title: "Recommended combinations",
          description:
            "**Read + Write (default):** same power as a classic API secret—use for trusted local IDEs and private services.\n\n**Read only:** monitoring, audit exports, and “status bot” integrations that must never enqueue LLM work.\n\n**Write only:** rare; for pipelines that only submit work and never poll results (you would use a different channel such as webhooks or a second read key).",
        },
        {
          title: "Security practices (OpenAI-style)",
          description:
            "Store secrets in environment variables or a vault—never commit keys to git or paste them into public tickets.\n\nRotate keys when someone leaves the team or a laptop is lost; revoke old keys from the API Keys page.\n\nPrefer **narrow** keys: default to read-only where possible, and use separate keys per environment (staging vs production).\n\nRemember: anyone who possesses the raw key can exercise whatever permissions you attached until you revoke it.",
        },
      ],
      bullets: [
        "Browser session traffic is separate; these Read/Write flags apply to `X-API-Key` requests.",
        "Static keys from server configuration (environment) are treated as **full read+write** because they do not carry dashboard metadata.",
        "If you see **403** after changing permissions, regenerate or create a new key with the right boxes checked; permissions are fixed at creation time.",
      ],
    },
    "features": {
      title: "Features",
      description: "What you get out of the box",
      icon: "Zap",
      features: [
        {
          title: "Multi-agent orchestration",
          icon: "Cpu",
          description:
            "Decomposition into subtasks, parallel execution, and aggregation—so large jobs finish faster than a single linear chain.",
        },
        {
          title: "Multi-tenant SaaS",
          icon: "Users",
          description: "Per-tenant isolation with API keys, rate limits, and metering aligned to your plan.",
        },
        {
          title: "RAG",
          icon: "Database",
          description: "Upload documents; chunks and embeddings power retrieval during agent runs.",
        },
        {
          title: "Real-time updates",
          icon: "Network",
          description: "WebSocket events for live task progress in dashboards and custom clients.",
        },
      ],
    },
    "architecture": {
      title: "Architecture",
      description: "How MasterNode.ai works under the hood",
      icon: "Book",
      layers: [
        {
          title: "1. Frontend Layer (Next.js)",
          items: [
            "React-based user interface",
            "WebSocket client for real-time updates",
            "DAG visualization with React Flow",
            "REST API integration"
          ]
        },
        {
          title: "2. API Gateway (FastAPI)",
          items: [
            "REST endpoints for task management",
            "WebSocket endpoint for real-time events",
            "Multi-tenant authentication",
            "Rate limiting middleware"
          ]
        },
        {
          title: "3. Control Plane (Stateless Services)",
          items: [
            "TaskService: Task creation, validation, and management",
            "Orchestrator: DAG building and coordination",
            "PolicyEngine: Plan-based limit enforcement",
            "UsageService: Token and cost tracking",
            "Billing: Plan management (Free, Pro, Premium, Infinity, Enterprise)"
          ]
        },
        {
          title: "4. Worker Plane (Celery)",
          items: [
            "Parallel agent execution",
            "LangGraph workflow orchestration",
            "Event emission for live updates",
            "Scalable worker pool"
          ]
        },
        {
          title: "5. Memory Layer",
          items: [
            "MongoDB: Short-term memory, job state, graphs",
            "Neon (pgvector): Long-term memory, RAG embeddings, vector search",
            "Hierarchical memory system",
            "Automatic LRU pruning"
          ]
        }
      ]
    },
    "api-reference": {
      title: "API reference",
      description: "REST surface for tasks, keys, RAG, templates, usage, and webhooks",
      icon: "Code",
      endpoints: [
        {
          method: "POST",
          path: "/v1/task",
          description: "Create a new parallel agent task. The task will be automatically decomposed into subtasks and executed by parallel agents.",
          code: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/task',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'task': 'Your task description',\n        'max_parallel_agents': 5,\n        'use_rag': False\n    }\n)\ntask = response.json()\nprint(f\"Task ID: {task['task_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    task: 'Your task description',\n    max_parallel_agents: 5,\n    use_rag: false\n  })\n});\n\nconst task = await response.json();\nconsole.log(`Task ID: ${task.task_id}`);",
            curl: "curl -X POST http://localhost:8000/v1/task \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"task\": \"Analyze the top 5 programming languages and compare their performance\",\n    \"max_parallel_agents\": 5,\n    \"use_rag\": false\n  }'"
          }
        },
        {
          method: "GET",
          path: "/v1/task",
          description: "List all tasks for your tenant with pagination support. Returns tasks ordered by creation date (newest first).",
          code: {
            python: "import requests\n\n# List first 20 tasks\nresponse = requests.get(\n    'http://localhost:8000/v1/task?skip=0&limit=20',\n    headers={'X-API-Key': 'your-api-key'}\n)\ndata = response.json()\nprint(f\"Total tasks: {data['total']}\")\nfor task in data['tasks']:\n    print(f\"{task['task_id']}: {task['status']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task?skip=0&limit=20', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst data = await response.json();\nconsole.log(`Total tasks: ${data.total}`);\ndata.tasks.forEach(task => {\n  console.log(`${task.task_id}: ${task.status}`);\n});",
            curl: "curl -X GET \"http://localhost:8000/v1/task?skip=0&limit=20\" \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "GET",
          path: "/v1/task/{task_id}",
          description: "Get detailed information about a specific task including status, execution graph, and partial results.",
          code: {
            python: "import requests\n\nresponse = requests.get(\n    'http://localhost:8000/v1/task/abc123',\n    headers={'X-API-Key': 'your-api-key'}\n)\ntask = response.json()\nprint(f\"Status: {task['status']}\")\nprint(f\"Task: {task['task']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task/abc123', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst task = await response.json();\nconsole.log(`Status: ${task.status}`);\nconsole.log(`Task: ${task.task}`);",
            curl: "curl -X GET http://localhost:8000/v1/task/abc123 \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "GET",
          path: "/v1/task/{task_id}/result",
          description: "Get the final result of a completed task. Returns the aggregated result from all agents.",
          code: {
            python: "import requests\n\nresponse = requests.get(\n    'http://localhost:8000/v1/task/abc123/result',\n    headers={'X-API-Key': 'your-api-key'}\n)\nresult = response.json()\nprint(f\"Final result: {result['final_result']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task/abc123/result', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst result = await response.json();\nconsole.log(`Final result: ${result.final_result}`);",
            curl: "curl -X GET http://localhost:8000/v1/task/abc123/result \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "POST",
          path: "/v1/task/batch",
          description: "Create multiple tasks in a single request. Useful for processing large batches of tasks efficiently.",
          code: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/task/batch',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'tasks': [\n            {'task': 'Task 1 description', 'max_parallel_agents': 3},\n            {'task': 'Task 2 description', 'max_parallel_agents': 5}\n        ],\n        'max_concurrent': 5\n    }\n)\nresult = response.json()\nprint(f\"Created {len(result['tasks'])} tasks\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/task/batch', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    tasks: [\n      { task: 'Task 1 description', max_parallel_agents: 3 },\n      { task: 'Task 2 description', max_parallel_agents: 5 }\n    ],\n    max_concurrent: 5\n  })\n});\n\nconst result = await response.json();\nconsole.log(`Created ${result.tasks.length} tasks`);",
            curl: "curl -X POST http://localhost:8000/v1/task/batch \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"tasks\": [\n      {\"task\": \"Analyze Python performance\", \"max_parallel_agents\": 3},\n      {\"task\": \"Analyze JavaScript performance\", \"max_parallel_agents\": 5}\n    ],\n    \"max_concurrent\": 5\n  }'"
          }
        },
        {
          method: "POST",
          path: "/v1/api-keys",
          description:
            "Create a new API key. Optional read/write booleans (default true) scope IDE and automation clients: Read allows GET/HEAD; Write allows POST/PUT/PATCH/DELETE. See Docs → API key permissions.",
          code: {
            python:
              "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/api-keys',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'name': 'Production API Key',\n        'read': True,\n        'write': True,\n    },\n)\nkey = response.json()\nprint(f\"API Key: {key['api_key']}\")\nprint(f\"read={key.get('read')} write={key.get('write')}\")\nprint(\"Save this secret once; store it in a vault or env var.\")",
            javascript:
              "const response = await fetch('http://localhost:8000/v1/api-keys', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json',\n  },\n  body: JSON.stringify({\n    name: 'Production API Key',\n    read: true,\n    write: true,\n  }),\n});\n\nconst key = await response.json();\nconsole.log(key.api_key, key.read, key.write);",
            curl:
              "curl -X POST http://localhost:8000/v1/api-keys \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"name\":\"CI read-only monitor\",\"read\":true,\"write\":false}'",
          }
        },
        {
          method: "GET",
          path: "/v1/api-keys",
          description: "List all API keys for your tenant. Returns key metadata (name, created date, last used) but not the actual key values.",
          code: {
            python: "import requests\n\nresponse = requests.get(\n    'http://localhost:8000/v1/api-keys',\n    headers={'X-API-Key': 'your-api-key'}\n)\nkeys = response.json()\nfor key in keys:\n    print(f\"{key['name']}: {key['key_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/api-keys', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst keys = await response.json();\nkeys.forEach(key => {\n  console.log(`${key.name}: ${key.key_id}`);\n});",
            curl: "curl -X GET http://localhost:8000/v1/api-keys \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "DELETE",
          path: "/v1/api-keys/{key_id}",
          description: "Delete an API key. This action cannot be undone. The key will immediately stop working.",
          code: {
            python: "import requests\n\nresponse = requests.delete(\n    'http://localhost:8000/v1/api-keys/key123',\n    headers={'X-API-Key': 'your-api-key'}\n)\nprint(response.json())",
            javascript: "const response = await fetch('http://localhost:8000/v1/api-keys/key123', {\n  method: 'DELETE',\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst result = await response.json();\nconsole.log(result);",
            curl: "curl -X DELETE http://localhost:8000/v1/api-keys/key123 \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "POST",
          path: "/v1/rag/upload",
          description: "Upload a file for RAG (Retrieval-Augmented Generation). Supported formats: PDF, TXT, MD, DOCX. Files are automatically chunked and embedded.",
          code: {
            python: "import requests\n\nwith open('document.pdf', 'rb') as f:\n    response = requests.post(\n        'http://localhost:8000/v1/rag/upload',\n        headers={'X-API-Key': 'your-api-key'},\n        files={'file': f}\n    )\nresult = response.json()\nprint(f\"File uploaded: {result['file_id']}\")",
            javascript: "const formData = new FormData();\nformData.append('file', fileInput.files[0]);\n\nconst response = await fetch('http://localhost:8000/v1/rag/upload', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key'\n  },\n  body: formData\n});\n\nconst result = await response.json();\nconsole.log(`File uploaded: ${result.file_id}`);",
            curl: "curl -X POST http://localhost:8000/v1/rag/upload \\\n  -H \"X-API-Key: your-api-key\" \\\n  -F \"file=@/path/to/document.pdf\""
          }
        },
        {
          method: "GET",
          path: "/v1/rag/files",
          description: "List all uploaded RAG files for your tenant. Returns file metadata including chunk count and file size.",
          code: {
            python: "import requests\n\nresponse = requests.get(\n    'http://localhost:8000/v1/rag/files',\n    headers={'X-API-Key': 'your-api-key'}\n)\nfiles = response.json()\nfor file in files:\n    print(f\"{file['filename']}: {file.get('chunks_count', 0)} chunks\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/rag/files', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst files = await response.json();\nfiles.forEach(file => {\n  console.log(`${file.filename}: ${file.chunks_count || 0} chunks`);\n});",
            curl: "curl -X GET http://localhost:8000/v1/rag/files \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "DELETE",
          path: "/v1/rag/files/{file_id}",
          description: "Delete a RAG file and all its associated chunks and embeddings. This action cannot be undone.",
          code: {
            python: "import requests\n\nresponse = requests.delete(\n    'http://localhost:8000/v1/rag/files/file123',\n    headers={'X-API-Key': 'your-api-key'}\n)\nprint(response.json())",
            javascript: "const response = await fetch('http://localhost:8000/v1/rag/files/file123', {\n  method: 'DELETE',\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst result = await response.json();\nconsole.log(result);",
            curl: "curl -X DELETE http://localhost:8000/v1/rag/files/file123 \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "GET",
          path: "/v1/usage",
          description: "Get usage statistics including token consumption, costs, and compute time. Supports date range filtering via query parameters.",
          code: {
            python: "import requests\n\n# Get usage for last 30 days\nresponse = requests.get(\n    'http://localhost:8000/v1/usage?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z',\n    headers={'X-API-Key': 'your-api-key'}\n)\nusage = response.json()\nprint(f\"Total tokens: {usage['summary']['total_tokens']}\")\nprint(f\"Total cost: ${usage['summary']['total_cost_usd']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/usage?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst usage = await response.json();\nconsole.log(`Total tokens: ${usage.summary.total_tokens}`);\nconsole.log(`Total cost: $${usage.summary.total_cost_usd}`);",
            curl: "curl -X GET \"http://localhost:8000/v1/usage?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z\" \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "POST",
          path: "/v1/webhooks/task_finished",
          description: "Configure a webhook to receive notifications when tasks complete. The webhook will be called with task completion data.",
          code: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/webhooks/task_finished',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'url': 'https://your-domain.com/webhook',\n        'events': ['task_completed', 'task_failed']\n    }\n)\nresult = response.json()\nprint(f\"Webhook configured: {result}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/webhooks/task_finished', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    url: 'https://your-domain.com/webhook',\n    events: ['task_completed', 'task_failed']\n  })\n});\n\nconst result = await response.json();\nconsole.log(`Webhook configured: ${result}`);",
            curl: "curl -X POST http://localhost:8000/v1/webhooks/task_finished \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"url\": \"https://your-domain.com/webhook\",\n    \"events\": [\"task_completed\", \"task_failed\"]\n  }'"
          }
        },
        {
          method: "POST",
          path: "/v1/agent-templates",
          description: "Create a custom agent template to customize agent behavior. Templates can be reused across multiple tasks.",
          code: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/agent-templates',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'name': 'Research Agent Template',\n        'description': 'Specialized for research tasks',\n        'agent_type': 'parallel',\n        'prompt_template': 'You are a research agent. Task: {task}\\nContext: {context}',\n        'variables': ['task', 'context']\n    }\n)\ntemplate = response.json()\nprint(f\"Template created: {template['template_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    name: 'Research Agent Template',\n    description: 'Specialized for research tasks',\n    agent_type: 'parallel',\n    prompt_template: 'You are a research agent. Task: {task}\\nContext: {context}',\n    variables: ['task', 'context']\n  })\n});\n\nconst template = await response.json();\nconsole.log(`Template created: ${template.template_id}`);",
            curl: "curl -X POST http://localhost:8000/v1/agent-templates \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Research Agent Template\",\n    \"description\": \"Specialized for research tasks\",\n    \"agent_type\": \"parallel\",\n    \"prompt_template\": \"You are a research agent. Task: {task}\\nContext: {context}\",\n    \"variables\": [\"task\", \"context\"]\n  }'"
          }
        },
        {
          method: "GET",
          path: "/v1/agent-templates",
          description: "List all agent templates. Supports filtering by agent_type and pagination.",
          code: {
            python: "import requests\n\n# List all parallel agent templates\nresponse = requests.get(\n    'http://localhost:8000/v1/agent-templates?agent_type=parallel&skip=0&limit=20',\n    headers={'X-API-Key': 'your-api-key'}\n)\ndata = response.json()\nfor template in data['templates']:\n    print(f\"{template['name']}: {template['template_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates?agent_type=parallel&skip=0&limit=20', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst data = await response.json();\ndata.templates.forEach(template => {\n  console.log(`${template.name}: ${template.template_id}`);\n});",
            curl: "curl -X GET \"http://localhost:8000/v1/agent-templates?agent_type=parallel&skip=0&limit=20\" \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "GET",
          path: "/v1/agent-templates/{template_id}",
          description: "Get detailed information about a specific agent template.",
          code: {
            python: "import requests\n\nresponse = requests.get(\n    'http://localhost:8000/v1/agent-templates/template123',\n    headers={'X-API-Key': 'your-api-key'}\n)\ntemplate = response.json()\nprint(f\"Template: {template['name']}\")\nprint(f\"Type: {template['agent_type']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates/template123', {\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst template = await response.json();\nconsole.log(`Template: ${template.name}`);\nconsole.log(`Type: ${template.agent_type}`);",
            curl: "curl -X GET http://localhost:8000/v1/agent-templates/template123 \\\n  -H \"X-API-Key: your-api-key\""
          }
        },
        {
          method: "PUT",
          path: "/v1/agent-templates/{template_id}",
          description: "Update an existing agent template. Only provided fields will be updated.",
          code: {
            python: "import requests\n\nresponse = requests.put(\n    'http://localhost:8000/v1/agent-templates/template123',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'name': 'Updated Research Agent',\n        'description': 'Updated description'\n    }\n)\ntemplate = response.json()\nprint(f\"Template updated: {template['name']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates/template123', {\n  method: 'PUT',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    name: 'Updated Research Agent',\n    description: 'Updated description'\n  })\n});\n\nconst template = await response.json();\nconsole.log(`Template updated: ${template.name}`);",
            curl: "curl -X PUT http://localhost:8000/v1/agent-templates/template123 \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Updated Research Agent\",\n    \"description\": \"Updated description\"\n  }'"
          }
        },
        {
          method: "DELETE",
          path: "/v1/agent-templates/{template_id}",
          description: "Delete an agent template. This action cannot be undone.",
          code: {
            python: "import requests\n\nresponse = requests.delete(\n    'http://localhost:8000/v1/agent-templates/template123',\n    headers={'X-API-Key': 'your-api-key'}\n)\nprint(response.json())",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates/template123', {\n  method: 'DELETE',\n  headers: { 'X-API-Key': 'your-api-key' }\n});\n\nconst result = await response.json();\nconsole.log(result);",
            curl: "curl -X DELETE http://localhost:8000/v1/agent-templates/template123 \\\n  -H \"X-API-Key: your-api-key\""
          }
        }
      ]
    },
    "agent-templates": {
      title: "Assistants",
      description: "Deep-domain chat specialists with export formats — Creator vs Business pipeline roles",
      icon: "FileText",
      content: [
        {
          type: "paragraph",
          text: "Assistants shape how chat answers and what it can export. Creator accounts focus on domain specialty, Memory knowledge files, and output formats (PPTX, PDF, DOCX, HTML, image, video, research) without choosing pipeline stages. Business accounts can still assign pipeline roles (Master, Decompose, Parallel, Aggregate, Supervise) for task runs. Use POST /v1/templates/ai-draft to generate a starter assistant from a natural-language description."
        },
        {
          type: "code",
          id: "create-template-example",
          examples: {
            python: "import requests\n\nresponse = requests.post(\n    'http://localhost:8000/v1/agent-templates',\n    headers={'X-API-Key': 'your-api-key'},\n    json={\n        'name': 'Research Agent Template',\n        'description': 'Specialized for research tasks',\n        'agent_type': 'parallel',\n        'prompt_template': 'You are a research agent. Task: {task}\\nContext: {context}',\n        'variables': ['task', 'context']\n    }\n)\ntemplate = response.json()\nprint(f\"Template ID: {template['template_id']}\")",
            javascript: "const response = await fetch('http://localhost:8000/v1/agent-templates', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    name: 'Research Agent Template',\n    description: 'Specialized for research tasks',\n    agent_type: 'parallel',\n    prompt_template: 'You are a research agent. Task: {task}\\nContext: {context}',\n    variables: ['task', 'context']\n  })\n});\n\nconst template = await response.json();\nconsole.log(`Template ID: ${template.template_id}`);",
            curl: "curl -X POST http://localhost:8000/v1/agent-templates \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Research Agent Template\",\n    \"description\": \"Specialized for research tasks\",\n    \"agent_type\": \"parallel\",\n    \"prompt_template\": \"You are a research agent. Task: {task}\\nContext: {context}\",\n    \"variables\": [\"task\", \"context\"]\n  }'"
          }
        }
      ]
    },
    "rag-system": {
      title: "RAG",
      description: "Bring your own documents into agent context",
      icon: "Database",
      steps: [
        "Upload: Upload your documents (PDF, TXT, MD, etc.)",
        "Chunking: Documents are automatically split into semantic chunks",
        "Embedding: Chunks are converted to vector embeddings",
        "Storage: Embeddings stored in Neon (pgvector)",
        "Retrieval: Relevant chunks retrieved based on task context",
        "Injection: Retrieved context injected into agent prompts"
      ],
      code: {
        python: "import requests\n\nwith open('document.pdf', 'rb') as f:\n    response = requests.post(\n        'http://localhost:8000/v1/rag/upload',\n        headers={'X-API-Key': 'your-api-key'},\n        files={'file': f}\n    )\nresult = response.json()",
        javascript: "const formData = new FormData();\nformData.append('file', fileInput.files[0]);\n\nconst response = await fetch('http://localhost:8000/v1/rag/upload', {\n  method: 'POST',\n  headers: {\n    'X-API-Key': 'your-api-key'\n  },\n  body: formData\n});\n\nconst result = await response.json();",
        curl: "curl -X POST http://localhost:8000/v1/rag/upload \\\n  -H \"X-API-Key: your-api-key\" \\\n  -F \"file=@document.pdf\""
      }
    },
    "websocket-events": {
      title: "WebSockets",
      description: "Stream task and agent events to your UI or services",
      icon: "Network",
      code: {
        javascript: "const ws = new WebSocket('ws://localhost:8000/v1/ws/task/abc123');\n\n// Add API key to connection (if required)\nws.onopen = () => {\n  console.log('WebSocket connected');\n};\n\nws.onmessage = (event) => {\n  const data = JSON.parse(event.data);\n  \n  if (data.type === 'agent_completed') {\n    console.log(`Agent ${data.data.agent_id} completed`);\n  } else if (data.type === 'task_completed') {\n    console.log('Task completed!', data.data.final_result);\n    ws.close();\n  }\n};\n\nws.onerror = (error) => {\n  console.error('WebSocket error:', error);\n};",
        python: "import asyncio\nimport websockets\nimport json\n\nasync def monitor_task(task_id, api_key=None):\n    uri = f'ws://localhost:8000/v1/ws/task/{task_id}'\n    headers = {}\n    if api_key:\n        headers['X-API-Key'] = api_key\n    \n    async with websockets.connect(uri, extra_headers=headers) as websocket:\n        print('WebSocket connected')\n        async for message in websocket:\n            data = json.loads(message)\n            print(f\"Event: {data['type']}\")\n            \n            if data['type'] == 'agent_completed':\n                print(f\"Agent {data['data']['agent_id']} completed\")\n            elif data['type'] == 'task_completed':\n                print('Task completed!', data['data']['final_result'])\n                break\n            elif data['type'] == 'task_running':\n                print('Task execution started')\n\nasyncio.run(monitor_task('abc123', api_key='your-api-key'))",
        curl: "# Note: curl doesn't support WebSocket connections directly.\n# Use wscat or a WebSocket client library instead.\n\n# Install wscat: npm install -g wscat\n# Connect to WebSocket:\nwscat -c \"ws://localhost:8000/v1/ws/task/abc123\" \\\n  -H \"X-API-Key: your-api-key\"\n\n# Or use websocat (Rust-based):\n# websocat \"ws://localhost:8000/v1/ws/task/abc123\" \\\n#   --header \"X-API-Key: your-api-key\""
      },
      events: [
        {
          type: "task_running",
          description: "Emitted when task execution starts (after decomposition)"
        },
        {
          type: "agent_completed",
          description: "Emitted when an individual agent completes execution"
        },
        {
          type: "task_completed",
          description: "Emitted when the entire task completes successfully"
        }
      ]
    },
    "code-examples": {
      title: "Code examples",
      description: "End-to-end script: create a task, poll status, read the result",
      icon: "Terminal",
      code: {
        python: "import requests\nimport time\n\nAPI_KEY = 'your-api-key'\nBASE_URL = 'http://localhost:8000'\n\n# Create a task\nresponse = requests.post(\n    f'{BASE_URL}/v1/task',\n    headers={'X-API-Key': API_KEY},\n    json={\n        'task': 'Analyze the top 5 programming languages',\n        'max_parallel_agents': 5,\n        'use_rag': False\n    }\n)\ntask = response.json()\ntask_id = task['task_id']\nprint(f'Created task: {task_id}')\n\n# Monitor task status\nwhile True:\n    response = requests.get(\n        f'{BASE_URL}/v1/task/{task_id}',\n        headers={'X-API-Key': API_KEY}\n    )\n    task_status = response.json()\n    \n    print(f'Status: {task_status[\"status\"]}')\n    \n    if task_status['status'] == 'completed':\n        result_response = requests.get(\n            f'{BASE_URL}/v1/task/{task_id}/result',\n            headers={'X-API-Key': API_KEY}\n        )\n        result = result_response.json()\n        print(f'Result: {result[\"final_result\"]}')\n        break\n    elif task_status['status'] == 'failed':\n        print(f'Task failed: {task_status.get(\"error\")}')\n        break\n    \n    time.sleep(2)",
        javascript: "const API_KEY = 'your-api-key';\nconst BASE_URL = 'http://localhost:8000';\n\n// Create a task\nconst createResponse = await fetch(`${BASE_URL}/v1/task`, {\n  method: 'POST',\n  headers: {\n    'X-API-Key': API_KEY,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    task: 'Analyze the top 5 programming languages',\n    max_parallel_agents: 5,\n    use_rag: false\n  })\n});\n\nconst task = await createResponse.json();\nconst taskId = task.task_id;\nconsole.log(`Created task: ${taskId}`);\n\n// Monitor task status\nconst pollTask = async () => {\n  while (true) {\n    const response = await fetch(`${BASE_URL}/v1/task/${taskId}`, {\n      headers: { 'X-API-Key': API_KEY }\n    });\n    \n    const taskStatus = await response.json();\n    console.log(`Status: ${taskStatus.status}`);\n    \n    if (taskStatus.status === 'completed') {\n      const resultResponse = await fetch(`${BASE_URL}/v1/task/${taskId}/result`, {\n        headers: { 'X-API-Key': API_KEY }\n      });\n      const result = await resultResponse.json();\n      console.log(`Result: ${result.final_result}`);\n      break;\n    } else if (taskStatus.status === 'failed') {\n      console.log(`Task failed: ${taskStatus.error}`);\n      break;\n    }\n    \n    await new Promise(resolve => setTimeout(resolve, 2000));\n  }\n};\n\npollTask();",
        curl: "# Step 1: Create a task\ncurl -X POST http://localhost:8000/v1/task \\\n  -H \"X-API-Key: your-api-key\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"task\": \"Analyze the top 5 programming languages\",\n    \"max_parallel_agents\": 5,\n    \"use_rag\": false\n  }'\n\n# Response will include task_id, save it\n# Example: {\"task_id\": \"abc123\", ...}\n\n# Step 2: Check task status (repeat until completed)\ncurl -X GET http://localhost:8000/v1/task/abc123 \\\n  -H \"X-API-Key: your-api-key\"\n\n# Step 3: Get final result when status is 'completed'\ncurl -X GET http://localhost:8000/v1/task/abc123/result \\\n  -H \"X-API-Key: your-api-key\""
      }
    },
    "best-practices": {
      title: "Best practices",
      description: "Task design, API usage, and RAG hygiene",
      icon: "CheckCircle2",
      practices: [
        {
          category: "Task Design",
          items: [
            "Be specific and clear in task descriptions",
            "Break down very large tasks into smaller, focused tasks",
            "Use appropriate max_parallel_agents based on task complexity",
            "Enable RAG when you have relevant documents"
          ]
        },
        {
          category: "API Usage",
          items: [
            "Use WebSockets for real-time monitoring instead of polling",
            "Implement proper error handling and retries",
            "Store API keys securely (never commit to version control)",
            "Use batch operations for multiple tasks",
            "Monitor your usage to stay within plan limits"
          ]
        },
        {
          category: "RAG Optimization",
          items: [
            "Upload only relevant documents for your use case",
            "Keep documents well-structured with clear sections",
            "Use descriptive filenames",
            "Delete unused files to manage storage"
          ]
        }
      ]
    },
    "troubleshooting": {
      title: "Troubleshooting",
      icon: "AlertCircle",
      issues: [
        {
          title: "401 Unauthorized Error",
          description: "Verify your API key is correct and included in the X-API-Key header.",
          solutions: [
            "Check for typos or extra whitespace in the API key",
            "Ensure you're using the correct API key for your tenant",
            "Verify the API key hasn't been deleted",
            "From an IDE or script you must send X-API-Key",
          ]
        },
        {
          title: "403 Forbidden - Plan Limit Exceeded",
          description: "Your request exceeds the limits of your current plan.",
          solutions: [
            "Upgrade your plan in the Billing page",
            "Reduce the number of parallel agents in your task",
            "Delete unused RAG files to free up space",
            "Wait for the monthly limit to reset"
          ]
        },
        {
          title: "429 Rate Limit Exceeded",
          description: "You've exceeded the rate limit for your API key.",
          solutions: [
            "Implement exponential backoff in your requests",
            "Upgrade your plan for higher rate limits",
            "Use WebSockets instead of polling to reduce API calls"
          ]
        },
        {
          title: "Task Stuck in \"pending\" Status",
          description: "If a task remains in \"pending\" status, there may be an issue with the worker service.",
          solutions: [
            "Check if Celery worker service is running",
            "Verify Redis connection (message broker)",
            "Check worker logs for errors",
            "Restart the Celery worker service"
          ]
        }
      ]
    },
    "faq": {
      title: "Frequently Asked Questions",
      icon: "MessageSquare",
      questions: [
        {
          question: "How does task decomposition work?",
          answer: "The MasterAgent analyzes your task and the TaskDecomposer splits it into subtasks that can be executed in parallel. The number of subtasks depends on task complexity and your max_parallel_agents setting."
        },
        {
          question: "What LLM providers are supported?",
          answer: "MasterNode.ai uses LiteLLM, which supports OpenAI, Groq, DeepSeek, Anthropic, and many other providers. Configure your provider via the LITELLM_API_KEY environment variable."
        },
        {
          question: "How is cost calculated?",
          answer: "Usage follows your plan’s rolling chat credit budget (5-hour window) and feature limits—parallel agents, RAG documents, and uploads. See /pricing for the current Free / Pro / Premium / Infinity ladder, and the Billing page for your workspace usage."
        },
        {
          question: "Can I use my own LLM models?",
          answer: "Yes! LiteLLM supports local models and custom endpoints. You can use Ollama, vLLM, or any OpenAI-compatible API endpoint."
        },
        {
          question: "How does RAG retrieval work?",
          answer: "When RAG is enabled, the system retrieves relevant document chunks based on semantic similarity to your task. These chunks are injected into agent prompts as context."
        },
        {
          question: "What happens if an agent fails?",
          answer: "If an agent fails, the task status changes to \"failed\" and the error is captured. You can retry the task or investigate the error message for details."
        },
        {
          question: "Can I cancel a running task?",
          answer: "Currently, tasks cannot be cancelled once started. This feature is planned for a future release."
        },
        {
          question: "How do I upgrade my plan?",
          answer: "Visit the Billing page to upgrade your plan. Plan changes take effect immediately."
        }
      ]
    },
    "pricing": {
      title: "Pricing",
      description: "Plans cap credits, parallelism, and RAG—upgrade when you outgrow defaults",
      icon: "Key",
      plans: [
        {
          name: "Free",
          features: [
            "Fair-use chat credits (5h window)",
            "Up to 4 parallel agents",
            "Chat attachments (RAG upload on Premium)",
          ]
        },
        {
          name: "Pro",
          highlighted: true,
          features: [
            "5× more credits per 5h window",
            "8 parallel agents",
            "20 RAG documents",
          ]
        },
        {
          name: "Premium",
          features: [
            "15× more credits per 5h window",
            "16 parallel agents",
            "50 RAG documents",
          ]
        },
        {
          name: "Infinity",
          features: [
            "Maximum credits per 5h window",
            "Infinite parallel agents (up to 60)",
            "200 RAG documents",
          ]
        }
      ]
    }
  }
} as const

export const contentData = injectBaseUrl(_contentData)
