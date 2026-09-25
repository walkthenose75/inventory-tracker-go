# Inventory Tracking v2

A clinical supply inventory tracker with an item detail view (with image), an actionable reorder dashboard, and a Copilot assistant grounded in Dataverse.

> Reusable demo asset. Contains no secrets, source records, or tenant-specific identifiers.

## Prerequisites

- A Power Platform environment where you can create solutions, with **Power Apps code apps enabled**
  (admin: PPAC → Environment → Settings → Product → Features).
- **Node.js 22+**, the **Power Platform CLI** (`pac`), and the **Azure CLI** (`az`).
- Maker access (System Administrator or equivalent) to import a solution and deploy a code app.

## Quick start

```powershell
git clone https://github.com/walkthenose75/inventory-tracker-go
cd inventory-tracking-v2
```

Then follow **Install** below (~10 minutes).

## What's inside

- `solution/` — the importable **solution package(s)** (Dataverse tables + agent) **and** the code‑app source (`solution/inventory-app/`)
- `synthetic-data/` — reviewable, fictitious demo data (CSV) + a one‑command loader
- `MANUAL_STEPS.md` — UI/admin steps that can't be automated (enablement, connections, sharing, …)
- `AGENT_BUILD.md` — the Copilot Studio agent: built **as code**, plus the 2‑click Dataverse MCP consent, publish, and embed
- `SOLUTION_HUB.md` / `solution-hub.json` — Solution City / Solution Hub submission fields
- `docs/` — architecture / demo notes (starter you can flesh out)

## Install (in your own environment)

1. **Import the solution.** [make.powerapps.com](https://make.powerapps.com) → **Solutions → Import solution** → pick the `*_managed.zip` in `solution/` (or `*_unmanaged.zip` if you want to customize). This creates the Dataverse tables and the Copilot Studio agent.
2. **Deploy the code app** from source (its `power.config.json` is templatized, so init sets your own ids):
   ```powershell
   cd solution/inventory-app
   npm install
   pac code init --environment <your-env-url> --displayName "Inventory Tracking v2"
   pac code push --solutionName <SolutionUniqueName>
   ```
   Then add the app to the solution once in the portal (**Solutions → your solution → Add existing → App**).
3. **Load the demo data** (resolves lookups automatically):
   ```powershell
   az login
   ./synthetic-data/load-synthetic-data.ps1 -EnvironmentUrl <your-env-url> -ManifestPath ./synthetic-data/manifest.json
   ```
   (Portal / Package Deployer alternatives are in `synthetic-data/README.md`.)
4. **Complete the UI/admin steps** in `MANUAL_STEPS.md` (connections, Teams CSP, sharing).
5. **Finish the agent** — follow `AGENT_BUILD.md`: add the Dataverse MCP tool (one‑time consent), publish, then set `VITE_AGENT_EMBED_URL` and redeploy to embed it in the app's Assistant tab.

## Demo

A clinical supply inventory tracker with an item detail view (with image), an actionable reorder dashboard, and a Copilot assistant grounded in Dataverse. Walk the app's tabs to show it end‑to‑end; drop screenshots and a short script into `docs/`.

## Customize

The code app is built with **Fluent UI 2** (`@fluentui/react-components`). Fork, edit `solution/inventory-app/src`, and `pac code push` to your environment.
