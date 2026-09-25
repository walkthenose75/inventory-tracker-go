# Demo data — import into the Dataverse tables

Fictitious clinical‑supply inventory (no real records). Two ways to load it after you've imported
the solution (so the `inv2_ItemCategory` / `inv2_InventoryItem` tables exist).

## Files
- `inv2_itemcategory.csv` — 5 categories (load first).
- `inv2_inventoryitem.csv` — 15 items; the `CategoryKey` column links each to its category.
- `manifest.json` — tells the loader the tables, keys, and the **category lookup** mapping.
- `load-synthetic-data.ps1` — self‑contained loader (Dataverse Web API; resolves the lookup for you).

## Option A — one command (recommended)

Handles the category **lookup** automatically. Requires the Azure CLI (`az`) and access to your env.

```powershell
az login
./load-synthetic-data.ps1 -EnvironmentUrl https://<your-org>.crm.dynamics.com -ManifestPath ./manifest.json
```

Categories load first, then each item resolves its `CategoryKey` to the `inv2_CategoryId` lookup.
Re‑runnable (it upserts by name).

## Option B — maker portal (no scripts)

[make.powerapps.com](https://make.powerapps.com) → **Tables** → open `Item Category` → **Import → Import
from Excel/CSV**, load `inv2_itemcategory.csv`. Then do `Inventory Item` with `inv2_inventoryitem.csv`.
**Caveat:** the portal import won't auto‑resolve the `CategoryKey` → **Category** lookup — map it during
import, or set the category on each item afterward. Option A avoids this.

## Option C — enterprise packaging (optional)

For a fully packaged **solution + data** deployment, repackage these rows with the **Configuration
Migration tool** / **Package Deployer** to produce a `data.zip` that imports rows (including lookups)
as part of a Package Deployer package. Heavier to set up; Option A is fine for a demo.

> The CSVs are reviewable and contain only fictitious data — safe to inspect and edit before loading.
