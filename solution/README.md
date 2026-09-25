# Solution artifacts — import into your own environment

This folder makes the demo **directly installable** in Power Platform.

## What's here

| File | Use |
|---|---|
| `InventoryTrackingV2_managed.zip` | **Import this** for a clean managed install (recommended for consumers). |
| `InventoryTrackingV2_unmanaged.zip` | Import this if you want to **customize** the solution in your own environment. |
| `inventory-app/` | The **code‑app source** (React + Vite + Fluent UI 2). Code apps aren't packaged inside a classic solution export, so the app ships as source and deploys with `pac code push`. |

## Install (3 steps)

1. **Import the solution.** In [make.powerapps.com](https://make.powerapps.com) → **Solutions → Import solution**, pick `InventoryTrackingV2_managed.zip` (or the unmanaged zip). This creates the Dataverse tables (`inv2_ItemCategory`, `inv2_InventoryItem` — including the item **image** column) and the **Copilot Studio agent**.
2. **Deploy the app from source.** Ensure **Power Apps code apps** are enabled on your environment, then from `inventory-app/`:
   ```powershell
   npm install
   pac code init --environment <your-env-url> --displayName "Inventory Tracking v2"
   pac code push --solutionName InventoryTrackingV2
   ```
   Then add the app to the solution once in the portal (Solutions → InventoryTrackingV2 → Add existing → App).
3. **Load the demo data.** Use the CSVs + manifest in `../synthetic-data/` with `load-synthetic-data.ps1` (fictitious clinical supplies — no real records).

Finish the agent (Dataverse MCP tool + publish + embed) with `../AGENT_BUILD.md`, and complete any UI/admin steps in `../MANUAL_STEPS.md`.

> `inventory-app/power.config.json` is templatized (`appId: null`, `environmentId: {{ENVIRONMENT_ID}}`) so `pac code init` sets your own values. Contains no secrets or tenant identifiers.
