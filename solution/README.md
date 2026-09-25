# Solution artifacts — import into your own environment

This folder makes **Inventory Tracking v2** installable in Power Platform.

## What's here

- `*_managed.zip` — **import this** for a clean managed install (Dataverse tables + the Copilot Studio agent).
- `*_unmanaged.zip` — import instead if you want to **customize** the solution.
- `inventory-app/` — the **code‑app source** (React + Vite + Fluent UI 2). Code apps aren't packaged inside a classic solution export, so the app ships as source and deploys with `pac code push`.

## Install (3 steps)

1. **Import the solution** — [make.powerapps.com](https://make.powerapps.com) → **Solutions → Import solution** → the managed (or unmanaged) zip.
2. **Deploy the app** — ensure code apps are enabled, then from `solution/inventory-app/`:
   ```powershell
   npm install
   pac code init --environment <your-env-url> --displayName "Inventory Tracking v2"
   pac code push --solutionName <SolutionUniqueName>
   ```
   Then add the app to the solution once in the portal (**Solutions → your solution → Add existing → App**).
3. **Load demo data** — see `../synthetic-data/README.md`.

> `inventory-app/power.config.json` is templatized (`appId: null`, `environmentId: {{ENVIRONMENT_ID}}`); `pac code init` sets your own values. No secrets or tenant identifiers.
