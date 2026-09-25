# Inventory Tracking v2

A clinical supply inventory tracker with an item detail view (with image), an actionable reorder dashboard, and a Copilot assistant grounded in Dataverse.

> Reusable demo asset. Contains no secrets, source records, or tenant-specific identifiers.

## What's inside

- `solution/` — the unmanaged solution package (Dataverse schema) + code‑app source
- `synthetic-data/` — reviewable, fictitious demo data (CSV) + loader
- `docs/` — architecture, user journeys, and customization notes
- `MANUAL_STEPS.md` — UI/admin steps that can't be automated (enablement, connections, agent publish, …)
- `AGENT_BUILD.md` — the Copilot Studio agent: built **as code**, plus the 2‑click Dataverse MCP consent, publish, and embed
- `SOLUTION_HUB.md` / `solution-hub.json` — Solution City / Solution Hub submission fields

## Install (in your own environment)

1. Ensure **Power Apps code apps** are enabled on your target environment.
2. Import the unmanaged solution from `solution/` (Dataverse schema).
3. Deploy the code app from source: `pac code push --environment <your-env-url> --solutionName <solution>`.
4. Load the fictitious demo data from `synthetic-data/`.
5. Complete the UI/admin steps in `MANUAL_STEPS.md` (connections, agent publish + approval, Teams CSP, sharing).
6. Finish the **Copilot Studio agent** with `AGENT_BUILD.md` — it's built as code and published; add the Dataverse MCP tool (one‑time consent), then set `VITE_AGENT_EMBED_URL` to embed it in the app.

## Demo

See `docs/` for the demo script and screenshots.

## Customize

The code app is built with **Fluent UI 2** (`@fluentui/react-components`). Fork, edit, and
`pac code push` to your environment.
