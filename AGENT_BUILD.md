# Agent build — Inventory Tracking v2

Built with the **new Copilot Studio experience** on the **GitHub Copilot harness**. The agent (identity + instructions + model) is authored **as code** and lands in the solution; the steps below are the one-time UI/consent last mile.

## 1. The agent (built as code)
Build + deploy it into the solution:

```powershell
./scripts/build-agent.ps1 -EnvironmentUrl <env> -Name "<Agent>" -PublisherPrefix <prefix> ` 
    -Solution <Solution> -InstructionsFile workspaces/<pilot>/generated/agent-instructions.md
```

## 2. Add the Dataverse MCP tool (Copilot Studio, ~2 clicks)
Grounding the agent on live Dataverse data is a one-time **connection consent** — the only step that can't be authored in code (OAuth consent is interactive). It's quick:

1. Open **copilotstudio.microsoft.com** → pick your environment → **Agents** → open the agent.
2. In the **Tools** section, select **+ Add tool**.
3. Choose **Model Context Protocol** → **Dataverse MCP Server**.
4. If prompted, **create/authorize the Dataverse connection** (one-time sign-in consent).
5. Select **Add to agent**.
6. *(Optional)* **… → Edit** next to the tool to scope which tables/tools are exposed (the reimagined Dataverse tables).

> The Dataverse MCP server is **enabled by default for the Copilot Studio client**, so there's usually nothing to turn on. Only *external* MCP clients (VS Code GitHub Copilot, Claude) need admin enablement in PPAC → Environment → **Settings → Product → Features → Dataverse Model Context Protocol**.

## 3. Test it (Copilot Studio test pane)

With the tool added, try these in **Test your agent**:

- "show me the tables in Dataverse"
- "how many records does Inventory Tracking v2 have?"
- "what needs attention right now?"

## 4. Refine the agent (optional) — paste into the Build tab

To expand behavior, paste this into the agent's **Build** (describe/refine) box:

```text
You are the Inventory Tracking v2 assistant for a **Providers** organization. Ground every answer in Dataverse via the Dataverse MCP Server over the reimagined Dataverse tables. Help users find records, report items that need attention, summarize by category, and take safe update actions on request. Be concise, show numbers, and proactively flag anything that needs action. Ask a brief clarifying question when a request is ambiguous.
```

## 5. Publish + channels

1. In Copilot Studio, **Publish** the agent.
- Enable the channel(s) you need — **Microsoft Teams** and/or a **Custom website** (for the code-app embed below).

## 6. Embed in the code app

The code app's **Assistant** tab renders the agent as soon as its embed URL is set — no code change needed:

1. In Copilot Studio → **Channels** → **Custom website** (or **Web/Direct Line**), copy the agent's **embed URL**.
2. Set it as the app's **`VITE_AGENT_EMBED_URL`** build variable (e.g. in the code app's `.env`), then redeploy.
3. The **Assistant** tab now hosts the live agent; until then it shows these setup steps.
